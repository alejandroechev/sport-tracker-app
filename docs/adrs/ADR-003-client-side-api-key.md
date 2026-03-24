# ADR-003: Client-Side API Calls with Exposed Key

## Status

Accepted

## Context

The app needs to call API-SPORTS endpoints to fetch live data. There are two options:

1. **Server-side proxy** — API key stays secret, but requires a backend server.
2. **Client-side calls** — API key is bundled into the client, but no server needed.

This is a personal-use app deployed to Vercel as a static site.

## Decision

Store the API-SPORTS key in a Vite environment variable (`VITE_API_SPORTS_KEY`) and make API calls directly from the browser. The key is embedded in the client-side JavaScript bundle.

## Consequences

- **Key is visible** in browser DevTools and the JS bundle — acceptable for personal use, not for production apps with paying users.
- **No backend required** — the app is a fully static site, simplifying deployment to Vercel.
- **No server costs** — no functions, no edge workers, no cold starts.
- **If the key leaks**, the only risk is someone else consuming the free-tier quota. The key can be regenerated on api-sports.io.
- If the app ever becomes public-facing, this decision should be revisited in favor of a server-side proxy or Vercel Edge Function.
