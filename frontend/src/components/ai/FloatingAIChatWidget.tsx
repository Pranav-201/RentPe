import React, { useState, useEffect } from 'react';
import { Bot } from 'lucide-react';
import { AIAssistantModal } from './AIAssistantModal';
import { useLocation } from 'react-router-dom';

export const FloatingAIChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const location = useLocation();
  const isCartPage = location.pathname === '/cart';

  // ── Footer-hide logic (non-cart pages) ──────────────────────────────────
  useEffect(() => {
    const checkFooterIntersection = () => {
      const footer = document.getElementById('app-footer') || document.querySelector('footer');
      if (!footer) { setIsHidden(false); return; }
      const rect = footer.getBoundingClientRect();
      const windowHeight = window.innerHeight || document.documentElement.clientHeight;
      setIsHidden(rect.top <= windowHeight - 10);
    };

    let observer: IntersectionObserver | null = null;
    const footer = document.getElementById('app-footer') || document.querySelector('footer');

    if (footer && 'IntersectionObserver' in window) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setIsHidden(true);
            } else {
              checkFooterIntersection();
            }
          });
        },
        { root: null, rootMargin: '0px 0px -20px 0px', threshold: 0 }
      );
      observer.observe(footer);
    }

    window.addEventListener('scroll', checkFooterIntersection, { passive: true });
    window.addEventListener('resize', checkFooterIntersection, { passive: true });
    checkFooterIntersection();

    return () => {
      if (observer) observer.disconnect();
      window.removeEventListener('scroll', checkFooterIntersection);
      window.removeEventListener('resize', checkFooterIntersection);
    };
  }, []);

  // ── Cart-page half-peek logic ────────────────────────────────────────────
  // peekExpanded = true → fully slid in (for 5 s), false → half-hidden on right
  const [peekExpanded, setPeekExpanded] = useState(false);

  // Reset when navigating away from / back to cart
  useEffect(() => {
    setPeekExpanded(false);
  }, [isCartPage]);

  // Auto-collapse after 5 seconds
  useEffect(() => {
    if (!isCartPage || !peekExpanded) return;
    const timer = setTimeout(() => setPeekExpanded(false), 5000);
    return () => clearTimeout(timer);
  }, [isCartPage, peekExpanded]);

  const handleCartClick = () => {
    if (!peekExpanded) {
      // 1st click: slide fully in, start 5 s timer
      setPeekExpanded(true);
    } else {
      // 2nd click while fully visible: open modal
      setIsOpen(true);
    }
  };
  // ────────────────────────────────────────────────────────────────────────

  return (
    <>
      <style>{`
        @keyframes rentpe-spin-glow {
          0%   { transform: rotate(0deg);   }
          100% { transform: rotate(360deg); }
        }
        @keyframes rentpe-pulse-glow {
          0%, 100% { transform: scale(1);    opacity: 0.85; }
          50%       { transform: scale(1.08); opacity: 1;    }
        }
        .ai-fab-container {
          position: relative;
          width: 58px;
          height: 58px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .ai-fab-spinner {
          position: absolute;
          inset: -2px;
          background-image: linear-gradient(rgb(186, 66, 255) 35%, rgb(0, 225, 255));
          border-radius: 50%;
          filter: blur(2px);
          box-shadow:
            0px -4px 18px 0px rgba(186, 66, 255, 0.6),
            0px  4px 18px 0px rgba(0, 225, 255, 0.6);
          animation: rentpe-spin-glow 2s linear infinite;
        }
        .ai-fab-core {
          position: relative;
          z-index: 10;
          width: 50px;
          height: 50px;
          background-color: #121214;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(255, 255, 255, 0.15);
          box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.8);
          transition: transform 0.25s ease, background-color 0.25s ease;
        }
        .ai-fab-container:hover .ai-fab-core {
          transform: scale(1.06);
          background-color: #1a1a1f;
        }
        .ai-fab-container:active .ai-fab-core {
          transform: scale(0.94);
        }

        /* ── Cart-page peek wrapper ─────────────────────────────────────── */
        /* Default: push half the button (29px) off the right edge          */
        .ai-peek-wrapper {
          transform: translateX(calc(50% + 6px));
          transition: transform 0.45s cubic-bezier(0.16, 1, 0.3, 1);
          will-change: transform;
        }
        /* Expanded: fully slide into view */
        .ai-peek-wrapper.peek-expanded {
          transform: translateX(0px);
        }
      `}</style>

      {isCartPage ? (
        /* ══ CART PAGE: half-peek mode ════════════════════════════════════════ */
        <>
          <div
            className={`fixed bottom-6 right-0 z-40 ai-peek-wrapper${peekExpanded ? ' peek-expanded' : ''}`}
          >
            {/* pr-6 = 24px gap from screen edge when fully visible */}
            <div className="pr-6">
              <button
                onClick={handleCartClick}
                aria-label="Open RentPe AI Assistant"
                className="ai-fab-container focus:outline-none group cursor-pointer"
              >
                <div className="ai-fab-spinner" />
                <div className="ai-fab-core">
                  <Bot className="w-6 h-6 text-white group-hover:text-cyan-300 transition-colors duration-200" />
                </div>
              </button>
            </div>
          </div>

          <AIAssistantModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </>
      ) : (
        /* ══ ALL OTHER PAGES: original behaviour ══════════════════════════════ */
        <>
          <div
            className={`fixed bottom-6 right-6 z-40 transform ${
              isHidden
                ? 'opacity-0 scale-75 translate-y-6 pointer-events-none'
                : 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
            }`}
            style={{
              transition:
                'opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1), transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
              willChange: 'opacity, transform',
            }}
          >
            <button
              onClick={() => setIsOpen(true)}
              aria-label="Open RentPe AI Assistant"
              className="ai-fab-container focus:outline-none group cursor-pointer"
            >
              <div className="ai-fab-spinner" />
              <div className="ai-fab-core">
                <Bot className="w-6 h-6 text-white group-hover:text-cyan-300 transition-colors duration-200" />
              </div>
            </button>
          </div>

          <AIAssistantModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </>
      )}
    </>
  );
};
