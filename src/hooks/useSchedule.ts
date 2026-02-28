import { useEffect, useState } from 'react';
import { fetchSchedule } from '../api/cdnFetcher';
import type { ScheduleGame } from '../types/nba';

interface UseScheduleResult {
  schedule: ScheduleGame[];
  loading: boolean;
  error: string | null;
}

export const useSchedule = (): UseScheduleResult => {
  const [schedule, setSchedule] = useState<ScheduleGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSchedule()
      .then(setSchedule)
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : 'Failed to load schedule'),
      )
      .finally(() => setLoading(false));
  }, []);

  return { schedule, loading, error };
};
