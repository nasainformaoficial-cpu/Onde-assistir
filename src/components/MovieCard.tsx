import React, { useEffect, useState } from 'react';
import { MovieItem, WatchProviderCountryResult } from '../types/tmdb';
import { getImageUrl, getMovieWatchProviders } from '../services/tmdb';
import { ProviderBadge } from './ProviderBadge';
import { Star, Film, Bookmark, Info, AlertCircle } from 'lucide-react';

interface MovieCardProps {
  movie: MovieItem;
  onOpenDetails: (movie: MovieItem) => void;
  isBookmarked: boolean;
  onToggleBookmark: (movie: MovieItem) => void;
}

export const MovieCard: React.FC<MovieCardProps> = ({
  movie,
  onOpenDetails,
  isBookmarked,
  onToggleBookmark,
}) => {
  const [providers, setProviders] = useState<WatchProviderCountryResult | null | undefined>(
    movie.providers_br
  );
  const [loadingProviders, setLoadingProviders] = useState<boolean>(!movie.providers_br);
  const [imageError, setImageError] = useState(false);

  // Lazy fetch providers if not pre-populated
  useEffect(() => {
    let isMounted = true;
    if (movie.providers_br !== undefined) {
      setProviders(movie.providers_br);
      setLoadingProviders(false);
      return;
    }

    setLoadingProviders(true);
    getMovieWatchProviders(movie.id)
      .then((data) => {
        if (isMounted) {
          setProviders(data);
          setLoadingProviders(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setProviders(null);
          setLoadingProviders(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [movie.id, movie.providers_br]);

  const releaseYear = movie.release_date ? movie.release_date.slice(0, 4) : '—';
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : '—';

  // Group streaming providers in Brazil
  const flatrateProviders = providers?.flatrate || [];
  const freeProviders = providers?.free || [];
  const rentProviders = providers?.rent || [];
  const buyProviders = providers?.buy || [];

  // Stream-ready providers (subscriptions + free)
  const streamProviders = [...flatrateProviders, ...freeProviders];

  const hasAnyProvider =
    flatrateProviders.length > 0 ||
    freeProviders.length > 0 ||
    rentProviders.length > 0 ||
    buyProviders.length > 0;

  return (
    <div
      onClick={() => onOpenDetails(movie)}
      className="group relative flex flex-col bg-slate-900/90 rounded-2xl overflow-hidden border border-slate-800/80 hover:border-rose-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-rose-950/20 hover:-translate-y-1.5 cursor-pointer"
    >
      {/* Poster Image Container */}
      <div className="relative aspect-[2/3] w-full bg-slate-950 overflow-hidden">
        {movie.poster_path && !imageError ? (
          <img
            src={getImageUrl(movie.poster_path, 'w500')}
            alt={movie.title}
            onError={() => setImageError(true)}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 text-slate-500 bg-slate-900">
            <Film className="w-12 h-12 mb-2 stroke-1 opacity-50" />
            <span className="text-xs text-center font-medium line-clamp-2">{movie.title}</span>
          </div>
        )}

        {/* Top Badges Overlay */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
          {/* TMDB Rating */}
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-md border border-white/10 text-amber-400 text-xs font-bold shadow-md">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span>{rating}</span>
          </div>

          {/* Watchlist Bookmark Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleBookmark(movie);
            }}
            title={isBookmarked ? 'Remover da minha lista' : 'Salvar na minha lista'}
            className={`pointer-events-auto p-1.5 rounded-lg backdrop-blur-md border transition-all cursor-pointer shadow-md ${
              isBookmarked
                ? 'bg-rose-600 text-white border-rose-500 shadow-rose-900/40'
                : 'bg-black/60 text-slate-300 border-white/10 hover:bg-black/90 hover:text-white'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-white' : ''}`} />
          </button>
        </div>

        {/* Year overlay pill */}
        <div className="absolute bottom-2.5 left-2.5">
          <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[11px] font-semibold text-slate-300 border border-white/10">
            {releaseYear}
          </span>
        </div>

        {/* Hover info badge */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3 pointer-events-none">
          <div className="flex items-center gap-1.5 text-xs text-rose-300 font-medium">
            <Info className="w-3.5 h-3.5" />
            <span>Ver detalhes e trailers</span>
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-3.5 flex flex-col flex-grow justify-between gap-3">
        {/* Title */}
        <div>
          <h3
            className="text-sm font-bold text-slate-100 line-clamp-1 group-hover:text-rose-400 transition-colors"
            title={movie.title}
          >
            {movie.title}
          </h3>
          {movie.original_title && movie.original_title !== movie.title && (
            <p className="text-[11px] text-slate-400 line-clamp-1 italic">
              {movie.original_title}
            </p>
          )}
        </div>

        {/* Streaming Providers in Brazil */}
        <div className="pt-2 border-t border-slate-800/80">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center justify-between">
            <span>Onde assistir (BR)</span>
            {streamProviders.length > 0 && (
              <span className="text-[9px] text-emerald-400 font-medium">Streaming</span>
            )}
          </div>

          {loadingProviders ? (
            <div className="flex items-center gap-1.5 py-1">
              <div className="w-6 h-6 rounded-md bg-slate-800 animate-pulse" />
              <div className="w-6 h-6 rounded-md bg-slate-800 animate-pulse" />
              <span className="text-[10px] text-slate-500">Buscando streamings...</span>
            </div>
          ) : streamProviders.length > 0 ? (
            /* Has subscription or free streaming */
            <div className="flex items-center gap-1.5 flex-wrap">
              {streamProviders.slice(0, 4).map((provider) => (
                <ProviderBadge key={provider.provider_id} provider={provider} size="sm" />
              ))}
              {streamProviders.length > 4 && (
                <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                  +{streamProviders.length - 4}
                </span>
              )}
            </div>
          ) : rentProviders.length > 0 || buyProviders.length > 0 ? (
            /* Only Rent or Buy */
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] text-amber-400/90 font-medium bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20">
                Aluguel / Compra:
              </span>
              {(rentProviders.length > 0 ? rentProviders : buyProviders).slice(0, 3).map((provider) => (
                <ProviderBadge key={provider.provider_id} provider={provider} size="sm" />
              ))}
            </div>
          ) : (
            /* Not available on streaming in BR */
            <div className="flex items-center gap-1 text-[11px] text-slate-400 py-0.5">
              <AlertCircle className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
              <span className="text-[10px] text-zinc-400">Indisponível em streaming no BR</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
