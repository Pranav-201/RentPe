import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Mail, User as UserIcon, ArrowRight, Sparkles, Phone, GraduationCap, Building2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AuthPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [isRegister, setIsRegister] = useState(searchParams.get('mode') === 'register');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [collegeId, setCollegeId] = useState('');
  const [collegeName, setCollegeName] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register, switchDemoUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (searchParams.get('mode') === 'register') {
      setIsRegister(true);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (isRegister) {
        await register({
          name,
          email,
          password,
          phone,
          collegeId,
          collegeName,
        });
      } else {
        await login({ email, password });
      }
      navigate('/');
    } catch {
      // Error handled by AuthContext toast
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role: 'admin' | 'customer') => {
    try {
      setLoading(true);
      await switchDemoUser(role);
      navigate('/');
    } catch {
      // Handled
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full pl-9 pr-3 py-2.5 rounded-xl bg-zinc-950/90 border border-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/30 transition-all text-xs";

  return (
    <div className="w-full flex flex-col justify-center items-center px-4 py-4 sm:py-6 my-auto">
      <div className="w-full max-w-[440px] sm:max-w-[480px] space-y-4 sm:space-y-5">
        {/* Header */}
        <div className="text-center space-y-1.5">
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {isRegister ? 'Join RentPe' : 'Welcome Back'}
          </h1>
          <p className="text-xs text-zinc-400">
            {isRegister ? 'Create your verified student account to rent & list' : 'Sign in to access your rentals and listings'}
          </p>
        </div>

        {/* Demo Account Quick Switcher */}
        <div className="p-3.5 rounded-2xl bg-zinc-900/70 border border-zinc-800/80 space-y-2 silver-card">
          <div className="flex items-center justify-between text-xs font-semibold text-zinc-300">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-zinc-400" /> Instant Demo Access
            </span>
            <span className="text-[10px] text-zinc-400 font-mono">One-click login</span>
          </div>
          <button
            type="button"
            onClick={() => handleDemoLogin('customer')}
            disabled={loading}
            className="w-full p-2.5 sm:p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 hover:border-zinc-700 text-left transition-all flex items-center justify-between group"
          >
            <div>
              <span className="font-bold text-xs text-zinc-200 flex items-center gap-1.5">
                <UserIcon className="w-3.5 h-3.5 text-zinc-400" /> Demo Student Account
              </span>
              <span className="text-[10px] text-zinc-400 font-mono block mt-0.5">student@rentpe.com (IIT Delhi)</span>
            </div>
            <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Auth Card */}
        <div className="p-5 sm:p-6 rounded-2xl bg-zinc-900/85 border border-zinc-800/90 shadow-2xl space-y-5 silver-card">
          {/* Switch Tab */}
          <div className="flex rounded-xl bg-zinc-950 p-1 border border-zinc-800 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setIsRegister(false)}
              className={`flex-1 py-2 rounded-lg transition-all ${
                !isRegister ? 'bg-zinc-100 text-zinc-950 shadow-sm font-bold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setIsRegister(true)}
              className={`flex-1 py-2 rounded-lg transition-all ${
                isRegister ? 'bg-zinc-100 text-zinc-950 shadow-sm font-bold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            {/* ── Register-only fields ── */}
            {isRegister && (
              <>
                {/* Full Name */}
                <div>
                  <label className="block text-zinc-400 mb-1 font-medium font-mono text-[11px]">Full Name *</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={inputClass}
                      placeholder="Your full name"
                    />
                  </div>
                </div>

                {/* Phone & College ID side-by-side on sm+ */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-zinc-400 mb-1 font-medium font-mono text-[11px]">Phone Number *</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className={inputClass}
                        placeholder="+91 98765 43210"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-zinc-400 mb-1 font-medium font-mono text-[11px]">Student / College ID *</label>
                    <div className="relative">
                      <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                      <input
                        type="text"
                        required
                        minLength={2}
                        value={collegeId}
                        onChange={(e) => setCollegeId(e.target.value)}
                        className={inputClass}
                        placeholder="e.g. 21CS1234"
                      />
                    </div>
                  </div>
                </div>

                {/* College Name */}
                <div>
                  <label className="block text-zinc-400 mb-1 font-medium font-mono text-[11px]">College / University Name *</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                      type="text"
                      required
                      minLength={2}
                      value={collegeName}
                      onChange={(e) => setCollegeName(e.target.value)}
                      className={inputClass}
                      placeholder="e.g. IIT Delhi"
                    />
                  </div>
                </div>
              </>
            )}

            {/* ── Always-shown fields ── */}
            <div>
              <label className="block text-zinc-400 mb-1 font-medium font-mono text-[11px]">Email Address *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                  placeholder="you@college.edu"
                />
              </div>
            </div>

            <div>
              <label className="block text-zinc-400 mb-1 font-medium font-mono text-[11px]">Password *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClass}
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50 active:scale-[0.99] mt-2 cursor-pointer"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  {isRegister ? 'Join RentPe' : 'Sign In'} <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

