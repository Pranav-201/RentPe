import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Package, Folder, Layers, ShoppingBag, LogIn, PlusCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ProductManager } from '../components/admin/ProductManager';
import { CategoryManager } from '../components/admin/CategoryManager';
import { InventoryManager } from '../components/admin/InventoryManager';
import { OrderManager } from '../components/admin/OrderManager';

export const AdminDashboardPage: React.FC = () => {
  const { isAuthenticated, user, loading: authLoading, switchDemoUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'inventory' | 'orders'>('products');
  const [loggingIn, setLoggingIn] = useState(false);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-zinc-700 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-5">
        <div className="w-16 h-16 rounded-3xl bg-zinc-900 border border-zinc-800 mx-auto flex items-center justify-center text-zinc-300 shadow-md">
          <PlusCircle className="w-8 h-8" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-xl font-bold text-white">Sign In to List Items</h2>
          <p className="text-xs text-zinc-400 leading-relaxed max-w-sm mx-auto">
            You need to be logged in to list your study materials, tools, or gadgets for rent on RentPe.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            to="/auth"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-bold shadow-md transition-all active:scale-[0.98]"
          >
            <LogIn className="w-4 h-4" /> Sign In / Register
          </Link>
          <button
            onClick={async () => {
              setLoggingIn(true);
              await switchDemoUser('admin');
              setLoggingIn(false);
            }}
            disabled={loggingIn}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-semibold shadow-sm transition-all"
          >
            {loggingIn ? (
              <div className="w-3.5 h-3.5 border-2 border-zinc-400 border-t-white rounded-full animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
            )}
            Quick Demo Login
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'products', label: 'Rental Listings', icon: Package },
    { id: 'categories', label: 'Categories', icon: Folder },
    { id: 'inventory', label: 'Inventory & Stock', icon: Layers },
    { id: 'orders', label: 'Rental Requests & Orders', icon: ShoppingBag },
  ] as const;

  return (
    <div className="page-container space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800/80">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-zinc-300 uppercase tracking-wider mb-1">
            <Sparkles className="w-3 h-3 text-zinc-400" /> Student Rental Hub
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">List & Manage Items</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Logged in as <span className="text-zinc-200 font-semibold">{user?.name}</span> {user?.collegeName ? `(${user.collegeName})` : ''}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap items-center gap-1 bg-zinc-950 border border-zinc-800 p-1.5 rounded-2xl">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-zinc-100 text-zinc-950 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Tab Panel */}
      <div className="animate-in fade-in duration-200">
        {activeTab === 'products' && <ProductManager />}
        {activeTab === 'categories' && <CategoryManager />}
        {activeTab === 'inventory' && <InventoryManager />}
        {activeTab === 'orders' && <OrderManager />}
      </div>
    </div>
  );
};
