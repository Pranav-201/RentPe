import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, PackageOpen, Zap } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { CheckoutModal } from './CheckoutModal';

export const CartDrawer: React.FC = () => {
  const { cart, isDrawerOpen, closeDrawer, updateQuantity, removeFromCart, clearCart } = useCart();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const navigate = useNavigate();

  if (!isDrawerOpen) return null;

  const items = cart?.items || [];

  return (
    <>
      <style>{`
        @keyframes drawer-slide-in {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        .cart-drawer-panel {
          animation: drawer-slide-in 0.32s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        @keyframes item-fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .cart-item-card {
          animation: item-fade-in 0.28s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .qty-btn:active { transform: scale(0.85); }
        .checkout-btn-glow {
          box-shadow: 0 0 18px rgba(139, 92, 246, 0.35);
        }
        .checkout-btn-glow:hover {
          box-shadow: 0 0 28px rgba(139, 92, 246, 0.55);
        }
      `}</style>

      <div className="fixed inset-0 z-50 flex justify-end">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-md"
          onClick={closeDrawer}
        />

        {/* Slide-out Panel */}
        <div className="cart-drawer-panel relative w-full max-w-[26rem] flex flex-col h-full z-10"
          style={{
            background: 'linear-gradient(160deg, #0f0f18 0%, #0a0a12 100%)',
            borderLeft: '1px solid rgba(139, 92, 246, 0.15)',
            boxShadow: '-20px 0 60px rgba(0,0,0,0.6), -1px 0 0 rgba(139,92,246,0.1)',
          }}
        >
          {/* Ambient glow top */}
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)', transform: 'translate(30%, -30%)' }}
          />

          {/* ── Header ───────────────────────────────────────────────── */}
          <div className="relative flex items-center justify-between px-5 py-4"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg,#fafafa,#a1a1aa)', boxShadow: '0 4px 14px rgba(255,255,255,0.16)', border: '1px solid rgba(255,255,255,0.55)' }}
              >
                <ShoppingBag className="w-4 h-4 text-zinc-950" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white leading-tight">Rental Cart</h2>
                <p className="text-[11px] text-slate-500 leading-tight">
                  {items.length === 0 ? 'Nothing here yet' : `${items.length} item${items.length > 1 ? 's' : ''} ready`}
                </p>
              </div>
              {items.length > 0 && (
                <span className="ml-1 px-2 py-0.5 rounded-full text-[11px] font-bold"
                  style={{ background: 'rgba(139,92,246,0.18)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.3)' }}
                >
                  {items.length}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              {items.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-[11px] font-medium text-slate-500 hover:text-rose-400 transition-colors px-2 py-1 rounded-lg hover:bg-rose-500/10"
                >
                  Clear all
                </button>
              )}
              <button
                onClick={closeDrawer}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-500 hover:text-white transition-all"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ── Items ────────────────────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
            style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(139,92,246,0.2) transparent' }}
          >
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12 space-y-4">
                <div className="w-20 h-20 rounded-3xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(79,70,229,0.05))', border: '1px solid rgba(139,92,246,0.15)' }}
                >
                  <PackageOpen className="w-9 h-9 text-slate-600" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-300 text-sm">Cart is empty</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-[220px]">
                    Find something to rent from fellow students on campus.
                  </p>
                </div>
                <button
                  onClick={() => { closeDrawer(); navigate('/'); }}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white transition-all hover:scale-105 active:scale-95"
                  style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', boxShadow: '0 4px 16px rgba(124,58,237,0.35)' }}
                >
                  Browse Listings
                </button>
              </div>
            ) : (
              items.map((item, i) => {
                const product = typeof item.product === 'object' && item.product !== null ? item.product : null;
                const productName = product?.name || 'Rental Item';
                const imageUrl =
                  product?.images?.[0]?.url ||
                  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80';
                const itemTotal = item.finalPrice || item.price * item.quantity;
                const originalTotal = item.price * item.quantity;
                const hasDiscount = item.discountPrice > 0;

                return (
                  <div
                    key={item._id}
                    className="cart-item-card rounded-2xl overflow-hidden"
                    style={{
                      animationDelay: `${i * 0.06}s`,
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
                      border: '1px solid rgba(255,255,255,0.07)',
                    }}
                  >
                    {/* Product row */}
                    <div className="flex gap-3.5 p-3.5">
                      {/* Image */}
                      <div className="relative flex-shrink-0">
                        <img
                          src={imageUrl}
                          alt={productName}
                          className="w-[72px] h-[72px] rounded-xl object-cover"
                          style={{ border: '1px solid rgba(255,255,255,0.08)' }}
                        />
                        {/* Rental badge */}
                        <span className="absolute -top-1.5 -right-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-md"
                          style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: '#fff', boxShadow: '0 2px 8px rgba(124,58,237,0.5)' }}
                        >
                          RENT
                        </span>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                        <div className="flex items-start justify-between gap-2">
                          <h4
                            onClick={() => { if (product?._id) { closeDrawer(); navigate(`/products/${product._id}`); } }}
                            className="text-xs font-bold text-slate-100 hover:text-violet-400 cursor-pointer truncate transition-colors leading-snug"
                            title={productName}
                          >
                            {productName}
                          </h4>
                          <button
                            onClick={() => removeFromCart(item._id)}
                            className="text-slate-600 hover:text-rose-400 transition-colors p-0.5 flex-shrink-0 hover:scale-110"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Rate */}
                        <p className="text-[11px] text-slate-500 font-mono">
                          ₹{item.price.toFixed(0)}<span className="text-slate-600">/day</span>
                        </p>

                        {/* Controls row */}
                        <div className="flex items-center justify-between">
                          {/* Days stepper */}
                          <div className="flex items-center gap-0.5 rounded-xl p-0.5"
                            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                          >
                            <button
                              onClick={() => updateQuantity(item._id, item.quantity - 1)}
                              className="qty-btn w-6 h-6 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                            >
                              <Minus className="w-2.5 h-2.5" />
                            </button>
                            <div className="px-2 min-w-[36px] text-center">
                              <span className="text-xs font-bold text-white font-mono">{item.quantity}</span>
                              <span className="text-[10px] text-slate-500 ml-0.5">d</span>
                            </div>
                            <button
                              onClick={() => updateQuantity(item._id, item.quantity + 1)}
                              className="qty-btn w-6 h-6 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                            >
                              <Plus className="w-2.5 h-2.5" />
                            </button>
                          </div>

                          {/* Price */}
                          <div className="text-right">
                            <span className="text-sm font-bold text-white font-mono">₹{itemTotal.toFixed(0)}</span>
                            {hasDiscount && (
                              <span className="block text-[10px] text-slate-600 line-through font-mono">
                                ₹{originalTotal.toFixed(0)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Checkout CTA */}
                    <button
                      onClick={() => { closeDrawer(); navigate(`/cart?item=${item._id}`); }}
                      className="checkout-btn-glow w-full py-2.5 flex items-center justify-center gap-2 text-xs font-bold text-white transition-all hover:gap-3 active:scale-[0.98]"
                      style={{
                        background: 'linear-gradient(90deg, rgba(109,40,217,0.85) 0%, rgba(79,70,229,0.85) 100%)',
                        borderTop: '1px solid rgba(139,92,246,0.25)',
                      }}
                    >
                      <Zap className="w-3 h-3 text-violet-300" />
                      Checkout This Item
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* ── Footer ───────────────────────────────────────────────── */}
          {items.length > 0 && (
            <div className="px-4 py-4 space-y-3"
              style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.25)' }}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Items in cart</span>
                <span className="font-bold text-slate-300 font-mono">{items.length}</span>
              </div>

              <p className="text-[11px] text-slate-600 leading-relaxed">
                Each rental is processed 1-by-1 directly with the campus lender.
              </p>

              <button
                onClick={() => { closeDrawer(); navigate('/cart'); }}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white transition-all hover:scale-[1.01] active:scale-[0.99]"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                View Full Rental Cart
              </button>
            </div>
          )}
        </div>
      </div>

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onSuccess={() => { setIsCheckoutOpen(false); closeDrawer(); navigate('/orders'); }}
      />
    </>
  );
};
