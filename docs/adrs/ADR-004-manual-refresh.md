# ADR-004: Manual Refresh to Conserve API Quota

## Status

Accepted

## Context

API-SPORTS free tier allows 100 requests per day per sport. Automatic polling (e.g., every 30 seconds) would exhaust the quota in under an hour. The app needs to provide up-to-date data while staying within limits.

## Decision

- **Manual refresh** — the user explicitly taps a refresh button to fetch new data.
- **Cooldown timer** — prevent accidental rapid refreshes by enforcing a minimum interval between requests.
- **Client-side caching** — keep the last fetched data in memory so navigating between pages doesn't trigger new API calls.

## Consequences

- **Not real-time** — scores update only when the user manually refreshes.
- **Quota control** — the user decides when to spend API calls, making 100/day sufficient for casual use.
- **Simpler implementation** — no WebSocket connections, no polling intervals, no background sync.
- **Good UX tradeoff** for a personal app — the user is aware of the quota constraint and manages it themselves.
- Future enhancement: display remaining quota count to help the user pace their refreshes.
