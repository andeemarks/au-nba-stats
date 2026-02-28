import type { PlayerData, SortState, ViewMode } from '../types/nba';
import { PlayerRow } from './PlayerRow';
import { SortableHeader } from './SortableHeader';

interface StatsTableProps {
  players: PlayerData[];
  mode: ViewMode;
  sortState: SortState;
  onSort: (column: string) => void;
}

const sortValue = (data: PlayerData, column: string, mode: ViewMode): number | string => {
  const { player, games, seasonAverages, last5Averages, teamRecord } = data;
  const lastGame = games[0];
  const avg = mode === 'seasonAvg' ? seasonAverages : last5Averages;

  const statMap: Record<string, number | string> = {
    name: player.name,
    record: teamRecord.wins - teamRecord.losses,
    date: lastGame?.gameDate ?? '',
    matchup: lastGame?.matchup ?? '',
    result: lastGame ? (lastGame.result === 'W' ? 1 : 0) : -1,
    starter: lastGame ? (lastGame.starter ? 1 : 0) : -1,
    gp: avg.gamesPlayed,
    min: mode === 'lastGame' ? (lastGame?.minutes ?? '') : avg.minutes,
    pts: mode === 'lastGame' ? (lastGame?.points ?? -1) : avg.points,
    reb: mode === 'lastGame' ? (lastGame?.rebounds ?? -1) : avg.rebounds,
    ast: mode === 'lastGame' ? (lastGame?.assists ?? -1) : avg.assists,
    stl: mode === 'lastGame' ? (lastGame?.steals ?? -1) : avg.steals,
    blk: mode === 'lastGame' ? (lastGame?.blocks ?? -1) : avg.blocks,
    tov: mode === 'lastGame' ? (lastGame?.turnovers ?? -1) : avg.turnovers,
    pf: mode === 'lastGame' ? (lastGame?.fouls ?? -1) : avg.fouls,
    pm: mode === 'lastGame' ? (lastGame?.plusMinus ?? -999) : avg.plusMinus,
    fgPct: mode === 'lastGame' ? (lastGame?.fgPct ?? -1) : avg.fgPct,
    fg3Pct: mode === 'lastGame' ? (lastGame?.fg3Pct ?? -1) : avg.fg3Pct,
    ftPct: mode === 'lastGame' ? (lastGame?.ftPct ?? -1) : avg.ftPct,
  };

  return statMap[column] ?? 0;
};

const sortPlayers = (players: PlayerData[], sortState: SortState, mode: ViewMode): PlayerData[] =>
  [...players].sort((a, b) => {
    const av = sortValue(a, sortState.column, mode);
    const bv = sortValue(b, sortState.column, mode);
    const cmp = typeof av === 'string' && typeof bv === 'string'
      ? av.localeCompare(bv)
      : (av as number) - (bv as number);
    return sortState.direction === 'asc' ? cmp : -cmp;
  });

// Columns where a higher value is better; tov and pf are lower-is-better.
const STAT_COLS: { key: string; higherBetter: boolean }[] = [
  { key: 'min', higherBetter: true },
  { key: 'pts', higherBetter: true },
  { key: 'reb', higherBetter: true },
  { key: 'ast', higherBetter: true },
  { key: 'stl', higherBetter: true },
  { key: 'blk', higherBetter: true },
  { key: 'tov', higherBetter: false },
  { key: 'pf',  higherBetter: false },
  { key: 'pm',  higherBetter: true },
  { key: 'fgPct',  higherBetter: true },
  { key: 'fg3Pct', higherBetter: true },
  { key: 'ftPct',  higherBetter: true },
];

// Returns a map of playerId → set of stat column keys where that player leads.
const computeLeaders = (players: PlayerData[], mode: ViewMode): Map<number, Set<string>> => {
  const result = new Map<number, Set<string>>();

  const hasData = (d: PlayerData) =>
    mode === 'lastGame' ? d.games.length > 0 : d.seasonAverages.gamesPlayed > 0;

  const eligible = players.filter(hasData);
  if (eligible.length === 0) return result;

  STAT_COLS.forEach(({ key, higherBetter }) => {
    const vals = eligible.map((d) => ({
      id: d.player.id,
      val: sortValue(d, key, mode) as number,
    }));

    const sentinel = higherBetter ? -999 : Infinity;
    const best = vals.reduce(
      (acc, v) => (higherBetter ? Math.max(acc, v.val) : Math.min(acc, v.val)),
      sentinel,
    );

    // Don't highlight a leader of 0 for lower-is-better stats (player may not have played)
    if (!higherBetter && best <= 0) return;

    vals
      .filter((v) => v.val === best)
      .forEach(({ id }) => {
        if (!result.has(id)) result.set(id, new Set());
        result.get(id)!.add(key);
      });
  });

  return result;
};

const SH = (props: { column: string; label: string; sortState: SortState; onSort: (c: string) => void; title?: string }) =>
  <SortableHeader {...props} />;

export const StatsTable = ({ players, mode, sortState, onSort }: StatsTableProps) => {
  const sorted = sortPlayers(players, sortState, mode);
  const leaders = computeLeaders(players, mode);

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-800">
      <table className="w-full text-gray-100 text-sm">
        <thead className="bg-gray-900 sticky top-0 z-10">
          <tr>
            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide cursor-pointer select-none hover:text-gray-200 whitespace-nowrap" onClick={() => onSort('name')}>
              Player{sortState.column === 'name' ? (sortState.direction === 'asc' ? ' ▲' : ' ▼') : ''}
            </th>
            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide cursor-pointer select-none hover:text-gray-200 whitespace-nowrap" onClick={() => onSort('record')}>
              Record{sortState.column === 'record' ? (sortState.direction === 'asc' ? ' ▲' : ' ▼') : ''}
            </th>

            {mode === 'lastGame' ? (
              <>
                <SH column="date" label="Date" sortState={sortState} onSort={onSort} />
                <SH column="matchup" label="Matchup" sortState={sortState} onSort={onSort} />
                <SH column="result" label="Result" sortState={sortState} onSort={onSort} />
                <th className="px-3 py-2 text-center text-xs font-semibold text-gray-400 uppercase tracking-wide">S/B</th>
              </>
            ) : (
              <SH column="gp" label="GP" sortState={sortState} onSort={onSort} title="Games Played" />
            )}

            <SH column="min" label="MIN" sortState={sortState} onSort={onSort} title="Minutes" />
            <SH column="pts" label="PTS" sortState={sortState} onSort={onSort} title="Points" />
            <SH column="reb" label="REB" sortState={sortState} onSort={onSort} title="Rebounds" />
            <SH column="ast" label="AST" sortState={sortState} onSort={onSort} title="Assists" />
            <SH column="stl" label="STL" sortState={sortState} onSort={onSort} title="Steals" />
            <SH column="blk" label="BLK" sortState={sortState} onSort={onSort} title="Blocks" />
            <SH column="tov" label="TOV" sortState={sortState} onSort={onSort} title="Turnovers" />
            <SH column="pf" label="PF" sortState={sortState} onSort={onSort} title="Personal Fouls" />
            <SH column="pm" label="+/-" sortState={sortState} onSort={onSort} title="Plus/Minus" />
            <SH column="fgPct" label="FG%" sortState={sortState} onSort={onSort} title="Field Goal %" />
            <SH column="fg3Pct" label="3P%" sortState={sortState} onSort={onSort} title="3-Point %" />
            <SH column="ftPct" label="FT%" sortState={sortState} onSort={onSort} title="Free Throw %" />
          </tr>
        </thead>
        <tbody>
          {sorted.map((data) => (
            <PlayerRow
              key={data.player.id}
              data={data}
              mode={mode}
              leadingStats={leaders.get(data.player.id) ?? new Set()}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};
