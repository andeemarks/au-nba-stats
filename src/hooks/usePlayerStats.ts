import { useEffect, useRef, useState } from 'react';
import { fetchBoxscore } from '../api/cdnFetcher';
import { TRACKED_PLAYERS } from '../config/players';
import { computeAverages, computeLast5Averages, computeTeamRecord, extractPlayerGames } from '../data/aggregator';
import type { GameStats, PlayerData, ScheduleGame } from '../types/nba';

interface UsePlayerStatsResult {
  players: PlayerData[];
  loading: boolean;
  progress: { loaded: number; total: number };
  error: string | null;
}

const BATCH_SIZE = 5;

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
        g.status === 'completed' &&
        (trackedTeamIds.has(g.homeTeamId) || trackedTeamIds.has(g.awayTeamId)),
    );

    setProgress({ loaded: 0, total: relevantGames.length });

    const boxscoreMap = new Map<string, Map<number, GameStats>>();

    const fetchInBatches = async () => {
      for (let i = 0; i < relevantGames.length; i += BATCH_SIZE) {
        if (abortRef.current) return;

        const batch = relevantGames.slice(i, i + BATCH_SIZE);
        const results = await Promise.allSettled(batch.map((g) => fetchBoxscore(g)));

        results.forEach((result, idx) => {
          if (result.status === 'fulfilled') {
            boxscoreMap.set(batch[idx].gameId, result.value);
          }
        });

        setProgress({ loaded: Math.min(i + BATCH_SIZE, relevantGames.length), total: relevantGames.length });

        const assembled = TRACKED_PLAYERS.map((player) => {
          const games = extractPlayerGames(player.id, player.teamId, schedule, boxscoreMap);
          return {
            player,
            games,
            seasonAverages: computeAverages(games),
            last5Averages: computeLast5Averages(games),
            teamRecord: computeTeamRecord(player.teamId, schedule, TRACKED_PLAYERS),
          };
        });

        setPlayers(assembled);
      }
    };

    fetchInBatches()
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : 'Failed to load player stats'),
      )
      .finally(() => {
        if (!abortRef.current) setLoading(false);
      });

    return () => {
      abortRef.current = true;
    };
  }, [schedule]);

  return { players, loading, progress, error };
};
