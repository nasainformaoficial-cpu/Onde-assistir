import React from 'react';
import { MovieItem } from '../types/tmdb';
import { MovieCard } from './MovieCard';
import { Bookmark, Film, Trash2, ArrowLeft } from 'lucide-react';

interface WatchlistViewProps {
  watchlist: MovieItem[];
  onOpenDetails: (movie: MovieItem) => void;
  onToggleBookmark: (movie: MovieItem) => void;
  onClearWatchlist: () => void;
  onBackToCatalogue: () => void;
}

export const WatchlistView: React.FC<WatchlistViewProps> = ({
  watchlist,
  onOpenDetails,
  onToggleBookmark,
  onClearWatchlist,
  onBackToCatalogue,
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToCatalogue}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors cursor-pointer"
            title="Voltar ao catálogo"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
              <Bookmark className="w-6 h-6 fill-rose-500 text-rose-500" />
              <span>Minha Lista de Filmes</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              {watchlist.length}{' '}
              {watchlist.length === 1 ? 'filme salvo' : 'filmes salvos'} para conferir onde assistir
            </p>
          </div>
        </div>

        {watchlist.length > 0 && (
          <button
            onClick={onClearWatchlist}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-red-950/40 text-slate-400 hover:text-red-400 border border-slate-800 hover:border-red-900/50 text-xs font-medium transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Limpar lista</span>
          </button>
        )}
      </div>

      {watchlist.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center px-4 bg-slate-900/40 rounded-3xl border border-slate-800/80">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-4">
            <Film className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-white mb-1">Sua lista está vazia</h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mb-6">
            Navegue pelos filmes populares, use a busca e clique no ícone de marcador para salvar títulos e acompanhar onde eles estão passando no Brasil.
          </p>
          <button
            onClick={onBackToCatalogue}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-colors cursor-pointer"
          >
            Explorar Filmes Populares
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {watchlist.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              onOpenDetails={onOpenDetails}
              isBookmarked={true}
              onToggleBookmark={onToggleBookmark}
            />
          ))}
        </div>
      )}
    </div>
  );
};
