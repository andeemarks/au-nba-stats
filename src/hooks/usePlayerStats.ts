import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';
import { fetchBoxscore } from '../api/cdnFetcher';
import { REGULAR_SEASON_PREFIX, TRACKED_PLAYERS } from '../config/players';
import { computeAverages, computeLast5Averages, computeTeamRecord, extractPlayerGames } from '../data/aggregator';
import type { GameStats, PlayerData, ScheduleGame } from '../types/nba';

interface UsePlayerStatsResult {
  players: PlayerData[];
  loading: boolean;
  progress: { loaded: number; total: number };
  error: string | null;
}

const BATCH_SIZE = 5;

const assemblePlayerData = (
  boxscoreMap: Map<string, Map<number, GameStats>>,
  schedule: ScheduleGame[],
  teamRecords: Map<number, { wins: number; losses: number }>,
): PlayerData[] =>
  TRACKED_PLAYERS.map((player) => {
    const games = extractPlayerGames(player.id, player.teamId, schedule, boxscoreMap);
    return {
      player,
      games,
      seasonAverages: computeAverages(games),
      last5Averages: computeLast5Averages(games),
      teamRecord: teamRecords.get(player.teamId) ?? { wins: 0, losses: 0 },
    };
  });

const fetchGamesInBatches = async (
  games: ScheduleGame[],
  abortRef: RefObject<boolean>,
  onBatch: (map: Map<string, Map<number, GameStats>>, loaded: number) => void,
): Promise<void> => {
  const map = new Map<string, Map<number, GameStats>>();
  for (let i = 0; i < games.length; i += BATCH_SIZE) {
    if (abortRef.current) return;
    const batch = games.slice(i, i + BATCH_SIZE);
    const results = await Promise.allSettled(batch.map(fetchBoxscore));
    results.forEach((result, idx) => {
      if (result.status === 'fulfilled') map.set(batch[idx].gameId, result.value);
    });
    onBatch(map, Math.min(i + BATCH_SIZE, games.length));
  }
};

export const usePlayerStats = (schedule: ScheduleGame[]): UsePlayerStatsResult => {
  const [players, setPlayers] = useState<PlayerData[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ loaded: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef(false);

  useEffect(() => {
    if (schedule.length === 0) return;
    abortRef.current = false;
    setLoading(true);
    setError(null);

    const trackedTeamIds = new Set(TRACKED_PLAYERS.map((p) => p.teamId));
    const relevantGames = schedule.filter(
      (g) =>
        g.gameId.startsWith(REGULAR_SEASON_PREFIX) &&
        g.status === 'completed' &&
        (trackedTeamIds.has(g.homeTeamId) || trackedTeamIds.has(g.awayTeamId)),
    );
    const teamRecords = new Map(
      [...trackedTeamIds].map((teamId) => [teamId, computeTeamRecord(teamId, schedule)]),
    );
    setProgress({ loaded: 0, total: relevantGames.length });

    fetchGamesInBatches(relevantGames, abortRef, (map, loaded) => {
      setProgress({ loaded, total: relevantGames.length });
      setPlayers(assemblePlayerData(map, schedule, teamRecords));
    })
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : 'Failed to load player stats'),
      )
      .finally(() => {
        if (!abortRef.current) setLoading(false);
      });

    return () => { abortRef.current = true; };
  }, [schedule]);

  return { players, loading, progress, error };
};