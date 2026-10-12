import React, { useState, useEffect, useRef } from 'react';
import { MovieCategory } from '../types/tmdb';
import {
  Search,
  X,
  Clapperboard,
  Bookmark,
  TrendingUp,
  Flame,
  Award,
  Sparkles,
  Menu,
} from 'lucide-react';

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearchSubmit: (query: string) => void;
  activeCategory: MovieCategory;
  onSelectCategory: (category: MovieCategory) => void;
  watchlistCount: number;
  onOpenWatchlist: () => void;
  isWatchlistActive: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  activeCategory,
  onSelectCategory,
  watchlistCount,
  onOpenWatchlist,
  isWatchlistActive,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearchSubmit(searchQuery.trim());
    }
  };

  const navItems = [
    { id: 'popular' as MovieCategory, label: 'Populares', icon: Flame },
    { id: 'trending' as MovieCategory, label: 'Em Alta', icon: TrendingUp },
    { id: 'top_rated' as MovieCategory, label: 'Mais Votados', icon: Award },
    { id: 'now_playing' as MovieCategory, label: 'Lançamentos', icon: Sparkles },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/85 backdrop-blur-xl border-b border-slate-800/80 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          {/* Logo */}
          <div
            onClick={() => {
              onSelectCategory('popular');
              onSearchChange('');
            }}
            className="flex items-center gap-2.5 cursor-pointer group flex-shrink-0"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-rose-400 flex items-center justify-center text-white shadow-lg shadow-rose-950/50 group-hover:scale-105 transition-transform">
              <Clapperboard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg sm:text-xl font-black tracking-tight text-white group-hover:text-rose-400 transition-colors">
                  ONDE<span className="text-rose-500">ASSISTIR</span>
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  🇧🇷 BR
                </span>
              </div>
              <p className="text-[10px] text-slate-400 -mt-1 font-medium hidden sm:block">
                Catálogo de Filmes por Streaming
              </p>
            </div>
          </div>

          {/* Desktop Category Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeCategory === item.id && !isWatchlistActive && !searchQuery;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectCategory(item.id);
                  }}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 text-rose-500" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Search Form */}
          <form
            onSubmit={handleSubmit}
            className="relative flex-1 max-w-xs sm:max-w-md"
          >
            <div className="relative flex items-center">
              <Search className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Buscar filme por nome..."
                className="w-full pl-10 pr-9 py-2 rounded-xl bg-slate-900/90 border border-slate-700/80 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    onSearchChange('');
                    inputRef.current?.focus();
                  }}
                  className="absolute right-3 p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </form>

          {/* Watchlist Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenWatchlist}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                isWatchlistActive
                  ? 'bg-rose-600 text-white border-rose-500 shadow-lg shadow-rose-900/40'
                  : 'bg-slate-900/90 hover:bg-slate-800 text-slate-200 border-slate-800 hover:border-slate-700'
              }`}
              title="Filmes salvos na Minha Lista"
            >
              <Bookmark className={`w-3.5 h-3.5 ${isWatchlistActive ? 'fill-white' : 'text-rose-500'}`} />
              <span className="hidden sm:inline">Minha Lista</span>
              {watchlistCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500 text-white font-mono">
                  {watchlistCount}
                </span>
              )}
            </button>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-slate-900 text-slate-300 border border-slate-800 hover:text-white cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-3 border-t border-slate-800/80 space-y-1 animate-in fade-in slide-in-from-top-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeCategory === item.id && !isWatchlistActive && !searchQuery;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectCategory(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4 text-rose-500" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
};
