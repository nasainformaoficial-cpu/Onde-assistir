import React from 'react';
import { MAJOR_BRAZILIAN_PROVIDERS } from '../constants/providers';
import { getImageUrl } from '../services/tmdb';
import { Tv, Sparkles } from 'lucide-react';

interface ProviderFilterProps {
  selectedProviderId: number | null;
  onSelectProvider: (providerId: number | null) => void;
}

export const ProviderFilter: React.FC<ProviderFilterProps> = ({
  selectedProviderId,
  onSelectProvider,
}) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <Tv className="w-4 h-4 text-rose-500" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Filtrar por Streaming no Brasil
          </h2>
        </div>
        {selectedProviderId && (
          <button
            onClick={() => onSelectProvider(null)}
            className="text-xs text-rose-400 hover:text-rose-300 underline font-medium cursor-pointer transition-colors"
          >
            Limpar filtro de streaming
          </button>
        )}
      </div>

      <div className="flex items-center gap-2.5 overflow-x-auto pb-2.5 scrollbar-thin scrollbar-thumb-slate-700/60 scrollbar-track-transparent snap-x">
        {/* "Todos" button */}
        <button
          onClick={() => onSelectProvider(null)}
          className={`snap-start flex-shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
            selectedProviderId === null
              ? 'bg-rose-600 text-white border-rose-500 shadow-lg shadow-rose-900/30'
              : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-800 hover:border-slate-700'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Todos os Canais</span>
        </button>

        {/* Major Providers */}
        {MAJOR_BRAZILIAN_PROVIDERS.map((provider) => {
          const isSelected = selectedProviderId === provider.id;
          return (
            <button
              key={provider.id}
              onClick={() => onSelectProvider(isSelected ? null : provider.id)}
              className={`snap-start flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all border cursor-pointer ${
                isSelected
                  ? 'bg-slate-100 text-slate-950 font-bold border-white shadow-lg shadow-white/10 scale-102 ring-2 ring-rose-500'
                  : 'bg-slate-900/80 hover:bg-slate-800 text-slate-200 border-slate-800/90 hover:border-slate-700'
              }`}
            >
              {provider.logoPath ? (
                <img
                  src={getImageUrl(provider.logoPath, 'w92')}
                  alt={provider.shortName}
                  className="w-5 h-5 rounded-md object-cover shadow-xs"
                />
              ) : (
                <div className="w-5 h-5 rounded-md bg-slate-800 flex items-center justify-center text-[9px] font-bold text-slate-300">
                  {provider.shortName.slice(0, 2)}
                </div>
              )}
              <span className="whitespace-nowrap">{provider.shortName}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
