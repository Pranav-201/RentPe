import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Edit2, Trash2, Search, RefreshCw, PackageOpen, GraduationCap, Building2, Camera, Upload, Image as ImageIcon } from 'lucide-react';
import { Product, Category } from '../../types';
import { productService, ProductPayload, ProductStatus } from '../../services/productService';
import { categoryService } from '../../services/categoryService';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../common/Modal';

export const ProductManager: React.FC = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductPayload>({
    name: '',
    description: '',
    price: 50,
    discountPrice: 0,
    category: '',
    sku: '',
    location: '',
    tags: [],
    images: [{ url: '', alt: '' }],
  });
  const [customCollege, setCustomCollege] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [saving, setSaving] = useState(false);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);

  const { success, error } = useToast();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [myListingsRes, catRes] = await Promise.all([
        productService.getMyListings(),
        categoryService.getAll({ limit: 100 }),
      ]);
      setProducts(myListingsRes.products || []);
      setCategories(catRes.categories || []);
      if (!formData.category && catRes.categories?.length > 0) {
        setFormData((prev) => ({ ...prev, category: catRes.categories[0]._id }));
      }
    } catch (err: any) {
      error(err.message || 'Failed to load your listings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openCreateModal = () => {
    setEditingProduct(null);
    const defaultCampus = user?.collegeName || 'IIT Delhi';
    setFormData({
      name: '',
      description: '',
      price: 50,
      discountPrice: 0,
      category: categories[0]?._id || '',
      sku: `RENT-${Date.now().toString(36).toUpperCase()}`,
      location: defaultCampus,
      tags: ['student', 'campus'],
      images: [],
    });
    setCustomCollege(false);
    setTagInput('student, campus');
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    const catId = typeof product.category === 'object' ? product.category._id : product.category;
    const userCampus = user?.collegeName || 'IIT Delhi';
    const prodCampus = product.location || userCampus;
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      discountPrice: product.discountPrice || 0,
      category: catId,
      sku: product.sku,
      location: prodCampus,
      tags: product.tags || [],
      images: product.images?.length ? product.images : [{ url: '', alt: '' }],
    });
    setCustomCollege(prodCampus.toLowerCase() !== userCampus.toLowerCase());
    setTagInput((product.tags || []).join(', '));
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.description || formData.price <= 0 || !formData.category || !formData.sku) {
      error('Please complete all required fields');
      return;
    }

    const tagsArray = tagInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const payload: ProductPayload = {
      ...formData,
      tags: tagsArray,
      price: Number(formData.price),
      discountPrice: formData.discountPrice ? Number(formData.discountPrice) : undefined,
    };

    try {
      setSaving(true);
      if (editingProduct) {
        await productService.update(editingProduct._id, payload);
        success('Rental listing updated successfully');
      } else {
        await productService.create(payload);
        success('Item listed successfully! Other students can now browse and rent it.');
      }
      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      error(err.message || 'Operation failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this rental listing?')) return;
    try {
      await productService.delete(id);
      success('Rental listing removed');
      await loadData();
    } catch (err: any) {
      error(err.message || 'Failed to remove listing');
    }
  };

  const handleStatusChange = async (product: Product, status: ProductStatus) => {
    try {
      const res = await productService.updateStatus(product._id, status);
      setProducts((prev) => prev.map((item) => item._id === product._id ? res.product : item));
      success('Listing status updated');
    } catch (err: any) {
      error(err.message || 'Failed to update listing status');
    }
  };

  const handlePhotoSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const url = String(reader.result || '');
      setFormData((prev) => ({
        ...prev,
        images: [{ url, alt: prev.name || 'Rental Item' }],
      }));
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const filteredProducts = products.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search my listed items..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs focus:outline-none focus:border-zinc-500 placeholder:text-zinc-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={loadData}
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors"
            title="Refresh Listings"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={openCreateModal}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" /> + List New Item
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-900/60 silver-card">
        <table className="w-full text-left text-xs text-zinc-300">
          <thead className="bg-zinc-950/90 text-zinc-400 uppercase tracking-wider text-[10px] font-mono border-b border-zinc-800">
            <tr>
              <th className="p-3.5">My Rental Item</th>
              <th className="p-3.5">SKU</th>
              <th className="p-3.5">Category</th>
              <th className="p-3.5">Daily Rate</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {loading ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-zinc-500">
                  Loading your rental listings...
                </td>
              </tr>
            ) : filteredProducts.length === 0 ? (
              <tr>
                  <td colSpan={6} className="p-10 text-center">
                  <div className="max-w-sm mx-auto space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 mx-auto flex items-center justify-center text-zinc-400">
                      <PackageOpen className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-zinc-200">
                        {search ? 'No matching listings found' : "You haven't listed any items for rent yet"}
                      </p>
                      <p className="text-xs text-zinc-400 mt-1">
                        {search
                          ? 'Try adjusting your search keywords.'
                          : 'List textbooks, calculators, lab coats, or gadgets to earn rental income from campus peers!'}
                      </p>
                    </div>
                    {!search && (
                      <button
                        onClick={openCreateModal}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold shadow-sm transition-all"
                      >
                        <Plus className="w-4 h-4" /> List Your First Item
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              filteredProducts.map((p) => {
                const catName = typeof p.category === 'object' && p.category !== null ? p.category.name : 'General';
                const img = p.images?.[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&q=80';

                return (
                  <tr key={p._id} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="p-3.5 flex items-center gap-3">
                      <img src={img} alt="" className="w-10 h-10 rounded-lg object-cover bg-zinc-950 border border-zinc-800 flex-shrink-0" />
                      <div>
                        <span className="font-semibold text-zinc-100 block">{p.name}</span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="inline-flex items-center gap-1 text-[10px] text-zinc-300 font-mono bg-zinc-950 border border-zinc-800 px-1.5 py-0.5 rounded">
                            <GraduationCap className="w-2.5 h-2.5 text-zinc-400" />
                            {p.location && p.location !== 'On Campus' ? p.location : (typeof p.owner === 'object' && p.owner?.collegeName) || user?.collegeName || 'Campus'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5 font-mono text-zinc-400">{p.sku}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-md bg-zinc-950 text-zinc-300 border border-zinc-800 text-[10px] font-mono">
                        {catName}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono font-bold text-zinc-100">
                      ₹{p.price.toFixed(0)}<span className="text-xs text-zinc-400 font-normal">/day</span>
                      {p.discountPrice ? (
                        <span className="text-[10px] text-zinc-400 block font-normal">
                          Sale: ₹{p.discountPrice.toFixed(0)}/day
                        </span>
                      ) : null}
                    </td>
                    <td className="p-3.5">
                      <select
                        value={p.status || (p.isAvailable === false ? 'Unavailable' : 'Available')}
                        onChange={(e) => handleStatusChange(p, e.target.value as ProductStatus)}
                        className="rounded-lg bg-zinc-950 border border-zinc-800 px-2 py-1.5 text-[11px] text-zinc-200 focus:outline-none focus:border-zinc-500"
                        aria-label={`Status for ${p.name}`}
                      >
                        <option value="Available">Available</option>
                        <option value="Already Rented">Already Rented</option>
                        <option value="Unavailable">Unavailable</option>
                      </select>
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
                          title="Edit Listing"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(p._id)}
                          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-rose-950/50 text-zinc-300 hover:text-rose-400 transition-colors"
                          title="Remove Listing"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'Edit Rental Item' : 'List New Rental Item'}
        maxWidth="lg"
        tone="graphite"
      >
        <form onSubmit={handleSubmit} className="space-y-5 text-xs font-sans">
          <div>
            <label className="block text-zinc-300 mb-1.5 font-semibold text-[11px]">Item Name <span className="text-zinc-500">*</span></label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950/90 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/30 transition-all"
              placeholder="e.g. Casio fx-991EX Scientific Calculator / Lab Coat / Drafter"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-zinc-300 mb-1.5 font-semibold text-[11px]">Listing SKU Code <span className="text-zinc-500">*</span></label>
              <input
                type="text"
                required
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950/90 border border-zinc-800 text-zinc-100 uppercase font-mono focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/30 transition-all"
                placeholder="RENT-001"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-zinc-300 font-semibold text-[11px]">Category <span className="text-zinc-500">*</span></label>
                <button
                  type="button"
                  onClick={async () => {
                    const catName = prompt('Enter new category name:');
                    if (!catName || !catName.trim()) return;
                    try {
                      const res = await categoryService.create({ name: catName.trim() });
                      success(`Category "${res.category.name}" created!`);
                      setCategories((prev) => [...prev, res.category]);
                      setFormData((prev) => ({ ...prev, category: res.category._id }));
                    } catch (err: any) {
                      error(err.message || 'Failed to create category');
                    }
                  }}
                  className="text-[10px] text-zinc-400 hover:text-white font-mono font-semibold"
                >
                  + Add Category
                </button>
              </div>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950/90 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/30 transition-all"
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Campus / College Selection */}
          <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-zinc-300 font-semibold text-sm flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-zinc-400" />
                <span>Campus / College Location *</span>
              </label>
              <span className="text-[10px] text-zinc-500">Visible in Campus Search</span>
            </div>

            <div className="flex rounded-lg bg-zinc-900 p-0.5 border border-zinc-800 text-[11px] font-medium">
              <button
                type="button"
                onClick={() => {
                  setCustomCollege(false);
                  setFormData((prev) => ({ ...prev, location: user?.collegeName || 'IIT Delhi' }));
                }}
                className={`flex-1 py-1.5 px-2 rounded-md transition-all flex items-center justify-center gap-1.5 ${!customCollege
                    ? 'bg-zinc-800 text-white font-semibold shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                  }`}
              >
                <Building2 className="w-3 h-3 text-zinc-400" />
                <span className="truncate">My Campus ({user?.collegeName || 'IIT Delhi'})</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setCustomCollege(true);
                  if (!formData.location || formData.location === user?.collegeName) {
                    setFormData((prev) => ({ ...prev, location: '' }));
                  }
                }}
                className={`flex-1 py-1.5 px-2 rounded-md transition-all flex items-center justify-center gap-1.5 ${customCollege
                    ? 'bg-zinc-800 text-white font-semibold shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                  }`}
              >
                <span>+ List in Another College</span>
              </button>
            </div>

            {customCollege && (
              <div className="space-y-1.5 pt-1 animate-in fade-in duration-150">
                <input
                  type="text"
                  required={customCollege}
                  value={formData.location || ''}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-5 py-3.5 rounded-xl bg-[#18191b] border border-[#303238] text-zinc-100 placeholder:text-zinc-500 text-base focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/30 transition-all"
                  placeholder="Enter college/university name (e.g. DTU, BITS Pilani, IIT Bombay, DU)..."
                />
                <div className="flex flex-wrap gap-1">
                  {['IIT Delhi', 'DTU Delhi', 'NSUT', 'BITS Pilani', 'IIT Bombay', 'Delhi University (DU)'].map(
                    (col) => (
                      <button
                        key={col}
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, location: col }))}
                        className="px-2 py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[10px] text-zinc-400 hover:text-zinc-200 transition-colors"
                      >
                        {col}
                      </button>
                    )
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-zinc-300 mb-2.5 font-semibold text-sm">Rental Price (₹/day) <span className="text-zinc-500">*</span></label>
              <input
                type="number"
                step="1"
                min="0"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                className="w-full px-5 py-3.5 rounded-xl bg-[#18191b] border border-[#303238] text-zinc-100 text-base focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/30 transition-all font-mono"
              />
            </div>
            <div>
              <label className="block text-zinc-300 mb-2.5 font-semibold text-sm">Discount Rate (₹/day optional)</label>
              <input
                type="number"
                step="1"
                min="0"
                value={formData.discountPrice || ''}
                onChange={(e) =>
                  setFormData({ ...formData, discountPrice: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-5 py-3.5 rounded-xl bg-[#18191b] border border-[#303238] text-zinc-100 text-base focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/30 transition-all font-mono"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-3.5 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <label className="block text-zinc-300 font-semibold text-[11px]">Item Photo</label>
                <p className="text-[10px] text-zinc-500 mt-1">Use a clear photo so students can recognize the item.</p>
              </div>
              <ImageIcon className="w-4 h-4 text-zinc-500 flex-shrink-0" />
            </div>

            {formData.images?.[0]?.url && (
              <div className="relative h-32 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
                <img src={formData.images[0].url} alt="Item preview" className="w-full h-full object-cover" />
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-[11px] font-semibold text-zinc-200 hover:border-zinc-500 hover:text-white transition-colors"
              >
                <Camera className="w-3.5 h-3.5" /> Take Photo
              </button>
              <button
                type="button"
                onClick={() => uploadInputRef.current?.click()}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-[11px] font-semibold text-zinc-200 hover:border-zinc-500 hover:text-white transition-colors"
              >
                <Upload className="w-3.5 h-3.5" /> Upload Photo
              </button>
            </div>

            <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handlePhotoSelected} className="hidden" />
            <input ref={uploadInputRef} type="file" accept="image/*" onChange={handlePhotoSelected} className="hidden" />

            <div>
              <label className="block text-zinc-500 mb-1 text-[10px]">Or paste an image URL</label>
              <input
                type="url"
                value={formData.images?.[0]?.url?.startsWith('data:') ? '' : formData.images?.[0]?.url || ''}
                onChange={(e) => setFormData({ ...formData, images: [{ url: e.target.value, alt: formData.name }] })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/30 transition-all"
                placeholder="https://images.unsplash.com/..."
              />
            </div>
          </div>

          <div>
            <label className="block text-zinc-300 mb-2.5 font-semibold text-sm">Description (min 10 chars) <span className="text-zinc-500">*</span></label>
            <textarea
              rows={3}
              required
              minLength={10}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-5 py-3.5 rounded-xl bg-[#18191b] border border-[#303238] text-zinc-100 text-base focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/30 transition-all resize-none"
              placeholder="Describe item condition, accessories included, campus pickup location..."
            />
          </div>

          <div>
            <label className="block text-zinc-300 mb-2.5 font-semibold text-sm">Tags (comma separated)</label>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              className="w-full px-5 py-3.5 rounded-xl bg-[#18191b] border border-[#303238] text-zinc-100 text-base focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/30 transition-all"
              placeholder="calculator, lab, exam, hostel"
            />
          </div>

                    <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-zinc-900 text-zinc-300 hover:text-white border border-zinc-800"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-bold shadow-sm disabled:opacity-50"
            >
              {saving ? 'Publishing...' : editingProduct ? 'Save Changes' : 'Publish Rental Listing'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
