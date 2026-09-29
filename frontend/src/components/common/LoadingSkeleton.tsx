import React from 'react';

export const LoadingSkeleton: React.FC<{ count?: number; type?: 'card' | 'row' | 'detail' }> = ({
  count = 4,
  type = 'card',
}) => {
  if (type === 'row') {
    return (
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="h-16 bg-slate-900/60 border border-slate-800/80 rounded-xl animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (type === 'detail') {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-pulse">
        <div className="aspect-square bg-slate-900/80 border border-slate-800 rounded-2xl" />
        <div className="space-y-4">
          <div className="h-8 bg-slate-800 rounded-lg w-3/4" />
          <div className="h-4 bg-slate-800/60 rounded w-1/4" />
          <div className="h-6 bg-slate-800/80 rounded w-1/3" />
          <div className="h-24 bg-slate-900/60 rounded-xl" />
          <div className="h-12 bg-slate-800 rounded-xl w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex flex-col gap-3 animate-pulse"
        >
          <div className="w-full aspect-[4/3] bg-slate-800/60 rounded-xl" />
          <div className="h-4 bg-slate-800/80 rounded w-2/3" />
          <div className="h-3 bg-slate-800/40 rounded w-1/2" />
          <div className="mt-auto flex justify-between items-center pt-2">
            <div className="h-5 bg-slate-800/80 rounded w-1/4" />
            <div className="h-8 bg-slate-800 rounded-lg w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
};
