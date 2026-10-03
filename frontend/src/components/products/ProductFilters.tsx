import React, { useState, useRef, useEffect } from 'react';
import { Search, X, ArrowUpDown, ChevronDown, Check, Sparkles, ArrowUp, ArrowDown, Star, GraduationCap, ChevronRight } from 'lucide-react';
import { Category } from '../../types';
import { CampusSearchModal } from './CampusSearchModal';

interface ProductFiltersProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy?: string;
  onSortChange?: (sort: string) => void;
  inStockOnly: boolean;
  onToggleInStock: () => void;
  onReset: () => void;
  minPrice?: string;
  maxPrice?: string;
  onPriceChange?: (min: string, max: string) => void;
}

const sortOptions = [
  { id: 'newest', label: 'Sort: Newest', icon: Sparkles },
  { id: 'price-asc', label: 'Price: Low to High', icon: ArrowUp },
  { id: 'price-desc', label: 'Price: High to Low', icon: ArrowDown },
  { id: 'rating', label: 'Top Rated', icon: Star },
];

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  sortBy = 'newest',
  onSortChange,
  inStockOnly,
  onToggleInStock,
  onReset,
}) => {
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isCampusSearchOpen, setIsCampusSearchOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  const hasActiveFilters = Boolean(
    selectedCategory || searchQuery || inStockOnly || (sortBy && sortBy !== 'newest')
  );

  const currentSort = sortOptions.find((opt) => opt.id === sortBy) || sortOptions[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="space-y-3.5">
      {/* Top Search & Action Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        {/* Search Input Box */}
        <div className="relative flex-1 sm:max-w-md group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-zinc-200 transition-colors" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search items by title, description or tags..."
            className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-zinc-900/40 hover:bg-zinc-900/70 focus:bg-zinc-900/90 border border-zinc-800/70 focus:border-zinc-600 text-zinc-100 placeholder:text-zinc-500 text-xs sm:text-sm focus:outline-none transition-all duration-200 shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-zinc-500 hover:text-zinc-200 rounded transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Campus Search Button */}
        <button
          type="button"
          onClick={() => setIsCampusSearchOpen(true)}
          aria-label="Search rental listings by campus"
          className="group flex min-h-11 w-full items-center justify-between rounded-xl border border-violet-400/25 bg-gradient-to-r from-violet-500/15 to-indigo-500/10 px-3 text-zinc-100 shadow-sm transition-all duration-200 hover:border-violet-400/45 hover:from-violet-500/25 hover:to-indigo-500/20 active:scale-[0.99] sm:min-h-0 sm:w-auto sm:justify-center sm:gap-2 sm:px-3.5 sm:py-2.5"
        >
          <span className="flex items-center gap-2.5 sm:gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-400/15 text-violet-200 transition-colors group-hover:bg-violet-400/25">
              <GraduationCap className="h-4 w-4" />
            </span>
            <span className="flex flex-col items-start leading-tight sm:block">
              <span className="text-xs font-semibold sm:hidden">Search by campus</span>
              <span className="hidden text-xs font-medium sm:inline">Campus Search</span>
              <span className="mt-0.5 text-[10px] text-zinc-400 sm:hidden">Browse listings from your college</span>
            </span>
          </span>
          <ChevronRight className="h-4 w-4 text-violet-200/80 sm:hidden" aria-hidden="true" />
        </button>

        {/* Secondary controls: In-Stock Toggle & Custom Sort Popover & Reset */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap justify-between sm:justify-end sm:ml-auto">
          {/* In-Stock Pill Switch */}
          <button
            type="button"
            onClick={onToggleInStock}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-all duration-200 cursor-pointer ${
              inStockOnly
                ? 'bg-zinc-100 text-zinc-950 border-zinc-100 shadow-sm font-semibold'
                : 'bg-zinc-900/40 text-zinc-400 border-zinc-800/70 hover:border-zinc-700 hover:text-zinc-200'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                inStockOnly ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.9)]' : 'bg-zinc-600'
              }`}
            />
            <span>In Stock</span>
          </button>

          {/* Modern Custom Sort Dropdown */}
          <div className="relative" ref={sortRef}>
            <button
              type="button"
              onClick={() => setIsSortOpen((prev) => !prev)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-all duration-200 cursor-pointer ${
                isSortOpen
                  ? 'bg-zinc-800 border-zinc-600 text-zinc-100 shadow-sm'
                  : 'bg-zinc-900/40 border-zinc-800/70 text-zinc-300 hover:border-zinc-700 hover:text-zinc-100'
              }`}
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400" />
              <span>{currentSort.label}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 ${
                  isSortOpen ? 'rotate-180 text-zinc-200' : ''
                }`}
              />
            </button>

            {/* Dropdown Menu Popover */}
            {isSortOpen && (
              <div className="absolute right-0 top-full mt-2 w-52 p-1.5 rounded-2xl bg-zinc-950/95 backdrop-blur-xl border border-zinc-800/90 shadow-2xl z-40 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-2.5 py-1.5 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                  Sort Items By
                </div>
                <div className="space-y-0.5">
                  {sortOptions.map((opt) => {
                    const Icon = opt.icon;
                    const isSelected = sortBy === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          onSortChange && onSortChange(opt.id);
                          setIsSortOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-zinc-900 text-white font-semibold'
                            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon
                            className={`w-3.5 h-3.5 ${
                              isSelected ? 'text-zinc-100' : 'text-zinc-500'
                            }`}
                          />
                          <span>{opt.label}</span>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-zinc-200" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Reset button if active */}
          {hasActiveFilters && (
            <button
              onClick={onReset}
              className="px-2.5 py-2 text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1 hover:bg-zinc-900/60 rounded-xl"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Category Pills Bar (Clean, Minimal, Overflow scrollable) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 no-scrollbar">
        <button
          onClick={() => onSelectCategory('')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap cursor-pointer ${
            !selectedCategory
              ? 'bg-zinc-100 text-zinc-950 font-semibold shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
          }`}
        >
          All Categories
        </button>
        {categories.map((cat) => (
          <button
            key={cat._id}
            onClick={() => onSelectCategory(cat._id)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium capitalize transition-all duration-200 whitespace-nowrap cursor-pointer ${
              selectedCategory === cat._id
                ? 'bg-zinc-100 text-zinc-950 font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>
      {/* Campus Search Radar Modal */}
      <CampusSearchModal
        isOpen={isCampusSearchOpen}
        onClose={() => setIsCampusSearchOpen(false)}
      />
    </div>
  );
};


