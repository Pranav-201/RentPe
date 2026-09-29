import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer id="app-footer" className="w-full bg-black overflow-hidden pt-20 sm:pt-28 md:pt-36 pb-0 select-none relative z-10 pointer-events-none">
      <div className="w-full flex items-end justify-center overflow-hidden">
        <span
          className="w-full text-center font-extrabold whitespace-nowrap tracking-[-0.035em] leading-[0.72] text-[27vw] text-transparent bg-clip-text bg-gradient-to-b from-[#6b6d80] via-[#3a3b4a] to-[#121218] translate-y-[3%]"
          style={{
            fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            display: 'block',
          }}
        >
          RentPe
        </span>
      </div>
    </footer>
  );
};



