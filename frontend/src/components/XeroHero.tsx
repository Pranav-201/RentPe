import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, ShieldCheck } from 'lucide-react';
import './XeroHero.css';

interface XeroHeroProps {
  onBrowseClick?: () => void;
  hideNav?: boolean;
}

const campusEngineeringProducts = [
  'Scientific Calculator',
  'Study Chair',
  'Ergonomic Table',
  'Mini Drafter',
  'Engineering Graphics Board',
  'Lab Coat & Goggles',
  'Workshop Apron',
  'Laptop Stand',
  'LED Desk Lamp',
  'Extension Board',
  'Bookshelf Unit',
  'Wi-Fi Router',
  'Wireless Mouse',
  'External Monitor',
  'Headphones',
  'HD Projector',
  'Kindle Reader',
  'Campus Bicycle',
  'Bluetooth Speaker',
  'Storage Organizer',
];

export const XeroHero: React.FC<XeroHeroProps> = ({ onBrowseClick, hideNav = false }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // References requested by specs
  const pipelineRef = useRef<HTMLDivElement>(null);
  const nodeStackRef = useRef<HTMLDivElement>(null);
  const nodeXRef = useRef<HTMLDivElement>(null);
  const nodeShieldRef = useRef<HTMLDivElement>(null);
  const beamGlowRef = useRef<SVGPathElement>(null);
  const beamCoreRef = useRef<SVGPathElement>(null);
  const beamGradientRef = useRef<SVGLinearGradientElement>(null);
  const splashRef = useRef<HTMLDivElement>(null);

  const handleBrowseScroll = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (onBrowseClick) {
      onBrowseClick();
    } else {
      document.getElementById('browse-section')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Toggle mobile menu & overflow
  const toggleMobileMenu = () => {
    setMobileMenuOpen((prev) => {
      const next = !prev;
      if (next) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
      return next;
    });
  };

  // Cleanup overflow on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // Beam Animation & Path calculation effect
  useEffect(() => {
    let animFrameId: number;
    let state: 'p1' | 'splash' | 'p2' | 'idle' = 'p1';
    let lastStateChange = performance.now();

    const updatePath = () => {
      if (
        !pipelineRef.current ||
        !nodeStackRef.current ||
        !nodeXRef.current ||
        !nodeShieldRef.current
      )
        return;

      const pRect = pipelineRef.current.getBoundingClientRect();
      const sRect = nodeStackRef.current.getBoundingClientRect();
      const xRect = nodeXRef.current.getBoundingClientRect();
      const shRect = nodeShieldRef.current.getBoundingClientRect();

      const startX = sRect.left + sRect.width / 2 - pRect.left;
      const startY = sRect.top + sRect.height / 2 - pRect.top;
      const midX = xRect.left + xRect.width / 2 - pRect.left;
      const midY = xRect.top + xRect.height / 2 - pRect.top;
      const endX = shRect.left + shRect.width / 2 - pRect.left;
      const endY = shRect.top + shRect.height / 2 - pRect.top;

      const d = `M ${startX},${startY} L ${midX},${midY} L ${endX},${endY}`;

      if (beamGlowRef.current) beamGlowRef.current.setAttribute('d', d);
      if (beamCoreRef.current) beamCoreRef.current.setAttribute('d', d);
    };

    const animate = (now: number) => {
      const elapsed = now - lastStateChange;
      const gradient = beamGradientRef.current;
      const glowPath = beamGlowRef.current;
      const corePath = beamCoreRef.current;
      const splash = splashRef.current;
      const nodeStack = nodeStackRef.current;
      const nodeShield = nodeShieldRef.current;

      if (state === 'p1') {
        const p1Duration = 800;
        const progress = Math.min(elapsed / p1Duration, 1);
        const percentage = progress * 0.5; // 0 → 0.5

        if (percentage < 0.4) {
          nodeStack?.classList.add('active');
        } else {
          nodeStack?.classList.remove('active');
        }

        if (glowPath) glowPath.style.opacity = '0.6';
        if (corePath) corePath.style.opacity = '1';

        if (gradient) {
          const center = percentage * 100;
          gradient.setAttribute('x1', `${center - 5}%`);
          gradient.setAttribute('x2', `${center + 5}%`);
          gradient.setAttribute('y1', '0%');
          gradient.setAttribute('y2', '0%');
        }

        if (elapsed >= p1Duration) {
          nodeStack?.classList.remove('active');
          state = 'splash';
          lastStateChange = now;
          if (glowPath) glowPath.style.opacity = '0';
          if (corePath) corePath.style.opacity = '0';
          splash?.classList.add('animate');
        }
      } else if (state === 'splash') {
        const splashDuration = 800;
        if (elapsed >= splashDuration) {
          splash?.classList.remove('animate');
          if (glowPath) glowPath.style.opacity = '0.6';
          if (corePath) corePath.style.opacity = '1';
          state = 'p2';
          lastStateChange = now;
        }
      } else if (state === 'p2') {
        const p2Duration = 800;
        const progress = Math.min(elapsed / p2Duration, 1);
        const percentage = 0.5 + progress * 0.5; // 0.5 → 1.0

        if (percentage > 0.6) {
          nodeShield?.classList.add('active');
        } else {
          nodeShield?.classList.remove('active');
        }

        if (gradient) {
          const center = percentage * 100;
          gradient.setAttribute('x1', `${center - 5}%`);
          gradient.setAttribute('x2', `${center + 5}%`);
          gradient.setAttribute('y1', '0%');
          gradient.setAttribute('y2', '0%');
        }

        if (elapsed >= p2Duration) {
          nodeShield?.classList.remove('active');
          state = 'idle';
          lastStateChange = now;
        }
      } else if (state === 'idle') {
        const idleDuration = 1000;
        if (elapsed >= idleDuration) {
          state = 'p1';
          lastStateChange = now;
        }
      }

      animFrameId = requestAnimationFrame(animate);
    };

    // Initial path measurement
    updatePath();
    window.addEventListener('resize', updatePath);
    animFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('resize', updatePath);
    };
  }, []);

  return (
    <div className="xero-landing-body">
      {/* 1. Sticky-style Top NAVBAR (rendered if hideNav is false) */}
      {!hideNav && (
        <nav className="xero-nav">
          <Link to="/" className="nav-logo flex items-center">
            <img
              src="/rentpe-logo.png"
              alt="RentPe"
              style={{ height: '48px', width: 'auto', objectFit: 'contain' }}
            />
          </Link>

          <button
            className={`menu-toggle ${mobileMenuOpen ? 'active' : ''}`}
            onClick={toggleMobileMenu}
            aria-label="Toggle navigation menu"
          >
            <span />
            <span />
          </button>

          <div className={`nav-menu ${mobileMenuOpen ? 'active' : ''}`}>
            <ul className="nav-links">
              <li>
                <a
                  href="#browse-section"
                  onClick={(e) => {
                    setMobileMenuOpen(false);
                    handleBrowseScroll(e);
                  }}
                >
                  Browse Items
                </a>
              </li>
              <li>
                <a
                  href="#browse-section"
                  onClick={(e) => {
                    setMobileMenuOpen(false);
                    handleBrowseScroll(e);
                  }}
                >
                  Categories
                </a>
              </li>
              <li>
                <Link
                  to="/auth"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  List Item
                </Link>
              </li>
            </ul>

            <div className="nav-actions">
              <Link
                to="/auth"
                className="btn-login"
                onClick={() => setMobileMenuOpen(false)}
              >
                Log in
              </Link>
              <Link
                to="/auth?mode=register"
                className="btn-signup"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign up
              </Link>
            </div>
          </div>
        </nav>
      )}

      {/* 2. HERO CARD */}
      <section className="hero-card">
        {/* Crosshatch grid overlay inside arc */}
        <div className="hero-grid" />

        {/* Animated Icon Pipeline */}
        <div className="icon-pipeline" ref={pipelineRef}>
          {/* Animated SVG Beam overlay */}
          <svg className="beam-svg">
            <defs>
              <filter
                id="glow"
                x="-20%"
                y="-20%"
                width="140%"
                height="140%"
              >
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feComposite
                  in="SourceGraphic"
                  in2="blur"
                  operator="over"
                />
              </filter>

              <linearGradient
                id="beam-gradient"
                gradientUnits="userSpaceOnUse"
                ref={beamGradientRef}
              >
                <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0" />
                <stop offset="20%" stopColor="#0ea5e9" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#fff" stopOpacity="1" />
                <stop offset="80%" stopColor="#38bdf8" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
              </linearGradient>
            </defs>

            <path
              ref={beamGlowRef}
              stroke="url(#beam-gradient)"
              strokeWidth="2"
              filter="url(#glow)"
              opacity="0.6"
              fill="none"
              strokeLinecap="round"
            />
            <path
              ref={beamCoreRef}
              stroke="url(#beam-gradient)"
              strokeWidth="0.8"
              opacity="1"
              fill="none"
              strokeLinecap="round"
            />
          </svg>

          {/* Left Node (College Student Icon) */}
          <div
            className="icon-node node-light-right"
            id="node-stack"
            ref={nodeStackRef}
          >
            <GraduationCap className="w-5 h-5 text-white/80" />
          </div>

          {/* Left Pipeline Line */}
          <div className="pipeline-line" />

          {/* Center Wrapper (Splash + Verification Node) */}
          <div className="center-wrapper">
            <div className="splash" ref={splashRef} />
            <div
              className="icon-node-center"
              id="node-x"
              ref={nodeXRef}
            >
              <ShieldCheck className="w-7 h-7 text-white" />
            </div>
          </div>

          {/* Right Pipeline Line */}
          <div className="pipeline-line right" />

          {/* Right Node (Indian Rupee Stacked Cash Notes Icon matching user reference image) */}
          <div
            className="icon-node node-light-left"
            id="node-shield"
            ref={nodeShieldRef}
          >
            <svg
              viewBox="0 0 32 24"
              className="w-6 h-5 text-white"
            >
              {/* Back Angled Cash Note */}
              <g transform="rotate(-9 16 12)">
                <rect
                  x="5"
                  y="4"
                  width="22"
                  height="13"
                  rx="1.2"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeOpacity="0.65"
                />
                <circle
                  cx="16"
                  cy="10.5"
                  r="2.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeOpacity="0.5"
                />
              </g>

              {/* Front Cash Note */}
              <g>
                {/* Dark Masking Rect behind front note */}
                <rect x="2" y="7" width="23" height="13.5" rx="1.2" fill="#14141d" />

                {/* Outer Border */}
                <rect
                  x="2"
                  y="7"
                  width="23"
                  height="13.5"
                  rx="1.2"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                />

                {/* Inner Framing Border */}
                <rect
                  x="3.8"
                  y="8.5"
                  width="19.4"
                  height="10.5"
                  rx="0.6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.8"
                  strokeOpacity="0.4"
                />

                {/* Solid Left & Right Dots */}
                <circle cx="6.5" cy="13.75" r="1.1" fill="currentColor" />
                <circle cx="20.5" cy="13.75" r="1.1" fill="currentColor" />

                {/* Solid Center Circle */}
                <circle cx="13.5" cy="13.75" r="3.6" fill="currentColor" />

                {/* Cutout Rupee Symbol ₹ inside Center Circle */}
                <path
                  d="M12.0 11.9H15.0 M12.0 13.0H15.0 M12.0 11.9V13.8C12.0 14.5 12.7 14.8 13.4 14.8 M13.0 14.2L14.7 16.3"
                  fill="none"
                  stroke="#14141d"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            </svg>
          </div>
        </div>

        {/* Hero Text tailored for RentPe */}
        <div className="hero-content">
          <h1 className="hero-heading">
            <span className="hero-heading-line1">Rent what you need</span>
            <strong className="hero-heading-line2">Share what you have.</strong>
          </h1>
          <p className="hero-sub">
            Turn unused stuff into value and
            <br />
            get what you need without the cost of buying new.
          </p>

          <div
            className="hero-action-buttons"
            style={{
              display: 'flex',
              gap: '14px',
              alignItems: 'center',
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            <button
              onClick={handleBrowseScroll}
              className="btn-cta"
              style={{ border: 'none', cursor: 'pointer' }}
            >
              Browse Rentals
            </button>
            <Link
              to="/admin"
              className="btn-login"
              style={{
                padding: '12px 28px',
                fontSize: '0.9rem',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              + List an Item
            </Link>
          </div>
        </div>
      </section>

      {/* 3. MARQUEE PRODUCTS TICKER (Engineering & Campus Essentials) */}
      <div className="marquee-container">
        <div className="marquee-content">
          {[...campusEngineeringProducts, ...campusEngineeringProducts].map((product, idx) => (
            <span key={idx} className="marquee-item">
              {product}
              <span className="marquee-dot" />
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default XeroHero;
