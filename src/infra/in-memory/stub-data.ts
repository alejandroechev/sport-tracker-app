import type {
  SportEvent,
  Match,
  StandingTable,
  FootballStandingEntry,
  F1DriverStanding,
  TennisRanking,
} from '../../domain/models';

// ---------------------------------------------------------------------------
// Football stub data
// ---------------------------------------------------------------------------

const footballTeams = [
  { id: 1, name: 'Arsenal', logo: 'https://media.api-sports.io/football/teams/42.png' },
  { id: 2, name: 'Manchester City', logo: 'https://media.api-sports.io/football/teams/50.png' },
  { id: 3, name: 'Liverpool', logo: 'https://media.api-sports.io/football/teams/40.png' },
  { id: 4, name: 'Chelsea', logo: 'https://media.api-sports.io/football/teams/49.png' },
  { id: 5, name: 'Tottenham', logo: 'https://media.api-sports.io/football/teams/47.png' },
  { id: 6, name: 'Newcastle', logo: 'https://media.api-sports.io/football/teams/34.png' },
];

function makeFootballStandings(competitionId: string): StandingTable {
  const entries: FootballStandingEntry[] = [
    { rank: 1, team: footballTeams[0], points: 71, played: 30, won: 22, drawn: 5, lost: 3, goalsFor: 68, goalsAgainst: 24, goalDifference: 44, form: 'WWDWW' },
    { rank: 2, team: footballTeams[1], points: 67, played: 30, won: 21, drawn: 4, lost: 5, goalsFor: 72, goalsAgainst: 30, goalDifference: 42, form: 'WLWWW' },
    { rank: 3, team: footballTeams[2], points: 65, played: 30, won: 20, drawn: 5, lost: 5, goalsFor: 65, goalsAgainst: 28, goalDifference: 37, form: 'DWWWL' },
    { rank: 4, team: footballTeams[3], points: 54, played: 30, won: 16, drawn: 6, lost: 8, goalsFor: 52, goalsAgainst: 35, goalDifference: 17, form: 'WDLWW' },
    { rank: 5, team: footballTeams[4], points: 50, played: 30, won: 15, drawn: 5, lost: 10, goalsFor: 55, goalsAgainst: 42, goalDifference: 13, form: 'LWWDW' },
    { rank: 6, team: footballTeams[5], points: 47, played: 30, won: 14, drawn: 5, lost: 11, goalsFor: 48, goalsAgainst: 38, goalDifference: 10, form: 'WDWLW' },
  ];
  return {
    competitionId,
    sport: 'football',
    season: 2024,
    entries,
    lastUpdated: new Date().toISOString(),
  };
}

const footballMatchesMap: Record<string, Match[]> = {
  'premier-league': [
    { id: 'pl-1', competitionId: 'premier-league', sport: 'football', status: 'live', date: new Date().toISOString(), homeTeam: footballTeams[0], awayTeam: footballTeams[1], score: { home: 1, away: 1 }, elapsed: 62, venue: 'Emirates Stadium', round: 'Matchday 31' },
    { id: 'pl-2', competitionId: 'premier-league', sport: 'football', status: 'finished', date: new Date(Date.now() - 86400000).toISOString(), homeTeam: footballTeams[2], awayTeam: footballTeams[3], score: { home: 3, away: 1 }, venue: 'Anfield', round: 'Matchday 30' },
    { id: 'pl-3', competitionId: 'premier-league', sport: 'football', status: 'scheduled', date: new Date(Date.now() + 3 * 86400000).toISOString(), homeTeam: footballTeams[4], awayTeam: footballTeams[5], score: { home: null, away: null }, venue: 'Tottenham Hotspur Stadium', round: 'Matchday 32' },
    { id: 'pl-4', competitionId: 'premier-league', sport: 'football', status: 'scheduled', date: new Date(Date.now() + 7 * 86400000).toISOString(), homeTeam: footballTeams[0], awayTeam: footballTeams[2], score: { home: null, away: null }, venue: 'Emirates Stadium', round: 'Matchday 33' },
  ],
  'champions-league': [
    { id: 'cl-1', competitionId: 'champions-league', sport: 'football', status: 'scheduled', date: new Date(Date.now() + 5 * 86400000).toISOString(), homeTeam: footballTeams[0], awayTeam: { id: 10, name: 'Bayern Munich' }, score: { home: null, away: null }, venue: 'Emirates Stadium', round: 'Quarter-final' },
    { id: 'cl-2', competitionId: 'champions-league', sport: 'football', status: 'scheduled', date: new Date(Date.now() + 6 * 86400000).toISOString(), homeTeam: { id: 11, name: 'Real Madrid' }, awayTeam: footballTeams[1], score: { home: null, away: null }, venue: 'Santiago Bernabéu', round: 'Quarter-final' },
  ],
  'la-liga': [
    { id: 'll-1', competitionId: 'la-liga', sport: 'football', status: 'scheduled', date: new Date(Date.now() + 2 * 86400000).toISOString(), homeTeam: { id: 11, name: 'Real Madrid' }, awayTeam: { id: 12, name: 'Barcelona' }, score: { home: null, away: null }, venue: 'Santiago Bernabéu', round: 'Matchday 29' },
  ],
  'fa-cup': [
    { id: 'fa-1', competitionId: 'fa-cup', sport: 'football', status: 'scheduled', date: new Date(Date.now() + 10 * 86400000).toISOString(), homeTeam: footballTeams[0], awayTeam: footballTeams[3], score: { home: null, away: null }, venue: 'Wembley', round: 'Semi-final' },
  ],
  'europa-league': [
    { id: 'el-1', competitionId: 'europa-league', sport: 'football', status: 'scheduled', date: new Date(Date.now() + 4 * 86400000).toISOString(), homeTeam: footballTeams[4], awayTeam: { id: 13, name: 'AC Milan' }, score: { home: null, away: null }, round: 'Round of 16' },
  ],
  'world-cup': [],
};

// ---------------------------------------------------------------------------
// Formula 1 stub data
// ---------------------------------------------------------------------------

function makeF1Standings(): StandingTable {
  const entries: F1DriverStanding[] = [
    { rank: 1, driver: { id: 1, name: 'Max Verstappen', number: 1 }, team: { id: 1, name: 'Red Bull Racing' }, points: 161, wins: 5 },
    { rank: 2, driver: { id: 2, name: 'Lewis Hamilton', number: 44 }, team: { id: 2, name: 'Ferrari' }, points: 113, wins: 2 },
    { rank: 3, driver: { id: 3, name: 'Charles Leclerc', number: 16 }, team: { id: 2, name: 'Ferrari' }, points: 105, wins: 2 },
    { rank: 4, driver: { id: 4, name: 'Lando Norris', number: 4 }, team: { id: 3, name: 'McLaren' }, points: 98, wins: 1 },
    { rank: 5, driver: { id: 5, name: 'Carlos Sainz', number: 55 }, team: { id: 4, name: 'Williams' }, points: 72, wins: 0 },
    { rank: 6, driver: { id: 6, name: 'Oscar Piastri', number: 81 }, team: { id: 3, name: 'McLaren' }, points: 68, wins: 1 },
  ];
  return {
    competitionId: 'f1',
    sport: 'formula1',
    season: 2025,
    entries,
    lastUpdated: new Date().toISOString(),
  };
}

const f1Matches: Match[] = [
  { id: 'f1-1', competitionId: 'f1', sport: 'formula1', status: 'live', date: new Date().toISOString(), homeTeam: { id: 100, name: 'Race' }, awayTeam: { id: 101, name: 'Monaco Grand Prix' }, score: { home: null, away: null }, elapsed: 'Lap 42/78', round: 'Round 8' },
  { id: 'f1-2', competitionId: 'f1', sport: 'formula1', status: 'scheduled', date: new Date(Date.now() + 14 * 86400000).toISOString(), homeTeam: { id: 100, name: 'Race' }, awayTeam: { id: 102, name: 'Canadian Grand Prix' }, score: { home: null, away: null }, round: 'Round 9' },
];

// ---------------------------------------------------------------------------
// Tennis stub data
// ---------------------------------------------------------------------------

function makeTennisRankings(): StandingTable {
  const entries: TennisRanking[] = [
    { rank: 1, player: { id: 1, name: 'Jannik Sinner', country: 'ITA' }, points: 11830 },
    { rank: 2, player: { id: 2, name: 'Carlos Alcaraz', country: 'ESP' }, points: 9255 },
    { rank: 3, player: { id: 3, name: 'Novak Djokovic', country: 'SRB' }, points: 7365 },
    { rank: 4, player: { id: 4, name: 'Alexander Zverev', country: 'GER' }, points: 6885 },
    { rank: 5, player: { id: 5, name: 'Daniil Medvedev', country: 'RUS' }, points: 5830 },
    { rank: 6, player: { id: 6, name: 'Andrey Rublev', country: 'RUS' }, points: 4710 },
  ];
  return {
    competitionId: 'atp',
    sport: 'tennis',
    season: 2025,
    entries,
    lastUpdated: new Date().toISOString(),
  };
}

const tennisMatches: Match[] = [
  { id: 'atp-1', competitionId: 'atp', sport: 'tennis', status: 'live', date: new Date().toISOString(), homeTeam: { id: 1, name: 'J. Sinner' }, awayTeam: { id: 3, name: 'N. Djokovic' }, score: { home: 2, away: 1 }, elapsed: 'Set 4', round: 'Roland Garros – SF' },
  { id: 'atp-2', competitionId: 'atp', sport: 'tennis', status: 'scheduled', date: new Date(Date.now() + 1 * 86400000).toISOString(), homeTeam: { id: 2, name: 'C. Alcaraz' }, awayTeam: { id: 4, name: 'A. Zverev' }, score: { home: null, away: null }, round: 'Roland Garros – SF' },
  { id: 'atp-3', competitionId: 'atp', sport: 'tennis', status: 'scheduled', date: new Date(Date.now() + 7 * 86400000).toISOString(), homeTeam: { id: 5, name: 'D. Medvedev' }, awayTeam: { id: 6, name: 'A. Rublev' }, score: { home: null, away: null }, round: 'Queen\'s Club – QF' },
];

// ---------------------------------------------------------------------------
// Exported accessors
// ---------------------------------------------------------------------------

const footballCompetitions = [
  'premier-league', 'fa-cup', 'la-liga',
  'champions-league', 'europa-league', 'world-cup',
];

export function getSportForCompetition(competitionId: string): 'football' | 'formula1' | 'tennis' {
  if (footballCompetitions.includes(competitionId)) return 'football';
  if (competitionId === 'f1') return 'formula1';
  return 'tennis';
}

export function getStubStandings(competitionId: string): StandingTable {
  const sport = getSportForCompetition(competitionId);
  if (sport === 'formula1') return makeF1Standings();
  if (sport === 'tennis') return makeTennisRankings();
  return makeFootballStandings(competitionId);
}

export function getStubMatches(competitionId: string): Match[] {
  const sport = getSportForCompetition(competitionId);
  if (sport === 'formula1') return f1Matches;
  if (sport === 'tennis') return tennisMatches;
  return footballMatchesMap[competitionId] ?? [];
}

export function getAllStubLiveEvents(): SportEvent[] {
  const allMatches = [
    ...Object.values(footballMatchesMap).flat(),
    ...f1Matches,
    ...tennisMatches,
  ];

  const competitionNames: Record<string, string> = {
    'premier-league': 'Premier League',
    'fa-cup': 'FA Cup',
    'la-liga': 'La Liga',
    'champions-league': 'Champions League',
    'europa-league': 'Europa League',
    'world-cup': 'FIFA World Cup',
    'f1': 'Formula 1',
    'atp': 'ATP Tour',
  };

  return allMatches
    .filter(m => m.status === 'live')
    .map(m => ({
      id: m.id,
      competitionId: m.competitionId,
      competitionName: competitionNames[m.competitionId] ?? m.competitionId,
      sport: m.sport,
      status: m.status,
      date: m.date,
      title: `${m.homeTeam.name} vs ${m.awayTeam.name}`,
      score: m.score.home != null && m.score.away != null
        ? `${m.score.home} - ${m.score.away}`
        : undefined,
      elapsed: m.elapsed != null ? String(m.elapsed) : undefined,
      participants: {
        home: { name: m.homeTeam.name, logo: m.homeTeam.logo },
        away: { name: m.awayTeam.name, logo: m.awayTeam.logo },
      },
    }));
}
