import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ShoppingBag, LogIn, PlusCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ProductManager } from '../components/admin/ProductManager';
import { OrderManager } from '../components/admin/OrderManager';

export const AdminDashboardPage: React.FC = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');

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
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'products', label: 'Rental Listings', icon: Package },
    { id: 'orders', label: 'Rental Requests & Orders', icon: ShoppingBag },
  ] as const;

  return (
    <div className="page-container space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800/80">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">List & Manage Items</h1>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap items-center gap-1 bg-zinc-950 border border-zinc-800 p-1.5 rounded-2xl">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  if (tab.id !== activeTab) setActiveTab(tab.id);
                }}
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
      <div key={activeTab} className="animate-in fade-in slide-in-from-bottom-1 duration-300">
        {activeTab === 'products' && <ProductManager />}
        {activeTab === 'orders' && <OrderManager />}
      </div>
    </div>
  );
};
