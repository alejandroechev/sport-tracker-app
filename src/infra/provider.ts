import type { SportDataPort } from '../domain/services/sport-data.port';
import { InMemoryStubAdapter } from './in-memory';
import { EspnCompositeAdapter } from './espn/composite.adapter';

export function createSportDataAdapter(): SportDataPort {
  const useStub =
    import.meta.env.VITE_USE_STUB === 'true' ||
    (typeof localStorage !== 'undefined' &&
      localStorage.getItem('sport-tracker-use-stub') === 'true');

  if (useStub) {
    return new InMemoryStubAdapter();
  }

  // ESPN API requires no key — use it by default
  return new EspnCompositeAdapter();
}
