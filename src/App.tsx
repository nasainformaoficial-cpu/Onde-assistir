import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  MovieCategory,
  MovieItem,
  SortOption,
} from './types/tmdb';
import {
  discoverMovies,
  enrichMoviesWithProviders,
  getNowPlayingMovies,
  getPopularMovies,
  getTopRatedMovies,
  getTrendingMovies,
  searchMovies,
} from './services/tmdb';
import { MAJOR_BRAZILIAN_PROVIDERS } from './constants/providers';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { ProviderFilter } from './components/ProviderFilter';
import { GenreFilter } from './components/GenreFilter';
import { MovieCard } from './components/MovieCard';
import { MovieModal } from './components/MovieModal';
import { WatchlistView } from './components/WatchlistView';
import { SkeletonGrid } from './components/SkeletonGrid';
import {
  Flame,
  Search,
  Sparkles,
  AlertCircle,
  RefreshCw,
  Film,
  Layers,
  ChevronDown,
} from 'lucide-react';

const WATCHLIST_STORAGE_KEY = 'onde_assistir_watchlist_v1';

export default function App() {
  // Navigation & View States
  const [activeCategory, setActiveCategory] = useState<MovieCategory>('popular');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedQuery, setDebouncedQuery] = useState<string>('');
  const [isWatchlistActive, setIsWatchlistActive] = useState<boolean>(false);

  // Filter States
  const [selectedProviderId, setSelectedProviderId] = useState<number | null>(null);
  const [selectedGenreId, setSelectedGenreId] = useState<number | null>(null);
  const [selectedSort, setSelectedSort] = useState<SortOption>('popularity.desc');
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  // Data States
  const [movies, setMovies] = useState<MovieItem[]>([]);
  const [featuredMovie, setFeaturedMovie] = useState<MovieItem | null>(null);
  const [selectedMovieForModal, setSelectedMovieForModal] = useState<MovieItem | null>(null);
  const [watchlist, setWatchlist] = useState<MovieItem[]>([]);

  // Pagination & Loading States
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Search debounce ref
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load Watchlist from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(WATCHLIST_STORAGE_KEY);
      if (stored) {
        setWatchlist(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Falha ao carregar watchlist local:', e);
    }
  }, []);

  // Sync Watchlist to localStorage
  const handleToggleBookmark = useCallback((movie: MovieItem) => {
    setWatchlist((prev) => {
      const exists = prev.some((item) => item.id === movie.id);
      let updated: MovieItem[];
      if (exists) {
        updated = prev.filter((item) => item.id !== movie.id);
      } else {
        updated = [movie, ...prev];
      }
      try {
        localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Falha ao salvar watchlist local:', e);
      }
      return updated;
    });
  }, []);

  const handleClearWatchlist = useCallback(() => {
    setWatchlist([]);
    localStorage.removeItem(WATCHLIST_STORAGE_KEY);
  }, []);

  // Handle Search Input Debounce
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      setDebouncedQuery(query.trim());
      setPage(1);
      if (query.trim()) {
        setIsWatchlistActive(false);
      }
    }, 450);
  };

  const handleSearchSubmit = (query: string) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    setDebouncedQuery(query.trim());
    setPage(1);
    setIsWatchlistActive(false);
  };

  // Fetch Hero Banner Featured Movie once on load
  useEffect(() => {
    getTrendingMovies('week')
      .then((res) => {
        if (res.results && res.results.length > 0) {
          // Prefer movie with backdrop and overview
          const best = res.results.find((m) => m.backdrop_path && m.overview) || res.results[0];
          setFeaturedMovie(best);
        }
      })
      .catch((err) => console.warn('Erro ao carregar filme em destaque:', err));
  }, []);

  // Master Data Fetching Function
  const fetchMoviesData = useCallback(
    async (currentPage = 1, append = false) => {
      if (currentPage === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);

      try {
        let response;

        // Mode 1: Search Query takes precedence if user entered text
        if (debouncedQuery) {
          response = await searchMovies(debouncedQuery, currentPage);
        }
        // Mode 2: Provider or Genre or Custom Sort or Year -> Discover API
        else if (selectedProviderId || selectedGenreId || selectedYear || selectedSort !== 'popularity.desc') {
          response = await discoverMovies({
            page: currentPage,
            providerId: selectedProviderId,
            genreId: selectedGenreId,
            sortBy: selectedSort,
            year: selectedYear,
          });
        }
        // Mode 3: Category Preset
        else {
          switch (activeCategory) {
            case 'trending':
              response = await getTrendingMovies('week');
              break;
            case 'top_rated':
              response = await getTopRatedMovies(currentPage);
              break;
            case 'now_playing':
              response = await getNowPlayingMovies(currentPage);
              break;
            case 'popular':
            default:
              response = await getPopularMovies(currentPage);
              break;
          }
        }

        const validResults = (response?.results || []).filter(
          (m) => m.poster_path || m.backdrop_path
        );

        // Pre-enrich first 8 items with providers so cards display streaming icons immediately
        const enrichedSlice = await enrichMoviesWithProviders(validResults.slice(0, 8));
        const finalResults = [...enrichedSlice, ...validResults.slice(8)];

        if (append) {
          setMovies((prev) => [...prev, ...finalResults]);
        } else {
          setMovies(finalResults);
        }

        setTotalPages(response?.total_pages || 1);
      } catch (err: any) {
        console.error('Falha ao buscar filmes da API TMDB:', err);
        setError(
          err?.message || 'Não foi possível carregar os filmes. Verifique sua conexão e tente novamente.'
        );
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [
      debouncedQuery,
      selectedProviderId,
      selectedGenreId,
      selectedSort,
      selectedYear,
      activeCategory,
    ]
  );

  // Trigger fetch on parameter changes
  useEffect(() => {
    if (isWatchlistActive) return;
    setPage(1);
    fetchMoviesData(1, false);
  }, [
    debouncedQuery,
    selectedProviderId,
    selectedGenreId,
    selectedSort,
    selectedYear,
    activeCategory,
    isWatchlistActive,
    fetchMoviesData,
  ]);

  // Handle "Load More"
  const handleLoadMore = () => {
    if (page < totalPages && !loadingMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchMoviesData(nextPage, true);
    }
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSelectedProviderId(null);
    setSelectedGenreId(null);
    setSelectedYear(null);
    setSelectedSort('popularity.desc');
  };

  const hasActiveFilters = Boolean(
    selectedProviderId || selectedGenreId || selectedYear || selectedSort !== 'popularity.desc'
  );

  const selectedProviderInfo = MAJOR_BRAZILIAN_PROVIDERS.find((p) => p.id === selectedProviderId);

  // Section title builder
  const getSectionTitle = () => {
    if (debouncedQuery) {
      return `Resultados para "${debouncedQuery}"`;
    }
    if (selectedProviderInfo) {
      return `Catálogo ${selectedProviderInfo.name} no Brasil`;
    }
    switch (activeCategory) {
      case 'trending':
        return 'Filmes em Alta no Brasil Esta Semana';
      case 'top_rated':
        return 'Filmes Melhores Avaliados';
      case 'now_playing':
        return 'Filmes Recentes e em Cartaz';
      case 'popular':
      default:
        return 'Filmes Mais Populares no Brasil';
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col font-sans">
      {/* Top Navigation */}
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onSearchSubmit={handleSearchSubmit}
        activeCategory={activeCategory}
        onSelectCategory={(cat) => {
          setActiveCategory(cat);
          setIsWatchlistActive(false);
          setSearchQuery('');
          setDebouncedQuery('');
        }}
        watchlistCount={watchlist.length}
        onOpenWatchlist={() => setIsWatchlistActive(true)}
        isWatchlistActive={isWatchlistActive}
      />

      {/* Main Content Area */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* VIEW 1: WATCHLIST */}
        {isWatchlistActive ? (
          <WatchlistView
            watchlist={watchlist}
            onOpenDetails={(movie) => setSelectedMovieForModal(movie)}
            onToggleBookmark={handleToggleBookmark}
            onClearWatchlist={handleClearWatchlist}
            onBackToCatalogue={() => setIsWatchlistActive(false)}
          />
        ) : (
          /* VIEW 2: BROWSE / SEARCH CATALOGUE */
          <>
            {/* Featured Hero Banner (Only shown on initial popular view with no active text search) */}
            {!debouncedQuery && !hasActiveFilters && activeCategory === 'popular' && featuredMovie && (
              <HeroBanner
                movie={featuredMovie}
                onOpenDetails={(movie) => setSelectedMovieForModal(movie)}
                isBookmarked={watchlist.some((w) => w.id === featuredMovie.id)}
                onToggleBookmark={handleToggleBookmark}
              />
            )}

            {/* Provider Quick Filter Strip */}
            <div className="pt-2">
              <ProviderFilter
                selectedProviderId={selectedProviderId}
                onSelectProvider={(id) => {
                  setSelectedProviderId(id);
                  if (debouncedQuery) {
                    setSearchQuery('');
                    setDebouncedQuery('');
                  }
                }}
              />
            </div>

            {/* Genre & Sorting Controls */}
            <GenreFilter
              selectedGenreId={selectedGenreId}
              onSelectGenre={setSelectedGenreId}
              selectedSort={selectedSort}
              onSelectSort={setSelectedSort}
              selectedYear={selectedYear}
              onSelectYear={setSelectedYear}
              hasActiveFilters={hasActiveFilters}
              onResetAllFilters={handleResetFilters}
            />

            {/* Section Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-6 rounded-full bg-rose-500" />
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    {getSectionTitle()}
                  </h2>
                  <p className="text-xs text-slate-400">
                    Clique em qualquer filme para ver onde assistir (streaming, aluguel ou compra digital no Brasil)
                  </p>
                </div>
              </div>

              {selectedProviderInfo && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                  <span className="text-slate-400">Filtrando por:</span>
                  <span className="font-bold text-white">{selectedProviderInfo.name}</span>
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center justify-between p-4 rounded-2xl bg-red-950/40 border border-red-800/80 text-red-200">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <p className="text-xs sm:text-sm">{error}</p>
                </div>
                <button
                  onClick={() => fetchMoviesData(page)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-800 hover:bg-red-700 text-white text-xs font-semibold cursor-pointer transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Tentar novamente</span>
                </button>
              </div>
            )}

            {/* Movie Grid or Loading */}
            {loading ? (
              <SkeletonGrid count={10} />
            ) : movies.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center px-4 bg-slate-900/40 rounded-3xl border border-slate-800">
                <Film className="w-16 h-16 text-slate-600 mb-3" />
                <h3 className="text-lg font-bold text-white mb-1">Nenhum filme encontrado</h3>
                <p className="text-xs sm:text-sm text-slate-400 max-w-md mb-5">
                  Não encontramos títulos correspondentes aos filtros aplicados ou ao termo de busca.
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={handleResetFilters}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Limpar Filtros
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-8">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                  {movies.map((movie) => (
                    <MovieCard
                      key={movie.id}
                      movie={movie}
                      onOpenDetails={(m) => setSelectedMovieForModal(m)}
                      isBookmarked={watchlist.some((w) => w.id === movie.id)}
                      onToggleBookmark={handleToggleBookmark}
                    />
                  ))}
                </div>

                {/* Load More Button */}
                {page < totalPages && (
                  <div className="flex justify-center pt-4 pb-8">
                    <button
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 active:scale-98 text-slate-100 border border-slate-800 hover:border-slate-700 text-sm font-bold shadow-lg transition-all cursor-pointer disabled:opacity-50"
                    >
                      {loadingMore ? (
                        <>
                          <div className="w-4 h-4 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
                          <span>Carregando mais filmes...</span>
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4 text-rose-500" />
                          <span>Carregar Mais Filmes</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950 py-8 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">ONDE ASSISTIR BR</span>
            <span>—</span>
            <span>Guia completo de streaming no Brasil</span>
          </div>
          <div className="flex items-center gap-3 text-slate-400">
            <span>Dados em tempo real via</span>
            <a
              href="https://www.themoviedb.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-rose-400 hover:underline font-semibold"
            >
              TMDB & JustWatch
            </a>
          </div>
        </div>
      </footer>

      {/* Movie Details Modal */}
      {selectedMovieForModal && (
        <MovieModal
          movie={selectedMovieForModal}
          onClose={() => setSelectedMovieForModal(null)}
          onSelectMovie={(movie) => setSelectedMovieForModal(movie)}
          isBookmarked={watchlist.some((w) => w.id === selectedMovieForModal.id)}
          onToggleBookmark={handleToggleBookmark}
        />
      )}
    </div>
  );
}
