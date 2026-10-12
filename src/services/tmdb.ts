import {
  MovieDetails,
  MovieItem,
  TMDBResponse,
  WatchProviderCountryResult,
  WatchProvidersResponse,
} from '../types/tmdb';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY || 'b1ceb72edada6ed1b5b29747ee93a087';
const BASE_URL = 'https://api.themoviedb.org/3';
export const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

// In-memory cache for watch providers to prevent redundant requests
const providerCache = new Map<number, WatchProviderCountryResult | null>();

export const getImageUrl = (
  path: string | null | undefined,
  size: 'w92' | 'w154' | 'w185' | 'w342' | 'w500' | 'w780' | 'original' = 'w500'
): string => {
  if (!path) return '';
  return `${IMAGE_BASE_URL}/${size}${path}`;
};

export const getBackdropUrl = (
  path: string | null | undefined,
  size: 'w780' | 'w1280' | 'original' = 'original'
): string => {
  if (!path) return '';
  return `${IMAGE_BASE_URL}/${size}${path}`;
};

async function tmdbFetch<T>(endpoint: string, params: Record<string, string | number | undefined> = {}): Promise<T> {
  const queryParams = new URLSearchParams();
  queryParams.append('api_key', API_KEY);
  queryParams.append('language', 'pt-BR');

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, String(value));
    }
  }

  const url = `${BASE_URL}${endpoint}?${queryParams.toString()}`;

  const response = await fetch(url);
  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(`Erro na chamada da API TMDB (${response.status}): ${errorText || response.statusText}`);
  }

  return response.json();
}

/**
 * Fetch streaming providers for a movie in Brazil
 */
export async function getMovieWatchProviders(movieId: number): Promise<WatchProviderCountryResult | null> {
  if (providerCache.has(movieId)) {
    return providerCache.get(movieId) || null;
  }

  try {
    const data = await tmdbFetch<WatchProvidersResponse>(`/movie/${movieId}/watch/providers`);
    const brData = data.results?.BR || null;
    providerCache.set(movieId, brData);
    return brData;
  } catch (error) {
    console.warn(`Não foi possível carregar os provedores para o filme ${movieId}:`, error);
    providerCache.set(movieId, null);
    return null;
  }
}

/**
 * Enriches an array of movies with their Brazil streaming providers
 * Uses batches of 6 concurrent requests to balance speed and rate limits
 */
export async function enrichMoviesWithProviders(movies: MovieItem[]): Promise<MovieItem[]> {
  const batchSize = 6;
  const enriched: MovieItem[] = [...movies];

  for (let i = 0; i < enriched.length; i += batchSize) {
    const slice = enriched.slice(i, i + batchSize);
    await Promise.all(
      slice.map(async (movie, index) => {
        const actualIndex = i + index;
        if (!enriched[actualIndex].providers_br) {
          try {
            const providers = await getMovieWatchProviders(movie.id);
            enriched[actualIndex] = {
              ...enriched[actualIndex],
              providers_br: providers || undefined,
            };
          } catch {
            // Keep movie without providers
          }
        }
      })
    );
  }

  return enriched;
}

/**
 * Discover movies with full Brazilian streaming context
 */
export async function discoverMovies({
  page = 1,
  providerId,
  genreId,
  sortBy = 'popularity.desc',
  year,
}: {
  page?: number;
  providerId?: number | null;
  genreId?: number | null;
  sortBy?: string;
  year?: number | null;
}): Promise<TMDBResponse<MovieItem>> {
  const params: Record<string, string | number | undefined> = {
    page,
    region: 'BR',
    sort_by: sortBy,
    include_adult: 'false',
    'vote_count.gte': sortBy === 'vote_average.desc' ? 200 : 15,
  };

  if (genreId) {
    params.with_genres = genreId;
  }

  if (year) {
    params.primary_release_year = year;
  }

  if (providerId) {
    // When filtering by provider, set watch_region to BR
    params.watch_region = 'BR';
    params.with_watch_providers = providerId;
    // Include subscription (flatrate) and free
    params.with_watch_monetization_types = 'flatrate|free|ads';
  }

  return tmdbFetch<TMDBResponse<MovieItem>>('/discover/movie', params);
}

/**
 * Get popular movies in Brazil
 */
export async function getPopularMovies(page = 1): Promise<TMDBResponse<MovieItem>> {
  return tmdbFetch<TMDBResponse<MovieItem>>('/movie/popular', {
    page,
    region: 'BR',
  });
}

/**
 * Get trending movies this week
 */
export async function getTrendingMovies(timeWindow: 'day' | 'week' = 'week'): Promise<TMDBResponse<MovieItem>> {
  return tmdbFetch<TMDBResponse<MovieItem>>(`/trending/movie/${timeWindow}`);
}

/**
 * Get top rated movies
 */
export async function getTopRatedMovies(page = 1): Promise<TMDBResponse<MovieItem>> {
  return tmdbFetch<TMDBResponse<MovieItem>>('/movie/top_rated', {
    page,
    region: 'BR',
  });
}

/**
 * Get movies currently in theaters or recently released
 */
export async function getNowPlayingMovies(page = 1): Promise<TMDBResponse<MovieItem>> {
  return tmdbFetch<TMDBResponse<MovieItem>>('/movie/now_playing', {
    page,
    region: 'BR',
  });
}

/**
 * Search movies by query text
 */
export async function searchMovies(query: string, page = 1): Promise<TMDBResponse<MovieItem>> {
  return tmdbFetch<TMDBResponse<MovieItem>>('/search/movie', {
    query,
    page,
    include_adult: 'false',
    region: 'BR',
  });
}

/**
 * Get full movie details with appended providers, cast, videos, recommendations
 */
export async function getMovieDetails(movieId: number): Promise<MovieDetails> {
  return tmdbFetch<MovieDetails>(`/movie/${movieId}`, {
    append_to_response: 'watch/providers,credits,videos,recommendations,release_dates',
  });
}

/**
 * Extract Brazilian age rating certification if available
 */
export function getBrazilianAgeRating(details?: MovieDetails): string | null {
  if (!details?.release_dates?.results) return null;
  const brRelease = details.release_dates.results.find((r) => r.iso_3166_1 === 'BR');
  if (!brRelease) return null;
  const cert = brRelease.release_dates.find((d) => d.certification && d.certification.trim().length > 0);
  return cert ? cert.certification : null;
}
