import type { AverageStats, PlayerData, ViewMode } from '../types/nba';
import { fmtDate, fmtPct, fmtRecord, fmtStat } from '../utils/formatters';

interface PlayerRowProps {
  data: PlayerData;
  mode: ViewMode;
}

const StatCell = ({ value }: { value: string }) => (
  <td className="px-3 py-2 text-right text-sm tabular-nums">{value}</td>
);

const AverageStatCells = ({ avg }: { avg: AverageStats }) => (
  <>
    <StatCell value={fmtStat(avg.minutes)} />
    <StatCell value={fmtStat(avg.points)} />
    <StatCell value={fmtStat(avg.rebounds)} />
    <StatCell value={fmtStat(avg.assists)} />
    <StatCell value={fmtStat(avg.steals)} />
    <StatCell value={fmtStat(avg.blocks)} />
    <StatCell value={fmtStat(avg.turnovers)} />
    <StatCell value={fmtStat(avg.fouls)} />
    <StatCell value={fmtStat(avg.plusMinus)} />
    <StatCell value={fmtPct(avg.fgPct)} />
    <StatCell value={fmtPct(avg.fg3Pct)} />
    <StatCell value={fmtPct(avg.ftPct)} />
  </>
);

export const PlayerRow = ({ data, mode }: PlayerRowProps) => {
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
          {lastGame
            ? `${lastGame.result} ${lastGame.teamScore}-${lastGame.opponentScore}`
            : '—'}
        </td>
        <td className="px-3 py-2 text-sm text-center">
          {lastGame ? (lastGame.starter ? 'S' : 'B') : '—'}
        </td>
        {lastGame ? (
          <>
            <StatCell value={lastGame.minutes} />
            <StatCell value={String(lastGame.points)} />
            <StatCell value={String(lastGame.rebounds)} />
            <StatCell value={String(lastGame.assists)} />
            <StatCell value={String(lastGame.steals)} />
            <StatCell value={String(lastGame.blocks)} />
            <StatCell value={String(lastGame.turnovers)} />
            <StatCell value={String(lastGame.fouls)} />
            <StatCell value={String(lastGame.plusMinus)} />
            <StatCell value={fmtPct(lastGame.fgPct)} />
            <StatCell value={fmtPct(lastGame.fg3Pct)} />
            <StatCell value={fmtPct(lastGame.ftPct)} />
          </>
        ) : (
          Array.from({ length: 12 }).map((_, i) => <StatCell key={i} value="—" />)
        )}
      </tr>
    );
  }

  const avg = mode === 'seasonAvg' ? seasonAverages : last5Averages;

  return (
    <tr className="border-t border-gray-800 hover:bg-gray-800/50 transition-colors">
      <td className="px-3 py-2 text-sm font-medium whitespace-nowrap">{player.name}</td>
      <td className="px-3 py-2 text-sm text-gray-400 whitespace-nowrap">{recordStr}</td>
      <td className="px-3 py-2 text-sm text-gray-400 text-center">{avg.gamesPlayed}</td>
      <AverageStatCells avg={avg} />
    </tr>
  );
};
