import type { AverageStats, GameStats, PlayerData, ViewMode } from '../types/nba';
import { fmtDate, fmtPct, fmtRecord, fmtStat } from '../utils/formatters';

interface PlayerRowProps {
  data: PlayerData;
  mode: ViewMode;
  leadingStats: Set<string>;
}

type Trend = { arrow: '↑' | '↓'; good: boolean } | null;

const minutesToDecimal = (minutes: string): number => {
  const [m, s] = minutes.split(':').map(Number);
  return (m ?? 0) + (s ?? 0) / 60;
};

const computeTrend = (gameVal: number, avgVal: number, higherBetter: boolean): Trend => {
  if (gameVal === 0) return null;
  if (gameVal > avgVal) return { arrow: '↑', good: higherBetter };
  if (gameVal < avgVal) return { arrow: '↓', good: !higherBetter };
  return null;
};

const StatCell = ({ value, isLeader, trend }: { value: string; isLeader?: boolean; trend?: Trend }) => (
  <td className={`px-3 py-2 text-right text-sm tabular-nums ${isLeader ? 'text-amber-300 font-semibold' : ''}`}>
    {isLeader ? <span className="inline-block bg-amber-900/40 rounded px-1">{value}</span> : value}
    {trend && <span className={`text-xs ${trend.good ? 'text-green-500' : 'text-red-400'}`}>{trend.arrow}</span>}
  </td>
);

const AverageStatCells = ({ avg, leading }: { avg: AverageStats; leading: Set<string> }) => (
  <>
    <StatCell value={fmtStat(avg.minutes)}   isLeader={leading.has('min')} />
    <StatCell value={fmtStat(avg.points)}    isLeader={leading.has('pts')} />
    <StatCell value={fmtStat(avg.rebounds)}  isLeader={leading.has('reb')} />
    <StatCell value={fmtStat(avg.assists)}   isLeader={leading.has('ast')} />
    <StatCell value={fmtStat(avg.steals)}    isLeader={leading.has('stl')} />
    <StatCell value={fmtStat(avg.blocks)}    isLeader={leading.has('blk')} />
    <StatCell value={fmtStat(avg.turnovers)} isLeader={leading.has('tov')} />
    <StatCell value={fmtStat(avg.fouls)}     isLeader={leading.has('pf')} />
    <StatCell value={fmtStat(avg.plusMinus)} isLeader={leading.has('pm')} />
    <StatCell value={fmtPct(avg.fgPct)}      isLeader={leading.has('fgPct')} />
    <StatCell value={fmtPct(avg.fg3Pct)}     isLeader={leading.has('fg3Pct')} />
    <StatCell value={fmtPct(avg.ftPct)}      isLeader={leading.has('ftPct')} />
  </>
);

const GameStatCells = ({ game, avg, leading }: { game: GameStats; avg: AverageStats; leading: Set<string> }) => {
  const t = (gameVal: number, avgVal: number, higherBetter: boolean) =>
    computeTrend(gameVal, avgVal, higherBetter);
  return (
    <>
      <StatCell value={game.minutes}            isLeader={leading.has('min')}    trend={t(minutesToDecimal(game.minutes), avg.minutes, true)} />
      <StatCell value={String(game.points)}     isLeader={leading.has('pts')}    trend={t(game.points, avg.points, true)} />
      <StatCell value={String(game.rebounds)}   isLeader={leading.has('reb')}    trend={t(game.rebounds, avg.rebounds, true)} />
      <StatCell value={String(game.assists)}    isLeader={leading.has('ast')}    trend={t(game.assists, avg.assists, true)} />
      <StatCell value={String(game.steals)}     isLeader={leading.has('stl')}    trend={t(game.steals, avg.steals, true)} />
      <StatCell value={String(game.blocks)}     isLeader={leading.has('blk')}    trend={t(game.blocks, avg.blocks, true)} />
      <StatCell value={String(game.turnovers)}  isLeader={leading.has('tov')}    trend={t(game.turnovers, avg.turnovers, false)} />
      <StatCell value={String(game.fouls)}      isLeader={leading.has('pf')}     trend={t(game.fouls, avg.fouls, false)} />
      <StatCell value={String(game.plusMinus)}  isLeader={leading.has('pm')}     trend={t(game.plusMinus, avg.plusMinus, true)} />
      <StatCell value={fmtPct(game.fgPct)}      isLeader={leading.has('fgPct')}  trend={t(game.fgPct, avg.fgPct, true)} />
      <StatCell value={fmtPct(game.fg3Pct)}     isLeader={leading.has('fg3Pct')} trend={t(game.fg3Pct, avg.fg3Pct, true)} />
      <StatCell value={fmtPct(game.ftPct)}      isLeader={leading.has('ftPct')}  trend={t(game.ftPct, avg.ftPct, true)} />
    </>
  );
};

export const PlayerRow = ({ data, mode, leadingStats }: PlayerRowProps) => {
  const { player, games, seasonAverages, last5Averages, teamRecord } = data;
  const lastGame = games[0] ?? null;
  const avg = mode === 'seasonAvg' ? seasonAverages : last5Averages;

  return (
    <tr className="border-t border-gray-800 odd:bg-gray-900/20 hover:bg-blue-950/30 transition-colors">
      <td className="px-3 py-2 text-sm font-medium whitespace-nowrap">{player.name}</td>
      <td className="px-3 py-2 text-sm text-gray-400 whitespace-nowrap">{fmtRecord(teamRecord.wins, teamRecord.losses)}</td>

      {mode === 'lastGame' && (
        <>
          <td className="px-3 py-2 text-sm text-gray-400">{lastGame ? fmtDate(lastGame.gameDate) : '—'}</td>
          <td className="px-3 py-2 text-sm text-gray-400 whitespace-nowrap">{lastGame?.matchup ?? '—'}</td>
          <td className={`px-3 py-2 text-sm font-semibold ${lastGame?.result === 'W' ? 'text-green-400' : 'text-red-400'}`}>
            {lastGame ? `${lastGame.result} ${lastGame.teamScore}-${lastGame.opponentScore}` : '—'}
          </td>
          <td className="px-3 py-2 text-sm text-center">{lastGame ? (lastGame.starter ? 'S' : 'B') : '—'}</td>
        </>
      )}

      {mode === 'seasonAvg' && (
        <td className="px-3 py-2 text-sm text-gray-400 text-center">{avg.gamesPlayed}</td>
      )}

      {mode === 'lastGame'
        ? lastGame
          ? <GameStatCells game={lastGame} avg={seasonAverages} leading={leadingStats} />
          : Array.from({ length: 12 }).map((_, i) => <StatCell key={i} value="—" />)
        : <AverageStatCells avg={avg} leading={leadingStats} />
      }
    </tr>
  );
};
