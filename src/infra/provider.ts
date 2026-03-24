import type { SportDataPort } from '../domain/services/sport-data.port';
import { InMemoryStubAdapter } from './in-memory';
import { CompositeApiSportsAdapter } from './api-sports/composite.adapter';

export function createSportDataAdapter(): SportDataPort {
  const apiKey =
    import.meta.env.VITE_API_SPORTS_KEY ||
    (typeof localStorage !== 'undefined' &&
      localStorage.getItem('sport-tracker-api-key'));

  if (apiKey && typeof apiKey === 'string') {
    return new CompositeApiSportsAdapter(apiKey);
  }

  return new InMemoryStubAdapter();
}
