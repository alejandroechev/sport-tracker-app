import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { getCompetitionById } from '../../domain/config/competitions';
import { MatchCard } from '../components/MatchCard';
import RefreshButton from '../components/RefreshButton';
import StandingTable from '../components/StandingTable';
import { useSportData } from '../hooks/useSportData';

type Tab = 'standings' | 'upcoming' | 'live';

const TABS: { key: Tab; label: string }[] = [
  { key: 'standings', label: 'Standings' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'live', label: 'Live' },
];

export default function CompetitionPage() {
  const { competitionId } = useParams<{ competitionId: string }>();
  const competition = competitionId
    ? getCompetitionById(competitionId)
    : undefined;

  const [activeTab, setActiveTab] = useState<Tab>('standings');
  const fetchedTabs = useRef<Set<Tab>>(new Set());

  const {
    standings,
    loadingStandings,
    errorStandings,
    refreshStandings,
    lastUpdatedStandings,

    upcoming,
    loadingUpcoming,
    errorUpcoming,
    refreshUpcoming,
    lastUpdatedUpcoming,

    liveByCompetition,
    loadingLiveByComp,
    refreshLiveByCompetition,
  } = useSportData();

  const fetchTabData = useCallback(
    (tab: Tab) => {
      if (!competitionId) return;
      switch (tab) {
        case 'standings':
          refreshStandings(competitionId);
          break;
        case 'upcoming':
          refreshUpcoming(competitionId);
          break;
        case 'live':
          refreshLiveByCompetition(competitionId);
          break;
      }
    },
    [competitionId, refreshStandings, refreshUpcoming, refreshLiveByCompetition],
  );

  // Lazy-fetch on first tab view
  useEffect(() => {
    if (!competitionId || !competition) return;
    if (fetchedTabs.current.has(activeTab)) return;
    fetchedTabs.current.add(activeTab);
    fetchTabData(activeTab);
  }, [activeTab, competitionId, competition, fetchTabData]);

  // After this guard, competitionId is guaranteed to be defined
  if (!competition || !competitionId) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="max-w-lg mx-auto p-4 space-y-4">
          <Link
            to="/sports"
            className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 min-h-12 py-2"
          >
            ← Back
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            Competition not found
          </h1>
          <p className="text-gray-600">
            No competition exists with ID &quot;{competitionId}&quot;.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-lg mx-auto p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link
            to="/sports"
            className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 min-h-12 py-2"
          >
            ← Back
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            {competition.name}
          </h1>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 rounded-lg bg-gray-200 p-1">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors min-h-[44px] ${
                activeTab === tab.key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="space-y-4">
          {activeTab === 'standings' && (
            <StandingsTab
              standings={standings}
              loading={loadingStandings}
              error={errorStandings}
              lastUpdated={lastUpdatedStandings}
              onRefresh={() => {
                fetchedTabs.current.delete('standings');
                refreshStandings(competitionId);
              }}
            />
          )}
          {activeTab === 'upcoming' && (
            <UpcomingTab
              matches={upcoming}
              loading={loadingUpcoming}
              error={errorUpcoming}
              lastUpdated={lastUpdatedUpcoming}
              onRefresh={() => {
                fetchedTabs.current.delete('upcoming');
                refreshUpcoming(competitionId);
              }}
            />
          )}
          {activeTab === 'live' && (
            <LiveTab
              matches={liveByCompetition}
              loading={loadingLiveByComp}
              onRefresh={() => {
                fetchedTabs.current.delete('live');
                refreshLiveByCompetition(competitionId);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Sub-components for each tab ─── */

function StandingsTab({
  standings,
  loading,
  error,
  lastUpdated,
  onRefresh,
}: {
  standings: ReturnType<typeof useSportData>['standings'];
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
  onRefresh: () => void;
}) {
  return (
    <>
      <RefreshButton
        onRefresh={onRefresh}
        isLoading={loading}
        lastUpdated={lastUpdated ?? undefined}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      {loading && !standings && (
        <p className="text-sm text-gray-500">Loading standings…</p>
      )}
      {standings && <StandingTable standings={standings} />}
      {!loading && !standings && !error && (
        <p className="text-center text-gray-400 py-8 text-sm">
          No standings available
        </p>
      )}
    </>
  );
}

function UpcomingTab({
  matches,
  loading,
  error,
  lastUpdated,
  onRefresh,
}: {
  matches: ReturnType<typeof useSportData>['upcoming'];
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
  onRefresh: () => void;
}) {
  const display = matches.slice(0, 10);

  return (
    <>
      <RefreshButton
        onRefresh={onRefresh}
        isLoading={loading}
        lastUpdated={lastUpdated ?? undefined}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      {loading && display.length === 0 && (
        <p className="text-sm text-gray-500">Loading upcoming matches…</p>
      )}
      {display.length > 0 && (
        <div className="space-y-3">
          {display.map((m) => (
            <MatchCard key={m.id} match={m} />
          ))}
        </div>
      )}
      {!loading && display.length === 0 && !error && (
        <p className="text-center text-gray-400 py-8 text-sm">
          No upcoming matches
        </p>
      )}
    </>
  );
}

function LiveTab({
  matches,
  loading,
  onRefresh,
}: {
  matches: ReturnType<typeof useSportData>['liveByCompetition'];
  loading: boolean;
  onRefresh: () => void;
}) {
  return (
    <>
      <RefreshButton onRefresh={onRefresh} isLoading={loading} />
      {loading && matches.length === 0 && (
        <p className="text-sm text-gray-500">Checking for live matches…</p>
      )}
      {matches.length > 0 && (
        <div className="space-y-3">
          {matches.map((m) => (
            <MatchCard key={m.id} match={m} />
          ))}
        </div>
      )}
      {!loading && matches.length === 0 && (
        <p className="text-center text-gray-400 py-8 text-sm">
          No live matches right now
        </p>
      )}
    </>
  );
}
