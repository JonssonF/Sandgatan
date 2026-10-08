# Sandgatan

Sandgatan är hushållets budgetapp — och grunden för en framtida hushållsdashboard med kalender, todo,
inköpslista, väder, barnens schema och smart-home-integrationer. Version 1 fokuserar enbart på budget:
inkomster, utgifter och sparande, månad för månad.

Allt körs lokalt i hemnätverket, på en Raspberry Pi 5, utan krav på molntjänster.

## Arkitektur

```
Sandgatan.Domain          Entiteter (Income, Expense, Saving, Category) och enums
Sandgatan.Application     DTOs, use-case-tjänster (services), repository- och integrationsinterface
Sandgatan.Infrastructure  EF Core (SQLite), repository-implementationer, DI-registrering
Sandgatan.Api             ASP.NET Core Web API, controllers, Swagger
sandgatan-web/            React + TypeScript + Vite + Mantine + TanStack Query (PWA)
docker-compose.yml        Kör api + web i containrar med en delad SQLite-volym
```

Application-lagret känner bara till interface mot Infrastructure (repositories) och mot framtida externa
system (integrations) — aldrig konkreta implementationer. Det gör det möjligt att lägga till t.ex. en
bank-integration senare utan att röra budgetlogiken.

### Integrationsinterface (förberedda, ej implementerade)

`Sandgatan.Application/Interfaces/Integrations/`:

- `IBankIntegration` — banktransaktioner/lån
- `IEnergyIntegration` — elförbrukning/elpris
- `ICalendarIntegration` — familjekalender
- `ISmartHomeIntegration` — smarta hem-enheter

Inga av dessa har en implementation ännu, och inget i `Sandgatan.Infrastructure` eller `Program.cs`
registrerar dem i DI-containern. De finns enbart för att arkitekturen ska vara redo när det blir
aktuellt — se **Framtida integrationsplan** nedan.

## Kom igång lokalt

### Förutsättningar

- .NET 8 SDK (eller nyare, projekten targetar `net8.0`)
- Node.js 20+ och npm
- (Valfritt, för produktion) Docker + Docker Compose

### Backend

```bash
cd Sandgatan.Api
dotnet run
```

API:t startar på `http://localhost:5043` (se `Properties/launchSettings.json`). Vid start körs
`Database.Migrate()` automatiskt, en SQLite-fil skapas i `Sandgatan.Api/data/sandgatan.db`, och
grundkategorierna seedas (aldrig privata budgetbelopp). Swagger UI finns på `/swagger` i
utvecklingsläge.

Ny migration efter en modelländring:

```bash
dotnet ef migrations add <Namn> --project Sandgatan.Infrastructure --startup-project Sandgatan.Api --output-dir Persistence/Migrations
```

### Frontend

```bash
cd sandgatan-web
npm install
npm run dev
```

Vite-servern startar på `http://localhost:5173`. Kopiera `.env.example` till `.env.local` om du
behöver peka på en annan backend-URL än standarden i `.env.development`
(`VITE_API_BASE_URL=http://localhost:5043/api`).

Appen är byggd mobile-first men med en separat, mer rymlig layout för större skärmar (väggskärm/
tablet) via Mantines responsiva grid. Ljust/mörkt tema växlas i headern och följer annars systemets
inställning.

## Deploy till Raspberry Pi 5 (Docker Compose)

```bash
docker compose up -d --build
```

Detta bygger och startar två containrar:

- **api** — ASP.NET Core, SQLite-filen ligger i den namngivna Docker-volymen `sandgatan-data`
  (`/app/data/sandgatan.db` i containern), så data överlever omstarter och omdeployer.
- **web** — statisk build av frontend serverad via nginx på port `8080`, som reverse-proxyar
  `/api/*` till api-containern. Frontend och API är därmed samma origin i produktion — inget
  CORS-krångel, ingen extra konfiguration av IP-adresser.

Öppna `http://<raspberry-pi-ip>:8080` från valfri enhet på hemnätverket. Lägg till appen på
hemskärmen (iOS/Android) för en installerad PWA i standalone-läge.

På Pi:n ligger repot i `~/deploy/Sandgatan` och appen nås på `http://raspberrypi:8080`. Uppdatera med:

```bash
ssh raspberrypi 'cd ~/deploy/Sandgatan && git pull && docker compose up -d --build'
```

## Home Assistant (familjedashboarden)

Home Assistant är motorn i familjedashboarden (kalender, väder, inköpslista, Hue, Plejd, el/sol).
Sandgatan förblir budgetappen och visas i dashboarden som ett kort som öppnar hela appen.

HA körs som container (`homeassistant/docker-compose.yml`) i en egen mapp på Pi:n,
`~/deploy/HomeAssistant`, så att den startas om och uppdateras oberoende av Sandgatan. Den kör med
`network_mode: host` (krävs för att hitta enheter i nätverket och för Bluetooth/Plejd) och nås på
`http://raspberrypi:8123`. Konfigurationen ligger i `~/deploy/HomeAssistant/config` (ägs av root –
redigera via HA:s gränssnitt eller `docker exec homeassistant ...`). `recorder` är inställd på
`commit_interval: 30` och `purge_keep_days: 10` för att skona SD-kortet.

```bash
ssh raspberrypi 'cd ~/deploy/HomeAssistant && docker compose pull && docker compose up -d'   # uppdatera HA
```

HA OS och HA Supervised valdes bort: HA OS ersätter hela operativsystemet (Pi:n kör andra projekt),
och Supervised är avvecklat. Container-varianten saknar add-on-butiken, men HACS fungerar.

### Miljövariabler / secrets

Inga hemligheter finns i repot. `ConnectionStrings__Default` och `Cors__AllowedOrigins__0` sätts som
miljövariabler i `docker-compose.yml`. När riktiga integrationer (bank, el, kalender) läggs till ska
API-nycklar och tokens läggas i en `.env`-fil (redan gitignorad) eller i Docker/OS-secrets — aldrig i
kod eller `appsettings.json`.

## PWA

Frontend är konfigurerad som en installbar PWA (`vite-plugin-pwa`):

- Manifest med namn, ikoner (`public/icons/`, placeholders — byt ut mot riktig grafik) och
  `display: standalone`.
- Service worker cachar app-skalet (JS/CSS/HTML/ikoner) för snabb start och en enkel offline-shell.
- **API-anrop cachas aldrig** (`NetworkOnly` för `/api/*`) — CRUD kräver alltid kontakt med
  backend-servern i v1. Om servern inte går att nå visas en tydlig banner i appen
  (`BackendOfflineBanner`) istället för att tysta fel eller visa gammal data som om den vore aktuell.
- Kiosk-/dashboardläge (t.ex. för en väggmonterad platta som alltid visar Sandgatan) kan byggas ovanpå
  detta senare genom att öppna appen i helskärm/kiosk-läge i webbläsaren — ingen ändring i appen krävs
  för v1.

## Säkerhet

Appen körs i dagsläget utan autentisering, avsedd för hemnätverket. Arkitekturen (separata lager,
DTO-validering, tydliga interface) gör det möjligt att lägga till autentisering (t.ex. ASP.NET Core
Identity eller en enkel PIN-kod i frontend) senare utan större omskrivning. Lägg aldrig bankuppgifter,
API-nycklar eller andra hemligheter i repot — använd miljövariabler/secrets.

## Framtida integrationsplan

> **Beslut 2026-10-08:** Home Assistant blir familjedashboarden. Kalender, väder, todo/inköpslista,
> barnens schema, Hue/Plejd och el/sol hanteras därför i första hand som HA-integrationer, inte i
> Sandgatan. Listan nedan är kvar som referens; det som fortfarande är aktuellt *i* Sandgatan är
> främst bank/lån och sådant som jämför verkliga kostnader mot budgeten.

Följande är **inte** implementerat i v1, men arkitekturen (interface i
`Sandgatan.Application/Interfaces/Integrations/`) är förberedd för det:

- **Bank/lån** — troligen via en Open Banking/PSD2-baserad tredjepartsleverantör (t.ex. Tink, Nordigen/
  GoCardless Bank Account Data) snarare än ett direkt Swedbank-API, eftersom de flesta svenska banker
  inte erbjuder enkla publika API:er för privatpersoner. Implementeras som en klass som implementerar
  `IBankIntegration` i `Sandgatan.Infrastructure`, registreras i DI, och matas in i en ny
  applikationstjänst som t.ex. föreslår avstämning mot registrerade utgifter.
- **Varberg Energi / eldata** — `IEnergyIntegration`, sannolikt via leverantörens kund-API eller
  skrapning av förbrukningsdata, för att jämföra faktisk elkostnad mot budgeterad post.
- **Svea Solar** — solcellsproduktion, troligen som en utökning av `IEnergyIntegration` eller ett eget
  interface om datamodellen skiljer sig för mycket (produktion vs. förbrukning).
- **Google/Apple familjekalender** — `ICalendarIntegration`, via Google Calendar API respektive
  CalDAV (för iCloud/Apple). Ligger till grund för den planerade kalendervyn i hushållsdashboarden.
- **Philips Hue / Plejd** — `ISmartHomeIntegration`, via respektive lokala/molnbaserade API. Plejd har
  inget officiellt publikt API idag, så det kan kräva community-bibliotek eller en lokal gateway.
- **Väder** — ny integration (t.ex. SMHI:s öppna API, som inte kräver nyckel) för en väderwidget på
  dashboarden.
- **Todo / inköpslista** — nya domänentiteter och egna sidor i samma app, återanvänder samma
  arkitektur (Domain → Application → Infrastructure → Api) som budgetmodulen.
- **Barnens schema** — troligen en utökning av kalenderintegrationen, eventuellt med en enklare egen
  modell för återkommande skol-/fritidsscheman som inte ligger i en extern kalender.

Gemensamt för alla ovan: de ska implementeras som konkreta klasser i `Sandgatan.Infrastructure` som
implementerar respektive interface, registreras i `DependencyInjection.cs`, och exponeras via nya
API-endpoints eller genom att berika befintliga svar. Budgetlogiken i `Sandgatan.Application` ska
aldrig behöva ändras för att en integration läggs till eller byts ut.
