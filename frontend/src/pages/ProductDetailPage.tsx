import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Star,
  Check,
  Tag,
  XCircle,
  Plus,
  Minus,
  Repeat2,
  Phone,
  Building2,
  ShieldCheck
} from 'lucide-react';
import { Product, User } from '../types';
import { productService } from '../services/productService';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { ReviewSection } from '../components/products/ReviewSection';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart, cart } = useCart();
  const { error, info } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const fetchProduct = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await productService.getById(id);
      setProduct(res.product);
    } catch (err: any) {
      error(err.message || 'Failed to load product details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchProduct();
  }, [fetchProduct]);

  if (loading) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Listings
        </button>
        <LoadingSkeleton type="detail" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold text-zinc-200">Rental listing not found</h2>
        <Link
          to="/"
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-100 text-zinc-950 text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Back to listings
        </Link>
      </div>
    );
  }

  const categoryName =
    typeof product.category === 'object' && product.category !== null
      ? product.category.name
      : 'General';

  const images = product.images?.length
    ? product.images
    : [{ url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80', alt: product.name }];

  const currentImage = images[selectedImageIndex]?.url || images[0]?.url;

  const hasDiscount = !!product.discountPrice && product.discountPrice < product.price;
  const currentPrice = hasDiscount ? product.discountPrice! : product.price;
  const productStatus = product.status || (product.isAvailable === false ? 'Unavailable' : 'Available');
  const availableStock = productStatus === 'Available' ? 99 : 0;
  const isOutOfStock = productStatus !== 'Available';

  const owner: User | null =
    typeof product.owner === 'object' && product.owner !== null
      ? (product.owner as User)
      : typeof product.createdBy === 'object' && product.createdBy !== null
        ? (product.createdBy as User)
        : null;

  const ownerName = owner?.name || 'Verified Student Lender';
  const ownerCollege = owner?.collegeName || product.location || 'Campus Community';
  const ownerPhone = owner?.phone || '+91 98765 43210';

  const cleanPhone = ownerPhone.replace(/[^0-9]/g, '');

  const isInCart = cart?.items?.some((item) => {
    const itemProdId =
      typeof item.product === 'object' && item.product !== null
        ? item.product._id
        : item.product;
    return itemProdId === product?._id;
  }) || false;

  const isItemAdded = added || isInCart;

  const handleAddToCart = async () => {
    if (!product) return;
    if (isItemAdded) {
      info('Item already added to your cart');
      return;
    }
    try {
      setIsAdding(true);
      await addToCart(product._id, quantity);
      setAdded(true);
    } catch {
      // Handled in CartContext toast
    } finally {
      setIsAdding(false);
    }
  };

  const ownerDetails = (
    <div className="space-y-3 rounded-2xl border border-zinc-800/90 bg-gradient-to-br from-zinc-900 to-zinc-950 p-3.5 shadow-lg shadow-black/20 silver-card sm:p-4">
      <div className="flex items-center gap-2.5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-800 text-sm font-bold text-zinc-100 shadow-inner">
          {ownerName.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <h3 className="flex flex-wrap items-center gap-1.5 text-[15px] font-bold leading-5 text-zinc-100">
            {ownerName}
            <span className="inline-flex items-center gap-0.5 rounded-md border border-zinc-700 bg-zinc-800 px-1.5 py-0.5 font-mono text-[9px] font-medium leading-none text-zinc-300">
              <ShieldCheck className="h-3 w-3 text-zinc-300" /> Verified
            </span>
          </h3>
          <p className="mt-0.5 flex items-center gap-1 truncate text-[11px] text-zinc-400">
            <Building2 className="h-3 w-3 shrink-0 text-zinc-400" /> {ownerCollege}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <a
          href={`tel:${ownerPhone}`}
          aria-label={`Call ${ownerName}`}
          className="flex h-10 items-center justify-center gap-1.5 rounded-xl border border-sky-400/30 bg-sky-500 px-2.5 text-[13px] font-semibold text-white shadow-lg shadow-sky-950/40 transition-all hover:bg-sky-400 hover:shadow-sky-500/20 active:scale-[0.98]"
        >
          <Phone className="h-3.5 w-3.5" fill="currentColor" strokeWidth={2.5} aria-hidden="true" /> Call
        </a>
        <a
          href={`https://wa.me/${cleanPhone ? (cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone) : '919876543210'}`}
          target="_blank"
          rel="noreferrer"
          aria-label={`Message ${ownerName} on WhatsApp`}
          className="flex h-10 items-center justify-center gap-1.5 rounded-xl border border-emerald-400/30 bg-[#25D366] px-2.5 text-[13px] font-semibold text-white shadow-lg shadow-emerald-950/40 transition-all hover:bg-[#20bd5a] hover:shadow-emerald-500/20 active:scale-[0.98]"
        >
          <svg viewBox="0 0 32 32" aria-hidden="true" className="h-3.5 w-3.5 fill-current">
            <path d="M16.01 3.2a12.76 12.76 0 0 0-10.8 19.56L3.2 29l6.4-2.05A12.8 12.8 0 1 0 16 3.2Zm0 23.45c-2.1 0-4.17-.57-5.97-1.65l-.43-.25-3.8 1.22 1.24-3.7-.28-.45a10.52 10.52 0 1 1 9.24 4.83Zm5.77-7.85c-.32-.16-1.9-.94-2.2-1.05-.3-.11-.52-.16-.74.16-.22.32-.85 1.05-1.04 1.27-.2.22-.4.25-.72.08a8.62 8.62 0 0 1-2.53-1.56 9.5 9.5 0 0 1-1.75-2.18c-.18-.32 0-.49.14-.64.15-.14.32-.37.48-.56.16-.19.21-.32.32-.53.1-.21.05-.4-.03-.56-.08-.16-.74-1.78-1.01-2.44-.27-.64-.54-.55-.74-.56h-.63c-.22 0-.56.08-.85.4-.3.32-1.12 1.1-1.12 2.67 0 1.57 1.15 3.08 1.3 3.3.16.21 2.26 3.45 5.47 4.84.76.33 1.36.53 1.83.67.77.24 1.47.2 2.03.12.62-.1 1.9-.77 2.17-1.52.27-.75.27-1.4.19-1.53-.08-.13-.3-.2-.62-.36Z" />
          </svg>
          WhatsApp
        </a>
      </div>
    </div>
  );

  return (
    <div className="page-container space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Listings
      </button>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* Left: Item Images Gallery */}
        <div className="lg:col-span-5 space-y-3">
          <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-xl">
            <img
              src={currentImage}
              alt={product.name}
              className="block h-auto w-full object-contain"
            />
            {hasDiscount && (
              <div className="absolute top-3 left-3">
                <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-white text-zinc-950 shadow-lg">
                  <Tag className="w-3 h-3" /> Save ₹{(product.price - product.discountPrice!).toFixed(0)}/day
                </span>
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex flex-wrap items-center gap-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${selectedImageIndex === idx
                      ? 'border-zinc-300 scale-105'
                      : 'border-zinc-800 opacity-60 hover:opacity-100'
                    }`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}

        </div>

        {/* Right: Info, Price & Actions */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-300">
                {categoryName}
              </span>
              <span className="text-[11px] font-mono text-zinc-500">SKU: {product.sku}</span>
              {product.condition && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-400">
                  {product.condition}
                </span>
              )}
            </div>

            <h1 className="text-2xl font-extrabold leading-tight tracking-tight text-white sm:text-3xl">
              {product.name}
            </h1>

            {/* Ratings Summary */}
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-0.5 text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${i < Math.round(product.ratings?.average || 0)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-zinc-700'
                      }`}
                  />
                ))}
              </div>
              <span className="text-xs font-semibold text-zinc-200 font-mono">
                {product.ratings?.average?.toFixed(1) || '5.0'}
              </span>
              <span className="text-xs text-zinc-500">
                ({product.ratings?.count || 0} reviews)
              </span>
            </div>

            {/* Rental Price Box */}
            <div className="flex items-center gap-3 rounded-2xl border border-zinc-800/90 bg-gradient-to-br from-zinc-900 to-zinc-950 p-4 shadow-sm shadow-black/20 sm:p-5">
              <div>
                <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-400">Rental Rate</p>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-mono text-3xl font-black text-white sm:text-4xl">
                    ₹{currentPrice.toFixed(0)}
                  </span>
                  <span className="text-sm text-zinc-400">/ day</span>
                  {hasDiscount && (
                    <span className="text-sm text-zinc-500 line-through font-mono ml-1">
                      ₹{product.price.toFixed(0)}
                    </span>
                  )}
                </div>
              </div>

              {/* Availability badge inline with price */}
              <div className="ml-auto">
                {isOutOfStock ? (
                  <div className="flex items-center gap-1.5 whitespace-nowrap rounded-xl border border-rose-800/40 bg-rose-950/30 px-3 py-2 text-xs font-semibold text-rose-400">
                    <XCircle className="w-3.5 h-3.5" /> {productStatus}
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 whitespace-nowrap rounded-xl border border-emerald-900/50 bg-emerald-950/20 px-3 py-2 text-xs font-semibold text-zinc-100">
                    <Check className="w-3.5 h-3.5 text-emerald-400" /> Available
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <h4 className="mb-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
                About this Item
              </h4>
              <p className="whitespace-pre-line text-[15px] leading-6 text-zinc-300">
                {product.description}
              </p>
            </div>

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="rounded-lg border border-zinc-800 bg-zinc-950 px-2.5 py-1 font-mono text-[10px] text-zinc-400"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Desktop action area: owner details fill the left space; rental controls remain right. */}
          <div className="mt-auto flex flex-col gap-4 lg:flex-row lg:items-stretch">
            <div className="lg:flex-1">{ownerDetails}</div>

            {/* Rental Duration & Action Box */}
            <div className="w-full space-y-3 rounded-2xl border border-zinc-800 bg-zinc-900 p-4 silver-card lg:w-[19rem]">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-zinc-300">Duration:</span>
                <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded-xl p-0.5">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1 || isOutOfStock}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors disabled:opacity-40"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-xs font-bold text-white px-2.5 font-mono">
                    {quantity}d
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(availableStock, quantity + 1))}
                    disabled={quantity >= availableStock || isOutOfStock}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors disabled:opacity-40"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-zinc-400 font-mono block">Total</span>
                <span className="text-base font-bold text-white font-mono">
                  ₹{(currentPrice * quantity).toFixed(0)}
                </span>
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={isAdding || isOutOfStock}
              className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99] ${isItemAdded
                  ? 'bg-zinc-800 text-emerald-400 border border-emerald-500/30'
                  : isOutOfStock
                    ? 'bg-zinc-900 text-zinc-600 border border-zinc-800 cursor-not-allowed'
                    : 'bg-zinc-100 hover:bg-white text-zinc-950'
                }`}
            >
              {isItemAdded ? (
                <>
                  <Check className="w-4 h-4" /> Added to Rental Cart!
                </>
              ) : isOutOfStock ? (
                <span>Item Currently Unavailable</span>
              ) : (
                <>
                  <Repeat2 className="w-4 h-4" /> Rent for {quantity}d · ₹{(currentPrice * quantity).toFixed(0)}
                </>
              )}
            </button>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <div className="pt-4 border-t border-zinc-900">
        <ReviewSection productId={product._id} onReviewAdded={fetchProduct} />
      </div>
    </div>
  );
};
