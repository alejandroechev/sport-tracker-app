import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ApiSportsClient, ApiSportsError } from './client';
import type { ApiSport } from './client';

const MOCK_API_KEY = 'test-api-key-123';

function mockResponse(
  body: unknown,
  options: { status?: number; statusText?: string; headers?: Record<string, string> } = {},
) {
  const { status = 200, statusText = 'OK', headers = {} } = options;
  return new Response(JSON.stringify(body), {
    status,
    statusText,
    headers: new Headers(headers),
  });
}

const SAMPLE_RESPONSE = {
  get: 'fixtures',
  parameters: { league: '39' },
  errors: {},
  results: 1,
  response: [{ id: 1 }],
};

describe('ApiSportsClient', () => {
  let client: ApiSportsClient;
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    client = new ApiSportsClient(MOCK_API_KEY);
    fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockResponse(SAMPLE_RESPONSE));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('constructs correct URL for each sport', async () => {
    const expectations: Record<ApiSport, string> = {
      football: 'https://v3.football.api-sports.io/fixtures',
      formula1: 'https://v1.formula-1.api-sports.io/races',
      tennis: 'https://v1.tennis.api-sports.io/rankings',
    };

    for (const [sport, expectedBase] of Object.entries(expectations)) {
      fetchSpy.mockResolvedValueOnce(mockResponse(SAMPLE_RESPONSE));
      const endpoint = sport === 'football' ? '/fixtures' : sport === 'formula1' ? '/races' : '/rankings';
      await client.request(sport as ApiSport, endpoint);

      const calledUrl = (fetchSpy.mock.calls.at(-1)?.[0] as string) ?? '';
      expect(calledUrl).toBe(expectedBase);
    }
  });

  it('sends API key in x-apisports-key header', async () => {
    await client.request('football', '/fixtures');

    const calledInit = fetchSpy.mock.calls[0]?.[1] as RequestInit;
    const headers = calledInit.headers as Record<string, string>;
    expect(headers['x-apisports-key']).toBe(MOCK_API_KEY);
  });

  it('appends query params correctly', async () => {
    await client.request('football', '/fixtures', { league: '39', season: '2024' });

    const calledUrl = fetchSpy.mock.calls[0]?.[0] as string;
    const url = new URL(calledUrl);
    expect(url.searchParams.get('league')).toBe('39');
    expect(url.searchParams.get('season')).toBe('2024');
  });

  it('throws ApiSportsError on non-200 response', async () => {
    fetchSpy.mockResolvedValue(mockResponse({}, { status: 429, statusText: 'Too Many Requests' }));

    try {
      await client.request('football', '/fixtures');
      expect.unreachable('should have thrown');
    } catch (e) {
      expect(e).toBeInstanceOf(ApiSportsError);
      expect((e as ApiSportsError).statusCode).toBe(429);
      expect((e as ApiSportsError).message).toBe('API request failed: 429 Too Many Requests');
    }
  });

  it('warns when rate limit is low', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    fetchSpy.mockResolvedValueOnce(
      mockResponse(SAMPLE_RESPONSE, { headers: { 'x-ratelimit-requests-remaining': '3' } }),
    );

    await client.request('tennis', '/rankings');

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('only 3 requests remaining for tennis'),
    );
  });

  it('does not warn when rate limit is sufficient', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    fetchSpy.mockResolvedValueOnce(
      mockResponse(SAMPLE_RESPONSE, { headers: { 'x-ratelimit-requests-remaining': '50' } }),
    );

    await client.request('football', '/fixtures');

    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('returns typed response data', async () => {
    interface Fixture {
      id: number;
    }
    const result = await client.request<Fixture[]>('football', '/fixtures');
    expect(result.results).toBe(1);
    expect(result.response).toEqual([{ id: 1 }]);
  });
});
