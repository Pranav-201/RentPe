import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  ShoppingBag
} from 'lucide-react';
import { Order } from '../types';
import { orderService } from '../services/orderService';
import { useToast } from '../context/ToastContext';
import { Badge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';

export const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const { success, error } = useToast();

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await orderService.getOrders({
        status: statusFilter || undefined,
      });
      setOrders(res.orders || []);
    } catch (err: any) {
      error(err.message || 'Failed to load order history');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to cancel this order? Reserved stock will be returned.')) {
      return;
    }

    try {
      setCancellingId(orderId);
      await orderService.cancelOrder(orderId);
      success('Order cancelled successfully');
      await fetchOrders();
    } catch (err: any) {
      error(err.message || 'Failed to cancel order');
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'delivered':
        return <Badge variant="success">Returned</Badge>;
      case 'shipped':
        return <Badge variant="indigo">Out for Delivery</Badge>;
      case 'confirmed':
        return <Badge variant="primary">Confirmed</Badge>;
      case 'pending':
        return <Badge variant="warning">Pending Approval</Badge>;
      case 'cancelled':
        return <Badge variant="danger">Cancelled</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <div className="page-container space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Package className="w-6 h-6 text-violet-400" /> My Rentals
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track the status of your active and past rental requests
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {['', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-all ${
                statusFilter === st
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-600/20'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {st || 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <LoadingSkeleton count={3} type="row" />
      ) : orders.length === 0 ? (
        <EmptyState
          icon={<Package className="w-12 h-12 text-slate-500" />}
          title="No rentals found"
          description="You haven't placed any rental requests matching the selected filter yet."
          action={
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-md shadow-violet-600/20 transition-colors"
            >
              <ShoppingBag className="w-4 h-4" /> Browse Listings
            </Link>
          }
        />
      ) : (
        <div className="space-y-5">
          {orders.map((order) => {
            const canCancel = order.status === 'pending' || order.status === 'confirmed';
            const isCancelling = cancellingId === order._id;

            return (
              <div
                key={order._id}
                className="p-5 sm:p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4 hover:border-slate-700/80 transition-all"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-mono text-xs font-bold text-indigo-400">
                      #{order._id.slice(-8).toUpperCase()}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(order.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {getStatusBadge(order.status)}
                    <span className="text-xs font-bold text-white font-mono">
                      ₹{(order.finalPrice || order.totalPrice).toFixed(0)}
                    </span>
                  </div>
                </div>

                {/* Items in this Order */}
                <div className="space-y-2">
                  {order.items?.map((item, idx) => {
                    const product = item.product;
                    const img =
                      product?.images?.[0]?.url ||
                      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=150&q=80';

                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={img}
                            alt=""
                            className="w-10 h-10 rounded-lg object-cover bg-slate-800 flex-shrink-0"
                          />
                          <div>
                            <span className="font-semibold text-slate-200 block">
                              {product?.name || 'Rental item'}
                            </span>
                            <span className="text-slate-500 text-[11px]">
                              {item.quantity} day{item.quantity > 1 ? 's' : ''} × ₹{item.price?.toFixed(0)}
                            </span>
                          </div>
                        </div>

                        <span className="font-mono font-bold text-slate-200">
                          ₹{(item.finalPrice || item.price * item.quantity).toFixed(0)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Shipping & Actions Footer */}
                <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-400">
                  <div>
                    <span className="font-medium text-slate-300">Deliver to: </span>
                    <span>
                      {order.shippingAddress?.street}, {order.shippingAddress?.city},{' '}
                      {order.shippingAddress?.country}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                    {canCancel && (
                      <button
                        onClick={() => handleCancelOrder(order._id)}
                        disabled={isCancelling}
                        className="px-3.5 py-1.5 rounded-xl border border-rose-900/60 bg-rose-950/30 text-rose-300 hover:bg-rose-900/50 text-xs font-semibold transition-colors disabled:opacity-50"
                      >
                        {isCancelling ? 'Cancelling...' : 'Cancel Order'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
