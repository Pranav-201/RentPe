import React, { useState } from 'react';
import { CreditCard, Truck, CheckCircle2, ShieldCheck, MapPin } from 'lucide-react';
import { Modal } from '../common/Modal';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { orderService } from '../../services/orderService';
import { useToast } from '../../context/ToastContext';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const { cart, fetchCart } = useCart();
  const { success, error } = useToast();

  const [shippingAddress, setShippingAddress] = useState({
    street: user?.address?.street || '45 Innovation Way, Suite 100',
    city: user?.address?.city || 'San Francisco',
    state: user?.address?.state || 'CA',
    zipCode: user?.address?.zipCode || '94107',
    country: user?.address?.country || 'USA',
  });

  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingAddress.street || !shippingAddress.city || !shippingAddress.state || !shippingAddress.zipCode || !shippingAddress.country) {
      error('Please complete all shipping address fields');
      return;
    }

    try {
      setLoading(true);
      const res = await orderService.create({
        shippingAddress,
        paymentMethod,
      });
      success(`Order #${res.order._id.slice(-6).toUpperCase()} placed successfully!`);
      await fetchCart(); // Refresh cart to empty state
      onSuccess();
    } catch (err: any) {
      error(err.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const finalPrice = cart?.finalPrice || (cart?.totalPrice || 0) - (cart?.discountPrice || 0);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Complete Order Checkout" maxWidth="lg">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Order Summary Snapshot */}
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400">Total payable amount</p>
            <p className="text-xl font-bold text-white font-mono">₹{finalPrice.toFixed(0)}</p>
          </div>
          <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold text-indigo-400">
            {cart?.items?.length || 0} items in order
          </span>
        </div>

        {/* Shipping Address Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-200 uppercase tracking-wider">
            <MapPin className="w-3.5 h-3.5 text-indigo-400" /> Shipping Destination
          </div>

          <div className="space-y-2.5">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Street Address</label>
              <input
                type="text"
                required
                value={shippingAddress.street}
                onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-indigo-500 transition-colors"
                placeholder="123 Tech Blvd"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-slate-400 mb-1">City</label>
                <input
                  type="text"
                  required
                  value={shippingAddress.city}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-indigo-500 transition-colors"
                  placeholder="San Francisco"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">State / Province</label>
                <input
                  type="text"
                  required
                  value={shippingAddress.state}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-indigo-500 transition-colors"
                  placeholder="CA"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Postal / Zip Code</label>
                <input
                  type="text"
                  required
                  value={shippingAddress.zipCode}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, zipCode: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-indigo-500 transition-colors"
                  placeholder="94107"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Country</label>
                <input
                  type="text"
                  required
                  value={shippingAddress.country}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-indigo-500 transition-colors"
                  placeholder="USA"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-200 uppercase tracking-wider">
            <CreditCard className="w-3.5 h-3.5 text-indigo-400" /> Payment Selection
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'credit_card', label: 'Credit Card', icon: CreditCard },
              { id: 'cod', label: 'Cash on Delivery', icon: Truck },
              { id: 'upi', label: 'UPI / Direct', icon: ShieldCheck },
            ].map((method) => {
              const Icon = method.icon;
              const isSelected = paymentMethod === method.id;
              return (
                <button
                  type="button"
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id)}
                  className={`p-3 rounded-xl border text-left flex flex-col items-center justify-center gap-1.5 transition-all ${
                    isSelected
                      ? 'bg-indigo-950/60 border-indigo-500 text-indigo-300'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-[11px] font-semibold text-center">{method.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-2 disabled:opacity-50 transition-all"
          >
            {loading ? (
              <span>Placing Order...</span>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" /> Place Order (₹{finalPrice.toFixed(0)})
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
