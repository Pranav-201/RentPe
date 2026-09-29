import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Eye } from 'lucide-react';
import { Order } from '../../types';
import { orderService } from '../../services/orderService';
import { useToast } from '../../context/ToastContext';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';

export const OrderManager: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [newPaymentStatus, setNewPaymentStatus] = useState('');
  const [updating, setUpdating] = useState(false);

  const { success, error } = useToast();

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await orderService.getOrders({
        limit: 100,
        status: statusFilter || undefined,
      });
      setOrders(res.orders || []);
    } catch (err: any) {
      error(err.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const openDetails = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setNewPaymentStatus(order.paymentStatus);
    setIsDetailOpen(true);
  };

  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    try {
      setUpdating(true);
      const res = await orderService.updateStatus(selectedOrder._id, {
        status: newStatus,
        paymentStatus: newPaymentStatus,
      });
      success('Order status updated');
      setSelectedOrder(res.order);
      setIsDetailOpen(false);
      await loadOrders();
    } catch (err: any) {
      error(err.message || 'Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'delivered':
        return <Badge variant="success">Delivered</Badge>;
      case 'shipped':
        return <Badge variant="indigo">Shipped</Badge>;
      case 'confirmed':
        return <Badge variant="primary">Confirmed</Badge>;
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'cancelled':
        return <Badge variant="danger">Cancelled</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters & Refresh */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {['', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-all ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              {st || 'All Orders'}
            </button>
          ))}
        </div>

        <button
          onClick={loadOrders}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
            <tr>
              <th className="p-3.5">Order ID</th>
              <th className="p-3.5">Date</th>
              <th className="p-3.5">Items</th>
              <th className="p-3.5">Total</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5">Payment</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {loading ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-500">
                  Loading orders...
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-500">
                  No orders found.
                </td>
              </tr>
            ) : (
              orders.map((o) => (
                <tr key={o._id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3.5 font-mono font-semibold text-slate-200">
                    #{o._id.slice(-6).toUpperCase()}
                  </td>
                  <td className="p-3.5 text-slate-400">
                    {new Date(o.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-3.5 text-slate-300">{o.items?.length || 0} items</td>
                  <td className="p-3.5 font-mono font-bold text-slate-100">
                    ${(o.finalPrice || o.totalPrice).toFixed(2)}
                  </td>
                  <td className="p-3.5">{getStatusBadge(o.status)}</td>
                  <td className="p-3.5">
                    <span className="capitalize text-[11px] text-slate-300 font-mono">
                      {o.paymentStatus}
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => openDetails(o)}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-600 hover:text-white transition-all text-xs font-semibold flex items-center gap-1.5 ml-auto"
                    >
                      <Eye className="w-3.5 h-3.5" /> Manage
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Order Detail & Status Update Modal */}
      {selectedOrder && (
        <Modal
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          title={`Order #${selectedOrder._id.slice(-6).toUpperCase()}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            {/* Status Update Form */}
            <form
              onSubmit={handleStatusUpdate}
              className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3"
            >
              <h4 className="font-semibold text-slate-200">Update Order State</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Fulfillment Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Payment Status</label>
                  <select
                    value={newPaymentStatus}
                    onChange={(e) => setNewPaymentStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="failed">Failed</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={updating}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold disabled:opacity-50"
                >
                  {updating ? 'Saving...' : 'Apply Status Change'}
                </button>
              </div>
            </form>

            {/* Items List */}
            <div>
              <h4 className="font-semibold text-slate-200 mb-2">Order Line Items</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {selectedOrder.items?.map((item) => {
                  const product = item.product;
                  return (
                    <div
                      key={item._id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-200">{product?.name || 'Product'}</span>
                        <span className="text-slate-400">× {item.quantity}</span>
                      </div>
                      <span className="font-mono font-bold text-slate-100">
                        ${(item.finalPrice || item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
              <h4 className="font-semibold text-slate-200 mb-1">Shipping Details</h4>
              <p>{selectedOrder.shippingAddress?.street}</p>
              <p>
                {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state}{' '}
                {selectedOrder.shippingAddress?.zipCode}, {selectedOrder.shippingAddress?.country}
              </p>
              <p className="mt-2 text-slate-400">
                Payment Method:{' '}
                <span className="text-slate-200 font-mono uppercase">
                  {selectedOrder.paymentMethod}
                </span>
              </p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
