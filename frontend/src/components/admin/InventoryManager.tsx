import React, { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, XCircle, RefreshCw } from 'lucide-react';
import { Product, Inventory } from '../../types';
import { productService } from '../../services/productService';
import { inventoryService } from '../../services/inventoryService';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';

export const InventoryManager: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [inventories, setInventories] = useState<Record<string, Inventory>>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all');
  const [editingItem, setEditingItem] = useState<{ product: Product; inventory?: Inventory } | null>(
    null
  );
  const [quantity, setQuantity] = useState<number>(0);
  const [reorderLevel, setReorderLevel] = useState<number>(10);
  const [supplier, setSupplier] = useState<string>('');
  const [saving, setSaving] = useState(false);

  const { success, error } = useToast();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const prodRes = await productService.getMyListings();
      setProducts(prodRes.products || []);

      // Fetch inventory for each product
      const inventoryMap: Record<string, Inventory> = {};
      await Promise.all(
        (prodRes.products || []).map(async (p) => {
          try {
            const invRes = await inventoryService.getByProductId(p._id);
            if (invRes.inventory) {
              inventoryMap[p._id] = invRes.inventory;
            }
          } catch {
            // Inventory might not be initialized yet
          }
        })
      );
      setInventories(inventoryMap);
    } catch (err: any) {
      error(err.message || 'Failed to load inventory');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openEditModal = (product: Product) => {
    const inv = inventories[product._id];
    setEditingItem({ product, inventory: inv });
    setQuantity(inv ? inv.quantity : 50);
    setReorderLevel(inv ? inv.reorderLevel : 10);
    setSupplier(inv?.supplier || 'Primary Supplier');
    setIsModalOpen(true);
  };

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      setSaving(true);
      const res = await inventoryService.update(editingItem.product._id, {
        quantity: Number(quantity),
        reorderLevel: Number(reorderLevel),
        supplier,
      });
      success('Stock updated successfully');
      setInventories((prev) => ({ ...prev, [editingItem.product._id]: res.inventory }));
      setIsModalOpen(false);
    } catch (err: any) {
      error(err.message || 'Failed to update stock');
    } finally {
      setSaving(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    const inv = inventories[p._id];
    if (filter === 'low') return inv?.status === 'low_stock';
    if (filter === 'out') return !inv || inv?.status === 'out_of_stock' || inv?.available === 0;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Header & Filter Tabs */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filter === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            All Inventory ({products.length})
          </button>
          <button
            onClick={() => setFilter('low')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filter === 'low'
                ? 'bg-amber-600 text-white'
                : 'bg-slate-900 text-amber-400 hover:bg-slate-800'
            }`}
          >
            <AlertTriangle className="w-3 h-3" /> Low Stock
          </button>
          <button
            onClick={() => setFilter('out')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filter === 'out'
                ? 'bg-rose-600 text-white'
                : 'bg-slate-900 text-rose-400 hover:bg-slate-800'
            }`}
          >
            <XCircle className="w-3 h-3" /> Out of Stock
          </button>
        </div>

        <button
          onClick={loadData}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
            <tr>
              <th className="p-3.5">Product</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5">Total Quantity</th>
              <th className="p-3.5">Reserved</th>
              <th className="p-3.5">Available Stock</th>
              <th className="p-3.5">Reorder Level</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {loading ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-500">
                  Loading inventory balances...
                </td>
              </tr>
            ) : filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-500">
                  No inventory entries match current filter.
                </td>
              </tr>
            ) : (
              filteredProducts.map((p) => {
                const inv = inventories[p._id];
                const available = inv ? inv.available : 0;
                const quantity = inv ? inv.quantity : 0;
                const reserved = inv ? inv.reserved : 0;
                const reorder = inv ? inv.reorderLevel : 10;
                const status = inv?.status || 'out_of_stock';

                return (
                  <tr key={p._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5">
                      <span className="font-semibold text-slate-100 block">{p.name}</span>
                      <span className="text-[10px] text-slate-500 font-mono">SKU: {p.sku}</span>
                    </td>
                    <td className="p-3.5">
                      {status === 'in_stock' ? (
                        <Badge variant="success">In Stock</Badge>
                      ) : status === 'low_stock' ? (
                        <Badge variant="warning">Low Stock</Badge>
                      ) : (
                        <Badge variant="danger">Out of Stock</Badge>
                      )}
                    </td>
                    <td className="p-3.5 font-mono font-medium text-slate-200">{quantity}</td>
                    <td className="p-3.5 font-mono text-slate-400">{reserved}</td>
                    <td className="p-3.5 font-mono font-bold text-slate-100">
                      <span
                        className={
                          available === 0
                            ? 'text-rose-400'
                            : available <= reorder
                            ? 'text-amber-400'
                            : 'text-emerald-400'
                        }
                      >
                        {available}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-slate-400">{reorder}</td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => openEditModal(p)}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-600 hover:text-white transition-all text-xs font-semibold"
                      >
                        Adjust Stock
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Adjust Stock Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Adjust Stock: ${editingItem?.product.name}`}
        maxWidth="md"
      >
        <form onSubmit={handleUpdate} className="space-y-3.5 text-xs">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 space-y-1">
            <p>
              SKU: <span className="font-mono text-slate-200">{editingItem?.product.sku}</span>
            </p>
            <p>
              Currently Reserved in Orders:{' '}
              <span className="font-mono text-slate-200">
                {editingItem?.inventory?.reserved || 0}
              </span>
            </p>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">Total Physical Quantity *</label>
            <input
              type="number"
              min="0"
              required
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">Reorder Alert Threshold</label>
            <input
              type="number"
              min="0"
              value={reorderLevel}
              onChange={(e) => setReorderLevel(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">Supplier / Vendor</label>
            <input
              type="text"
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
              placeholder="e.g. Primary Tech Distributor"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold disabled:opacity-50"
            >
              {saving ? 'Updating...' : 'Save Stock'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
