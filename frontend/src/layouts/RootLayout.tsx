import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { CartDrawer } from '../components/cart/CartDrawer';
import { FloatingAIChatWidget } from '../components/ai/FloatingAIChatWidget';

export const RootLayout: React.FC = () => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/auth';
  const isAdminPage = location.pathname === '/admin';
  const isTermsPage = location.pathname === '/terms';

  return (
    <div className="min-h-screen flex flex-col bg-[#070709] text-zinc-100 selection:bg-zinc-700 selection:text-white relative">
      {/* Background Grain & Subtle Gradient Layers */}
      <div className="fixed inset-0 bg-grain pointer-events-none z-30" />
      <div className="fixed inset-0 bg-dots pointer-events-none opacity-40 z-0" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[350px] bg-gradient-to-b from-white/[0.03] via-zinc-800/[0.02] to-transparent rounded-full blur-3xl pointer-events-none z-0" />

      {/* Main Layout Elements */}
      <div className="relative z-10 flex-1 flex flex-col">
        {!isAuthPage && <Navbar />}
        <main className={`flex-1 w-full ${isAuthPage ? 'flex flex-col justify-center items-center' : ''}`}>
          <Outlet />
        </main>
        {!isAuthPage && !isAdminPage && !isTermsPage && <Footer />}
        <CartDrawer />
        {!isAuthPage && !isAdminPage && <FloatingAIChatWidget />}
      </div>
    </div>
  );
};
