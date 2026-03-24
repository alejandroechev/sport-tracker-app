import type {
  StandingTable as StandingTableType,
  StandingEntry,
  FootballStandingEntry,
  F1DriverStanding,
  F1ConstructorStanding,
  TennisRanking,
} from '../../domain/models';

function isFootballStanding(entry: StandingEntry): entry is FootballStandingEntry {
  return 'goalDifference' in entry;
}

function isF1Standing(entry: StandingEntry): entry is F1DriverStanding {
  return 'driver' in entry;
}

function isF1ConstructorStanding(entry: StandingEntry): entry is F1ConstructorStanding {
  return 'team' in entry && !('goalDifference' in entry) && !('driver' in entry) && !('player' in entry);
}

function isTennisRanking(entry: StandingEntry): entry is TennisRanking {
  return 'player' in entry;
}

interface Props {
  standings: StandingTableType;
}

function FootballHeader() {
  return (
    <tr>
      <th className="sticky top-0 bg-gray-100 px-2 py-2 text-left text-xs font-semibold text-gray-600 w-8">#</th>
      <th className="sticky top-0 bg-gray-100 px-2 py-2 text-left text-xs font-semibold text-gray-600">Team</th>
      <th className="sticky top-0 bg-gray-100 px-2 py-2 text-center text-xs font-semibold text-gray-600 w-10">P</th>
      <th className="sticky top-0 bg-gray-100 px-2 py-2 text-center text-xs font-semibold text-gray-600 w-10 hidden sm:table-cell">W</th>
      <th className="sticky top-0 bg-gray-100 px-2 py-2 text-center text-xs font-semibold text-gray-600 w-10 hidden sm:table-cell">D</th>
      <th className="sticky top-0 bg-gray-100 px-2 py-2 text-center text-xs font-semibold text-gray-600 w-10 hidden sm:table-cell">L</th>
      <th className="sticky top-0 bg-gray-100 px-2 py-2 text-center text-xs font-semibold text-gray-600 w-10">GD</th>
      <th className="sticky top-0 bg-gray-100 px-2 py-2 text-center text-xs font-semibold text-gray-600 w-12">Pts</th>
    </tr>
  );
}

function FootballRow({ entry, index }: { entry: FootballStandingEntry; index: number }) {
  const isTopFour = entry.rank <= 4;
  return (
    <tr className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} ${isTopFour ? 'border-l-2 border-l-blue-500' : ''}`}>
      <td className="px-2 py-2 text-sm font-medium text-gray-700">{entry.rank}</td>
      <td className="px-2 py-2 text-sm text-gray-900 flex items-center gap-2">
        {entry.team.logo && <img src={entry.team.logo} alt="" className="w-5 h-5" />}
        <span className="truncate">{entry.team.name}</span>
      </td>
      <td className="px-2 py-2 text-sm text-center text-gray-600">{entry.played}</td>
      <td className="px-2 py-2 text-sm text-center text-gray-600 hidden sm:table-cell">{entry.won}</td>
      <td className="px-2 py-2 text-sm text-center text-gray-600 hidden sm:table-cell">{entry.drawn}</td>
      <td className="px-2 py-2 text-sm text-center text-gray-600 hidden sm:table-cell">{entry.lost}</td>
      <td className="px-2 py-2 text-sm text-center text-gray-600">{entry.goalDifference > 0 ? `+${entry.goalDifference}` : entry.goalDifference}</td>
      <td className="px-2 py-2 text-sm text-center font-bold text-gray-900">{entry.points}</td>
    </tr>
  );
}

function F1Header() {
  return (
    <tr>
      <th className="sticky top-0 bg-gray-100 px-2 py-2 text-left text-xs font-semibold text-gray-600 w-8">#</th>
      <th className="sticky top-0 bg-gray-100 px-2 py-2 text-left text-xs font-semibold text-gray-600">Driver</th>
      <th className="sticky top-0 bg-gray-100 px-2 py-2 text-left text-xs font-semibold text-gray-600 hidden sm:table-cell">Team</th>
      <th className="sticky top-0 bg-gray-100 px-2 py-2 text-center text-xs font-semibold text-gray-600 w-12">Wins</th>
      <th className="sticky top-0 bg-gray-100 px-2 py-2 text-center text-xs font-semibold text-gray-600 w-12">Pts</th>
    </tr>
  );
}

function F1Row({ entry, index }: { entry: F1DriverStanding; index: number }) {
  const isTopThree = entry.rank <= 3;
  return (
    <tr className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} ${isTopThree ? 'border-l-2 border-l-yellow-500' : ''}`}>
      <td className="px-2 py-2 text-sm font-medium text-gray-700">{entry.rank}</td>
      <td className="px-2 py-2 text-sm text-gray-900">{entry.driver.name}</td>
      <td className="px-2 py-2 text-sm text-gray-600 hidden sm:table-cell">{entry.team.name}</td>
      <td className="px-2 py-2 text-sm text-center text-gray-600">{entry.wins}</td>
      <td className="px-2 py-2 text-sm text-center font-bold text-gray-900">{entry.points}</td>
    </tr>
  );
}

function TennisHeader() {
  return (
    <tr>
      <th className="sticky top-0 bg-gray-100 px-2 py-2 text-left text-xs font-semibold text-gray-600 w-8">#</th>
      <th className="sticky top-0 bg-gray-100 px-2 py-2 text-left text-xs font-semibold text-gray-600">Player</th>
      <th className="sticky top-0 bg-gray-100 px-2 py-2 text-left text-xs font-semibold text-gray-600 hidden sm:table-cell">Country</th>
      <th className="sticky top-0 bg-gray-100 px-2 py-2 text-center text-xs font-semibold text-gray-600 w-14">Pts</th>
    </tr>
  );
}

function TennisRow({ entry, index }: { entry: TennisRanking; index: number }) {
  const isTopTen = entry.rank <= 10;
  return (
    <tr className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} ${isTopTen ? 'border-l-2 border-l-green-500' : ''}`}>
      <td className="px-2 py-2 text-sm font-medium text-gray-700">{entry.rank}</td>
      <td className="px-2 py-2 text-sm text-gray-900">{entry.player.name}</td>
      <td className="px-2 py-2 text-sm text-gray-600 hidden sm:table-cell">{entry.player.country ?? '—'}</td>
      <td className="px-2 py-2 text-sm text-center font-bold text-gray-900">{entry.points}</td>
    </tr>
  );
}

function F1ConstructorHeader() {
  return (
    <tr>
      <th className="sticky top-0 bg-gray-100 px-2 py-2 text-left text-xs font-semibold text-gray-600 w-8">#</th>
      <th className="sticky top-0 bg-gray-100 px-2 py-2 text-left text-xs font-semibold text-gray-600">Constructor</th>
      <th className="sticky top-0 bg-gray-100 px-2 py-2 text-center text-xs font-semibold text-gray-600 w-14">Pts</th>
    </tr>
  );
}

function F1ConstructorRow({ entry, index }: { entry: F1ConstructorStanding; index: number }) {
  const isTopThree = entry.rank <= 3;
  return (
    <tr className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} ${isTopThree ? 'border-l-2 border-l-yellow-500' : ''}`}>
      <td className="px-2 py-2 text-sm font-medium text-gray-700">{entry.rank}</td>
      <td className="px-2 py-2 text-sm text-gray-900 flex items-center gap-2">
        {entry.team.color && (
          <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: `#${entry.team.color}` }} />
        )}
        {entry.team.name}
      </td>
      <td className="px-2 py-2 text-sm text-center font-bold text-gray-900">{entry.points}</td>
    </tr>
  );
}

export default function StandingTable({ standings }: Props) {
  if (standings.entries.length === 0) {
    return <p className="text-center text-gray-400 py-8 text-sm">No standings available</p>;
  }

  const firstEntry = standings.entries[0];

  return (
    <div className="overflow-auto rounded-lg border border-gray-200 shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead>
          {isFootballStanding(firstEntry) && <FootballHeader />}
          {isF1Standing(firstEntry) && <F1Header />}
          {isF1ConstructorStanding(firstEntry) && <F1ConstructorHeader />}
          {isTennisRanking(firstEntry) && <TennisHeader />}
        </thead>
        <tbody>
          {standings.entries.map((entry, i) => {
            if (isFootballStanding(entry)) return <FootballRow key={entry.rank} entry={entry} index={i} />;
            if (isF1Standing(entry)) return <F1Row key={entry.rank} entry={entry} index={i} />;
            if (isF1ConstructorStanding(entry)) return <F1ConstructorRow key={entry.rank} entry={entry} index={i} />;
            if (isTennisRanking(entry)) return <TennisRow key={entry.rank} entry={entry} index={i} />;
            return null;
          })}
        </tbody>
      </table>
    </div>
  );
}
