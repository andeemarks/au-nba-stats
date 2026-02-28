import { REGULAR_SEASON_PREFIX } from '../config/players';
import type { AverageStats, GameStats, ScheduleGame, TeamRecord } from '../types/nba';

const parseMinutesToDecimal = (minutes: string): number => {
  const [m, s] = minutes.split(':').map(Number);
  return (m ?? 0) + (s ?? 0) / 60;
};

type StatSums = {
  minutes: number; points: number; rebounds: number; assists: number;
  steals: number; blocks: number; turnovers: number; fouls: number;
  plusMinus: number; fgm: number; fga: number; fg3m: number; fg3a: number;
  ftm: number; fta: number;
};

const ZERO_SUMS: StatSums = {
  minutes: 0, points: 0, rebounds: 0, assists: 0, steals: 0, blocks: 0,
  turnovers: 0, fouls: 0, plusMinus: 0, fgm: 0, fga: 0, fg3m: 0, fg3a: 0, ftm: 0, fta: 0,
};

const addGame = (acc: StatSums, g: GameStats): StatSums => ({
  minutes:   acc.minutes   + parseMinutesToDecimal(g.minutes),
  points:    acc.points    + g.points,
  rebounds:  acc.rebounds  + g.rebounds,
  assists:   acc.assists   + g.assists,
  steals:    acc.steals    + g.steals,
  blocks:    acc.blocks    + g.blocks,
  turnovers: acc.turnovers + g.turnovers,
  fouls:     acc.fouls     + g.fouls,
  plusMinus: acc.plusMinus + g.plusMinus,
  fgm:  acc.fgm  + g.fgm,  fga:  acc.fga  + g.fga,
  fg3m: acc.fg3m + g.fg3m, fg3a: acc.fg3a + g.fg3a,
  ftm:  acc.ftm  + g.ftm,  fta:  acc.fta  + g.fta,
});

export const computeAverages = (games: GameStats[]): AverageStats => {
  if (games.length === 0) return {
    gamesPlayed: 0, minutes: 0, points: 0, rebounds: 0, assists: 0, steals: 0,
    blocks: 0, turnovers: 0, fouls: 0, plusMinus: 0, fgPct: 0, fg3Pct: 0, ftPct: 0,
  };
  const n = games.length;
  const s = games.reduce(addGame, ZERO_SUMS);
  return {
    gamesPlayed: n,
    minutes:   s.minutes   / n,
    points:    s.points    / n,
    rebounds:  s.rebounds  / n,
    assists:   s.assists   / n,
    steals:    s.steals    / n,
    blocks:    s.blocks    / n,
    turnovers: s.turnovers / n,
    fouls:     s.fouls     / n,
    plusMinus: s.plusMinus / n,
    fgPct:  s.fga  > 0 ? s.fgm  / s.fga  : 0,
    fg3Pct: s.fg3a > 0 ? s.fg3m / s.fg3a : 0,
    ftPct:  s.fta  > 0 ? s.ftm  / s.fta  : 0,
  };
};

export const computeLast5Averages = (games: GameStats[]): AverageStats =>
  computeAverages(games.slice(0, 5));

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