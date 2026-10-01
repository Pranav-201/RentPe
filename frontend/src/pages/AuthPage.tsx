import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Mail, User as UserIcon, ArrowRight, Phone, GraduationCap, Building2 } from 'lucide-react';
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

  const { login, register } = useAuth();
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

  const inputClass = "w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#18191b] border border-[#303238] text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/30 transition-all text-sm";

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-[#070709] px-3 py-2 sm:px-6 sm:py-4 lg:px-10">
      <div className="w-full max-w-6xl flex flex-col items-center gap-3">
        <Link to="/" aria-label="Go to RentPe home" className="self-start">
          <img src="/rentpe-logo.png" alt="RentPe" className="h-14 sm:h-16 w-auto object-contain" />
        </Link>
        <div className="w-full grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] overflow-hidden rounded-2xl border border-zinc-800 bg-[#111214] shadow-2xl shadow-black/50">
        <div className="relative hidden lg:flex min-h-[440px] flex-col justify-between overflow-hidden p-7 bg-[#09090b]">
          <img src="/image.png" alt="Campus rental items" className="absolute inset-0 w-full h-full object-cover opacity-50" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#09090b]/75 via-[#09090b]/25 to-[#050505]/95" />
          
         
        </div>

        <div className="flex items-center bg-[#111214] px-5 py-5 sm:px-8 lg:px-12">
          <div className="w-full max-w-xl mx-auto space-y-3">
            <div className="space-y-1.5">
              <h1 className={`${isRegister ? 'text-2xl sm:text-3xl' : 'text-3xl sm:text-4xl'} font-semibold tracking-tight text-white`}>
                {isRegister ? 'Create your account' : 'Welcome back'}
              </h1>
              <p className="text-sm text-zinc-400">
                {isRegister ? 'Join your campus rental community.' : 'Sign in to access your rentals and listings.'}
              </p>
            </div>

            <div className="flex border-b border-white/10 text-sm font-semibold">
              <button type="button" onClick={() => setIsRegister(false)} className={`flex-1 border-b-2 py-3 transition-colors ${!isRegister ? 'border-white text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}>Sign In</button>
              <button type="button" onClick={() => setIsRegister(true)} className={`flex-1 border-b-2 py-3 transition-colors ${isRegister ? 'border-white text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}>Register</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-2 text-xs">
              {isRegister && (
                <>
                  <div>
                    <label className="mb-1 block text-[11px] font-semibold text-zinc-300">Full Name</label>
                    <div className="relative"><UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" /><input type="text" required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="Your full name" /></div>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-[11px] font-semibold text-zinc-300">Phone Number</label>
                      <div className="relative"><Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" /><input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} placeholder="+91 98765 43210" /></div>
                    </div>
                    <div>
                      <label className="mb-1 block text-[11px] font-semibold text-zinc-300">Student / College ID</label>
                      <div className="relative"><GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" /><input type="text" required minLength={2} value={collegeId} onChange={(e) => setCollegeId(e.target.value)} className={inputClass} placeholder="e.g. 21CS1234" /></div>
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] font-semibold text-zinc-300">College / University Name</label>
                    <div className="relative"><Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" /><input type="text" required minLength={2} value={collegeName} onChange={(e) => setCollegeName(e.target.value)} className={inputClass} placeholder="e.g. IIT Delhi" /></div>
                  </div>
                </>
              )}

              <div>
                <label className="mb-1 block text-[11px] font-semibold text-zinc-300">Email Address</label>
                <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" /><input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} placeholder="you@college.edu" /></div>
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-semibold text-zinc-300">Password</label>
                <div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" /><input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} placeholder="Enter your password" /></div>
              </div>

              <button type="submit" disabled={loading} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3 text-sm font-bold text-zinc-950 shadow-lg shadow-black/20 transition-all hover:bg-zinc-200 active:scale-[0.99] disabled:opacity-50">
                {loading ? 'Authenticating...' : isRegister ? 'Create account' : 'Sign in'} <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

