import type { Match } from '../../domain/models';

interface MatchCardProps {
  match: Match;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function StatusBadge({ match }: { match: Match }) {
  switch (match.status) {
    case 'live':
      return (
        <div className="flex items-center gap-1.5 text-sm font-medium text-red-600">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-600" />
          </span>
          <span data-testid="elapsed">{match.elapsed}&apos;</span>
        </div>
      );
    case 'finished':
      return <span className="text-sm font-medium text-gray-500">FT</span>;
    case 'scheduled':
      return (
        <span className="text-sm text-gray-500" data-testid="scheduled-date">
          {formatDate(match.date)}
        </span>
      );
    case 'postponed':
      return (
        <span className="text-sm font-semibold text-orange-500">PPD</span>
      );
    case 'cancelled':
      return <span className="text-sm font-semibold text-red-600">CAN</span>;
  }
}

function TeamRow({
  team,
  score,
  isActive,
}: {
  team: Match['homeTeam'];
  score: number | null;
  isActive: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {team.logo && (
          <img
            src={team.logo}
            alt={`${team.name} logo`}
            className="h-5 w-5 object-contain"
          />
        )}
        <span className="text-sm text-gray-900">{team.name}</span>
      </div>
      <span
        className={`text-sm tabular-nums ${isActive ? 'font-bold text-gray-900' : 'text-gray-500'}`}
      >
        {score ?? '-'}
      </span>
    </div>
  );
}

export function MatchCard({ match }: MatchCardProps) {
  const showBoldScore = match.status === 'live' || match.status === 'finished';

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      {match.round && (
        <p className="mb-2 text-xs text-gray-400">{match.round}</p>
      )}

      <div className="flex flex-col gap-1.5">
        <TeamRow
          team={match.homeTeam}
          score={match.score.home}
          isActive={showBoldScore}
        />
        <TeamRow
          team={match.awayTeam}
          score={match.score.away}
          isActive={showBoldScore}
        />
      </div>

      <div className="mt-3 border-t border-gray-100 pt-2">
        <StatusBadge match={match} />
      </div>
    </div>
  );
}
