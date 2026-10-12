import React from 'react';
import { TMDB_GENRES } from '../constants/providers';
import { SortOption } from '../types/tmdb';
import { Filter, ArrowUpDown } from 'lucide-react';

interface GenreFilterProps {
  selectedGenreId: number | null;
  onSelectGenre: (genreId: number | null) => void;
  selectedSort: SortOption;
  onSelectSort: (sort: SortOption) => void;
  selectedYear: number | null;
  onSelectYear: (year: number | null) => void;
  hasActiveFilters: boolean;
  onResetAllFilters: () => void;
}

export const GenreFilter: React.FC<GenreFilterProps> = ({
  selectedGenreId,
  onSelectGenre,
  selectedSort,
  onSelectSort,
  selectedYear,
  onSelectYear,
  hasActiveFilters,
  onResetAllFilters,
}) => {
  const currentYear = new Date().getFullYear();
  const yearOptions = [currentYear, currentYear - 1, currentYear - 2, 2023, 2022, 2020, 2015, 2010, 2000];

  return (
    <div className="w-full space-y-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80 backdrop-blur-md">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-rose-500" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Categorias & Ordenação
          </span>
        </div>

        <div className="flex items-center gap-3 ml-auto">
          {/* Year selector */}
          <select
            value={selectedYear || ''}
            onChange={(e) => onSelectYear(e.target.value ? Number(e.target.value) : null)}
            className="bg-slate-800 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-rose-500 cursor-pointer"
          >
            <option value="">Todos os anos</option>
            {yearOptions.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          {/* Sort selector */}
          <div className="flex items-center gap-1.5 bg-slate-800 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedSort}
              onChange={(e) => onSelectSort(e.target.value as SortOption)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="popularity.desc" className="bg-slate-800">Mais Populares</option>
              <option value="vote_average.desc" className="bg-slate-800">Melhores Notas TMDB</option>
              <option value="primary_release_date.desc" className="bg-slate-800">Lançamentos Recentes</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button
              onClick={onResetAllFilters}
              className="text-xs text-rose-400 hover:text-rose-300 font-medium transition-colors cursor-pointer"
            >
              Limpar tudo
            </button>
          )}
        </div>
      </div>

      {/* Genre pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none snap-x">
        <button
          onClick={() => onSelectGenre(null)}
          className={`snap-start flex-shrink-0 px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
            selectedGenreId === null
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
              : 'bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-transparent'
          }`}
        >
          Todos os gêneros
        </button>
        {TMDB_GENRES.map((genre) => {
          const isSelected = selectedGenreId === genre.id;
          return (
            <button
              key={genre.id}
              onClick={() => onSelectGenre(isSelected ? null : genre.id)}
              className={`snap-start flex-shrink-0 px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                isSelected
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-semibold'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              {genre.name}
            </button>
          );
        })}
      </div>
    </div>
  );
};
