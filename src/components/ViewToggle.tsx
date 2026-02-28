import type { ViewMode } from '../types/nba';

interface ViewToggleProps {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
}

const MODES: { value: ViewMode; label: string }[] = [
  { value: 'lastGame', label: 'Last Game' },
  { value: 'seasonAvg', label: 'Season Avg' },
  { value: 'last5', label: 'Last 5 Games' },
];

export const ViewToggle = ({ mode, onChange }: ViewToggleProps) => (
  <div className="inline-flex rounded-lg overflow-hidden border border-gray-700">
    {MODES.map(({ value, label }) => (
      <button
        key={value}
        onClick={() => onChange(value)}
        className={`px-4 py-2 text-sm font-medium transition-colors ${
          mode === value
            ? 'bg-blue-600 text-white'
            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
        }`}
      >
        {label}
      </button>
    ))}
  </div>
);
