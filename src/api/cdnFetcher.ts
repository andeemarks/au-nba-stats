import type { GameStats, ScheduleGame } from '../types/nba';
import { cacheGet, cacheGetWithTTL, cacheSet } from './cache';

const CDN_BASE = 'https://cdn.nba.com/static/json';
const SCHEDULE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours
const SCHEDULE_CACHE_KEY = 'nba_schedule_v2';

// ---------------------------------------------------------------------------
// Schedule
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const parseScheduleGame = (raw: any): ScheduleGame | null => {
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
    return rawGames.map(parseScheduleGame).filter((g): g is ScheduleGame => g !== null);
  });

  cacheSet(SCHEDULE_CACHE_KEY, games);
  return games;
};

// ---------------------------------------------------------------------------
// Boxscore
// ---------------------------------------------------------------------------

/** Parses ISO 8601 duration "PT35M56.00S" → "35:56" */
const parseMinutes = (iso: string): string => {
  const match = iso.match(/PT(\d+)M([\d.]+)S/);
  if (!match) return '0:00';
  const mins = match[1];
  const secs = Math.round(Number(match[2])).toString().padStart(2, '0');
  return `${mins}:${secs}`;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const parsePlayerStats = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  player: any,
  gameId: string,
  gameDate: string,
  matchup: string,
  opponent: string,
  result: 'W' | 'L',
  teamScore: number,
  opponentScore: number,
): GameStats => {
  const s = player.statistics ?? {};
  return {
    gameId,
    gameDate,
    matchup,
    opponent,
    result,
    teamScore,
    opponentScore,
    starter: player.starter === '1',
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

  const homeTricode: string = g.homeTeam?.teamTricode ?? '';
  const awayTricode: string = g.awayTeam?.teamTricode ?? '';

  const map = new Map<number, GameStats>();

  const addPlayers = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    players: any[],
    teamScore: number,
    oppScore: number,
    oppTricode: string,
    isHome: boolean,
  ) => {
    const result: 'W' | 'L' = teamScore > oppScore ? 'W' : 'L';
    const matchup = isHome
      ? `${homeTricode} vs. ${awayTricode}`
      : `${awayTricode} @ ${homeTricode}`;

    players.forEach((p) => {
      const playerId = Number(p.personId);
      if (!playerId) return;
      map.set(
        playerId,
        parsePlayerStats(p, game.gameId, game.gameDate, matchup, oppTricode, result, teamScore, oppScore),
      );
    });
  };

  addPlayers(g.homeTeam?.players ?? [], homeScore, awayScore, awayTricode, true);
  addPlayers(g.awayTeam?.players ?? [], awayScore, homeScore, homeTricode, false);

  // Only cache completed games — live games may have partial data
  if (game.status === 'completed') {
    cacheSet(cacheKey, [...map.entries()]);
  }

  return map;
};
