import React from 'react';
import { WatchProvider } from '../types/tmdb';
import { getImageUrl } from '../services/tmdb';

interface ProviderBadgeProps {
  provider: WatchProvider;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
}

export const ProviderBadge: React.FC<ProviderBadgeProps> = ({
  provider,
  size = 'md',
  showName = false,
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6 rounded-md text-[10px]',
    md: 'w-8 h-8 rounded-lg text-xs',
    lg: 'w-11 h-11 rounded-xl text-sm',
  };

  const logoUrl = provider.logo_path ? getImageUrl(provider.logo_path, 'w92') : null;

  return (
    <div
      className={`inline-flex items-center gap-2 group transition-transform hover:scale-105`}
      title={provider.provider_name}
    >
      <div
        className={`${sizeClasses[size]} overflow-hidden bg-slate-800 border border-slate-700/80 shadow-md flex items-center justify-center relative flex-shrink-0`}
      >
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={provider.provider_name}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <span className="font-bold text-slate-300">
            {provider.provider_name.slice(0, 2).toUpperCase()}
          </span>
        )}
      </div>
      {showName && (
        <span className="text-xs font-medium text-slate-200 truncate max-w-[120px]">
          {provider.provider_name}
        </span>
      )}
    </div>
  );
};
