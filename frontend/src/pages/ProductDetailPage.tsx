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
  MessageCircle,
  GraduationCap,
  Building2,
  MapPin,
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
  const ownerCollegeId = owner?.collegeId || 'Verified Student';
  const pickupLocation = product.location || ownerCollege || 'On Campus Pickup';

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
          <div className="h-64 sm:h-72 rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-800 shadow-xl relative">
            <img
              src={currentImage}
              alt={product.name}
              className="w-full h-full object-cover"
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
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Persistent Owner Information Card */}
          <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 shadow-lg space-y-3 silver-card">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-200 font-bold text-sm flex-shrink-0">
                {ownerName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-1.5 flex-wrap">
                  {ownerName}
                  <span className="inline-flex items-center gap-0.5 px-1.5 rounded-md bg-zinc-800 border border-zinc-700 text-[9px] text-zinc-300 font-mono">
                    <ShieldCheck className="w-3 h-3 text-zinc-300" /> Verified
                  </span>
                </h3>
                <p className="text-[11px] text-zinc-400 flex items-center gap-1 truncate">
                  <Building2 className="w-3 h-3 text-zinc-400 flex-shrink-0" /> {ownerCollege}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center gap-2">
                <GraduationCap className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
                <div className="min-w-0">
                  <span className="text-[9px] text-zinc-400 block uppercase font-mono">Student ID</span>
                  <span className="text-xs font-semibold text-zinc-200 truncate block">{ownerCollegeId}</span>
                </div>
              </div>

              <div className="p-2 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
                <div className="min-w-0">
                  <span className="text-[9px] text-zinc-400 block uppercase font-mono">Campus Spot</span>
                  <span className="text-xs font-semibold text-zinc-200 truncate block">{pickupLocation}</span>
                </div>
              </div>
            </div>

            {/* Direct Contact Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <a
                href={`tel:${ownerPhone}`}
                className="py-1.5 px-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
              >
                <Phone className="w-3 h-3 text-zinc-300" /> Call
              </a>
              <a
                href={`https://wa.me/${cleanPhone ? (cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone) : '919876543210'}`}
                target="_blank"
                rel="noreferrer"
                className="py-1.5 px-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
              >
                <MessageCircle className="w-3 h-3 text-zinc-300" /> WhatsApp
              </a>
            </div>
          </div>
        </div>

        {/* Right: Info, Price & Actions */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="space-y-3">
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

            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-tight">
              {product.name}
            </h1>

            {/* Ratings Summary */}
            <div className="flex items-center gap-2">
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
            <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800/90 flex items-center gap-3">
              <div>
                <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider mb-0.5">Rental Rate</p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-white font-mono">
                    ₹{currentPrice.toFixed(0)}
                  </span>
                  <span className="text-xs text-zinc-400">/ day</span>
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
                  <div className="flex items-center gap-1 text-xs font-semibold text-rose-400 bg-rose-950/30 border border-rose-800/40 px-2.5 py-1 rounded-xl">
                    <XCircle className="w-3.5 h-3.5" /> {productStatus}
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-xs font-semibold text-zinc-200 bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-xl">
                    <Check className="w-3.5 h-3.5 text-emerald-400" /> Available
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <h4 className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-1 font-mono">
                About this Item
              </h4>
              <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {product.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-lg bg-zinc-950 border border-zinc-800 text-[10px] text-zinc-400 font-mono"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Rental Duration & Action Box */}
          <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3 silver-card mt-auto">
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

      {/* Customer Reviews Section */}
      <div className="pt-4 border-t border-zinc-900">
        <ReviewSection productId={product._id} onReviewAdded={fetchProduct} />
      </div>
    </div>
  );
};
