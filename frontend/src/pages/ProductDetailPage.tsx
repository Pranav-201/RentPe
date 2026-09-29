import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Star,
  Check,
  Tag,
  AlertTriangle,
  XCircle,
  Plus,
  Minus,
  Repeat2,
  Phone,
  MessageCircle,
  Mail,
  GraduationCap,
  Building2,
  MapPin,
  ShieldCheck,
  ShoppingCart
} from 'lucide-react';
import { Product, Inventory, User } from '../types';
import { productService } from '../services/productService';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { ReviewSection } from '../components/products/ReviewSection';
import { Modal } from '../components/common/Modal';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart, openDrawer, cart } = useCart();
  const { error } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [inventory, setInventory] = useState<Inventory | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [isOwnerModalOpen, setIsOwnerModalOpen] = useState(false);

  const fetchProduct = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await productService.getById(id);
      setProduct(res.product);
      setInventory(res.inventory || null);
    } catch (err: any) {
      error(err.message || 'Failed to load product details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
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
  const availableStock = inventory ? inventory.available : 99;
  const isOutOfStock = inventory ? inventory.status === 'out_of_stock' || inventory.available === 0 : false;
  const isLowStock = inventory ? inventory.status === 'low_stock' : false;

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
  const ownerEmail = owner?.email || 'student@rentpe.com';
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
      setIsOwnerModalOpen(true);
      return;
    }
    try {
      setIsAdding(true);
      await addToCart(product._id, quantity);
      setAdded(true);
      setIsOwnerModalOpen(true);
    } catch {
      // Handled in CartContext toast
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="page-container space-y-12">
      {/* Back Button */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Listings
        </button>
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left: Item Images Gallery */}
        <div className="lg:col-span-6 space-y-4">
          <div className="aspect-square rounded-3xl overflow-hidden bg-zinc-950 border border-zinc-800 shadow-2xl relative">
            <img
              src={currentImage}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {hasDiscount && (
              <div className="absolute top-4 left-4">
                <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-white text-zinc-950 shadow-lg">
                  <Tag className="w-3.5 h-3.5" /> Save ₹{(product.price - product.discountPrice!).toFixed(0)}/day
                </span>
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex flex-wrap items-center gap-3">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                    selectedImageIndex === idx
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
          <div className="p-5 rounded-3xl bg-zinc-900/80 border border-zinc-800 shadow-xl space-y-4 silver-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-200 font-bold text-sm">
                  {ownerName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-1.5">
                    {ownerName}
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-md bg-zinc-800 border border-zinc-700 text-[9px] text-zinc-300 font-mono">
                      <ShieldCheck className="w-3 h-3 text-zinc-300" /> Verified
                    </span>
                  </h3>
                  <p className="text-[11px] text-zinc-400 flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-zinc-400" /> {ownerCollege}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
              <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center gap-2.5">
                <GraduationCap className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                <div className="min-w-0">
                  <span className="text-[9px] text-zinc-400 block uppercase font-mono">Student ID</span>
                  <span className="text-xs font-semibold text-zinc-200 truncate block">{ownerCollegeId}</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                <div className="min-w-0">
                  <span className="text-[9px] text-zinc-400 block uppercase font-mono">Campus Spot</span>
                  <span className="text-xs font-semibold text-zinc-200 truncate block">{pickupLocation}</span>
                </div>
              </div>
            </div>

            {/* Direct Contact Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <a
                href={`tel:${ownerPhone}`}
                className="py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
              >
                <Phone className="w-3.5 h-3.5 text-zinc-300" /> Call {ownerPhone}
              </a>
              <a
                href={`https://wa.me/${cleanPhone ? (cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone) : '919876543210'}`}
                target="_blank"
                rel="noreferrer"
                className="py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
              >
                <MessageCircle className="w-3.5 h-3.5 text-zinc-300" /> WhatsApp
              </a>
            </div>
          </div>
        </div>

        {/* Right: Info, Price & Actions */}
        <div className="lg:col-span-6 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-300">
                {categoryName}
              </span>
              <span className="text-xs font-mono text-zinc-400">SKU: {product.sku}</span>
              {product.condition && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-400">
                  Condition: {product.condition}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {product.name}
            </h1>

            {/* Ratings Summary */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.round(product.ratings?.average || 0)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-zinc-700'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-semibold text-zinc-200 font-mono">
                {product.ratings?.average?.toFixed(1) || '5.0'}
              </span>
              <span className="text-xs text-zinc-400">
                ({product.ratings?.count || 0} reviews)
              </span>
            </div>

            {/* Rental Price Box */}
            <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800/90">
              <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider mb-1">Rental Rate</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-white font-mono">
                  ₹{currentPrice.toFixed(0)}
                </span>
                <span className="text-xs text-zinc-400 font-normal">/ day</span>
                {hasDiscount && (
                  <span className="text-base text-zinc-500 line-through font-mono ml-2">
                    ₹{product.price.toFixed(0)}
                  </span>
                )}
              </div>
            </div>

            {/* Stock / Availability status indicator */}
            <div className="flex items-center gap-2">
              {isOutOfStock ? (
                <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-400 bg-rose-950/30 border border-rose-800/40 px-3 py-1 rounded-xl">
                  <XCircle className="w-4 h-4" /> Currently Unavailable
                </div>
              ) : isLowStock ? (
                <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 bg-amber-950/30 border border-amber-800/40 px-3 py-1 rounded-xl">
                  <AlertTriangle className="w-4 h-4" /> Only {availableStock} units left
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-200 bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-xl">
                  <Check className="w-4 h-4 text-emerald-400" /> Available for Rent ({availableStock} in stock)
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2 font-mono">
                About this Item
              </h4>
              <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2">
                {product.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-0.5 rounded-lg bg-zinc-950 border border-zinc-800 text-[10px] text-zinc-400 font-mono"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Rental Duration & Action Box */}
          <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4 mt-6 silver-card">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-zinc-300">Duration:</span>
                <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded-xl p-1">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1 || isOutOfStock}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors disabled:opacity-40"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs font-bold text-white px-3 font-mono">
                    {quantity} Day{quantity > 1 ? 's' : ''}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(availableStock, quantity + 1))}
                    disabled={quantity >= availableStock || isOutOfStock}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors disabled:opacity-40"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-zinc-400 font-mono block">Total Rent ({quantity}d)</span>
                <span className="text-lg font-bold text-white font-mono">
                  ₹{(currentPrice * quantity).toFixed(0)}
                </span>
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={isAdding || isOutOfStock}
              className={`w-full py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99] ${
                isItemAdded
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
                  <Repeat2 className="w-4 h-4" /> Rent for {quantity} Day{quantity > 1 ? 's' : ''} · ₹{(currentPrice * quantity).toFixed(0)}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Owner & Pickup Details Modal on Click of Rent */}
      <Modal
        isOpen={isOwnerModalOpen}
        onClose={() => setIsOwnerModalOpen(false)}
        title="Item Added & Owner Details"
        maxWidth="md"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 text-zinc-200 flex items-center gap-2.5">
            <Check className="w-5 h-5 text-zinc-100 flex-shrink-0" />
            <div>
              <p className="font-bold text-xs text-white">Added to your Rental Cart</p>
              <p className="text-[11px] text-zinc-400">
                You can contact the student owner below for pickup and handover details.
              </p>
            </div>
          </div>

          {/* Owner Profile Card */}
          <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-100 font-bold text-sm">
                {ownerName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                  {ownerName}
                  <span className="px-1.5 py-0.2 rounded-md bg-zinc-800 text-zinc-300 text-[9px] font-mono border border-zinc-700">
                    Verified
                  </span>
                </h4>
                <p className="text-zinc-400 text-xs flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-zinc-400" /> {ownerCollege}
                </p>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-zinc-900">
              <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-900/90">
                <span className="text-zinc-400 flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-zinc-400" /> Student ID:
                </span>
                <span className="font-mono font-semibold text-zinc-200">{ownerCollegeId}</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-900/90">
                <span className="text-zinc-400 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-zinc-400" /> Mobile:
                </span>
                <span className="font-mono font-bold text-white">{ownerPhone}</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-900/90">
                <span className="text-zinc-400 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-zinc-400" /> Email:
                </span>
                <span className="font-mono text-zinc-300">{ownerEmail}</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-900/90">
                <span className="text-zinc-400 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-zinc-400" /> Campus Location:
                </span>
                <span className="font-semibold text-zinc-200">{pickupLocation}</span>
              </div>
            </div>
          </div>

          {/* Quick Contact Action Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <a
              href={`tel:${ownerPhone}`}
              className="py-2.5 px-3 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <Phone className="w-4 h-4" /> Call Owner
            </a>
            <a
              href={`https://wa.me/${cleanPhone ? (cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone) : '919876543210'}`}
              target="_blank"
              rel="noreferrer"
              className="py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 font-bold text-xs flex items-center justify-center gap-2 transition-all"
            >
              <MessageCircle className="w-4 h-4" /> WhatsApp
            </a>
          </div>

          <div className="flex gap-2 pt-2 border-t border-zinc-800">
            <button
              onClick={() => setIsOwnerModalOpen(false)}
              className="flex-1 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-semibold text-xs transition-colors"
            >
              Continue Browsing
            </button>
            <button
              onClick={() => {
                setIsOwnerModalOpen(false);
                openDrawer();
              }}
              className="flex-1 py-2.5 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors"
            >
              <ShoppingCart className="w-3.5 h-3.5" /> View Cart & Checkout
            </button>
          </div>
        </div>
      </Modal>

      {/* Customer Reviews Section */}
      <div className="pt-10 border-t border-zinc-900">
        <ReviewSection productId={product._id} onReviewAdded={fetchProduct} />
      </div>
    </div>
  );
};
