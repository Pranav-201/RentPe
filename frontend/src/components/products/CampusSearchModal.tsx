import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  X,
  ArrowLeft,
  Search,
  PackageOpen,
  RotateCw,
  MapPinOff,
  ArrowUpRight,
  Building2,
  Package,
  Radio,
} from 'lucide-react';
import { productService, CampusEntry } from '../../services/productService';
import { Product, Pagination } from '../../types';
import { ProductCard } from './ProductCard';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface CampusSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type View = 'campus-list' | 'campus-products';

// ─── Skeletons ─────────────────────────────────────────────────────────────────

const ProductGridSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {Array.from({ length: 6 }).map((_, i) => (
      <div
        key={i}
        className="bg-[#0e1015] border border-[#1e222b] rounded-2xl p-4 flex flex-col gap-3 animate-pulse shadow-sm"
      >
        <div className="w-full aspect-[4/3] bg-[#161820] rounded-xl" />
        <div className="h-4 bg-[#1e222b] rounded w-2/3" />
        <div className="h-3 bg-[#161820] rounded w-1/2" />
        <div className="flex justify-between items-center pt-2">
          <div className="h-5 bg-[#1e222b] rounded w-1/4" />
          <div className="h-8 bg-[#161820] rounded-lg w-1/3" />
        </div>
      </div>
    ))}
  </div>
);

// ─── Main Component ─────────────────────────────────────────────────────────────

export const CampusSearchModal: React.FC<CampusSearchModalProps> = ({ isOpen, onClose }) => {
  const [isScanning, setIsScanning] = useState(true);
  const [view, setView] = useState<View>('campus-list');
  const [animating, setAnimating] = useState(false);

  // Campus list
  const [campuses, setCampuses] = useState<CampusEntry[]>([]);
  const [campusLoading, setCampusLoading] = useState(false);
  const [campusError, setCampusError] = useState('');

  // Selected campus
  const [selectedCampus, setSelectedCampus] = useState<CampusEntry | null>(null);

  // Campus products
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 12, total: 0, pages: 1 });
  const [productsLoading, setProductsLoading] = useState(false);
  const [campusSearch, setCampusSearch] = useState('');

  const searchRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // ── Fetch campuses ──────────────────────────────────────────────────────────

  const fetchCampuses = useCallback(async () => {
    setCampusLoading(true);
    setCampusError('');
    try {
      const data = await productService.getCampuses();
      setCampuses(data.campuses || []);
    } catch (err: any) {
      setCampusError(err.message || 'Failed to load campuses');
    } finally {
      setCampusLoading(false);
    }
  }, []);

  // When modal opens, trigger radar scanning animation then show colleges
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOpen) {
      setIsScanning(true);
      setView('campus-list');
      setSelectedCampus(null);
      setCampusSearch('');
      setProducts([]);
      setPagination({ page: 1, limit: 12, total: 0, pages: 1 });
      fetchCampuses();

      timer = setTimeout(() => {
        setIsScanning(false);
      }, 2300);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isOpen, fetchCampuses]);

  const handleScanAgain = () => {
    setIsScanning(true);
    fetchCampuses();
    setTimeout(() => {
      setIsScanning(false);
    }, 2300);
  };

  // ── Fetch campus products ───────────────────────────────────────────────────

  const fetchCampusProducts = useCallback(async (campus: string, search: string, page: number) => {
    setProductsLoading(true);
    try {
      const data = await productService.getAll({
        college: campus,
        search: search || undefined,
        page,
        limit: 12,
      });
      setProducts(data.products || []);
      if (data.pagination) setPagination(data.pagination);
    } catch {
      // EmptyState handles display
    } finally {
      setProductsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (view === 'campus-products' && selectedCampus) {
      fetchCampusProducts(selectedCampus.college, campusSearch, pagination.page);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campusSearch, pagination.page, view]);

  // ── Navigation ──────────────────────────────────────────────────────────────

  const goToCampus = (campus: CampusEntry) => {
    setAnimating(true);
    setSelectedCampus(campus);
    setCampusSearch('');
    setPagination({ page: 1, limit: 12, total: 0, pages: 1 });
    fetchCampusProducts(campus.college, '', 1);
    setTimeout(() => {
      setView('campus-products');
      setAnimating(false);
      setTimeout(() => searchRef.current?.focus(), 80);
    }, 210);
  };

  const goBackToCampusList = () => {
    setAnimating(true);
    setTimeout(() => {
      setView('campus-list');
      setSelectedCampus(null);
      setCampusSearch('');
      setAnimating(false);
    }, 210);
  };

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [view]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm"
      style={{ animation: 'csfadein 0.2s ease forwards' }}
      onClick={onClose}
    >
      <style>{`
        @keyframes csfadein  { from{opacity:0} to{opacity:1} }
        @keyframes csslideup { from{opacity:0;transform:translateY(16px) scale(0.98)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes csslidefwd { from{opacity:0;transform:translateX(16px)} to{opacity:1;transform:translateX(0)} }
        @keyframes cssliderev { from{opacity:0;transform:translateX(-16px)} to{opacity:1;transform:translateX(0)} }
        @keyframes cscardin  { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .cs-dialog  { animation: csslideup 0.25s cubic-bezier(0.22,1,0.36,1) forwards; }
        .cs-fwd     { animation: csslidefwd 0.22s ease forwards; }
        .cs-rev     { animation: cssliderev 0.22s ease forwards; }
        .cs-card-in { animation: cscardin 0.25s ease both; }
        .cs-hidden  { opacity:0; pointer-events:none; }
        .no-scrollbar::-webkit-scrollbar { display:none; }
        .no-scrollbar { -ms-overflow-style:none; scrollbar-width:none; }

        /* Campus explorer theme */
        .campus-solid-window {
          background:
            linear-gradient(rgba(255, 255, 255, 0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.025) 1px, transparent 1px),
            #0a0a0a;
          background-size: 28px 28px;
        }

        .campus-solid-card {
          background: #f4f4f0;
          border: 3px solid #050505;
          box-shadow: 7px 7px 0 #050505;
          transition: transform 0.18s ease, box-shadow 0.18s ease;
        }

        .campus-solid-card:hover {
          background: #ffffff;
          border-color: #050505;
          box-shadow: 10px 10px 0 #050505;
          transform: translate(-3px, -3px);
        }

        .campus-solid-card:active {
          box-shadow: 2px 2px 0 #050505;
          transform: translate(5px, 5px);
        }

        /* Boxes Loader Styles */
        .boxes-loader-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px 0 16px 0;
        }

        .boxes-loader {
          position: relative;
          width: 112px;
          height: 112px;
        }

        .boxes-loader .box1,
        .boxes-loader .box2,
        .boxes-loader .box3 {
          border: 16px solid #f5f5f5;
          box-sizing: border-box;
          position: absolute;
          display: block;
        }

        .boxes-loader .box1 {
          width: 112px;
          height: 48px;
          margin-top: 64px;
          margin-left: 0px;
          animation: abox1 4s 1s forwards ease-in-out infinite;
        }

        .boxes-loader .box2 {
          width: 48px;
          height: 48px;
          margin-top: 0px;
          margin-left: 0px;
          animation: abox2 4s 1s forwards ease-in-out infinite;
        }

        .boxes-loader .box3 {
          width: 48px;
          height: 48px;
          margin-top: 0px;
          margin-left: 64px;
          animation: abox3 4s 1s forwards ease-in-out infinite;
        }

        @keyframes abox1 {
          0% {
            width: 112px;
            height: 48px;
            margin-top: 64px;
            margin-left: 0px;
          }
          12.5% {
            width: 48px;
            height: 48px;
            margin-top: 64px;
            margin-left: 0px;
          }
          25% {
            width: 48px;
            height: 48px;
            margin-top: 64px;
            margin-left: 0px;
          }
          37.5% {
            width: 48px;
            height: 48px;
            margin-top: 64px;
            margin-left: 0px;
          }
          50% {
            width: 48px;
            height: 48px;
            margin-top: 64px;
            margin-left: 0px;
          }
          62.5% {
            width: 48px;
            height: 48px;
            margin-top: 64px;
            margin-left: 0px;
          }
          75% {
            width: 48px;
            height: 112px;
            margin-top: 0px;
            margin-left: 0px;
          }
          87.5% {
            width: 48px;
            height: 48px;
            margin-top: 0px;
            margin-left: 0px;
          }
          100% {
            width: 48px;
            height: 48px;
            margin-top: 0px;
            margin-left: 0px;
          }
        }

        @keyframes abox2 {
          0% {
            width: 48px;
            height: 48px;
            margin-top: 0px;
            margin-left: 0px;
          }
          12.5% {
            width: 48px;
            height: 48px;
            margin-top: 0px;
            margin-left: 0px;
          }
          25% {
            width: 48px;
            height: 48px;
            margin-top: 0px;
            margin-left: 0px;
          }
          37.5% {
            width: 48px;
            height: 48px;
            margin-top: 0px;
            margin-left: 0px;
          }
          50% {
            width: 112px;
            height: 48px;
            margin-top: 0px;
            margin-left: 0px;
          }
          62.5% {
            width: 48px;
            height: 48px;
            margin-top: 0px;
            margin-left: 64px;
          }
          75% {
            width: 48px;
            height: 48px;
            margin-top: 0px;
            margin-left: 64px;
          }
          87.5% {
            width: 48px;
            height: 48px;
            margin-top: 0px;
            margin-left: 64px;
          }
          100% {
            width: 48px;
            height: 48px;
            margin-top: 0px;
            margin-left: 64px;
          }
        }

        @keyframes abox3 {
          0% {
            width: 48px;
            height: 48px;
            margin-top: 0px;
            margin-left: 64px;
          }
          12.5% {
            width: 48px;
            height: 48px;
            margin-top: 0px;
            margin-left: 64px;
          }
          25% {
            width: 48px;
            height: 112px;
            margin-top: 0px;
            margin-left: 64px;
          }
          37.5% {
            width: 48px;
            height: 48px;
            margin-top: 64px;
            margin-left: 64px;
          }
          50% {
            width: 48px;
            height: 48px;
            margin-top: 64px;
            margin-left: 64px;
          }
          62.5% {
            width: 48px;
            height: 48px;
            margin-top: 64px;
            margin-left: 64px;
          }
          75% {
            width: 48px;
            height: 48px;
            margin-top: 64px;
            margin-left: 64px;
          }
          87.5% {
            width: 48px;
            height: 48px;
            margin-top: 64px;
            margin-left: 64px;
          }
          100% {
            width: 112px;
            height: 48px;
            margin-top: 64px;
            margin-left: 0px;
          }
        }
      `}</style>

      {/* Dialog Window - Solid Dark Black */}
      <div
        className={`cs-dialog w-full ${
          isScanning ? 'max-w-md' : view === 'campus-products' ? 'max-w-3xl' : 'max-w-2xl'
        } rounded-3xl overflow-hidden flex flex-col transition-all duration-300 relative campus-solid-window`}
        style={{
          border: '1px solid #1e222b',
          boxShadow: '0 32px 80px rgba(0, 0, 0, 0.95)',
          maxHeight: '88vh',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Accent Edge */}
        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-zinc-600 to-transparent" />

        {/* Header - Solid Dark */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0d0d0d]/90 flex-shrink-0">
          <div className="flex items-center gap-3">
            {view === 'campus-products' && (
              <button
                onClick={goBackToCampusList}
                className="p-2 rounded-xl text-zinc-400 hover:text-white bg-[#12151c] hover:bg-[#1a1e27] border border-[#1e222b] transition-colors mr-0.5 cursor-pointer"
                title="Back to all campuses"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div>
              {isScanning ? (
                <>
                  <h3 className="text-sm font-bold text-white tracking-tight">Campus Search</h3>
                  <p className="text-[11px] text-zinc-400 font-mono">Finding active campus listings...</p>
                </>
              ) : view === 'campus-list' ? (
                <>
                  <h3 className="text-sm font-bold text-white tracking-tight">Active Campus Rentals</h3>
                  <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
                    {campuses.length} campus hub{campuses.length !== 1 ? 's' : ''} with live listings
                  </p>
                </>
              ) : (
                <>
                  <h3 className="text-sm font-bold text-white tracking-tight">{selectedCampus?.college}</h3>
                  <p className="text-[11px] text-zinc-400 font-mono">
                    {productsLoading
                      ? 'Loading items...'
                      : `${pagination.total} rental listing${pagination.total !== 1 ? 's' : ''} available`}
                  </p>
                </>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white bg-[#12151c] hover:bg-[#1a1e27] border border-[#1e222b] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <div ref={scrollRef} className="overflow-y-auto no-scrollbar flex-1 bg-transparent" style={{ minHeight: 0 }}>
          {isScanning ? (
            /* ═══ BOXES SCANNING LOADER ═══ */
            <div className="p-8 flex flex-col items-center justify-center text-center min-h-[300px] space-y-6 animate-in fade-in duration-300">
              <div className="boxes-loader-wrapper">
                <div className="boxes-loader">
                  <div className="box1" />
                  <div className="box2" />
                  <div className="box3" />
                </div>
              </div>
              <div className="space-y-1.5">
                <h4 className="text-base font-bold text-white tracking-tight">
                  Scanning for active campuses...
                </h4>
                <p className="text-xs text-zinc-400 max-w-xs leading-relaxed">
                  Searching live student listing nodes across verified campus networks.
                </p>
              </div>
            </div>
          ) : (
            <div className={animating ? 'cs-hidden' : ''}>

              {/* ═══ CAMPUS LIST (Solid Dark) ═══ */}
              {view === 'campus-list' && (
                <div className="cs-rev p-5 sm:p-6 space-y-5">
                  {campusError && (
                    <p className="text-center py-8 text-xs text-rose-400">{campusError}</p>
                  )}

                  {campusLoading ? (
                    <div className="flex items-center justify-center py-12 text-zinc-400 text-xs font-mono">
                      Loading campuses...
                    </div>
                  ) : campuses.length === 0 && !campusError ? (
                    <div className="flex flex-col items-center space-y-4 py-10 text-center animate-in fade-in duration-300">
                      <div className="w-16 h-16 rounded-2xl bg-[#12151c] border border-[#1e222b] flex items-center justify-center text-zinc-500 shadow-inner">
                        <MapPinOff className="w-8 h-8 text-zinc-500" />
                      </div>
                      <div className="space-y-1.5">
                        <h4 className="text-base font-bold text-white tracking-tight">
                          No active campus listings yet
                        </h4>
                        <p className="text-xs text-zinc-400 max-w-xs leading-relaxed">
                          No active item listings are currently registered for colleges in your radius.
                        </p>
                      </div>
                      <div className="flex items-center gap-2 pt-2">
                        <button
                          onClick={handleScanAgain}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-zinc-200 text-black shadow-sm transition-colors cursor-pointer"
                        >
                          <RotateCw className="w-3.5 h-3.5" />
                          <span>Scan Again</span>
                        </button>
                        <button
                          onClick={onClose}
                          className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#12151c] hover:bg-[#1a1e27] text-zinc-300 border border-[#1e222b] transition-colors cursor-pointer"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      {/* Sub-bar */}
                      <div className="flex items-center justify-between gap-3 pb-4 mb-1 border-b border-white/10">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-400">
                            <Radio className="w-3.5 h-3.5" />
                            <span>Live campus network</span>
                          </div>
                          <p className="mt-1 text-sm font-semibold text-zinc-100">
                            Choose a campus to explore
                          </p>
                        </div>
                        <button
                          onClick={handleScanAgain}
                          className="group flex shrink-0 items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/30 text-[11px] font-semibold text-zinc-300 hover:text-white shadow-sm transition-all cursor-pointer"
                        >
                          <RotateCw className="w-3 h-3 text-zinc-400 group-hover:text-white group-hover:rotate-180 transition-all duration-500" />
                          <span>Rescan</span>
                        </button>
                      </div>

                      {/* Campus Cards Grid - Solid Opaque Dark Black (No Transparency) */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                        {campuses.map((campus, i) => (
                          <button
                            key={campus.college}
                            onClick={() => goToCampus(campus)}
                            className="cs-card-in campus-solid-card group relative text-left rounded-none p-5 cursor-pointer overflow-hidden flex flex-col justify-between min-h-[164px]"
                            style={{ animationDelay: `${i * 45}ms` }}
                          >
                            {/* Card Top / Header */}
                            <div className="relative z-10 flex items-start justify-between gap-3">
                              <div className="min-w-0 pr-2">
                                <div className="mb-3 inline-flex items-center gap-1.5 border-2 border-black bg-black px-2 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-white">
                                  <Radio className="h-3 w-3" />
                                  Live campus
                                </div>
                                <h4 className="text-[17px] font-black uppercase text-black tracking-tight line-clamp-1">
                                  {campus.college}
                                </h4>
                                <p className="text-xs text-zinc-700 mt-1.5 flex items-center gap-1.5 font-bold">
                                  <Building2 className="w-3.5 h-3.5 text-black flex-shrink-0" />
                                  <span className="truncate">Verified Campus Community</span>
                                </p>
                              </div>

                              <div className="w-9 h-9 border-2 border-black bg-white group-hover:bg-black group-hover:text-white flex items-center justify-center text-black transition-colors flex-shrink-0">
                                <ArrowUpRight className="w-3.5 h-3.5" />
                              </div>
                            </div>

                            {/* Card Bottom Divider + Stats */}
                            <div className="relative z-10 flex items-center justify-between pt-3 mt-4 border-t-2 border-black">
                              <span className="inline-flex items-center gap-1.5 border-2 border-black bg-white px-2.5 py-1 text-[11px] font-black text-black">
                                <Package className="w-3 h-3" />
                                {campus.count} rental{campus.count !== 1 ? 's' : ''}
                              </span>
                              <span className="text-[11px] font-black uppercase text-black transition-colors flex items-center gap-1">
                                Explore →
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ═══ CAMPUS PRODUCTS (Solid Dark) ═══ */}
              {view === 'campus-products' && (
                <div className="cs-fwd p-6 space-y-5">
                  {/* Search */}
                  <div className="relative group">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-white transition-colors" />
                    <input
                      ref={searchRef}
                      type="text"
                      value={campusSearch}
                      onChange={(e) => {
                        setCampusSearch(e.target.value);
                        setPagination((p) => ({ ...p, page: 1 }));
                      }}
                      placeholder={`Search items in ${selectedCampus?.college ?? 'this campus'}...`}
                      className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-[#0e1015] hover:bg-[#12151c] focus:bg-[#12151c] border border-[#1e222b] focus:border-zinc-600 text-white placeholder:text-zinc-500 text-sm focus:outline-none transition-all duration-200 shadow-sm"
                    />
                    {campusSearch && (
                      <button
                        onClick={() => { setCampusSearch(''); setPagination((p) => ({ ...p, page: 1 })); }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-zinc-400 hover:text-white rounded transition-colors cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Grid */}
                  {productsLoading ? (
                    <ProductGridSkeleton />
                  ) : products.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-14 gap-4 text-center">
                      <div className="p-4 rounded-2xl bg-[#0e1015] border border-[#1e222b]">
                        <PackageOpen className="w-8 h-8 text-zinc-500" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-zinc-200">No items found</p>
                        <p className="text-xs text-zinc-500 mt-1 max-w-xs">
                          {campusSearch
                            ? `No items matching "${campusSearch}" at ${selectedCampus?.college}.`
                            : `No active listings from ${selectedCampus?.college} yet.`}
                        </p>
                      </div>
                      {campusSearch && (
                        <button
                          onClick={() => setCampusSearch('')}
                          className="px-3 py-1.5 text-xs font-semibold bg-white hover:bg-zinc-200 text-black rounded-lg transition-colors cursor-pointer"
                        >
                          Clear search
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {products.map((product) => (
                        <div key={product._id} onClick={onClose}>
                          <ProductCard product={product} />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Pagination */}
                  {pagination.pages > 1 && (
                    <div className="flex items-center justify-center gap-2 pt-4 border-t border-[#1e222b]">
                      <button
                        onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
                        disabled={pagination.page <= 1}
                        className="px-3 py-1.5 rounded-xl text-xs font-medium bg-[#0e1015] border border-[#1e222b] text-zinc-300 hover:bg-[#161820] hover:text-white hover:border-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-sm"
                      >
                        ← Prev
                      </button>
                      <span className="text-xs font-mono text-zinc-400 px-2">
                        {pagination.page} / {pagination.pages}
                      </span>
                      <button
                        onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                        disabled={pagination.page >= pagination.pages}
                        className="px-3 py-1.5 rounded-xl text-xs font-medium bg-[#0e1015] border border-[#1e222b] text-zinc-300 hover:bg-[#161820] hover:text-white hover:border-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-sm"
                      >
                        Next →
                      </button>
                    </div>
                  )}
                </div>
              )}

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

