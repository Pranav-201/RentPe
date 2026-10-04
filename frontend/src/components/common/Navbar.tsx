import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingCart,
  User as UserIcon,
  LogOut,
  Package,
  ChevronDown,
  PlusCircle,
  X,
  Mail,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { Modal } from './Modal';
import { OPEN_SIGN_IN_MODAL_EVENT } from '../../config/signInModal';
import { firebaseAuth } from '../../config/firebase';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout, signInWithEmail, signUpWithEmail, resendVerificationEmail, signInWithGoogle } = useAuth();
  const { error: toastError } = useToast();
  const { cart, openDrawer } = useCart();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'verify'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const [unverifiedUser, setUnverifiedUser] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const totalCartItems = cart?.items?.length || 0;

  useEffect(() => {
    const openModal = () => {
      setAuthMode('login');
      setIsAuthModalOpen(true);
    };
    window.addEventListener(OPEN_SIGN_IN_MODAL_EVENT, openModal);
    return () => window.removeEventListener(OPEN_SIGN_IN_MODAL_EVENT, openModal);
  }, []);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleCloseAuthModal = () => {
    setIsAuthModalOpen(false);
    setPassword('');
    setConfirmPassword('');
    setShowLoginPassword(false);
    setShowSignupPassword(false);
    setShowConfirmPassword(false);
    setIsSubmitting(false);
    setIsResending(false);
  };

  const handleEmailLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail || !password || isSubmitting) return;

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      toastError('Enter a valid email address.');
      return;
    }

    try {
      setIsSubmitting(true);
      await signInWithEmail(cleanEmail, password);
      handleCloseAuthModal();
    } catch (err: any) {
      if (err?.code === 'auth/unverified-email') {
        setUnverifiedEmail(cleanEmail);
        setUnverifiedUser(err.user || firebaseAuth.currentUser);
        setAuthMode('verify');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailSignup = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanEmail = email.trim();
    if (isSubmitting) return;

    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      toastError('Enter a valid email address.');
      return;
    }

    if (!password || password.length < 6) {
      toastError('Password should be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      toastError('Passwords do not match.');
      return;
    }

    try {
      setIsSubmitting(true);
      const createdUser = await signUpWithEmail(cleanEmail, password);
      setUnverifiedEmail(cleanEmail);
      setUnverifiedUser(createdUser);
      setResendCooldown(30);
      setAuthMode('verify');
      setPassword('');
      setConfirmPassword('');
    } catch {
      // Errors handled via toast in AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendVerification = async () => {
    if (resendCooldown > 0 || isResending) return;
    try {
      setIsResending(true);
      await resendVerificationEmail(unverifiedUser);
      setResendCooldown(30);
    } catch {
      // Errors handled via toast in AuthContext
    } finally {
      setIsResending(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
      handleCloseAuthModal();
    } catch {
      // Firebase errors are shown through the existing toast UI.
    }
  };

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
                  className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 hover:border-zinc-700 transition-all text-xs font-medium cursor-pointer"
                >
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name || 'User'}
                      className="w-6 h-6 rounded-lg object-cover border border-zinc-700"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-200 font-bold text-xs">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
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
                          {user?.avatar ? (
                            <img
                              src={user.avatar}
                              alt={user.name || 'User'}
                              className="flex h-11 w-11 shrink-0 rounded-xl border border-zinc-600/80 object-cover shadow-inner"
                            />
                          ) : (
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-zinc-600/80 bg-zinc-800 text-sm font-bold text-zinc-100 shadow-inner">
                              {user?.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                          )}
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
                <button
                  type="button"
                  className="px-3.5 py-1.5 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold shadow-sm transition-all hover:shadow-zinc-100/10 cursor-pointer"
                  onClick={() => {
                    setAuthMode('login');
                    setIsAuthModalOpen(true);
                  }}
                >
                  Sign in
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <Modal
        isOpen={isAuthModalOpen}
        onClose={handleCloseAuthModal}
        title=""
        maxWidth="md"
        tone="graphite"
        showHeader={false}
      >
        <div className="relative -m-6 space-y-5 bg-black p-6 sm:-m-6 sm:p-6">
          <button
            type="button"
            aria-label="Close authentication dialog"
            onClick={handleCloseAuthModal}
            className="absolute right-0 top-0 p-1 text-zinc-400 transition-colors hover:text-white cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>

          {authMode === 'login' && (
            <>
              <div className="flex flex-col items-center gap-4 pt-1 text-center">
                <img src="/rentpe-logo.png" alt="RentPe" className="h-11 w-auto object-contain" />
                <h2 className="text-2xl font-semibold tracking-tight text-white">Login to your account</h2>
              </div>

              <form onSubmit={handleEmailLogin} className="space-y-3">
                <div>
                  <label htmlFor="login-email" className="block text-sm font-medium text-zinc-100 mb-1">Email</label>
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="mail@example.com"
                    required
                    className="w-full rounded-xl border-2 border-zinc-500 bg-[#18181b] px-4 py-2.5 text-base text-white placeholder:text-zinc-500 outline-none transition-colors focus:border-zinc-300"
                  />
                </div>
                <div>
                  <label htmlFor="login-password" className="block text-sm font-medium text-zinc-100 mb-1">Password</label>
                  <div className="relative">
                    <input
                      id="login-password"
                      type={showLoginPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Password"
                      required
                      className="w-full rounded-xl border-2 border-zinc-500 bg-[#18181b] px-4 pr-11 py-2.5 text-base text-white placeholder:text-zinc-500 outline-none transition-colors focus:border-zinc-300"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                      aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                    >
                      {showLoginPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={!email || !password || isSubmitting}
                  className="w-full rounded-xl bg-gradient-to-r from-[#3b4f92] to-[#65498b] py-3 text-base font-semibold text-zinc-100 transition-opacity disabled:text-zinc-400 disabled:opacity-90 cursor-pointer"
                >
                  {isSubmitting ? 'Logging in...' : 'Login'}
                </button>
              </form>

              <div className="text-center text-sm text-zinc-400">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signup');
                    setPassword('');
                    setConfirmPassword('');
                  }}
                  className="font-semibold text-white underline underline-offset-2 hover:text-zinc-200 cursor-pointer"
                >
                  Sign up
                </button>
              </div>

              <div className="flex items-center gap-3 text-base text-zinc-400" aria-hidden="true">
                <span className="h-px flex-1 bg-white/10" />
                <span className="whitespace-nowrap">Or</span>
                <span className="h-px flex-1 bg-white/10" />
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#18191b] py-3 text-base font-semibold text-white transition-all hover:border-zinc-500 hover:bg-[#202124] active:scale-[0.99] cursor-pointer"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
                  <path fill="#4285F4" d="M21.35 12.27c0-.79-.07-1.55-.21-2.27H12v4.3h5.23a4.47 4.47 0 0 1-1.94 2.93v2.79h3.14c1.84-1.69 2.92-4.18 2.92-7.75Z" />
                  <path fill="#34A853" d="M12 21.75c2.62 0 4.82-.87 6.43-2.36l-3.14-2.79c-.87.59-1.99.94-3.29.94-2.53 0-4.68-1.71-5.45-4.01H3.3v2.88A9.71 9.71 0 0 0 12 21.75Z" />
                  <path fill="#FBBC05" d="M6.55 13.53A5.85 5.85 0 0 1 6.25 12c0-.53.09-1.04.3-1.53V7.59H3.3A9.75 9.75 0 0 0 2.25 12c0 1.57.38 3.06 1.05 4.41l3.25-2.88Z" />
                  <path fill="#EA4335" d="M12 6.46c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.81 3.53 14.61 2.25 12 2.25A9.71 9.71 0 0 0 3.3 7.59l3.25 2.88c.77-2.3 2.92-4.01 5.45-4.01Z" />
                </svg>
                Login with Google
              </button>

              <p className="text-center text-xs leading-5 text-zinc-400">
                By continuing, you agree to our <a href="#privacy-policy" className="font-semibold text-white underline underline-offset-2">Privacy Policy</a> and <Link to="/terms" onClick={handleCloseAuthModal} className="font-semibold text-white underline underline-offset-2">Terms of Use</Link>.
              </p>
            </>
          )}

          {authMode === 'signup' && (
            <>
              <div className="flex flex-col items-center gap-4 pt-1 text-center">
                <img src="/rentpe-logo.png" alt="RentPe" className="h-11 w-auto object-contain" />
                <h2 className="text-2xl font-semibold tracking-tight text-white">Create your account</h2>
              </div>

              <form onSubmit={handleEmailSignup} className="space-y-3">
                <div>
                  <label htmlFor="signup-email" className="block text-sm font-medium text-zinc-100 mb-1">Email</label>
                  <input
                    id="signup-email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="mail@example.com"
                    required
                    className="w-full rounded-xl border-2 border-zinc-500 bg-[#18181b] px-4 py-2.5 text-base text-white placeholder:text-zinc-500 outline-none transition-colors focus:border-zinc-300"
                  />
                </div>
                <div>
                  <label htmlFor="signup-password" className="block text-sm font-medium text-zinc-100 mb-1">Password</label>
                  <div className="relative">
                    <input
                      id="signup-password"
                      type={showSignupPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Password (min. 6 characters)"
                      required
                      className="w-full rounded-xl border-2 border-zinc-500 bg-[#18181b] px-4 pr-11 py-2.5 text-base text-white placeholder:text-zinc-500 outline-none transition-colors focus:border-zinc-300"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignupPassword(!showSignupPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                      aria-label={showSignupPassword ? 'Hide password' : 'Show password'}
                    >
                      {showSignupPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <label htmlFor="signup-confirm-password" className="block text-sm font-medium text-zinc-100 mb-1">Confirm Password</label>
                  <div className="relative">
                    <input
                      id="signup-confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      placeholder="Confirm Password"
                      required
                      className="w-full rounded-xl border-2 border-zinc-500 bg-[#18181b] px-4 pr-11 py-2.5 text-base text-white placeholder:text-zinc-500 outline-none transition-colors focus:border-zinc-300"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={!email || !password || !confirmPassword || isSubmitting}
                  className="w-full rounded-xl bg-gradient-to-r from-[#3b4f92] to-[#65498b] py-3 text-base font-semibold text-zinc-100 transition-opacity disabled:text-zinc-400 disabled:opacity-90 cursor-pointer"
                >
                  {isSubmitting ? 'Creating account...' : 'Create Account'}
                </button>
              </form>

              <div className="text-center text-sm text-zinc-400">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setPassword('');
                    setConfirmPassword('');
                  }}
                  className="font-semibold text-white underline underline-offset-2 hover:text-zinc-200 cursor-pointer"
                >
                  Login
                </button>
              </div>

              <div className="flex items-center gap-3 text-base text-zinc-400" aria-hidden="true">
                <span className="h-px flex-1 bg-white/10" />
                <span className="whitespace-nowrap">Or</span>
                <span className="h-px flex-1 bg-white/10" />
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#18191b] py-3 text-base font-semibold text-white transition-all hover:border-zinc-500 hover:bg-[#202124] active:scale-[0.99] cursor-pointer"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
                  <path fill="#4285F4" d="M21.35 12.27c0-.79-.07-1.55-.21-2.27H12v4.3h5.23a4.47 4.47 0 0 1-1.94 2.93v2.79h3.14c1.84-1.69 2.92-4.18 2.92-7.75Z" />
                  <path fill="#34A853" d="M12 21.75c2.62 0 4.82-.87 6.43-2.36l-3.14-2.79c-.87.59-1.99.94-3.29.94-2.53 0-4.68-1.71-5.45-4.01H3.3v2.88A9.71 9.71 0 0 0 12 21.75Z" />
                  <path fill="#FBBC05" d="M6.55 13.53A5.85 5.85 0 0 1 6.25 12c0-.53.09-1.04.3-1.53V7.59H3.3A9.75 9.75 0 0 0 2.25 12c0 1.57.38 3.06 1.05 4.41l3.25-2.88Z" />
                  <path fill="#EA4335" d="M12 6.46c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.81 3.53 14.61 2.25 12 2.25A9.71 9.71 0 0 0 3.3 7.59l3.25 2.88c.77-2.3 2.92-4.01 5.45-4.01Z" />
                </svg>
                Continue with Google
              </button>

              <p className="text-center text-xs leading-5 text-zinc-400">
                By continuing, you agree to our <a href="#privacy-policy" className="font-semibold text-white underline underline-offset-2">Privacy Policy</a> and <Link to="/terms" onClick={handleCloseAuthModal} className="font-semibold text-white underline underline-offset-2">Terms of Use</Link>.
              </p>
            </>
          )}

          {authMode === 'verify' && (
            <>
              <div className="flex flex-col items-center gap-3 pt-1 text-center">
                <div className="w-12 h-12 rounded-2xl bg-violet-950/60 border border-violet-500/30 flex items-center justify-center text-violet-400 shadow-lg shadow-violet-950/40">
                  <Mail className="w-6 h-6 text-violet-400" />
                </div>
                <h2 className="text-2xl font-semibold tracking-tight text-white">Verify your email</h2>
                <p className="text-sm text-zinc-400 max-w-sm">
                  We've sent a verification link to:
                </p>
                <div className="w-full rounded-xl border border-zinc-700 bg-[#18181b] px-4 py-2.5 text-center text-sm font-semibold text-white font-mono break-all">
                  {unverifiedEmail || email}
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed max-w-sm">
                  Please check your inbox and verify your email before logging in.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={isResending || resendCooldown > 0}
                  className="w-full rounded-xl bg-gradient-to-r from-[#3b4f92] to-[#65498b] py-3 text-base font-semibold text-zinc-100 transition-opacity disabled:text-zinc-400 disabled:opacity-75 cursor-pointer flex items-center justify-center gap-2"
                >
                  {isResending ? 'Sending...' : resendCooldown > 0 ? `Resend email (${resendCooldown}s)` : 'Resend verification email'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setPassword('');
                    setConfirmPassword('');
                  }}
                  className="w-full rounded-xl border border-zinc-700 bg-[#18191b] py-3 text-base font-semibold text-zinc-300 hover:text-white hover:border-zinc-500 transition-all cursor-pointer"
                >
                  Back to Login
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </>
  );
};
