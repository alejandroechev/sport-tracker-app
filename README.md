# Sport Tracker

A personal Progressive Web App for monitoring live scores, standings, and upcoming events across multiple sports and competitions.

## Features

- **Live scores** — real-time match and race results
- **Standings** — league tables, driver/rider rankings, player rankings
- **Upcoming events** — scheduled fixtures, races, and matches
- **Manual refresh** — conserve API quota by refreshing on demand
- **PWA** — installable on mobile and desktop, works offline (cached shell)
- **Multi-sport** — football, Formula 1, and tennis in one place

## Tracked Competitions

| Sport    | Competitions                                                        |
| -------- | ------------------------------------------------------------------- |
| Football | Premier League, FA Cup, La Liga, Champions League, Europa League, FIFA World Cup |
| F1       | Formula 1 World Championship                                       |
| Tennis   | ATP Tour                                                            |

## Tech Stack

- **Framework:** React 19 + TypeScript
- **Build:** Vite
- **Styling:** Tailwind CSS v4
- **Data:** [API-SPORTS](https://api-sports.io) (Football, F1, Tennis APIs)
- **Hosting:** Vercel
- **CI/CD:** GitHub Actions

## Getting Started

### Prerequisites

- Node.js 20+
- An [API-SPORTS](https://api-sports.io) API key (free tier: 100 requests/day per sport)

### Setup

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env and add your API-SPORTS key:
#   VITE_API_SPORTS_KEY=your_api_key_here

# Start dev server
npm run dev
```

### Environment Variables

| Variable              | Description          |
| --------------------- | -------------------- |
| `VITE_API_SPORTS_KEY` | API-SPORTS API key   |

## Scripts

| Command           | Description                |
| ----------------- | -------------------------- |
| `npm run dev`     | Start development server   |
| `npm run build`   | Production build           |
| `npm run preview` | Preview production build   |
| `npm run lint`    | Run ESLint                 |
| `npm run test`    | Run unit tests             |
| `npm run test:e2e`| Run end-to-end tests       |

## Deployment

The app deploys to **Vercel** via GitHub Actions on push to `main`.

Set `VITE_API_SPORTS_KEY` as an environment variable in Vercel project settings.

## Architecture

See [docs/system-diagram.md](docs/system-diagram.md) for the full architecture diagram.

Key architectural decisions are documented in [docs/adrs/](docs/adrs/).

## Language

The UI is in **English**.
