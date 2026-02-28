import type { SortState } from '../types/nba';

interface SortableHeaderProps {
  column: string;
  label: string;
  sortState: SortState;
  onSort: (column: string) => void;
  title?: string;
  align?: 'left' | 'right';
}

export const SortableHeader = ({ column, label, sortState, onSort, title, align = 'right' }: SortableHeaderProps) => {
  const isActive = sortState.column === column;
  const indicator = isActive ? (sortState.direction === 'asc' ? ' ▲' : ' ▼') : '';
  const textAlign = align === 'left' ? 'text-left' : 'text-right';

  return (
    <th
      className={`px-3 py-2 ${textAlign} text-xs font-semibold text-gray-400 uppercase tracking-wide cursor-pointer select-none whitespace-nowrap hover:text-gray-200 transition-colors`}
      onClick={() => onSort(column)}
      title={title}
    >
      {label}{indicator}
    </th>
  );
};
