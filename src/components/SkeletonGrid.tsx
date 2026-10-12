import React from 'react';

export const SkeletonGrid: React.FC<{ count?: number }> = ({ count = 10 }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col bg-slate-900 rounded-2xl overflow-hidden border border-slate-800"
        >
          <div className="aspect-[2/3] w-full bg-slate-800/80" />
          <div className="p-3.5 space-y-2.5">
            <div className="h-4 bg-slate-800 rounded w-3/4" />
            <div className="h-3 bg-slate-800/60 rounded w-1/2" />
            <div className="pt-2 border-t border-slate-800 flex gap-1.5">
              <div className="w-6 h-6 rounded bg-slate-800" />
              <div className="w-6 h-6 rounded bg-slate-800" />
              <div className="w-6 h-6 rounded bg-slate-800" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
