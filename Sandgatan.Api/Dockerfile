# Build context is the repo root (docker-compose.yml sets it) because the API
# project references the Domain/Application/Infrastructure projects as siblings.

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY Sandgatan.Domain/Sandgatan.Domain.csproj Sandgatan.Domain/
COPY Sandgatan.Application/Sandgatan.Application.csproj Sandgatan.Application/
COPY Sandgatan.Infrastructure/Sandgatan.Infrastructure.csproj Sandgatan.Infrastructure/
COPY Sandgatan.Api/Sandgatan.Api.csproj Sandgatan.Api/
RUN dotnet restore Sandgatan.Api/Sandgatan.Api.csproj

COPY Sandgatan.Domain/ Sandgatan.Domain/
COPY Sandgatan.Application/ Sandgatan.Application/
COPY Sandgatan.Infrastructure/ Sandgatan.Infrastructure/
COPY Sandgatan.Api/ Sandgatan.Api/

RUN dotnet publish Sandgatan.Api/Sandgatan.Api.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

# The .NET 8 images ship a non-root "app" user (UID 1654) – run as that.
RUN mkdir -p /app/data && chown app:app /app/data

COPY --from=build /app/publish .

USER app
ENV ASPNETCORE_URLS=http://+:8080
ENV ConnectionStrings__Default="Data Source=/app/data/sandgatan.db"
EXPOSE 8080

ENTRYPOINT ["dotnet", "Sandgatan.Api.dll"]
