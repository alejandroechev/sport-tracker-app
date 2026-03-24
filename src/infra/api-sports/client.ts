export type ApiSport = 'football' | 'formula1' | 'tennis';

const BASE_URLS: Record<ApiSport, string> = {
  football: 'https://v3.football.api-sports.io',
  formula1: 'https://v1.formula-1.api-sports.io',
  tennis: 'https://v1.tennis.api-sports.io',
};

export interface ApiSportsResponse<T> {
  get: string;
  parameters: Record<string, string>;
  errors: Record<string, string> | string[];
  results: number;
  response: T;
}

export class ApiSportsError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = 'ApiSportsError';
    this.statusCode = statusCode;
  }
}

export class ApiSportsClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async request<T>(
    sport: ApiSport,
    endpoint: string,
    params?: Record<string, string>,
  ): Promise<ApiSportsResponse<T>> {
    const baseUrl = BASE_URLS[sport];
    const url = new URL(endpoint, baseUrl);
    if (params) {
      Object.entries(params).forEach(([key, value]) =>
        url.searchParams.set(key, value),
      );
    }

    const response = await fetch(url.toString(), {
      headers: {
        'x-apisports-key': this.apiKey,
      },
    });

    if (!response.ok) {
      throw new ApiSportsError(
        `API request failed: ${response.status} ${response.statusText}`,
        response.status,
      );
    }

    const remaining = response.headers.get('x-ratelimit-requests-remaining');
    if (remaining !== null && parseInt(remaining) <= 5) {
      console.warn(
        `API-SPORTS rate limit warning: only ${remaining} requests remaining for ${sport}`,
      );
    }

    return response.json() as Promise<ApiSportsResponse<T>>;
  }
}
