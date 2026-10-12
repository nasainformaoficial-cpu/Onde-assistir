export interface WatchProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
  display_priority?: number;
}

export interface WatchProviderCountryResult {
  link?: string;
  flatrate?: WatchProvider[];
  rent?: WatchProvider[];
  buy?: WatchProvider[];
  free?: WatchProvider[];
  ads?: WatchProvider[];
}

export interface WatchProvidersResponse {
  id: number;
  results: {
    BR?: WatchProviderCountryResult;
    [countryCode: string]: WatchProviderCountryResult | undefined;
  };
}

export interface Genre {
  id: number;
  name: string;
}

export interface MovieItem {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genre_ids?: number[];
  genres?: Genre[];
  runtime?: number;
  tagline?: string;
  // Attached watch providers for fast display on cards
  providers_br?: WatchProviderCountryResult;
  loading_providers?: boolean;
}

export interface VideoItem {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface CrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
}

export interface MovieDetails extends MovieItem {
  genres: Genre[];
  runtime: number;
  tagline: string;
  status: string;
  budget: number;
  revenue: number;
  credits?: {
    cast: CastMember[];
    crew: CrewMember[];
  };
  videos?: {
    results: VideoItem[];
  };
  'watch/providers'?: {
    results: {
      BR?: WatchProviderCountryResult;
    };
  };
  release_dates?: {
    results: Array<{
      iso_3166_1: string;
      release_dates: Array<{
        certification: string;
        type: number;
        release_date: string;
      }>;
    }>;
  };
  recommendations?: {
    results: MovieItem[];
  };
}

export interface TMDBResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export type SortOption =
  | 'popularity.desc'
  | 'vote_average.desc'
  | 'primary_release_date.desc'
  | 'revenue.desc';

export type MovieCategory = 'popular' | 'trending' | 'top_rated' | 'now_playing' | 'custom_filter';
