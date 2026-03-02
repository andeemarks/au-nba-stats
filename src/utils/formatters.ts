export const fmtPct = (value: number): string =>
  value === 0 ? '—' : `${(value * 100).toFixed(1)}%`;

export const fmtStat = (value: number, decimals = 1): string =>
  value.toFixed(decimals);

export const fmtRecord = (wins: number, losses: number): string =>
  `${wins}-${losses}`;

export const fmtDate = (etDateStr: string): string => {
  // etDateStr is "YYYY-MM-DD" in Eastern Time (America/New_York).
  // Convert a representative 20:00 ET game time to UTC, then read the local
  // calendar date so that "Yesterday" reflects when the game happened locally.
  const [year, month, day] = etDateStr.split('-').map(Number);

  // Sample noon UTC to determine the ET offset for this date (handles EST/EDT).
  const noonUTC = new Date(Date.UTC(year!, month! - 1, day!, 12, 0, 0));
  const etHourAtNoonUTC = Number(
    new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York',
      hour: 'numeric',
      hour12: false,
    }).format(noonUTC),
  );
  const etOffsetHours = (isNaN(etHourAtNoonUTC) ? 7 : etHourAtNoonUTC) - 12; // e.g. -5 (EST) or -4 (EDT)

  // 20:00 ET expressed as UTC (Date handles day overflow automatically).
  const gameUTC = new Date(Date.UTC(year!, month! - 1, day!, 20 - etOffsetHours, 0, 0));

  // Local calendar date of the game and today.
  const gameLocal = new Date(gameUTC.getFullYear(), gameUTC.getMonth(), gameUTC.getDate());
  const now = new Date();
  const todayLocal = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const diffDays = Math.round((todayLocal.getTime() - gameLocal.getTime()) / 86_400_000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays} days ago`;
};
