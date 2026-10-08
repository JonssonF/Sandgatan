# CLAUDE.md

Detta är kontext för Claude Code (eller andra AI-assistenter) när du jobbar med Sandgatan. Läs detta – särskilt **Arbetslogg och beslut** längst ner – innan du börjar en ny uppgift i repot. Se [README.md](README.md) för fullständig setup, deploy och framtida integrationsplan.

## Vad är Sandgatan

Hushållets budgetapp (inkomster, utgifter, sparande – månad för månad) som körs lokalt i hemnätverket på en Raspberry Pi 5. Familjedashboarden (kalender, todo, inköpslista, väder, smart hem) byggs i **Home Assistant** på samma Pi; Sandgatan är budgetdelen och visas där som ett kort som öppnar hela appen (se arbetsloggen 2026-10-08).

**Pi:n:** `ssh raspberrypi` (användare `fredrikjonsson`). Sandgatan i `~/deploy/Sandgatan` → `http://raspberrypi:8080`, Home Assistant i `~/deploy/HomeAssistant` → `http://raspberrypi:8123`. Pi:n kör även andra projekt (eijs, skav, Portainer på 9443) – rör inte dem.

## Stack

- **Backend:** .NET 8 (`net8.0`), ASP.NET Core Web API, EF Core + **SQLite**, Swagger i Development.
- **Frontend:** `sandgatan-web/` – React 19 + TypeScript + Vite + Mantine + TanStack Query + React Router, installbar PWA (`vite-plugin-pwa`).
- **Drift:** Docker Compose (api + web/nginx på port 8080, SQLite i named volume `sandgatan-data`).
- Inga testprojekt finns ännu.

## Grundregler för ändringar

1. **Bygg och lint ska vara rena innan en uppgift räknas som klar:**
   ```bash
   dotnet build
   npm --prefix sandgatan-web run build
   npm --prefix sandgatan-web run lint
   ```
2. **Svenska** i UI-texter, routes (`/inkomster`, `/utgifter`, `/sparande`, `/installningar`) och dokumentation. Engelska i kod (klasser, metoder, variabler, kod-kommentarer) – så ser befintlig kod ut.
3. **Verifiera UI-ändringar i webbläsaren** (Claude Browser-verktyget via `.claude/launch.json`) innan du rapporterar att något är löst.
4. **Respektera lagren:** Application känner bara till interface (repositories/integrations), aldrig Infrastructure-implementationer. Budgetlogik ska inte behöva ändras när en integration läggs till.
5. Överengineera inte – integrationsinterfacen (`IBankIntegration`, `IEnergyIntegration`, `ICalendarIntegration`, `ISmartHomeIntegration`) är förberedda men medvetet oimplementerade och oregistrerade i DI.
6. **Aldrig hemligheter eller riktiga budgetbelopp i repot.** Seed-data innehåller bara standardkategorier.
7. Filer sparas som **UTF-8** (README.md låg tidigare som UTF-16 och blev oläslig i verktyg/diffar).

## Arkitektur

```
Sandgatan.Domain          Entiteter (Income, Expense, Saving, Category, Purchase, SpendingBudget) + ExpenseType-enum (Fixed/Variable)
Sandgatan.Application     DTOs, services, repository-/integrationsinterface, Common/MonthMath
Sandgatan.Infrastructure  SandgatanDbContext, migrationer, SeedData, repositories, DI
Sandgatan.Api             Controllers, Program.cs (migrerar + seedar vid start), CORS, Swagger
sandgatan-web/            src/api (fetch-klient per resurs), pages, components, context/BudgetPeriodContext
```

### Domän – värt att veta
- Alla poster (inkomst/utgift/sparande) hör till en specifik `Year` + `Month`.
- **Lån:** kategorier med `IsLoan = true` (seedad: "Lån") ger utgifter valfria `InterestAmount`/`AmortizationAmount`. `Amount` är effektiv total (ränta + amortering om ingen explicit total anges). Budgetsammanfattningen summerar lån separat.
- **Lån med skuld + räntesats:** lånutgifter kan ha `LoanBalance` (kvarvarande skuld vid månadens början) och `InterestRatePercent` (% per år). När **båda** finns räknar backend räntan (`LoanMath.MonthlyInterest` = skuld × räntesats / 12, heltal kr) och `Amount` = ränta + amortering – explicit total/manuell ränta ignoreras då. Bara en av dem ifylld → 400. Vid överföring till nästa månad (automatisk, manuell och "kopiera till nästa månad") rullar `LoanMath.RollForward` fram lånet: ny skuld = skuld − amortering, räntan räknas om. Frontend speglar formeln i `lib/loanMath.ts` (prognos i `LoanProjection`, snabbredigering i `LoanQuickEdit`). Ändras skuld/ränta i en månad uppdateras **inte** redan skapade senare månader.
- **Kategorier har en typ** (`CategoryType`: `Expense`/`Income`). Utgifter kräver en utgiftskategori; inkomster har en *valfri* inkomstkategori (`Income.CategoryId` nullable). Unikt index är `(Type, Name)` – "Övrigt" finns alltså för båda typerna. Typen sätts bara vid skapande och ändras aldrig. Seed: utgift (Boende, Lån, El, …) och inkomst (Lön, Barnbidrag, VAB, Föräldrapenning, Övrigt) – seedas separat per typ så äldre databaser också får inkomstkategorierna.
- **Återkommande poster – automatisk överföring:** när en månad öppnas i appen anropar frontend (`components/MonthAutoInit.tsx`) `POST /api/budget/{year}/{month}/ensure-initialized`. Backend (`RecurringCopyService.EnsureMonthInitializedAsync`) kopierar `IsRecurring`-poster från föregående månad **högst en gång per månad** (spåras i tabellen `InitializedMonths`, så raderade poster aldrig kommer tillbaka), **aldrig längre fram än nästa månad** (bläddrar man långt fram händer inget), och **aldrig in i en månad som redan har poster** (den markeras bara). Saknar föregående månad återkommande poster markeras månaden inte, så den kan initieras senare.
- **Manuell kopiering** finns kvar (`POST /api/budget/{year}/{month}/copy-recurring`, knapp i Inställningar) och hoppar över poster vars **namn** redan finns i målmånaden. Enskilda poster kan kopieras via `POST /api/{resurs}/{id}/copy-to-next-month`.
- **Kopiera valda/alla poster till nästa månad:** `POST /api/budget/{year}/{month}/copy-to-next-month` med valfri body `{ incomeIds, expenseIds, savingIds }` (saknad lista = alla av den typen). Kopierar även icke-återkommande poster. Dubblettskydd på **namn**: poster vars namn redan finns i nästa månad hoppas över, och samma namn kopieras bara en gång även om källmånaden har flera. UI: `components/CopyToNextMonthButton.tsx` (knapp på översikten + i Inställningar) – dialog med kryssrutor per post, "Markera alla", och poster som redan finns visas bockade/låsta som "Redan kopierad".
- **Snabbuppdatering av inkomstbelopp:** `components/IncomeQuickEdit.tsx` – klick på en inkomst (inkomstsidan: namnet; översikten: hela raden) öppnar en popover med bara beloppsfältet + förra månadens belopp som referens. Matchning mot förra månaden sker på **namn**.

- **Vardagsköp (`Purchase`) – "slösa-pengen":** separat från utgifter. Utgifter = räkningar (fasta eller rörliga, ofta återkommande; obs att lån och Vivab ligger som "Rörlig" i riktiga datan, så `ExpenseType.Variable` betyder **inte** köp). Köp loggas när de händer med belopp, namn, utgiftskategori (ej lånekategorier i UI) och datum; `Year`/`Month` härleds från datumet i backend. Köp är aldrig återkommande och följer **inte** med vid kopiering till nästa månad. **Månadspott** (`SpendingBudget`, unik per år+månad): en månad utan egen rad ärver senaste tidigare månads belopp (`GetEffectiveAsync`), så potten följer med framåt tills den ändras; att sätta potten skriver bara en rad för den valda månaden. **Sammanfattningen** räknar `PlannedPurchases = max(pott, faktiska köp)` in i `TotalExpenses`/"Kvar efter utgifter", så budgeten håller tidigt i månaden och överdrag syns. UI: `/vardagskop` (`PurchasesPage`), `SpendingCard` (översikt + sidan), snabbregistrering `PurchaseModal` ("Köp"-knapp överst på översikten).
- **Lönedag:** `lib/payday.ts` (bara frontend): lön den 25:e (`PAYDAY_DAY_OF_MONTH`), flyttas bakåt till närmaste bankdag (helg, svenska helgdagar inkl. långfredag, annandag påsk, Kristi himmelsfärd, midsommarafton, julafton och nyårsafton). `PaydayCountdown` visar "Lön om X dagar · fredag 23 oktober" räknat från dagens datum.
- **Kategorifärger:** `Category.Color` lagrar en **palettnyckel** (`blue`, `orange`, `aqua`, `yellow`, `magenta`, `green`, `violet`, `red`) – aldrig en hex. Nyckeln översätts till ljus/mörk-variant i `sandgatan-web/src/lib/categoryColors.ts` (färgblindsvaliderad ordning). `null` = automatisk färg.

### Databas (SQLite)
- Connection string: `ConnectionStrings:Default` = `Data Source=data/sandgatan.db` (relativt arbetskatalogen). Lokalt hamnar filen i `Sandgatan.Api/data/sandgatan.db` (gitignorerad).
- `Database.Migrate()` + `SeedData.SeedAsync()` körs automatiskt vid API-start – ingen manuell `database update` behövs.
- Ny migration:
  ```bash
  dotnet ef migrations add <Namn> --project Sandgatan.Infrastructure --startup-project Sandgatan.Api --output-dir Persistence/Migrations
  ```

### API-endpoints
- `GET /api/health`
- `GET /api/budget/{year}/{month}/summary`, `POST /api/budget/{year}/{month}/copy-recurring`, `POST /api/budget/{year}/{month}/ensure-initialized`, `POST /api/budget/{year}/{month}/copy-to-next-month`
- `api/categories` – GET, POST, PUT `{id}`, DELETE `{id}`
- `api/incomes`, `api/expenses`, `api/savings` – GET (`?year=&month=`), GET `{id}`, POST, PUT `{id}`, DELETE `{id}`, POST `{id}/copy-to-next-month`
- `api/purchases` – GET (`?year=&month=`), GET `{id}`, POST, PUT `{id}`, DELETE `{id}`; `GET`/`PUT api/purchases/budget/{year}/{month}` (månadspott, PUT-body `{ amount }`)

## Kommandon

```bash
dotnet run --project Sandgatan.Api --launch-profile http   # API på http://localhost:5043 (Swagger: /swagger)
npm --prefix sandgatan-web install
npm --prefix sandgatan-web run dev                          # Vite på http://localhost:5173
docker compose up -d --build                                # Produktion på Pi:n, port 8080
```

`.claude/launch.json` har två konfigurationer: `sandgatan-api` (5043) och `sandgatan-web` (**5174**, se arbetsloggen 2026-09-29 för varför inte 5173).

## Kända begränsningar / kvar att göra

- Ingen autentisering (avsett för hemnätverket).
- Inga automatiska tester.
- PWA-ikonerna i `public/icons/` är placeholders.

## Arbetslogg och beslut

> Här antecknas ändringar och beslut så att du alltid har rätt kontext.
> Läs alltid denna sektion innan du bygger vidare. Nya poster läggs till **längst ner**.

- 2026-09-25: Grundstruktur byggd (Clean Architecture, entiteter, EF Core/SQLite, migrationer `InitialCreate` och `AddLoanInterestAmortization`, React/Mantine-PWA med dashboard, inkomster, utgifter, sparande och inställningar).
- 2026-09-29: **README.md sparades om från UTF-16 till UTF-8** – den var oläslig för git-diffar och verktyg (svenska tecken blev skräp). Innehållet är oförändrat. CLAUDE.md skapad.
- 2026-09-29: **Verifierade att SQLite redan fungerar fullt ut** – inget behövde implementeras. API:t startar, kör migrationer, skapar `Sandgatan.Api/data/sandgatan.db` och seedar de 10 standardkategorierna. Frontend hämtar data från API:t utan fel. Databasen är nu redo för att fylla på med riktiga rader via appen (eller Swagger på `http://localhost:5043/swagger`).
- 2026-09-29: **Dev-port för frontend i launch.json ändrad till 5174 (`--strictPort`)** – på utvecklarens dator körs ofta en annan Vite-server från ett annat projekt på 5173. `appsettings.Development.json` fick därför `Cors:AllowedOrigins` = 5173 **och** 5174, så att båda portarna fungerar mot API:t i Development. Produktion påverkas inte (där är frontend och API samma origin via nginx). `sandgatan-api` lades också till i launch.json.
- 2026-09-29: **Lade till `.vscode/tasks.json` och `.vscode/launch.json`** (lokala – `.vscode/` är gitignorerad, så de finns bara på utvecklarens dator). Task `Starta Sandgatan` (standard-build-task, Ctrl+Shift+B) kör `api: run` + `webb: dev` (port 5174) parallellt. F5-compound `Sandgatan (API + webb)` startar Vite som preLaunchTask, API:t med C#-debugger (`coreclr`, kräver C#-tillägget) och öppnar Edge med JS-debugger. Obs: Vite-tasken fortsätter köra efter att debuggningen stoppats – stäng den i terminalpanelen.
- 2026-09-29: **Kategorier kan nu skapas direkt från utgiftsformuläret + cirkeldiagram (ringdiagram) för utgifter per kategori på översikten.** Kategori-CRUD fanns redan under Inställningar men syntes inte där man faktiskt behöver den. (1) Ny delad `components/CategoryModal.tsx` (skapa/redigera, används både av `SettingsPage` och av en "+ Ny kategori"-knapp under kategorivalet i `ExpensesPage` – den nya kategorin väljs automatiskt i formuläret). Kategori-Select är nu sökbar. (2) Kategorier fick en **färgväljare** (8 palettfärger + "Automatisk"), visas som färgprick (`components/CategoryDot.tsx`) i kategorilistan och utgiftstabellen. Inga backend-ändringar behövdes – `Color`-fältet fanns redan (MaxLength 20). (3) `components/ExpensesByCategoryChart.tsx`: egen SVG-donut, **inga nya npm-beroenden** (valde bort `@mantine/charts`/recharts för bundle-storlekens skull). Max 7 tårtbitar – fler kategorier slås ihop till en grå "Övrigt (N kategorier)". Kategorier utan vald färg får första lediga palettfärg bland de synliga, så två bitar krockar aldrig i färg om inte användaren själv valt samma. Hover/klick på bit eller förklaringsrad visar belopp + andel i mitten; förklaringslistan med belopp och procent fungerar som tabellvy. Verifierat i webbläsaren med tillfällig testdata i jan 2031 (borttagen efteråt).
- 2026-09-29: **Inkomstkategorier, automatisk månadsöverföring, snabbuppdatering av lön och rekommenderad sparkvot.** (1) `Category.Type` (ny enum `CategoryType`) + `Income.CategoryId` (valfri) – migration `AddIncomeCategoriesAndMonthInit`, som också bytte unikt index från `Name` till `(Type, Name)` och lade till tabellen `InitializedMonths`. Befintliga kategorier blev `Expense`. Inställningar visar nu två listor (Utgifts-/Inkomstkategorier); `CategoryModal` tar en `type`-prop och döljer lånevalet för inkomster; inkomstformuläret har kategorival + "Ny kategori". Radering av kategori blockeras nu även om inkomster använder den. (2) Automatisk överföring av återkommande poster när en månad öppnas – regler under "Domän" ovan. Detta ersätter den gamla principen "kopiering körs aldrig implicit" – användaren bad uttryckligen om att förra månadens värden ska följa med automatiskt. (3) Snabbredigering av inkomstbelopp (`IncomeQuickEdit`) på inkomstsidan och i översiktens "Alla poster", med "Samma som [förra månaden]" / "[Förra månaden]: X kr" under namnet så man ser vad som inte uppdaterats. (4) Översikten visar under sparkvoten: rekommenderad sparkvot 10 % (`RECOMMENDED_SAVINGS_RATE` i `DashboardPage.tsx`) i kronor och hur mycket som saknas/överskrids. **Säkerhetskopia** av databasen före migrationen ligger i `Sandgatan.Api/data/backup-2026-09-29/` (gitignorerad, inkl. WAL-fil – kopiera alltid `.db-wal` med när API:t körs, annars saknas senaste ändringarna). Testat mot en separat kopia av databasen (API på 5044 + Vite på 5175 med `VITE_API_BASE_URL`), så den riktiga datan inte påverkades av testerna.
- 2026-09-29: **Lån: total skuld + räntesats med automatisk ränteberäkning och prognos.** Migration `AddLoanBalanceAndRate` (två nullbara kolumner på `Expenses`: `LoanBalance` decimal(18,2), `InterestRatePercent` decimal(6,3)). Regler under "Domän" ovan. UI: utgiftsformuläret visar för lånekategorier Total skuld / Räntesats / Amortering, beräknad ränta + "att betala denna månad" och en 12-månadersprognos med ungefärlig tid till skuldfrihet; äldre lån utan skuld/räntesats fungerar som förut (manuell ränta/total). Klick på ett låns namn i utgiftstabellen öppnar `LoanQuickEdit` (skuld, räntesats, amortering – live-förhandsvisning). Lånekortet på översikten visar total skuld (`BudgetSummaryDto.TotalLoanBalance`). Tips: migrationen skapades med `--configuration Release` så att den inte krockade med ett körande Debug-API (låsta DLL:er) – användbart knep. Säkerhetskopia före migrationen: `Sandgatan.Api/data/backup-2026-09-29-lan/`. Testat i isolerad miljö (API 5044 + Vite 5175 mot en kopia av databasen).
- 2026-10-04: **Kopiera poster till nästa månad med kryssrutor.** Ny endpoint `copy-to-next-month` (regler under "Domän") och `CopyToNextMonthButton` – knappen "Kopiera till [nästa månad]" på översikten och i Inställningar öppnar en lista med alla poster, "Markera alla" och "Redan kopierad"-markering, så att inget kan dubbleras. `RecurringCopyService` fick ett filter-predikat i stället för hårdkodad `IsRecurring`, och kopieringen lägger nu till namn i dubblettsetet medan den kopierar (gäller även den gamla `copy-recurring`). Testat i isolerad miljö (API 5044 i Release + Vite 5175 mot en kopia av databasen). Obs: i riktiga datan för oktober 2026 finns redan två identiska "Barnbidrag" och två "Epic Games" – troligen gamla dubbletter; de har inte rörts.
- 2026-10-04: **Vardagsköp med månadspott + nedräkning till lön.** Användaren ville skilja räkningar (el, huslån, bredband) från oförutsägbara köp (ICA, barnskor, punka) och enkelt se "slösa-pengen" per månad. Regler under "Domän" ovan. Vardagsköp blev en **egen entitet** i stället för att återanvända `ExpenseType.Variable`, eftersom befintliga "Rörlig"-poster i riktiga datan är lån/Vivab. Migration `AddPurchasesAndSpendingBudget` (två nya tabeller, inga ändringar i befintliga). Kategorier kan inte raderas om köp använder dem. Översikten: "Köp"-knapp först, `PaydayCountdown` under rubriken, `SpendingCard` med stapel (orange från 85 %, röd vid överdrag), fördelning per kategori och senaste köpen; "Totala utgifter" visar "inkl. vardagsköp X kr" och fördelningsstapeln har ett vardagsköp-segment. Säkerhetskopia före migrationen: `Sandgatan.Api/data/backup-2026-10-04-vardagskop/`. Testat i isolerad miljö (API 5044 i Release + Vite 5175 mot en kopia av databasen). Tips: Claude Browser-panelen pausar animationer när den är dold, så Mantine-modaler kan se ut att "inte öppnas" i tester – ta en till skärmdump innan du felsöker.
- 2026-10-08: **Driftsatt på Pi:n + Home Assistant som familjedashboard.** Beslut: HA (Container) är dashboardmotorn och användaren bygger själv dashboarden av HA-kort. Sandgatan förblir budgetappen och blir ett kort i HA som öppnar hela appen ("app i appen"). Kalender/väder/smart hem byggs alltså **inte** i Sandgatan; integrationsinterfacen behålls men främst bank är fortfarande aktuellt (se README "Framtida integrationsplan"). Första riktiga Docker-körningen hittade ett fel: `useradd --uid 1654` krockade med .NET 8-imagens inbyggda `app`-användare (samma UID) – API-Dockerfilen kör nu som `app`. HA:s compose-fil ligger i `homeassistant/docker-compose.yml` (host-nätverk, privileged, `/run/dbus` för Bluetooth/Plejd) och kopieras till `~/deploy/HomeAssistant` på Pi:n; HA-config ägs av root, så redigera via `docker exec homeassistant ...`. `recorder`: `commit_interval: 30`, `purge_keep_days: 10` (SD-kort). SD-kortet var 81 % fullt – mest Dockers byggcache från eijs/skav (28 GB); cache äldre än 7 dagar rensades (`docker builder prune --filter until=168h`). Ingen budgetdata flyttades till Pi:n (användaren: datan är inte viktig än). Utveckling sker lokalt (Vite 5174) med Pi:n som testmiljö.
- 2026-10-08 (kväll): **HA: kameradashboard, HACS och Tapo-dörrklockan (pågår).** `homeassistant/dashboards/kameraovervakning.yaml` klistras in via Raw configuration editor (HA-gränssnittet är sanningen – ändringar där syns inte automatiskt i repot). Tapo C500 (Altanen 192.168.1.205, Garageuppfart) via inbyggda TP-Link-integrationen; höger/vänster-pilarna anropar medvetet motsatt `panorera`-knapp. Dörrklockan (192.168.1.137) svarar **inte** på TP-Link-integrationens discovery och låg som Generic Camera med `stream1` = H.265 2560×1920 (spelas inte i Chrome/Android, snapshots felar) – `stream2` är H.264 1280×960. Den generiska posten använde TP-Link-molnkontot; användaren uppmanad att byta lösenord och skapa lokalt kamerakonto. HACS 2.0.5 installerat manuellt (README). **Kvar:** användaren lägger till dörrklockan via HACS-integrationen *Tapo: Cameras Control* (nedladdad, HA omstartad) → sedan ta bort Generic-posten, uppdatera dashboarden med nya entiteter (livevy, ringsignal-binary_sensor, knappar). Grenar staplade: `feature/home-assistant-pi` → `feature/kamera-dashboard` → `feature/hacs` (inget mergat till main).
