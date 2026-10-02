import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const AuthPage: React.FC = () => {
  const { signInWithEmail, signInWithGoogle } = useAuth();
  const [isEmailLoginOpen, setIsEmailLoginOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch {
      // Firebase errors are shown through the existing toast UI.
    }
  };

  const handleEmailLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await signInWithEmail(email, password);
    } catch {
      // Firebase errors are shown through the existing toast UI.
    }
  };

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
              <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">Welcome to RentPe</h1>
            </div>

            <div className="space-y-3 text-sm">
              <p className="font-semibold text-zinc-300">Create a new account</p>
              <button type="button" onClick={handleGoogleLogin} className="flex w-full items-center justify-center rounded-xl bg-white py-3 font-bold text-zinc-950 shadow-lg shadow-black/20 transition-all hover:bg-zinc-200 active:scale-[0.99]">
                Continue with Google
              </button>
            </div>

            <div className="flex items-center gap-3 text-xs text-zinc-500" aria-hidden="true">
              <span className="h-px flex-1 bg-white/10" />
              <span>or</span>
              <span className="h-px flex-1 bg-white/10" />
            </div>

            <div className="space-y-3 text-sm">
              <p className="font-semibold text-zinc-300">Already have an account?</p>
              <button type="button" onClick={() => setIsEmailLoginOpen(true)} className="flex w-full items-center justify-center rounded-xl border border-white/10 bg-[#18191b] py-3 font-bold text-white transition-all hover:border-zinc-500 hover:bg-[#202124] active:scale-[0.99]">
                Login with Email
              </button>
              {isEmailLoginOpen && (
                <form onSubmit={handleEmailLogin} className="space-y-2 pt-1">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="Email"
                    className="w-full rounded-xl border border-[#303238] bg-[#18191b] px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none transition-colors focus:border-zinc-500"
                  />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Password"
                    className="w-full rounded-xl border border-[#303238] bg-[#18191b] px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none transition-colors focus:border-zinc-500"
                  />
                  <button type="submit" className="flex w-full items-center justify-center rounded-xl bg-white py-2.5 text-sm font-bold text-zinc-950 shadow-lg shadow-black/20 transition-all hover:bg-zinc-200 active:scale-[0.99]">
                    Login
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

