import { REGULAR_SEASON_PREFIX } from '../config/players';
import type { AverageStats, GameStats, ScheduleGame, TeamRecord } from '../types/nba';

// ---------------------------------------------------------------------------
// Averages
// ---------------------------------------------------------------------------

const parseMinutesToDecimal = (minutes: string): number => {
  const [m, s] = minutes.split(':').map(Number);
  return (m ?? 0) + (s ?? 0) / 60;
};

export const computeAverages = (games: GameStats[]): AverageStats => {
  const count = games.length;
  if (count === 0) {
    return {
      gamesPlayed: 0,
      minutes: 0,
      points: 0,
      rebounds: 0,
      assists: 0,
      steals: 0,
      blocks: 0,
      turnovers: 0,
      fouls: 0,
      plusMinus: 0,
      fgPct: 0,
      fg3Pct: 0,
      ftPct: 0,
    };
  }

  const sum = games.reduce(
    (acc, g) => ({
      minutes: acc.minutes + parseMinutesToDecimal(g.minutes),
      points: acc.points + g.points,
      rebounds: acc.rebounds + g.rebounds,
      assists: acc.assists + g.assists,
      steals: acc.steals + g.steals,
      blocks: acc.blocks + g.blocks,
      turnovers: acc.turnovers + g.turnovers,
      fouls: acc.fouls + g.fouls,
      plusMinus: acc.plusMinus + g.plusMinus,
      fgm: acc.fgm + g.fgm,
      fga: acc.fga + g.fga,
      fg3m: acc.fg3m + g.fg3m,
      fg3a: acc.fg3a + g.fg3a,
      ftm: acc.ftm + g.ftm,
      fta: acc.fta + g.fta,
    }),
    { minutes: 0, points: 0, rebounds: 0, assists: 0, steals: 0, blocks: 0,
      turnovers: 0, fouls: 0, plusMinus: 0, fgm: 0, fga: 0, fg3m: 0, fg3a: 0, ftm: 0, fta: 0 },
  );

  return {
    gamesPlayed: count,
    minutes: sum.minutes / count,
    points: sum.points / count,
    rebounds: sum.rebounds / count,
    assists: sum.assists / count,
    steals: sum.steals / count,
    blocks: sum.blocks / count,
    turnovers: sum.turnovers / count,
    fouls: sum.fouls / count,
    plusMinus: sum.plusMinus / count,
    fgPct: sum.fga > 0 ? sum.fgm / sum.fga : 0,
    fg3Pct: sum.fg3a > 0 ? sum.fg3m / sum.fg3a : 0,
    ftPct: sum.fta > 0 ? sum.ftm / sum.fta : 0,
  };
};

export const computeLast5Averages = (games: GameStats[]): AverageStats =>
  computeAverages(games.slice(0, 5));

// ---------------------------------------------------------------------------
// Team record
// ---------------------------------------------------------------------------

export const computeTeamRecord = (teamId: number, schedule: ScheduleGame[]): TeamRecord =>
  schedule
    .filter(
      (g) =>
        g.gameId.startsWith(REGULAR_SEASON_PREFIX) &&
        g.status === 'completed' &&
        (g.homeTeamId === teamId || g.awayTeamId === teamId),
    )
    .reduce(
      (acc, g) => {
        const teamScore = g.homeTeamId === teamId ? g.homeScore : g.awayScore;
        const oppScore = g.homeTeamId === teamId ? g.awayScore : g.homeScore;
        return teamScore > oppScore
          ? { wins: acc.wins + 1, losses: acc.losses }
          : { wins: acc.wins, losses: acc.losses + 1 };
      },
      { wins: 0, losses: 0 },
    );

// ---------------------------------------------------------------------------
// Player game extraction
// ---------------------------------------------------------------------------

export const extractPlayerGames = (
  playerId: number,
  teamId: number,
  schedule: ScheduleGame[],
  boxscoreMap: Map<string, Map<number, GameStats>>,
): GameStats[] =>
  schedule
    .filter(
      (g) =>
        g.gameId.startsWith(REGULAR_SEASON_PREFIX) &&
        g.status === 'completed' &&
        (g.homeTeamId === teamId || g.awayTeamId === teamId),
    )
    .flatMap((g) => {
      const boxscore = boxscoreMap.get(g.gameId);
      const stats = boxscore?.get(playerId);
      return stats ? [stats] : [];
    })
    .sort((a, b) => b.gameDate.localeCompare(a.gameDate));
