# Sport Tracker App

## Description
A personal sport tracker PWA for monitoring live scores, standings, and upcoming events across football, F1, and tennis. Data sourced from API-SPORTS. No database — static competition config with dynamic API fetching. Client-side API calls with manual refresh.

## Architecture

- **TypeScript** — default language for all code
- **React 19 + Vite** — UI framework and build tool
- **Tailwind CSS v4** — utility-first styling
- **PWA** — Progressive Web App for mobile-first experience
- **Domain Logic Separation** — separate domain logic from CLI/UI/WebAPI layers
- **CLI** — always implement a CLI with feature parity to the UI layer
- **Language Convention** — all UI text, code, comments, and documentation in English
- **In-Memory Stubs for External Integrations** — for every external service integration (e.g., API-SPORTS), implement an in-memory stub with the same interface. Auto-select real vs stub based on credentials availability.
- **No Database** — competition configuration is static (checked into repo). All live data is fetched from APIs at runtime. Nothing is persisted server-side.

## Data Source

- **API-SPORTS** (https://api-sports.io/) — football, F1, tennis
- API keys stored in environment variables, never committed
- Client-side fetching with manual refresh (no polling/websockets)

## Git Workflow

- **Work directly on master**
- **Commit after every completed unit of work**
- **Push after each work session** — Remote: https://github.com/alejandroechev/sport-tracker-app.git
- **Tag milestones**: `git tag v0.1.0-mvp`
- **Branch only for risky experiments**

## Deployment

- **CI/CD via GitHub Actions → Vercel**
- Vercel auto-deploy disabled, only deploy through the pipeline
- Never deploy manually
- Production URL: TBD

## Documentation

- **README.md** — project overview, setup instructions, usage
- **System Diagram** — maintain a Mermaid architecture diagram
- **ADRs** — record significant architecture decisions in `docs/adrs/`
- **Read ADRs first** — before starting any development work, read all Architecture Decision Records in `docs/adrs/` to understand existing design decisions and constraints
