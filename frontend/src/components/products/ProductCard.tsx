import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Repeat2, Check, Tag } from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, cart, openDrawer } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const isInCart = cart?.items?.some((item) => {
    const itemProdId =
      typeof item.product === 'object' && item.product !== null
        ? item.product._id
        : item.product;
    return itemProdId === product._id;
  }) || false;

  const isItemAdded = added || isInCart;

  const categoryName = typeof product.category === 'object' && product.category !== null
    ? product.category.name
    : 'General';

  const defaultImage =
    product.images?.[0]?.url ||
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80';

  const hasDiscount = !!product.discountPrice && product.discountPrice < product.price;
  const currentPrice = hasDiscount ? product.discountPrice! : product.price;
  const status = product.status || (product.isAvailable === false ? 'Unavailable' : 'Available');
  const isRentable = status === 'Available';

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isItemAdded) {
      openDrawer();
      return;
    }

    try {
      setIsAdding(true);
      await addToCart(product._id, 1);
      setAdded(true);
    } catch {
      // Handled in CartContext toast
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="group relative flex flex-col bg-zinc-900/60 border border-zinc-800/90 rounded-2xl overflow-hidden hover:border-zinc-700 hover:shadow-xl hover:shadow-black/40 transition-all duration-300 silver-card-hover">
      {/* Image & Badges */}
      <Link to={`/products/${product._id}`} className="relative aspect-[4/3] overflow-hidden bg-zinc-950">
        <img
          src={defaultImage}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
          loading="lazy"
        />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 z-10">
          <span className="px-2 py-0.5 rounded-md bg-zinc-950/80 backdrop-blur-md border border-zinc-800 text-[10px] font-mono text-zinc-300">
            {categoryName}
          </span>
          <span className={`px-2 py-0.5 rounded-md backdrop-blur-md border text-[10px] font-semibold ${
            isRentable
              ? 'bg-emerald-950/80 border-emerald-800 text-emerald-300'
              : 'bg-rose-950/80 border-rose-800 text-rose-300'
          }`}>
            {status}
          </span>
          {hasDiscount && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-white text-zinc-950 shadow-sm">
              <Tag className="w-2.5 h-2.5" /> Save ₹{(product.price - product.discountPrice!).toFixed(0)}
            </span>
          )}
        </div>

        {/* Rating Badge */}
        {product.ratings?.count > 0 && (
          <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1 px-2 py-0.5 rounded-lg bg-zinc-950/90 backdrop-blur-md border border-zinc-800 text-zinc-200 text-xs font-semibold font-mono">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span>{product.ratings.average.toFixed(1)}</span>
            <span className="text-[10px] text-zinc-400">({product.ratings.count})</span>
          </div>
        )}
      </Link>

      {/* Product Content */}
      <div className="p-4 flex-1 flex flex-col justify-between gap-3">
        <div>
          <div className="flex items-center justify-between gap-2 text-[10px] text-zinc-400 font-mono mb-1">
            <span>SKU: {product.sku}</span>
          </div>
          <Link
            to={`/products/${product._id}`}
            className="font-semibold text-zinc-100 text-sm hover:text-white line-clamp-1 transition-colors"
          >
            {product.name}
          </Link>
          <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Pricing & Add to Cart button */}
        <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80 mt-auto">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1">
              <span className="text-base font-bold text-white font-mono">
                ₹{currentPrice.toFixed(0)}
              </span>
              <span className="text-[11px] text-zinc-400 font-normal">/day</span>
              {hasDiscount && (
                <span className="text-xs text-zinc-500 line-through font-mono ml-1">
                  ₹{product.price.toFixed(0)}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isAdding || !isRentable}
            className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-xs font-semibold transition-all duration-200 ${
              !isRentable
                ? 'bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed'
                : isItemAdded
                ? 'bg-zinc-800 text-white border border-zinc-600 shadow-sm hover:bg-zinc-700/80'
                : 'bg-zinc-100 hover:bg-white text-zinc-950 shadow-sm active:scale-95'
            }`}
            title={!isRentable ? `${status} - not currently rentable` : isItemAdded ? 'Item added to cart (Click to view)' : 'Rent this item'}
          >
            {!isRentable ? (
              <span>{status}</span>
            ) : isItemAdded ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Added</span>
              </>
            ) : (
              <>
                <Repeat2 className="w-3.5 h-3.5" />
                <span>Rent</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
