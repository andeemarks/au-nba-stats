import type { GameStats, ScheduleGame } from '../types/nba';
import { cacheGet, cacheGetWithTTL, cacheSet } from './cache';

// In development, requests go through the Vite proxy (/nba-cdn → cdn.nba.com/static/json)
// which adds the correct Origin header to satisfy the CDN's CORS policy.
const CDN_BASE = import.meta.env.DEV ? '/nba-cdn' : 'https://cdn.nba.com/static/json';
const SCHEDULE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours
const SCHEDULE_CACHE_KEY = 'nba_schedule_v2';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const parseScheduleGame = (raw: any): ScheduleGame => {
  const homeScore = Number(raw.homeTeam?.score ?? 0);
  const awayScore = Number(raw.awayTeam?.score ?? 0);
  const statusText: string = raw.gameStatusText ?? '';
  const isFinal = raw.gameStatus === 3 || statusText.toLowerCase().includes('final');

  return {
    gameId: String(raw.gameId),
    gameDate: (raw.gameDateEst ?? '').slice(0, 10), // "YYYY-MM-DD"
    homeTeamId: Number(raw.homeTeam?.teamId),
    awayTeamId: Number(raw.awayTeam?.teamId),
    homeScore,
    awayScore,
    status: isFinal ? 'completed' : raw.gameStatus === 2 ? 'live' : 'upcoming',
  };
};

export const fetchSchedule = async (): Promise<ScheduleGame[]> => {
  const cached = cacheGetWithTTL<ScheduleGame[]>(SCHEDULE_CACHE_KEY, SCHEDULE_TTL_MS);
  if (cached) return cached;

  const url = `${CDN_BASE}/staticData/scheduleLeagueV2.json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch schedule: ${res.status}`);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const json: any = await res.json();
  const gameDates: unknown[] = json?.leagueSchedule?.gameDates ?? [];

  const games = gameDates.flatMap((dateEntry: unknown) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawGames: unknown[] = (dateEntry as any).games ?? [];
    return rawGames.map(parseScheduleGame);
  });

  cacheSet(SCHEDULE_CACHE_KEY, games);
  return games;
};

/** Parses ISO 8601 duration e.g. "PT35M56.00S" or "PT45M" → "35:56" or "45:00" */
const parseMinutes = (iso: string): string => {
  const withSecs = iso.match(/PT(\d+)M([\d.]+)S/);
  if (withSecs) {
    const secs = Math.round(Number(withSecs[2])).toString().padStart(2, '0');
    return `${withSecs[1]}:${secs}`;
  }
  const minsOnly = iso.match(/PT(\d+)M/);
  return minsOnly ? `${minsOnly[1]}:00` : '0:00';
};

interface GameContext {
  gameId: string;
  gameDate: string;
  matchup: string;
  opponent: string;
  result: 'W' | 'L';
  teamScore: number;
  opponentScore: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const parsePlayerStats = (player: any, ctx: GameContext): GameStats => {
  const s = player.statistics ?? {};
  return {
    ...ctx,
    starter: player.starter === 1 || player.starter === '1',
    minutes: parseMinutes(s.minutesCalculated ?? 'PT0M0.00S'),
    points: Number(s.points ?? 0),
    rebounds: Number(s.reboundsTotal ?? 0),
    assists: Number(s.assists ?? 0),
    steals: Number(s.steals ?? 0),
    blocks: Number(s.blocks ?? 0),
    turnovers: Number(s.turnovers ?? 0),
    fouls: Number(s.foulsPersonal ?? 0),
    plusMinus: Number(s.plusMinusPoints ?? 0),
    fgm: Number(s.fieldGoalsMade ?? 0),
    fga: Number(s.fieldGoalsAttempted ?? 0),
    fgPct: Number(s.fieldGoalsPercentage ?? 0),
    fg3m: Number(s.threePointersMade ?? 0),
    fg3a: Number(s.threePointersAttempted ?? 0),
    fg3Pct: Number(s.threePointersPercentage ?? 0),
    ftm: Number(s.freeThrowsMade ?? 0),
    fta: Number(s.freeThrowsAttempted ?? 0),
    ftPct: Number(s.freeThrowsPercentage ?? 0),
  };
};

interface MatchupContext {
  homeTricode: string;
  awayTricode: string;
  game: ScheduleGame;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const playerEntries = (players: any[], teamScore: number, oppScore: number, isHome: boolean, ctx: MatchupContext): [number, GameStats][] => {
  const result: 'W' | 'L' = teamScore > oppScore ? 'W' : 'L';
  const oppTricode = isHome ? ctx.awayTricode : ctx.homeTricode;
  const matchup = isHome
    ? `${ctx.homeTricode} vs. ${ctx.awayTricode}`
    : `${ctx.awayTricode} @ ${ctx.homeTricode}`;
  const gameCtx: GameContext = {
    gameId: ctx.game.gameId, gameDate: ctx.game.gameDate,
    matchup, opponent: oppTricode, result, teamScore, opponentScore: oppScore,
  };
  return players.flatMap((p) => {
    const playerId = Number(p.personId);
    return playerId ? [[playerId, parsePlayerStats(p, gameCtx)]] : [];
  });
};

/**
 * Fetches a boxscore and returns a map of playerId → GameStats.
 * Completed game boxscores are cached indefinitely.
 */
export const fetchBoxscore = async (game: ScheduleGame): Promise<Map<number, GameStats>> => {
  const cacheKey = `nba_boxscore_${game.gameId}`;
  const cached = cacheGet<[number, GameStats][]>(cacheKey);
  if (cached) return new Map(cached);

  const url = `${CDN_BASE}/liveData/boxscore/boxscore_${game.gameId}.json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch boxscore ${game.gameId}: ${res.status}`);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const json: any = await res.json();
  const g = json?.game ?? {};

  const homeScore = Number(g.homeTeam?.score ?? game.homeScore);
  const awayScore = Number(g.awayTeam?.score ?? game.awayScore);
  const ctx: MatchupContext = {
    homeTricode: g.homeTeam?.teamTricode ?? '',
    awayTricode: g.awayTeam?.teamTricode ?? '',
    game,
  };

  const entries: [number, GameStats][] = [
    ...playerEntries(g.homeTeam?.players ?? [], homeScore, awayScore, true, ctx),
    ...playerEntries(g.awayTeam?.players ?? [], awayScore, homeScore, false, ctx),
  ];

  if (game.status === 'completed') {
    cacheSet(cacheKey, entries);
  }

  return new Map(entries);
};
