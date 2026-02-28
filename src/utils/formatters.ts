export const fmtPct = (value: number): string =>
  value === 0 ? '—' : `${(value * 100).toFixed(1)}%`;

export const fmtStat = (value: number, decimals = 1): string =>
  value.toFixed(decimals);

export const fmtRecord = (wins: number, losses: number): string =>
  `${wins}-${losses}`;

export const fmtDate = (dateStr: string): string => {
  const [year, month, day] = dateStr.split('-').map(Number);
  const gameDate = new Date(year, (month ?? 1) - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.round((today.getTime() - gameDate.getTime()) / 86_400_000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays} days ago`;
};
