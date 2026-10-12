import React, { useEffect, useState } from 'react';
import { MovieItem, WatchProviderCountryResult } from '../types/tmdb';
import { getBackdropUrl, getMovieWatchProviders } from '../services/tmdb';
import { ProviderBadge } from './ProviderBadge';
import { Play, Info, Bookmark, Star, Calendar } from 'lucide-react';

interface HeroBannerProps {
  movie: MovieItem | null;
  onOpenDetails: (movie: MovieItem) => void;
  isBookmarked: boolean;
  onToggleBookmark: (movie: MovieItem) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  movie,
  onOpenDetails,
  isBookmarked,
  onToggleBookmark,
}) => {
  const [providers, setProviders] = useState<WatchProviderCountryResult | null>(null);

  useEffect(() => {
    if (!movie) return;
    let isMounted = true;
    getMovieWatchProviders(movie.id)
      .then((data) => {
        if (isMounted) setProviders(data);
      })
      .catch(() => {
        if (isMounted) setProviders(null);
      });

    return () => {
      isMounted = false;
    };
  }, [movie]);

  if (!movie) return null;

  const flatrate = providers?.flatrate || [];
  const free = providers?.free || [];
  const streamProviders = [...flatrate, ...free];
  const rentOrBuy = [...(providers?.rent || []), ...(providers?.buy || [])];

  const releaseYear = movie.release_date ? movie.release_date.slice(0, 4) : '';

  return (
    <div className="relative w-full rounded-3xl overflow-hidden bg-slate-950 border border-slate-800/80 shadow-2xl">
      {/* Background Backdrop Image */}
      <div className="relative aspect-[16/9] sm:aspect-[21/9] lg:aspect-[24/9] w-full overflow-hidden">
        {movie.backdrop_path && (
          <img
            src={getBackdropUrl(movie.backdrop_path, 'original')}
            alt={movie.title}
            className="w-full h-full object-cover object-center scale-102 transition-transform duration-1000 ease-out"
          />
        )}

        {/* Cinematic Multi-layered Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/70 to-transparent" />
      </div>

      {/* Banner Content Overlay */}
      <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-8 lg:p-10 max-w-3xl">
        {/* Top Feature Tag & Rating */}
        <div className="flex flex-wrap items-center gap-2.5 mb-2.5">
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-rose-600 text-white shadow-md shadow-rose-950/40">
            Destaque da Semana
          </span>

          <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-black/70 backdrop-blur-md border border-white/10 text-amber-400 text-xs font-bold">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{movie.vote_average?.toFixed(1)}</span>
          </div>

          {releaseYear && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-slate-300 text-xs font-medium">
              <Calendar className="w-3 h-3 text-slate-400" />
              <span>{releaseYear}</span>
            </div>
          )}
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight drop-shadow-lg mb-2">
          {movie.title}
        </h1>

        {/* Synopsis */}
        <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 sm:line-clamp-3 mb-4 leading-relaxed max-w-2xl">
          {movie.overview}
        </p>

        {/* Brazilian Streaming Availability Badge Bar */}
        <div className="flex flex-wrap items-center gap-3 mb-5 p-2.5 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700/60 max-w-fit">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
            <span>🇧🇷</span>
            <span>Disponível em:</span>
          </div>

          {streamProviders.length > 0 ? (
            <div className="flex items-center gap-1.5 flex-wrap">
              {streamProviders.slice(0, 5).map((p) => (
                <ProviderBadge key={p.provider_id} provider={p} size="sm" showName />
              ))}
            </div>
          ) : rentOrBuy.length > 0 ? (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs text-amber-300 font-medium">Aluguel / Compra:</span>
              {rentOrBuy.slice(0, 4).map((p) => (
                <ProviderBadge key={p.provider_id} provider={p} size="sm" showName />
              ))}
            </div>
          ) : (
            <span className="text-xs text-zinc-400 font-medium">
              Consulte plataformas e opções de streaming
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onOpenDetails(movie)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-xl shadow-rose-950/50 hover:shadow-rose-900/60 transition-all hover:scale-102 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Onde Assistir & Trailer</span>
          </button>

          <button
            onClick={() => onToggleBookmark(movie)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border backdrop-blur-md text-sm font-semibold transition-all cursor-pointer ${
              isBookmarked
                ? 'bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-900/40'
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-200 border-slate-700'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-white' : ''}`} />
            <span>{isBookmarked ? 'Na Minha Lista' : 'Salvar'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
