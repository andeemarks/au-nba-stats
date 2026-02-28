interface LoadingStateProps {
  loaded: number;
  total: number;
}

export const LoadingState = ({ loaded, total }: LoadingStateProps) => (
  <div className="flex flex-col items-center justify-center py-20 gap-4 text-gray-400">
    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    {total > 0 && (
      <p className="text-sm">
        Loading box scores… {loaded} / {total}
      </p>
    )}
  </div>
);
