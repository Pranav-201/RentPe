import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  ScrollText,
  MessageSquare
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { orderService } from '../services/orderService';
import { Order } from '../types';
import { EmptyState } from '../components/common/EmptyState';
import { OwnerChatModal, OwnerProfile } from '../components/chat/OwnerChatModal';
import { TERMS_ACCEPTED_KEY } from './TermsPage';

export const CartPage: React.FC = () => {
  const { cart, loading, updateQuantity, removeFromCart, clearCart } = useCart();
  const { error } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const items = cart?.items || [];
  const queryItemId = searchParams.get('item');
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Terms acceptance — stored in sessionStorage by TermsPage
  const [termsAccepted, setTermsAccepted] = useState(
    () => sessionStorage.getItem(TERMS_ACCEPTED_KEY) === 'true'
  );

  // Sync if user navigates back from terms page
  useEffect(() => {
    const sync = () => setTermsAccepted(sessionStorage.getItem(TERMS_ACCEPTED_KEY) === 'true');
    window.addEventListener('focus', sync);
    return () => window.removeEventListener('focus', sync);
  }, []);

  useEffect(() => {
    if (items.length > 0) {
      if (queryItemId && items.some((i) => i._id === queryItemId)) {
        setSelectedItemId(queryItemId);
      } else if (!selectedItemId || !items.some((i) => i._id === selectedItemId)) {
        setSelectedItemId(items[0]._id);
      }
    }
  }, [items, queryItemId, selectedItemId]);

  const handleSelect = (id: string) => {
    setSelectedItemId(id);
    setSearchParams({ item: id });
  };

  const selectedItem = items.find((i) => i._id === selectedItemId) || items[0];

  const selectedProduct =
    selectedItem && typeof selectedItem.product === 'object' && selectedItem.product !== null
      ? selectedItem.product
      : null;
  const selectedProductName = selectedProduct?.name || 'Rental Item';
  const selectedItemImage =
    selectedProduct?.images?.[0]?.url ||
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&q=80';

  const itemDailyRate = selectedItem ? selectedItem.price : 0;
  const itemDays = selectedItem ? selectedItem.quantity : 1;
  const itemBasePrice = itemDailyRate * itemDays;
  const itemDiscountPrice = selectedItem
    ? selectedItem.discountTotal || (selectedItem.discountPrice || 0) * itemDays
    : 0;
  const itemFinalPrice = Math.max(0, itemBasePrice - itemDiscountPrice);

  // Extract owner profile
  const ownerData: OwnerProfile | null =
    typeof selectedProduct?.owner === 'object' && selectedProduct?.owner !== null
      ? (selectedProduct.owner as OwnerProfile)
      : typeof selectedProduct?.createdBy === 'object' && selectedProduct?.createdBy !== null
      ? (selectedProduct.createdBy as OwnerProfile)
      : null;

  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { success } = useToast();

  const handleMessageOwner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !selectedProduct) {
      error('Please select an item to rent');
      return;
    }

    try {
      setSubmitting(true);
      const res = await orderService.create({
        cartItemId: selectedItem._id,
        days: itemDays,
        quantity: itemDays,
        message: `Hi ${ownerData?.name || 'Owner'}! I'd like to rent "${selectedProductName}" for ${itemDays} day${itemDays > 1 ? 's' : ''}. Total: ₹${itemFinalPrice.toFixed(0)}`,
      });
      setActiveOrder(res.order);
      success('Rental request sent to owner! Awaiting acceptance.');
      setIsChatOpen(true);
    } catch (err: any) {
      error(err.message || 'Failed to send rental request to owner');
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0 && !loading) {
    return (
      <EmptyState
        title="Your rental cart is empty"
        description="You haven't added any items yet. Browse available listings to find something to rent from fellow students."
        action={
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-md shadow-violet-600/20 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Browse Listings
          </Link>
        }
      />
    );
  }

  return (
    <div className="page-container flex flex-col lg:h-[calc(100vh-80px)] lg:max-h-[calc(100vh-80px)] space-y-4 pb-6 lg:pb-0 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-3.5 flex-shrink-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-violet-400" /> Rental Checkout (1-by-1)
          </h1>
          {/* Terms & Conditions link row */}
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            {termsAccepted ? (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" /> Terms & Conditions Accepted
              </span>
            ) : (
              <>
                <span className="text-[11px] text-rose-400 font-medium">⚠ Terms not accepted —</span>
                <button
                  onClick={() => navigate('/terms')}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-violet-400 hover:text-violet-300 underline underline-offset-2 transition-colors cursor-pointer"
                >
                  <ScrollText className="w-3 h-3" /> Read & Accept Terms
                </button>
              </>
            )}
          </div>
        </div>

        {items.length > 0 && (
          <button
            onClick={clearCart}
            className="text-xs text-slate-400 hover:text-rose-400 transition-colors self-start sm:self-auto cursor-pointer"
          >
            Clear entire cart
          </button>
        )}
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0 overflow-hidden">
        {/* Left Column: Cart Items List */}
        <div className="lg:col-span-5 flex flex-col min-h-0 h-full overflow-hidden space-y-3">
          <div className="flex items-center justify-between px-1 flex-shrink-0">
            <h2 className="text-sm font-bold text-slate-200">
              Items in Cart ({items.length})
            </h2>
            <span className="text-[11px] text-zinc-500">Click an item to checkout</span>
          </div>

          <div className="flex-1 overflow-y-auto pr-1.5 space-y-3">
            {items.map((item) => {
              const product =
                typeof item.product === 'object' && item.product !== null ? item.product : null;
              const productName = product?.name || 'Rental Item';
              const img =
                product?.images?.[0]?.url ||
                'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&q=80';

              const isSelected = selectedItem?._id === item._id;
              const itemTotal = item.finalPrice || item.price * item.quantity;

              return (
                <div
                  key={item._id}
                  onClick={() => handleSelect(item._id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
                    isSelected
                      ? 'bg-violet-950/20 border-violet-500/80 ring-1 ring-violet-500/40 shadow-lg shadow-violet-950/30'
                      : 'bg-slate-900/70 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <img
                      src={img}
                      alt={productName}
                      className="w-16 h-16 rounded-xl object-cover bg-slate-800 flex-shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3
                          className={`text-xs font-bold truncate ${
                            isSelected ? 'text-violet-200' : 'text-slate-200'
                          }`}
                          title={productName}
                        >
                          {productName}
                        </h3>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFromCart(item._id);
                          }}
                          className="text-slate-500 hover:text-rose-400 p-1 transition-colors cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                        ₹{item.price.toFixed(0)}/day
                      </p>

                      <div className="flex items-center justify-between mt-3">
                        {/* Days modifier */}
                        <div
                          className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => updateQuantity(item._id, item.quantity - 1)}
                            className="p-1 rounded text-slate-400 hover:text-white cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-semibold text-white px-2 min-w-[20px] text-center font-mono">
                            {item.quantity}d
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item._id, item.quantity + 1)}
                            className="p-1 rounded text-slate-400 hover:text-white cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-bold text-white font-mono block">
                            ₹{itemTotal.toFixed(0)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Selected / Checkout Badge */}
                  <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between">
                    {isSelected ? (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-violet-400">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Selected for Rental Checkout
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium text-slate-400 hover:text-white flex items-center gap-1">
                        Checkout This Item <ArrowRight className="w-3 h-3" />
                      </span>
                    )}

                    <span className="text-[10px] text-zinc-500 uppercase font-mono">1 Item</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Full Rental Checkout Details for Selected Item */}
        {selectedItem && (
          <div className="lg:col-span-7 flex flex-col min-h-0 h-full overflow-hidden">
            <form
              onSubmit={handleMessageOwner}
              className="h-full flex flex-col rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl overflow-hidden"
            >
              {/* Scrollable Content: Item Details, Price Breakdown, Pickup & Contact, Settlement Info */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 pr-3 sm:pr-5">
                {/* Step 1: Selected Rental Details Header */}
                <div className="flex items-start gap-4 pb-4 border-b border-slate-800">
                  <img
                    src={selectedItemImage}
                    alt={selectedProductName}
                    className="w-20 h-20 rounded-xl object-cover bg-slate-800 border border-slate-700/60 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded-md bg-violet-500/10 text-violet-400 text-[10px] font-bold border border-violet-500/20 uppercase tracking-wide">
                        Selected Rental
                      </span>
                      <span className="text-[11px] text-slate-400">Verified Campus Listing</span>
                    </div>
                    <h2 className="text-base font-bold text-white truncate" title={selectedProductName}>
                      {selectedProductName}
                    </h2>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-300">
                      <span>
                        Duration: <strong className="text-white font-mono">{itemDays} Day(s)</strong>
                      </span>
                      <span>•</span>
                      <span>
                        Daily Rate: <strong className="text-violet-400 font-mono">₹{itemDailyRate.toFixed(0)}</strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Step 2: Price Calculation Breakdown */}
                <div className="space-y-2 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 text-xs">
                  <h3 className="font-bold text-slate-200 mb-2 flex items-center gap-1.5 text-xs uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-violet-400" /> Price Breakdown
                  </h3>
                  <div className="flex justify-between text-slate-400">
                    <span>
                      Rental Base Price ({itemDays} day{itemDays > 1 ? 's' : ''} × ₹{itemDailyRate.toFixed(0)})
                    </span>
                    <span className="font-mono text-slate-200">₹{itemBasePrice.toFixed(0)}</span>
                  </div>
                  {itemDiscountPrice > 0 && (
                    <div className="flex justify-between text-emerald-400 font-medium">
                      <span>Rental Discount Applied</span>
                      <span className="font-mono">-₹{itemDiscountPrice.toFixed(0)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-400">
                    <span>Platform & Verification Fee</span>
                    <span className="text-emerald-400 font-semibold uppercase text-[11px]">Free</span>
                  </div>
                  <div className="pt-2.5 border-t border-slate-800 flex justify-between text-sm font-bold text-white">
                    <span>Total Amount Payable</span>
                    <span className="text-violet-400 font-mono text-base">₹{itemFinalPrice.toFixed(0)}</span>
                  </div>
                </div>
              </div>

              {/* Step 5: Message Owner - Bottom Action Bar */}
              <div className="p-3.5 sm:p-4 border-t border-slate-800 bg-slate-950/90 flex-shrink-0 flex items-center justify-between gap-4">
                <div className="text-xs">
                  <span className="text-slate-400 block text-[11px]">Rental Estimate</span>
                  <span className="text-base font-bold text-violet-400 font-mono">
                    ₹{itemFinalPrice.toFixed(0)}
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs shadow-md shadow-violet-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
                >
                  <MessageSquare className="w-4 h-4" /> {submitting ? 'Sending Request...' : 'Message Owner'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Owner Chat UI Modal */}
      <OwnerChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        product={selectedProduct}
        owner={ownerData}
        order={activeOrder}
        rentalDays={itemDays}
        totalPrice={itemFinalPrice}
      />
    </div>
  );
};

