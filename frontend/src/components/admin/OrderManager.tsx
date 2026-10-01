import React, { useState, useEffect, useCallback } from 'react';
import {
  RefreshCw,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Package,
  User as UserIcon,
  Loader2
} from 'lucide-react';
import { Order } from '../../types';
import { orderService } from '../../services/orderService';
import { useToast } from '../../context/ToastContext';
import { Badge } from '../common/Badge';
import { OwnerChatModal } from '../chat/OwnerChatModal';

export const OrderManager: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [chatOrder, setChatOrder] = useState<Order | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const { success, error } = useToast();

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await orderService.getOrders({
        limit: 100,
        status: statusFilter || undefined,
        type: 'owner',
      });
      setOrders(res.orders || []);
    } catch (err: any) {
      error(err.message || 'Failed to load rental requests');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // Quick Accept Action
  const handleQuickAccept = async (order: Order) => {
    try {
      setActionLoadingId(order._id);
      const res = await orderService.updateStatus(order._id, { status: 'accepted' });
      success(`Request #${(order.orderNumber || order._id).slice(-6).toUpperCase()} accepted!`);
      setOrders((prev) =>
        prev.map((o) => (o._id === order._id ? res.order : o))
      );
    } catch (err: any) {
      error(err.message || 'Failed to accept rental request');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Quick Decline Action
  const handleQuickDecline = async (order: Order) => {
    try {
      setActionLoadingId(order._id);
      const res = await orderService.updateStatus(order._id, { status: 'declined' });
      success(`Request #${(order.orderNumber || order._id).slice(-6).toUpperCase()} declined`);
      setOrders((prev) =>
        prev.map((o) => (o._id === order._id ? res.order : o))
      );
    } catch (err: any) {
      error(err.message || 'Failed to decline rental request');
    } finally {
      setActionLoadingId(null);
    }
  };

  const openChat = (order: Order) => {
    setChatOrder(order);
    setIsChatOpen(true);
  };

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'accepted':
        return <Badge variant="success">Accepted</Badge>;
      case 'declined':
        return <Badge variant="danger">Declined</Badge>;
      case 'delivered':
        return <Badge variant="success">Delivered</Badge>;
      case 'shipped':
        return <Badge variant="indigo">Shipped</Badge>;
      case 'confirmed':
        return <Badge variant="primary">Confirmed</Badge>;
      case 'pending':
        return <Badge variant="warning">Pending Request</Badge>;
      case 'cancelled':
        return <Badge variant="neutral">Cancelled</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters & Refresh */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {['', 'pending', 'accepted', 'declined', 'confirmed', 'delivered', 'cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-all ${
                statusFilter === st
                  ? 'bg-zinc-100 text-zinc-950 shadow-sm'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              {st === '' ? 'All Requests' : st === 'pending' ? 'Pending Approval' : st}
            </button>
          ))}
        </div>

        <button
          onClick={loadOrders}
          className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white transition-colors"
          title="Refresh List"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-900/60">
        <table className="w-full text-left text-xs text-zinc-300">
          <thead className="bg-zinc-950 text-zinc-400 uppercase tracking-wider text-[10px] border-b border-zinc-800 font-mono">
            <tr>
              <th className="p-3.5">Order ID</th>
              <th className="p-3.5">Date</th>
              <th className="p-3.5">Item</th>
              <th className="p-3.5">Total</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5">Payment</th>
              <th className="p-3.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {loading ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-zinc-500">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
                    <span>Loading rental requests...</span>
                  </div>
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-zinc-500">
                  <Package className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  No rental requests or orders found.
                </td>
              </tr>
            ) : (
              orders.map((o) => {
                const item = o.items?.[0];
                const product = item?.product;
                const renter = typeof o.user === 'object' ? o.user : null;
                const isActionBusy = actionLoadingId === o._id;

                return (
                  <tr key={o._id} className="hover:bg-zinc-800/40 transition-colors">
                    {/* 1. Order ID */}
                    <td className="p-3.5 font-mono font-semibold text-zinc-200">
                      {o.orderNumber || `#${o._id.slice(-6).toUpperCase()}`}
                    </td>

                    {/* 2. Date */}
                    <td className="p-3.5 text-zinc-400 whitespace-nowrap">
                      {new Date(o.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>

                    {/* 3. Item */}
                    <td className="p-3.5">
                      <div className="flex items-center gap-2.5 min-w-[200px]">
                        {product?.images?.[0]?.url ? (
                          <img
                            src={product.images[0].url}
                            alt=""
                            className="w-9 h-9 rounded-lg object-cover bg-zinc-950 border border-zinc-800 flex-shrink-0"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center flex-shrink-0">
                            <Package className="w-4 h-4 text-zinc-500" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-semibold text-zinc-100 truncate max-w-[180px]">
                            {product?.name || 'Rental Item'}
                          </p>
                          <p className="text-[11px] text-zinc-400 truncate flex items-center gap-1 mt-0.5">
                            <UserIcon className="w-2.5 h-2.5 text-zinc-400" />
                            {renter?.name || 'Student Customer'}
                            {renter?.collegeName && (
                              <span className="text-zinc-500 font-mono text-[10px]">
                                • {renter.collegeName}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* 4. Total */}
                    <td className="p-3.5 font-mono font-bold text-white whitespace-nowrap">
                      ₹{(o.finalPrice || o.totalPrice || 0).toFixed(0)}
                      {item?.quantity && (
                        <span className="text-[10px] text-zinc-400 block font-normal">
                          ({item.quantity}d rental)
                        </span>
                      )}
                    </td>

                    {/* 5. Status */}
                    <td className="p-3.5 whitespace-nowrap">
                      {getStatusBadge(o.status)}
                    </td>

                    {/* 6. Payment */}
                    <td className="p-3.5 whitespace-nowrap">
                      <span className="capitalize text-[11px] text-zinc-300 font-mono block">
                        {o.paymentStatus === 'completed' ? 'Paid' : 'On-Pickup'}
                      </span>
                      <span className="text-[10px] text-zinc-400 font-mono">
                        {o.paymentMethod || 'Cash/UPI'}
                      </span>
                    </td>

                    {/* 7. Action */}
                    <td className="p-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* If Pending: Show Accept & Decline Options */}
                        {o.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleQuickAccept(o)}
                              disabled={isActionBusy}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1 active:scale-95 disabled:opacity-50"
                              title="Accept request"
                            >
                              {isActionBusy ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              )}
                              Accept
                            </button>

                            <button
                              onClick={() => handleQuickDecline(o)}
                              disabled={isActionBusy}
                              className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-rose-950/60 text-zinc-300 hover:text-rose-400 border border-zinc-700 hover:border-rose-800/60 font-semibold text-xs transition-all flex items-center gap-1 disabled:opacity-50"
                              title="Decline request"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              Decline
                            </button>
                          </>
                        )}

                        {/* If Accepted: Show Chat Button so Owner & Customer can Chat */}
                        {(o.status === 'accepted' || o.status === 'confirmed') && (
                          <button
                            onClick={() => openChat(o)}
                            className="px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs shadow-md shadow-violet-600/20 flex items-center gap-1.5 transition-all active:scale-95"
                            title="Open chat to coordinate pickup/return"
                          >
                            <MessageSquare className="w-3.5 h-3.5" /> Chat
                          </button>
                        )}

                        {/* If Declined / Cancelled */}
                        {(o.status === 'declined' || o.status === 'cancelled') && (
                          <span className="text-[11px] text-zinc-400 font-mono pr-1">
                            {o.status === 'declined' ? 'Declined' : 'Cancelled'}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Owner Chat UI Modal (for real-time messaging after acceptance) */}
      <OwnerChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        order={chatOrder}
        onStatusChange={(updatedOrder) => {
          setOrders((prev) =>
            prev.map((o) => (o._id === updatedOrder._id ? updatedOrder : o))
          );
          if (chatOrder && chatOrder._id === updatedOrder._id) {
            setChatOrder(updatedOrder);
          }
        }}
      />
    </div>
  );
};
