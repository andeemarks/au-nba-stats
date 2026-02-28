export const fmtPct = (value: number): string =>
  value === 0 ? '—' : `${(value * 100).toFixed(1)}%`;

export const fmtStat = (value: number, decimals = 1): string =>
  value === 0 ? '0' : value.toFixed(decimals);

export const fmtRecord = (wins: number, losses: number, rank: number): string =>
  `${wins}-${losses} (#${rank})`;

export const fmtDate = (dateStr: string): string => {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, (month ?? 1) - 1, day);
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
};
