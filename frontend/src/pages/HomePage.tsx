import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  PlusCircle,
} from 'lucide-react';
import { Product, Category, Pagination } from '../types';
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';
import { ProductCard } from '../components/products/ProductCard';
import { ProductFilters } from '../components/products/ProductFilters';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { EmptyState } from '../components/common/EmptyState';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { XeroHero } from '../components/XeroHero';
import { openSignInModal } from '../config/signInModal';

export const HomePage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1, limit: 12, total: 0, pages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const { error } = useToast();
  const { isAuthenticated } = useAuth();

  const fetchCategories = useCallback(async () => {
    try {
      const res = await categoryService.getAll({ limit: 50 });
      setCategories(res.categories || []);
    } catch (err: any) { console.warn('Failed to load categories:', err); }
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await productService.getAll({
        page: pagination.page,
        limit: pagination.limit,
        category: selectedCategory || undefined,
        search: searchQuery || undefined,
        minPrice: minPrice || undefined,
        maxPrice: maxPrice || undefined,
        inStock: inStockOnly ? 'true' : undefined,
        sort: sortBy || undefined,
      });
      setProducts(res.products || []);
      if (res.pagination) setPagination(res.pagination);
    } catch (err: any) {
      error(err.message || 'Failed to load listings');
    } finally { setLoading(false); }
  }, [pagination.page, pagination.limit, selectedCategory, searchQuery, minPrice, maxPrice, inStockOnly, sortBy, error]);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);
  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleResetFilters = () => {
    setSelectedCategory('');
    setSearchQuery('');
    setMinPrice('');
    setMaxPrice('');
    setInStockOnly(false);
    setSortBy('newest');
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const scrollToBrowse = () => {
    document.getElementById('browse-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div>
      {/* ═══════════════════════════════════════════════════════
          UNIFIED RENTPE HERO CARD (Xero Architecture)
      ═══════════════════════════════════════════════════════ */}
      <XeroHero onBrowseClick={scrollToBrowse} hideNav={true} />

      {/* ═══════════════════════════════════════════════════════
          BROWSE — Page 2
      ═══════════════════════════════════════════════════════ */}
      <section id="browse-section" className="px-4 sm:px-6 lg:px-8 xl:px-12 py-14 space-y-8 max-w-screen-xl min-[1536px]:max-w-[96rem] min-[1920px]:max-w-[112rem] mx-auto">
        {/* Section header */}
        <div className="flex items-end justify-between border-b border-zinc-800/60 pb-5">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Available Rentals</h2>
            <p className="text-xs text-zinc-500 mt-0.5">{pagination.total} items listed by campus students</p>
          </div>
          <Link
            to="/admin"
            onClick={(event) => {
              if (!isAuthenticated) {
                event.preventDefault();
                openSignInModal();
              }
            }}
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-700 rounded-xl px-4 py-2 transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" /> List an item
          </Link>
        </div>

        {/* Filters */}
        <ProductFilters
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={(id) => { setSelectedCategory(id); setPagination((prev) => ({ ...prev, page: 1 })); }}
          searchQuery={searchQuery}
          onSearchChange={(q) => { setSearchQuery(q); setPagination((prev) => ({ ...prev, page: 1 })); }}
          sortBy={sortBy}
          onSortChange={(sort) => { setSortBy(sort); setPagination((prev) => ({ ...prev, page: 1 })); }}
          inStockOnly={inStockOnly}
          onToggleInStock={() => { setInStockOnly(!inStockOnly); setPagination((prev) => ({ ...prev, page: 1 })); }}
          onReset={handleResetFilters}
        />

        {/* Grid */}
        {loading ? (
          <LoadingSkeleton count={8} type="card" />
        ) : products.length === 0 ? (
          <EmptyState
            title="No rental items found"
            description="Try changing your search keywords, clear active filters, or list a new item for other students!"
            action={
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 text-xs font-semibold text-white bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
              >
                Reset Filters
              </button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 min-[2200px]:grid-cols-6 gap-4 sm:gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-8 border-t border-zinc-800/60">
            <button
              onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page <= 1}
              className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono text-zinc-400 px-3">
              Page <span className="text-zinc-100 font-bold">{pagination.page}</span> of {pagination.pages}
            </span>
            <button
              onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page >= pagination.pages}
              className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </section>
    </div>
  );
};
