# ADR-002: No Database — Static Config + Dynamic Fetching

## Status

Accepted

## Context

The app tracks a predefined list of competitions (Premier League, Champions League, F1, ATP, etc.). Sports data like scores and standings is inherently transient — it changes constantly and the source of truth is always the external API. There is no user-generated content to persist.

## Decision

- The **competition list** is hardcoded in source code (`domain/config/`).
- **Sports data** (scores, standings, fixtures) is fetched on demand from API-SPORTS and held only in component state.
- **No database**, no backend storage, no caching layer beyond client-side memory.

## Consequences

- **Simpler architecture** — no database to provision, migrate, or maintain.
- **No persistence** — refreshing the page loses fetched data (acceptable for a live-data app).
- **Adding/removing competitions** requires a code change and redeploy.
- **No user accounts or preferences** — all users see the same competition list.
- Architecture remains easy to reason about for a personal-use app.
