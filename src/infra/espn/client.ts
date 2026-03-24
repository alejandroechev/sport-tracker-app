const ESPN_BASE = 'https://site.api.espn.com/apis';
const ESPN_V2_BASE = 'https://site.api.espn.com/apis/v2';

export class EspnClient {
  async getStandings(sport: string, slug: string): Promise<any> {
    const url = `${ESPN_V2_BASE}/sports/${sport}/${slug}/standings`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`ESPN API error: ${res.status}`);
    return res.json();
  }

  async getScoreboard(sport: string, slug: string, date?: string): Promise<any> {
    let url = `${ESPN_BASE}/site/v2/sports/${sport}/${slug}/scoreboard`;
    if (date) url += `?dates=${date}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`ESPN API error: ${res.status}`);
    return res.json();
  }

  async getTennisRankings(): Promise<any> {
    const url = `${ESPN_BASE}/site/v2/sports/tennis/atp/rankings`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`ESPN API error: ${res.status}`);
    return res.json();
  }
}
