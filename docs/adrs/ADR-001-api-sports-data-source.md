# ADR-001: Use API-SPORTS as Single Data Source

## Status

Accepted

## Context

The app needs real-time sports data covering three different sports: Formula 1, football (soccer), and tennis. Each sport requires standings, fixtures/schedules, and live scores. Using separate providers per sport would mean managing multiple API keys, different data formats, and inconsistent rate limits.

## Decision

Use the [API-SPORTS](https://api-sports.io) platform as the single data source for all sports:

- **Football:** `v3.football.api-sports.io` — standings, fixtures, live scores
- **Formula 1:** `v1.formula-1.api-sports.io` — rankings, races, live timing
- **Tennis:** `v1.tennis.api-sports.io` — rankings, games, live scores

All three APIs share a single API key and consistent authentication via the `x-apisports-key` header.

## Consequences

- **Single API key** for all sports simplifies configuration.
- **Free tier** allows 100 requests/day per sport (300 total across sports).
- **Consistent API patterns** across sports reduce adapter complexity.
- **Vendor lock-in** — switching providers later requires rewriting all adapters.
- **Rate limits** require careful quota management (see ADR-004).
