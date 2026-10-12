import React, { useEffect, useState } from 'react';
import { MovieDetails, MovieItem } from '../types/tmdb';
import {
  getBackdropUrl,
  getBrazilianAgeRating,
  getImageUrl,
  getMovieDetails,
} from '../services/tmdb';
import { ProviderBadge } from './ProviderBadge';
import {
  X,
  Star,
  Clock,
  Calendar,
  Bookmark,
  Play,
  ExternalLink,
  Users,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';

interface MovieModalProps {
  movie: MovieItem | null;
  onClose: () => void;
  onSelectMovie: (movie: MovieItem) => void;
  isBookmarked: boolean;
  onToggleBookmark: (movie: MovieItem) => void;
}

export const MovieModal: React.FC<MovieModalProps> = ({
  movie,
  onClose,
  onSelectMovie,
  isBookmarked,
  onToggleBookmark,
}) => {
  const [details, setDetails] = useState<MovieDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showTrailer, setShowTrailer] = useState<boolean>(false);

  useEffect(() => {
    if (!movie) return;

    let isMounted = true;
    setLoading(true);
    setShowTrailer(false);

    getMovieDetails(movie.id)
      .then((data) => {
        if (isMounted) {
          setDetails(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Erro ao carregar detalhes do filme:', err);
        if (isMounted) {
          setLoading(false);
        }
      });

    // Close on escape key
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      isMounted = false;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [movie, onClose]);

  if (!movie) return null;

  // Format runtime (e.g. 142 min -> 2h 22m)
  const formatRuntime = (minutes?: number) => {
    if (!minutes) return null;
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hrs}h ${mins}m`;
  };

  const providersBR = details?.['watch/providers']?.results?.BR || movie.providers_br;
  const flatrate = providersBR?.flatrate || [];
  const free = providersBR?.free || [];
  const rent = providersBR?.rent || [];
  const buy = providersBR?.buy || [];
  const streamProviders = [...flatrate, ...free];
  const hasAnyProvider =
    flatrate.length > 0 || free.length > 0 || rent.length > 0 || buy.length > 0;

  // Find official Portuguese or English trailer
  const videos = details?.videos?.results || [];
  const trailer =
    videos.find((v) => v.type === 'Trailer' && v.site === 'YouTube' && v.official) ||
    videos.find((v) => v.type === 'Trailer' && v.site === 'YouTube') ||
    videos.find((v) => v.site === 'YouTube');

  const ageRating = getBrazilianAgeRating(details || undefined);
  const cast = details?.credits?.cast?.slice(0, 8) || [];
  const recommendations = details?.recommendations?.results?.slice(0, 6) || [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-slate-300 hover:text-white border border-white/10 backdrop-blur-md transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Scrollable Container */}
        <div className="overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700/60 scrollbar-track-transparent">
          {/* Header Backdrop Banner */}
          <div className="relative aspect-video sm:aspect-[21/9] w-full bg-slate-950 overflow-hidden">
            {movie.backdrop_path ? (
              <img
                src={getBackdropUrl(movie.backdrop_path, 'w1280')}
                alt={movie.title}
                className="w-full h-full object-cover object-center"
              />
            ) : movie.poster_path ? (
              <img
                src={getImageUrl(movie.poster_path, 'original')}
                alt={movie.title}
                className="w-full h-full object-cover blur-md scale-110 opacity-40"
              />
            ) : null}

            {/* Gradient Mask */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-black/30" />

            {/* Header Content */}
            <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 flex items-end justify-between gap-4">
              <div className="max-w-2xl space-y-1">
                {details?.tagline && (
                  <p className="text-xs sm:text-sm text-rose-300 font-medium italic line-clamp-1">
                    "{details.tagline}"
                  </p>
                )}
                <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white drop-shadow-md">
                  {movie.title}
                </h1>
                {movie.original_title && movie.original_title !== movie.title && (
                  <p className="text-xs sm:text-sm text-slate-300 font-light italic">
                    Título original: {movie.original_title}
                  </p>
                )}
              </div>

              {/* Action Buttons in Header */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {trailer && (
                  <button
                    onClick={() => setShowTrailer(!showTrailer)}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs sm:text-sm transition-all shadow-lg shadow-rose-900/40 cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>{showTrailer ? 'Fechar Trailer' : 'Ver Trailer'}</span>
                  </button>
                )}
                <button
                  onClick={() => onToggleBookmark(movie)}
                  className={`p-2.5 rounded-xl border backdrop-blur-md transition-colors cursor-pointer ${
                    isBookmarked
                      ? 'bg-rose-600 text-white border-rose-500 shadow-lg shadow-rose-900/40'
                      : 'bg-slate-800/80 hover:bg-slate-700 text-slate-200 border-slate-700'
                  }`}
                  title={isBookmarked ? 'Remover da minha lista' : 'Adicionar à minha lista'}
                >
                  <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-white' : ''}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Trailer Embed Section (if open) */}
          {showTrailer && trailer && (
            <div className="p-4 sm:p-6 bg-black border-b border-slate-800">
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 shadow-2xl">
                <iframe
                  src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1&rel=0`}
                  title={trailer.name}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              </div>
            </div>
          )}

          {/* Main Info Section */}
          <div className="p-4 sm:p-6 space-y-6">
            {/* Metadata Pills */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
              {/* Rating */}
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{movie.vote_average?.toFixed(1)} TMDB</span>
                <span className="text-amber-400/60 font-normal">({movie.vote_count} votos)</span>
              </div>

              {/* Release Year */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700/80 text-slate-300">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{movie.release_date ? movie.release_date.slice(0, 4) : 'N/A'}</span>
              </div>

              {/* Runtime */}
              {details?.runtime ? (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700/80 text-slate-300">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{formatRuntime(details.runtime)}</span>
                </div>
              ) : null}

              {/* Brazilian Age Classification */}
              {ageRating && (
                <div className="px-2 py-0.5 rounded-md font-bold bg-slate-800 border border-slate-700 text-slate-200">
                  Classificação: {ageRating}
                </div>
              )}

              {/* Genres */}
              {details?.genres?.map((g) => (
                <span
                  key={g.id}
                  className="px-2.5 py-1 rounded-lg bg-slate-800/80 text-slate-300 border border-slate-700/50"
                >
                  {g.name}
                </span>
              ))}
            </div>

            {/* STREAMING AVAILABILITY IN BRAZIL - HERO CARD */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-800/90 via-slate-800/50 to-slate-900 border border-rose-500/30 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center justify-between mb-4 border-b border-slate-700/60 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🇧🇷</span>
                  <div>
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                      Onde Assistir no Brasil
                    </h2>
                    <p className="text-[11px] text-slate-400">
                      Dados oficiais atualizados em tempo real via JustWatch & TMDB
                    </p>
                  </div>
                </div>

                {providersBR?.link && (
                  <a
                    href={providersBR.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 font-medium transition-colors"
                  >
                    <span>Ver no JustWatch</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>

              {loading ? (
                <div className="flex items-center gap-2 py-4">
                  <div className="w-5 h-5 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs text-slate-400">Consultando catálogo brasileiro...</span>
                </div>
              ) : !hasAnyProvider ? (
                /* No provider in Brazil */
                <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200">
                  <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold">
                      Não disponível para streaming ou compra digital no Brasil no momento.
                    </p>
                    <p className="text-xs text-amber-300/80">
                      Os direitos de exibição no catálogo brasileiro podem ser adicionados em breve
                      pelas distribuidoras. Você pode salvá-lo na Minha Lista para checar depois!
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {/* Streaming Subscription / Flatrate */}
                  {streamProviders.length > 0 && (
                    <div className="p-3.5 rounded-xl bg-slate-900/80 border border-emerald-500/30 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          Streaming / Assinatura
                        </span>
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-mono">
                          {streamProviders.length}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {streamProviders.map((p) => (
                          <ProviderBadge key={p.provider_id} provider={p} size="md" showName />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Digital Rental */}
                  {rent.length > 0 && (
                    <div className="p-3.5 rounded-xl bg-slate-900/80 border border-sky-500/30 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
                          <span>🎟️</span>
                          Aluguel Digital
                        </span>
                        <span className="text-[10px] bg-sky-500/20 text-sky-300 px-1.5 py-0.5 rounded font-mono">
                          {rent.length}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {rent.map((p) => (
                          <ProviderBadge key={p.provider_id} provider={p} size="md" showName />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Digital Purchase */}
                  {buy.length > 0 && (
                    <div className="p-3.5 rounded-xl bg-slate-900/80 border border-purple-500/30 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-purple-400 flex items-center gap-1.5">
                          <span>🛍️</span>
                          Compra Digital
                        </span>
                        <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded font-mono">
                          {buy.length}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {buy.map((p) => (
                          <ProviderBadge key={p.provider_id} provider={p} size="md" showName />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Synopsis / Overview */}
            <div className="space-y-2">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">Sinopse</h2>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                {movie.overview || 'Sinopse não fornecida em português para esta obra.'}
              </p>
            </div>

            {/* Cast section */}
            {cast.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-rose-500" />
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Elenco Principal
                  </h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {cast.map((actor) => (
                    <div
                      key={actor.id}
                      className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-800/50 border border-slate-700/50"
                    >
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-700 flex-shrink-0">
                        {actor.profile_path ? (
                          <img
                            src={getImageUrl(actor.profile_path, 'w185')}
                            alt={actor.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-400">
                            {actor.name.slice(0, 1)}
                          </div>
                        )}
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-xs font-semibold text-slate-200 truncate">{actor.name}</p>
                        <p className="text-[11px] text-slate-400 truncate">{actor.character}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations / Similar Titles */}
            {recommendations.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-rose-500" />
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Filmes Semelhantes Recomendados
                  </h2>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                  {recommendations.map((rec) => (
                    <div
                      key={rec.id}
                      onClick={() => onSelectMovie(rec)}
                      className="group/rec cursor-pointer space-y-1.5"
                    >
                      <div className="aspect-[2/3] rounded-xl overflow-hidden bg-slate-800 border border-slate-700/60 group-hover/rec:border-rose-500/60 transition-all">
                        {rec.poster_path ? (
                          <img
                            src={getImageUrl(rec.poster_path, 'w342')}
                            alt={rec.title}
                            className="w-full h-full object-cover group-hover/rec:scale-105 transition-transform"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center p-2 text-center text-[10px] text-slate-400">
                            {rec.title}
                          </div>
                        )}
                      </div>
                      <p className="text-[11px] font-semibold text-slate-200 truncate group-hover/rec:text-rose-400">
                        {rec.title}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
