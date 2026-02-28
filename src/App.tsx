import { useState } from 'react';
import { LoadingState } from './components/LoadingState';
import { StatsTable } from './components/StatsTable';
import { ViewToggle } from './components/ViewToggle';
import { SEASON } from './config/players';
import { usePlayerStats } from './hooks/usePlayerStats';
import { useSchedule } from './hooks/useSchedule';
import type { PlayerData, SortState, ViewMode } from './types/nba';

const DEFAULT_SORT: SortState = { column: 'name', direction: 'asc' };

const ErrorBanner = ({ message }: { message: string }) => (
  <div className="mb-4 px-4 py-3 bg-red-900/40 border border-red-700 rounded-lg text-red-300 text-sm">
    {message}
  </div>
);

const LoadedView = ({ mode, onModeChange, players, sortState, onSort, updating, progress }: {
  mode: ViewMode; onModeChange: (m: ViewMode) => void;
  players: PlayerData[]; sortState: SortState; onSort: (col: string) => void;
  updating: boolean; progress: { loaded: number; total: number };
}) => (
  <>
    <div className="mb-4 flex items-center justify-between gap-4 flex-wrap">
      <ViewToggle mode={mode} onChange={onModeChange} />
      {updating && progress.total > 0 && (
        <p className="text-xs text-gray-500">Updating… {progress.loaded}/{progress.total}</p>
      )}
    </div>
    <StatsTable players={players} mode={mode} sortState={sortState} onSort={onSort} />
  </>
);

function App() {
  const [mode, setMode] = useState<ViewMode>('lastGame');
  const [sortState, setSortState] = useState<SortState>(DEFAULT_SORT);

  const { schedule, loading: scheduleLoading, error: scheduleError } = useSchedule();
  const { players, loading: statsLoading, progress, error: statsError } = usePlayerStats(schedule);

  const handleSort = (column: string) =>
    setSortState((prev) =>
      prev.column === column
        ? { column, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
        : { column, direction: column === 'name' ? 'asc' : 'desc' },
    );

  const error = scheduleError ?? statsError;
  const isLoading = scheduleLoading || (statsLoading && players.length === 0);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div className="max-w-[1600px] mx-auto px-4 py-6">
        <header className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">NBA Player Stats</h1>
          <p className="text-gray-400 text-sm mt-1">{SEASON} Season</p>
        </header>
        {error && <ErrorBanner message={error} />}
        {isLoading
          ? <LoadingState loaded={progress.loaded} total={progress.total} />
          : <LoadedView mode={mode} onModeChange={setMode} players={players} sortState={sortState} onSort={handleSort} updating={statsLoading} progress={progress} />
        }
      </div>
    </div>
  );
}

export default App;
