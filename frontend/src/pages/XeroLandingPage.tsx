import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { XeroHero } from '../components/XeroHero';
import { Product, Category, Pagination } from '../types';
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';
import { ProductCard } from '../components/products/ProductCard';
import { ProductFilters } from '../components/products/ProductFilters';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { EmptyState } from '../components/common/EmptyState';
import { useToast } from '../context/ToastContext';

export const XeroLandingPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 12,
    total: 0,
    pages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const { error } = useToast();

  const fetchCategories = useCallback(async () => {
    try {
      const res = await categoryService.getAll({ limit: 50 });
      setCategories(res.categories || []);
    } catch (err: any) {
      console.warn('Failed to load categories:', err);
    }
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
      });
      setProducts(res.products || []);
      if (res.pagination) setPagination(res.pagination);
    } catch (err: any) {
      error(err.message || 'Failed to load listings');
    } finally {
      setLoading(false);
    }
  }, [
    pagination.page,
    pagination.limit,
    selectedCategory,
    searchQuery,
    minPrice,
    maxPrice,
    inStockOnly,
    error,
  ]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleResetFilters = () => {
    setSelectedCategory('');
    setSearchQuery('');
    setMinPrice('');
    setMaxPrice('');
    setInStockOnly(false);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  return (
    <div style={{ background: '#0a0a0f', minHeight: '100vh', width: '100%' }}>
      {/* Exact Xero Hero specification */}
      <XeroHero />

      {/* RentPe Data Section below the Xero Hero */}
      <section
        id="rentpe-data"
        style={{
          maxWidth: '1600px',
          margin: '40px auto 80px',
          padding: '0 24px',
          color: '#f0f0f5',
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <div
          style={{
            borderTop: '1px solid rgba(255,255,255,0.08)',
            paddingTop: '40px',
            marginBottom: '32px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
          }}
        >
          <div>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: '#38bdf8',
                display: 'block',
                marginBottom: '6px',
              }}
            >
              RentPe Ecosystem Data
            </span>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 700, margin: 0, color: '#fff' }}>
              Explore Available Campus Gear & Data
            </h2>
          </div>

          <Link
            to="/app"
            style={{
              fontSize: '0.85rem',
              fontWeight: 600,
              color: '#fff',
              background: 'rgba(255,255,255,0.08)',
              padding: '8px 18px',
              borderRadius: '999px',
              textDecoration: 'none',
              border: '1px solid rgba(255,255,255,0.12)',
            }}
          >
            Launch RentPe App &rarr;
          </Link>
        </div>

        {/* Product Filters */}
        <ProductFilters
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={(id) => {
            setSelectedCategory(id);
            setPagination((prev) => ({ ...prev, page: 1 }));
          }}
          searchQuery={searchQuery}
          onSearchChange={(q) => {
            setSearchQuery(q);
            setPagination((prev) => ({ ...prev, page: 1 }));
          }}
          minPrice={minPrice}
          maxPrice={maxPrice}
          onPriceChange={(min, max) => {
            setMinPrice(min);
            setMaxPrice(max);
            setPagination((prev) => ({ ...prev, page: 1 }));
          }}
          inStockOnly={inStockOnly}
          onToggleInStock={() => {
            setInStockOnly(!inStockOnly);
            setPagination((prev) => ({ ...prev, page: 1 }));
          }}
          onReset={handleResetFilters}
        />

        {/* Products Grid */}
        {loading ? (
          <LoadingSkeleton count={8} type="card" />
        ) : products.length === 0 ? (
          <EmptyState
            title="No rental items found"
            description="Try changing your search keywords, clear active filters, or check back soon."
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
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '20px',
              marginTop: '24px',
            }}
          >
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default XeroLandingPage;
