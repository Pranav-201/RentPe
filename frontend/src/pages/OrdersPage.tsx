import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  ShoppingBag,
  MessageSquare,
  CheckCircle2
} from 'lucide-react';
import { Order } from '../types';
import { orderService } from '../services/orderService';
import { useToast } from '../context/ToastContext';
import { Badge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { OwnerChatModal } from '../components/chat/OwnerChatModal';

export const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [selectedChatOrder, setSelectedChatOrder] = useState<Order | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

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
    if (!confirm('Are you sure you want to cancel this rental request?')) {
      return;
    }

    try {
      setCancellingId(orderId);
      await orderService.cancelOrder(orderId);
      success('Rental request cancelled');
      await fetchOrders();
    } catch (err: any) {
      error(err.message || 'Failed to cancel request');
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'accepted':
        return <Badge variant="success">Accepted</Badge>;
      case 'declined':
        return <Badge variant="danger">Declined</Badge>;
      case 'delivered':
        return <Badge variant="success">Returned</Badge>;
      case 'shipped':
        return <Badge variant="indigo">Out for Delivery</Badge>;
      case 'confirmed':
        return <Badge variant="primary">Confirmed</Badge>;
      case 'pending':
        return <Badge variant="warning">Pending Owner Approval</Badge>;
      case 'cancelled':
        return <Badge variant="neutral">Cancelled</Badge>;
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
            Track the status of your rental requests and chat with item owners
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {['', 'pending', 'accepted', 'declined', 'confirmed', 'delivered', 'cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-all ${
                statusFilter === st
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-600/20'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {st === '' ? 'All' : st === 'pending' ? 'Pending' : st}
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
                className="p-5 sm:p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-4 hover:border-zinc-700/80 transition-all"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800/80">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-mono text-xs font-bold text-violet-400">
                      {order.orderNumber || `#${order._id.slice(-6).toUpperCase()}`}
                    </span>
                    <span className="text-xs text-zinc-400">
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
                        className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/70 border border-zinc-800/80 text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={img}
                            alt=""
                            className="w-10 h-10 rounded-lg object-cover bg-zinc-900 border border-zinc-800 flex-shrink-0"
                          />
                          <div>
                            <span className="font-semibold text-zinc-200 block">
                              {product?.name || 'Rental item'}
                            </span>
                            <span className="text-zinc-400 text-[11px]">
                              {item.quantity} day{item.quantity > 1 ? 's' : ''} × ₹{item.price?.toFixed(0)}
                            </span>
                          </div>
                        </div>

                        <span className="font-mono font-bold text-zinc-200">
                          ₹{(item.finalPrice || item.price * item.quantity).toFixed(0)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Status description & Actions Footer */}
                <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-zinc-400">
                  <div>
                    {order.status === 'accepted' ? (
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Request Accepted! You can chat with the owner.
                      </span>
                    ) : order.status === 'declined' ? (
                      <span className="text-rose-400 font-semibold">
                        This request was declined by the owner.
                      </span>
                    ) : (
                      <span className="text-amber-400 font-medium">
                        Waiting for owner to review and accept your request.
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                    {/* Chat with Owner button */}
                    <button
                      onClick={() => {
                        setSelectedChatOrder(order);
                        setIsChatOpen(true);
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-violet-600/20 transition-all active:scale-95"
                    >
                      <MessageSquare className="w-3.5 h-3.5" /> Chat with Owner
                    </button>

                    {canCancel && (
                      <button
                        onClick={() => handleCancelOrder(order._id)}
                        disabled={isCancelling}
                        className="px-3.5 py-1.5 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-rose-400 hover:border-rose-900/50 text-xs font-semibold transition-colors disabled:opacity-50"
                      >
                        {isCancelling ? 'Cancelling...' : 'Cancel Request'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Chat Modal */}
      <OwnerChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        order={selectedChatOrder}
        onStatusChange={(updatedOrder) => {
          setOrders((prev) =>
            prev.map((o) => (o._id === updatedOrder._id ? updatedOrder : o))
          );
          if (selectedChatOrder && selectedChatOrder._id === updatedOrder._id) {
            setSelectedChatOrder(updatedOrder);
          }
        }}
      />
    </div>
  );
};
