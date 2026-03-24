# System Architecture

## High-Level Overview

```mermaid
graph TD
    User([User / Browser])
    PWA[React PWA<br/>Vite + Tailwind]
    CLI[CLI Validator]

    subgraph "API-SPORTS Platform"
        FootballAPI[Football API<br/>v3.football.api-sports.io<br/>100 req/day]
        F1API[F1 API<br/>v1.formula-1.api-sports.io<br/>100 req/day]
        TennisAPI[Tennis API<br/>v1.tennis.api-sports.io<br/>100 req/day]
    end

    User --> PWA
    PWA -->|HTTPS + API Key| FootballAPI
    PWA -->|HTTPS + API Key| F1API
    PWA -->|HTTPS + API Key| TennisAPI
    CLI -->|validation| PWA
```

## Internal Architecture

```mermaid
graph LR
    subgraph UI["ui/"]
        Pages[Pages<br/>LivePage, CategoryPage,<br/>CompetitionPage, SettingsPage]
        Components[Components<br/>MatchCard, StandingTable, etc.]
        Hooks[Hooks<br/>useSportData, useRefresh]
        Pages --> Components
        Pages --> Hooks
    end

    subgraph Domain["domain/"]
        Models[Models<br/>TypeScript interfaces]
        Config[Config<br/>Static competition list]
        Services[Services<br/>Port interface +<br/>orchestration service]
    end

    subgraph Infra["infra/"]
        APIClient[api-sports/<br/>HTTP client]
        Adapters[Adapters<br/>football, F1, tennis]
        Stub[in-memory/<br/>Stub adapter for testing]
        APIClient --> Adapters
    end

    subgraph External["CLI"]
        CLITool[cli/<br/>Validation scripts]
    end

    Hooks --> Services
    Services --> Models
    Services --> Config
    Services -->|port interface| Adapters
    Services -->|port interface| Stub
    CLITool --> Services
```

## Data Flow

```mermaid
sequenceDiagram
    actor User
    participant UI as React UI
    participant Hook as useSportData
    participant Service as Orchestration Service
    participant Adapter as Sport Adapter
    participant API as API-SPORTS

    User->>UI: Tap refresh button
    UI->>Hook: trigger refresh
    Hook->>Service: fetchData(sport, competition)
    Service->>Adapter: getStandings / getFixtures / getLive
    Adapter->>API: GET /standings?league=39
    API-->>Adapter: JSON response
    Adapter-->>Service: domain model
    Service-->>Hook: typed data
    Hook-->>UI: re-render
    UI-->>User: updated scores
```

## Directory Structure

```
src/
├── domain/          # Business logic (no framework dependencies)
│   ├── models/      # TypeScript interfaces for all sports
│   ├── config/      # Static competition list (hardcoded)
│   └── services/    # Port interface + orchestration service
├── infra/           # External integrations
│   ├── api-sports/  # HTTP client + adapters (football, F1, tennis)
│   └── in-memory/   # Stub adapter for testing
├── ui/              # React components
│   ├── components/  # Reusable (MatchCard, StandingTable, etc.)
│   ├── pages/       # LivePage, CategoryPage, CompetitionPage, SettingsPage
│   └── hooks/       # useSportData, useRefresh
└── cli/             # CLI for validation
```
