import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, CheckCircle2, ScrollText, Shield, AlertTriangle,
  FileText, Clock, Ban, HelpCircle, ChevronDown
} from 'lucide-react';

const TERMS_ACCEPTED_KEY = 'rentpe_terms_accepted';

export const TermsPage: React.FC = () => {
  const navigate = useNavigate();
  const [checked, setChecked] = useState(false);
  const [scrolledToBottom, setScrolledToBottom] = useState(false);
  const [shake, setShake] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Track if user scrolled to bottom of terms content
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handler = () => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      if (scrollTop + clientHeight >= scrollHeight - 40) {
        setScrolledToBottom(true);
      }
    };
    el.addEventListener('scroll', handler);
    return () => el.removeEventListener('scroll', handler);
  }, []);

  const handleAgree = () => {
    if (!checked) {
      setShake(true);
      setTimeout(() => setShake(false), 600);
      return;
    }
    sessionStorage.setItem(TERMS_ACCEPTED_KEY, 'true');
    navigate('/cart');
  };

  const sections = [
    {
      icon: ScrollText,
      title: '1. Rental Agreement',
      color: '#a78bfa',
      content: [
        'By renting any item through RentPe, you enter into a legally binding agreement with the lender (a fellow student or campus member) to use the item responsibly for the agreed rental duration.',
        'The rental period begins from the time of pickup/delivery and ends at the agreed return date and time.',
        'You must return the item in the same condition as received, accounting for reasonable wear and tear.',
      ],
    },
    {
      icon: Shield,
      title: '2. Liability & Damage Policy',
      color: '#60a5fa',
      content: [
        'You are fully responsible for any damage, theft, or loss of the rented item during your rental period.',
        'In the event of damage, you must inform the lender and RentPe support within 24 hours of occurrence.',
        'Damage charges will be assessed based on the replacement value or repair cost of the item, as agreed with the lender.',
        'RentPe is not liable for any indirect damages, personal injuries, or losses arising from the use of rented items.',
      ],
    },
    {
      icon: Clock,
      title: '3. Return & Late Fees',
      color: '#34d399',
      content: [
        'Items must be returned by the agreed end date. Late returns are subject to a late fee of 1.5× the daily rental rate per additional day.',
        'If you need to extend your rental, you must request an extension through the app before the return deadline.',
        'Failure to return an item within 3 days past the due date will be treated as theft and reported to campus authorities.',
      ],
    },
    {
      icon: Ban,
      title: '4. Prohibited Uses',
      color: '#f87171',
      content: [
        'Rented items must not be sub-rented, lent, or transferred to any third party.',
        'Items must not be used for illegal purposes, commercial gain, or any activity that violates campus rules.',
        'Modifying, tampering, or disassembling rented items is strictly prohibited.',
        'RentPe reserves the right to suspend accounts found violating these terms.',
      ],
    },
    {
      icon: FileText,
      title: '5. Payments & Cancellations',
      color: '#fbbf24',
      content: [
        'All rental fees must be paid as agreed at checkout. RentPe supports UPI, card, and Cash on Delivery (meetup).',
        'Cancellations made more than 24 hours before the rental start time are eligible for a full refund.',
        'Cancellations within 24 hours of the rental start will incur a 10% cancellation fee.',
        'Refunds are processed within 5–7 business days to the original payment method.',
      ],
    },
    {
      icon: HelpCircle,
      title: '6. Dispute Resolution',
      color: '#c084fc',
      content: [
        'Any disputes between renters and lenders must first be reported to RentPe support via the Help section.',
        'RentPe will mediate disputes fairly based on evidence submitted by both parties within 7 days.',
        'Decisions made by RentPe\'s dispute team are final and binding on both parties.',
        'For unresolved disputes, both parties agree to seek resolution under applicable Indian student/consumer law.',
      ],
    },
    {
      icon: AlertTriangle,
      title: '7. Account & Data',
      color: '#fb923c',
      content: [
        'Your account information is used solely for facilitating rentals and will not be sold to third parties.',
        'RentPe may send you rental-related notifications via email or in-app messages.',
        'You are responsible for maintaining the security of your account credentials.',
        'RentPe reserves the right to terminate accounts that repeatedly violate platform policies.',
      ],
    },
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#07070a' }}>
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
        .shake { animation: shake 0.5s ease; }
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fade-up 0.4s cubic-bezier(0.16,1,0.3,1) both; }
        .terms-scroll::-webkit-scrollbar { width: 4px; }
        .terms-scroll::-webkit-scrollbar-track { background: transparent; }
        .terms-scroll::-webkit-scrollbar-thumb { background: rgba(139,92,246,0.3); border-radius: 9999px; }
        .terms-scroll { scrollbar-width: thin; scrollbar-color: rgba(139,92,246,0.3) transparent; }
        .custom-checkbox { accent-color: #7c3aed; width: 18px; height: 18px; cursor: pointer; flex-shrink: 0; }
      `}</style>

      {/* ── Top Bar ── */}
      <div className="sticky top-0 z-20 flex items-center gap-3 px-4 sm:px-6 py-3.5"
        style={{ background: 'rgba(7,7,10,0.92)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <button
          onClick={() => navigate('/cart')}
          className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors text-xs font-medium group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Checkout
        </button>

        <div className="h-4 w-px bg-slate-800" />

        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)' }}
          >
            <ScrollText className="w-3 h-3 text-white" />
          </div>
          <span className="text-sm font-bold text-white">Terms & Conditions</span>
        </div>

        <span className="ml-auto text-[11px] text-slate-600 font-mono">RentPe v1.0</span>
      </div>

      {/* ── Hero ── */}
      <div className="fade-up px-4 sm:px-6 pt-8 pb-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(124,58,237,0.12) 0%, transparent 70%)' }}
        />
        <div className="relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold mb-4"
            style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.25)', color: '#a78bfa' }}
          >
            <Shield className="w-3 h-3" /> Required before renting
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
            Rental Terms &<br />
            <span style={{ background: 'linear-gradient(90deg,#a78bfa,#60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Conditions
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-2.5 max-w-md mx-auto leading-relaxed">
            Please read all terms carefully before renting. You must accept these terms to complete your rental.
          </p>
        </div>
      </div>

      {/* ── Scrollable Content ── */}
      <div
        ref={scrollRef}
        className="terms-scroll flex-1 overflow-y-auto px-4 sm:px-6 max-w-2xl w-full mx-auto pb-6 space-y-4"
      >
        {sections.map((sec, i) => {
          const Icon = sec.icon;
          return (
            <div
              key={i}
              className="rounded-2xl p-5 fade-up"
              style={{
                animationDelay: `${0.05 + i * 0.05}s`,
                background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
                border: '1px solid rgba(255,255,255,0.07)',
              }}
            >
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `${sec.color}18`, border: `1px solid ${sec.color}30` }}
                >
                  <Icon className="w-3.5 h-3.5" style={{ color: sec.color }} />
                </div>
                <h2 className="text-sm font-bold text-white">{sec.title}</h2>
              </div>
              <ul className="space-y-2">
                {sec.content.map((point, j) => (
                  <li key={j} className="flex gap-2.5 text-xs text-slate-400 leading-relaxed">
                    <span className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0" style={{ background: sec.color }} />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}

        {/* Scroll hint */}
        {!scrolledToBottom && (
          <div className="flex flex-col items-center gap-1.5 py-2 text-slate-600 animate-bounce">
            <ChevronDown className="w-4 h-4" />
            <span className="text-[11px]">Scroll to read all terms</span>
          </div>
        )}
      </div>

      {/* ── Sticky Agreement Footer ── */}
      <div className="sticky bottom-0 z-20 w-full"
        style={{ background: 'rgba(7,7,10,0.96)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 space-y-3">
          {/* Checkbox row */}
          <label
            className={`flex items-start gap-3 cursor-pointer group ${shake ? 'shake' : ''}`}
          >
            <input
              type="checkbox"
              className="custom-checkbox mt-0.5"
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
            />
            <span className="text-xs leading-relaxed"
              style={{ color: checked ? '#a78bfa' : '#94a3b8' }}
            >
              I have carefully read and understood all the Terms & Conditions above, and I agree to comply with RentPe's rental policies, liability terms, and return guidelines.
            </span>
          </label>

          {/* CTA Button */}
          <button
            onClick={handleAgree}
            className="w-full py-3 rounded-xl font-bold text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            style={
              checked
                ? {
                    background: 'linear-gradient(135deg,#7c3aed,#4f46e5)',
                    color: '#fff',
                    boxShadow: '0 4px 20px rgba(124,58,237,0.4)',
                  }
                : {
                    background: 'rgba(255,255,255,0.05)',
                    color: '#475569',
                    border: '1px solid rgba(255,255,255,0.08)',
                    cursor: 'not-allowed',
                  }
            }
          >
            <CheckCircle2 className="w-4 h-4" />
            {checked ? 'I Agree — Continue to Checkout' : 'Please accept the terms to continue'}
          </button>

          <p className="text-center text-[11px] text-slate-600">
            By continuing you confirm you are a registered student on campus.
          </p>
        </div>
      </div>
    </div>
  );
};

export { TERMS_ACCEPTED_KEY };
