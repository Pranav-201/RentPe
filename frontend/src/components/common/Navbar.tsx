import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingCart,
  User as UserIcon,
  LogOut,
  Package,
  ChevronDown,
  PlusCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { cart, openDrawer } = useCart();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const totalCartItems = cart?.items?.length || 0;

  return (
    <>
      <header className="relative z-40 w-full bg-[#09090c]/85 border-b border-zinc-800/80 backdrop-blur-md border-sheen">
        <div className="max-w-7xl min-[1536px]:max-w-[96rem] min-[1920px]:max-w-[112rem] mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-[72px] flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center group py-0.5">
              <img
                src="/rentpe-logo.png"
                alt="RentPe"
                className="h-11 sm:h-12 w-auto object-contain group-hover:opacity-90 transition-opacity"
              />
            </Link>

            {/* Nav Links */}
            <nav className="hidden md:flex items-center gap-1 text-xs font-medium text-zinc-400">
              <Link
                to="/"
                className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-zinc-900/80 transition-colors"
              >
                Browse Items
              </Link>
              {isAuthenticated && (
                <>
                  <Link
                    to="/orders"
                    className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-zinc-900/80 transition-colors"
                  >
                    My Rentals
                  </Link>
                  <Link
                    to="/admin"
                    className="px-3 py-1.5 rounded-lg text-zinc-200 bg-zinc-900/90 border border-zinc-800 hover:border-zinc-600 hover:text-white transition-all flex items-center gap-1.5"
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-zinc-300" /> + List an Item
                  </Link>
                </>
              )}
            </nav>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2.5 sm:gap-3">

            {/* Rental Cart Trigger */}
            <button
              onClick={openDrawer}
              aria-label="Open rental cart"
              className="relative p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 transition-all"
            >
              <ShoppingCart className="w-4 h-4" />
              {totalCartItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-4 h-4 px-1 rounded-full bg-white text-zinc-950 text-[10px] font-bold flex items-center justify-center shadow-md">
                  {totalCartItems}
                </span>
              )}
            </button>

            {/* User Dropdown / Sign in */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 hover:border-zinc-700 transition-all text-xs font-medium"
                >
                  <div className="w-6 h-6 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-200 font-bold text-xs">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="hidden md:inline max-w-[100px] truncate text-zinc-300">{user?.name}</span>
                  <ChevronDown className="w-3 h-3 text-zinc-400" />
                </button>

                {isUserMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-3 w-72 overflow-hidden rounded-2xl border border-zinc-700/80 bg-[#16171b]/95 shadow-2xl shadow-black/40 backdrop-blur-xl z-50 text-xs">
                      <div className="border-b border-zinc-800/90 bg-gradient-to-br from-zinc-800/80 via-zinc-900/70 to-[#16171b] p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-zinc-600/80 bg-zinc-800 text-sm font-bold text-zinc-100 shadow-inner">
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-white">{user?.name}</p>
                            <p className="mt-0.5 truncate text-[11px] text-zinc-400">{user?.email}</p>
                          </div>
                        </div>
                        <span className="mt-3 inline-flex rounded-md border border-zinc-700 bg-zinc-900/80 px-2 py-1 font-mono text-[9px] font-semibold uppercase tracking-wider text-zinc-300">
                          {user?.collegeName || 'Student Member'}
                        </span>
                      </div>

                      <div className="p-2">

                      <Link
                        to="/admin"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-zinc-200 transition-colors hover:bg-zinc-800 hover:text-white font-medium"
                      >
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-800/80 text-zinc-400 transition-colors group-hover:bg-zinc-700 group-hover:text-white"><PlusCircle className="w-3.5 h-3.5" /></span>
                        <span>List & Manage Items</span>
                      </Link>

                      <Link
                        to="/orders"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white font-medium"
                      >
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-800/80 text-zinc-400 transition-colors group-hover:bg-zinc-700 group-hover:text-white"><Package className="w-3.5 h-3.5" /></span>
                        <span>My Rentals</span>
                      </Link>

                      <Link
                        to="/profile"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white font-medium"
                      >
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-800/80 text-zinc-400 transition-colors group-hover:bg-zinc-700 group-hover:text-white"><UserIcon className="w-3.5 h-3.5" /></span>
                        <span>Profile & Address</span>
                      </Link>

                      <div className="my-2 border-t border-zinc-800" />

                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          logout();
                        }}
                        className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-rose-400 transition-colors hover:bg-rose-950/40 font-medium"
                      >
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-950/30 text-rose-400 transition-colors group-hover:bg-rose-950/60"><LogOut className="w-3.5 h-3.5" /></span>
                        <span>Sign out</span>
                      </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/auth"
                  className="px-3.5 py-1.5 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold shadow-sm transition-all hover:shadow-zinc-100/10"
                >
                  Sign in
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
};
