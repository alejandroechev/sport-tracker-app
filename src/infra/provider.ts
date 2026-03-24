import type { SportDataPort } from '../domain/services/sport-data.port';
import { InMemoryStubAdapter } from './in-memory';

export function createSportDataAdapter(): SportDataPort {
  const apiKey =
    import.meta.env.VITE_API_SPORTS_KEY ||
    (typeof localStorage !== 'undefined' &&
      localStorage.getItem('sport-tracker-api-key'));

  if (apiKey) {
    // TODO: return real API adapter once implemented (api-client task)
    return new InMemoryStubAdapter();
  }

  return new InMemoryStubAdapter();
}
