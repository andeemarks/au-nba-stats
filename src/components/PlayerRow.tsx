import type { AverageStats, PlayerData, ViewMode } from '../types/nba';
import { fmtDate, fmtPct, fmtRecord, fmtStat } from '../utils/formatters';

interface PlayerRowProps {
  data: PlayerData;
  mode: ViewMode;
  leadingStats: Set<string>;
}

const StatCell = ({ value, isLeader }: { value: string; isLeader?: boolean }) => (
  <td className={`px-3 py-2 text-right text-sm tabular-nums ${isLeader ? 'text-amber-300 font-semibold' : ''}`}>
    {isLeader ? <span className="inline-block bg-amber-900/40 rounded px-1">{value}</span> : value}
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

export const PlayerRow = ({ data, mode, leadingStats }: PlayerRowProps) => {
  const { player, games, seasonAverages, last5Averages, teamRecord } = data;
  const lastGame = games[0] ?? null;

  const recordStr = fmtRecord(teamRecord.wins, teamRecord.losses, teamRecord.conferenceRank);

  if (mode === 'lastGame') {
    return (
      <tr className="border-t border-gray-800 odd:bg-gray-900/20 hover:bg-blue-950/30 transition-colors">
        <td className="px-3 py-2 text-sm font-medium whitespace-nowrap">{player.name}</td>
        <td className="px-3 py-2 text-sm text-gray-400 whitespace-nowrap">{recordStr}</td>
        <td className="px-3 py-2 text-sm text-gray-400">
          {lastGame ? fmtDate(lastGame.gameDate) : '—'}
        </td>
        <td className="px-3 py-2 text-sm text-gray-400 whitespace-nowrap">
          {lastGame?.matchup ?? '—'}
        </td>
        <td className={`px-3 py-2 text-sm font-semibold ${lastGame?.result === 'W' ? 'text-green-400' : 'text-red-400'}`}>
          {lastGame ? `${lastGame.result} ${lastGame.teamScore}-${lastGame.opponentScore}` : '—'}
        </td>
        <td className="px-3 py-2 text-sm text-center">
          {lastGame ? (lastGame.starter ? 'S' : 'B') : '—'}
        </td>
        {lastGame ? (
          <>
            <StatCell value={lastGame.minutes}          isLeader={leadingStats.has('min')} />
            <StatCell value={String(lastGame.points)}   isLeader={leadingStats.has('pts')} />
            <StatCell value={String(lastGame.rebounds)} isLeader={leadingStats.has('reb')} />
            <StatCell value={String(lastGame.assists)}  isLeader={leadingStats.has('ast')} />
            <StatCell value={String(lastGame.steals)}   isLeader={leadingStats.has('stl')} />
            <StatCell value={String(lastGame.blocks)}   isLeader={leadingStats.has('blk')} />
            <StatCell value={String(lastGame.turnovers)} isLeader={leadingStats.has('tov')} />
            <StatCell value={String(lastGame.fouls)}    isLeader={leadingStats.has('pf')} />
            <StatCell value={String(lastGame.plusMinus)} isLeader={leadingStats.has('pm')} />
            <StatCell value={fmtPct(lastGame.fgPct)}   isLeader={leadingStats.has('fgPct')} />
            <StatCell value={fmtPct(lastGame.fg3Pct)}  isLeader={leadingStats.has('fg3Pct')} />
            <StatCell value={fmtPct(lastGame.ftPct)}   isLeader={leadingStats.has('ftPct')} />
          </>
        ) : (
          Array.from({ length: 12 }).map((_, i) => <StatCell key={i} value="—" />)
        )}
      </tr>
    );
  }

  const avg = mode === 'seasonAvg' ? seasonAverages : last5Averages;

  return (
    <tr className="border-t border-gray-800 odd:bg-gray-900/20 hover:bg-blue-950/30 transition-colors">
      <td className="px-3 py-2 text-sm font-medium whitespace-nowrap">{player.name}</td>
      <td className="px-3 py-2 text-sm text-gray-400 whitespace-nowrap">{recordStr}</td>
      <td className="px-3 py-2 text-sm text-gray-400 text-center">{avg.gamesPlayed}</td>
      <AverageStatCells avg={avg} leading={leadingStats} />
    </tr>
  );
};
