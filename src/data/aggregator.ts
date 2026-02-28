import type { AverageStats, GameStats, ScheduleGame, TeamRecord, TrackedPlayer } from '../types/nba';

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

export const computeTeamRecord = (
  teamId: number,
  schedule: ScheduleGame[],
  allPlayers: TrackedPlayer[],
): TeamRecord => {
  const completedGames = schedule.filter(
    (g) => g.gameId.startsWith('0022') && g.status === 'completed' && (g.homeTeamId === teamId || g.awayTeamId === teamId),
  );

  const { wins, losses } = completedGames.reduce(
    (acc, g) => {
      const isHome = g.homeTeamId === teamId;
      const teamScore = isHome ? g.homeScore : g.awayScore;
      const oppScore = isHome ? g.awayScore : g.homeScore;
      return teamScore > oppScore
        ? { ...acc, wins: acc.wins + 1 }
        : { ...acc, losses: acc.losses + 1 };
    },
    { wins: 0, losses: 0 },
  );

  // Rank within tracked teams in the same conference
  const conference = allPlayers.find((p) => p.teamId === teamId)?.conference;
  const conferenceTeamIds = [...new Set(allPlayers
    .filter((p) => p.conference === conference)
    .map((p) => p.teamId))];

  const rank = conferenceTeamIds
    .map((tid) => {
      const tGames = schedule.filter(
        (g) => g.gameId.startsWith('0022') && g.status === 'completed' && (g.homeTeamId === tid || g.awayTeamId === tid),
      );
      const { w } = tGames.reduce(
        (acc, g) => {
          const isHome = g.homeTeamId === tid;
          const ts = isHome ? g.homeScore : g.awayScore;
          const os = isHome ? g.awayScore : g.homeScore;
          return ts > os ? { w: acc.w + 1, l: acc.l } : { w: acc.w, l: acc.l + 1 };
        },
        { w: 0, l: 0 },
      );
      const total = tGames.length;
      return { tid, winPct: total > 0 ? w / total : 0 };
    })
    .sort((a, b) => b.winPct - a.winPct)
    .findIndex((t) => t.tid === teamId) + 1;

  return { wins, losses, conferenceRank: rank };
};

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
        g.gameId.startsWith('0022') &&
        g.status === 'completed' &&
        (g.homeTeamId === teamId || g.awayTeamId === teamId),
    )
    .flatMap((g) => {
      const boxscore = boxscoreMap.get(g.gameId);
      const stats = boxscore?.get(playerId);
      return stats ? [stats] : [];
    })
    .sort((a, b) => b.gameDate.localeCompare(a.gameDate));
