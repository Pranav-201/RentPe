import React, { useState, useEffect } from 'react';
import { X, GraduationCap, RotateCw, MapPinOff } from 'lucide-react';

interface CampusSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CampusSearchModal: React.FC<CampusSearchModalProps> = ({ isOpen, onClose }) => {
  const [isScanning, setIsScanning] = useState(true);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOpen) {
      setIsScanning(true);
      timer = setTimeout(() => {
        setIsScanning(false);
      }, 4000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isOpen]);

  const handleScanAgain = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
    }, 4000);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <style>{`
        .radar-loader-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .radar-loader {
          position: relative;
          width: 150px;
          height: 150px;
          background: transparent;
          border-radius: 50%;
          box-shadow: 25px 25px 75px rgba(0,0,0,0.55);
          border: 1px solid #333;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .radar-loader::before {
          content: '';
          position: absolute;
          inset: 20px;
          background: transparent;
          border: 1px dashed #444;
          border-radius: 50%;
          box-shadow: inset -5px -5px 25px rgba(0,0,0,0.25),
          inset 5px 5px 35px rgba(0,0,0,0.25);
        }

        .radar-loader::after {
          content: '';
          position: absolute;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          border: 1px dashed #444;
          box-shadow: inset -5px -5px 25px rgba(0,0,0,0.25),
          inset 5px 5px 35px rgba(0,0,0,0.25);
        }

        .radar-loader span {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 50%;
          height: 100%;
          background: transparent;
          transform-origin: top left;
          animation: radar81 2s linear infinite;
          border-top: 1px dashed #fff;
        }

        .radar-loader span::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: seagreen;
          transform-origin: top left;
          transform: rotate(-55deg);
          filter: blur(30px) drop-shadow(20px 20px 20px seagreen);
        }

        @keyframes radar81 {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>

      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl overflow-hidden animate-in zoom-in-95 duration-200 relative"
        style={{
          background: '#0d0d0f',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 24px 70px rgba(0,0,0,0.9), 0 0 40px rgba(46, 139, 87, 0.1)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800/80 bg-zinc-900/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center border border-zinc-700/60">
              <GraduationCap className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white tracking-tight">Campus Search</h3>
              <p className="text-[11px] text-zinc-500 font-mono">Radar Location Detection</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 flex flex-col items-center justify-center text-center min-h-[300px]">
          {isScanning ? (
            <div className="flex flex-col items-center space-y-5 animate-in fade-in duration-300">
              <div className="radar-loader-wrapper">
                <div className="radar-loader">
                  <span />
                </div>
              </div>
              <div className="space-y-1.5">
                <h4 className="text-base font-semibold text-white tracking-tight">
                  Scanning for nearby colleges...
                </h4>
                <p className="text-xs text-zinc-400 max-w-xs">
                  Searching campus nodes and active student communities in your perimeter.
                </p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-800/40 text-[11px] font-mono text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                Radar Active
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-4 py-4 animate-in fade-in duration-300">
              <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 shadow-inner">
                <MapPinOff className="w-8 h-8 text-zinc-500" />
              </div>
              <div className="space-y-1.5">
                <h4 className="text-base font-semibold text-white tracking-tight">
                  No college found
                </h4>
                <p className="text-xs text-zinc-400 max-w-xs leading-relaxed">
                  We couldn't find any registered colleges in your current radius. Real-time campus search and nearby college item listings will be available here soon!
                </p>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={handleScanAgain}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700 transition-colors cursor-pointer"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Scan Again</span>
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
