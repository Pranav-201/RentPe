import React, { useState, useEffect } from 'react';
import { X, Check, Loader2 } from 'lucide-react';

export const BUILT_IN_AVATARS = [
  '/avtar1.jpg',
  '/avtar2.jpg',
  '/avtar3.jpg',
  '/avtar4.jpg',
  '/avtar5.jpg',
  '/avtar6.png',
  '/avtar7.webp',
  '/avtar8.jpg',
];

interface AvatarSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatar?: string;
  onSave: (avatarUrl: string) => Promise<void>;
}

export const AvatarSelectModal: React.FC<AvatarSelectModalProps> = ({
  isOpen,
  onClose,
  currentAvatar,
  onSave,
}) => {
  const [selectedAvatar, setSelectedAvatar] = useState<string>(
    currentAvatar || BUILT_IN_AVATARS[0]
  );
  const [isSaving, setIsSaving] = useState(false);

  // Sync current avatar when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedAvatar(currentAvatar || BUILT_IN_AVATARS[0]);
    }
  }, [isOpen, currentAvatar]);

  // Handle escape key and body scroll lock
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSaving) onClose();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isSaving, onClose]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (isSaving) return;
    try {
      setIsSaving(true);
      await onSave(selectedAvatar);
      onClose();
    } catch {
      // Error handling is managed by onSave / ToastContext
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={() => !isSaving && onClose()}
      />

      {/* Dialog container */}
      <div
        className="relative w-full max-w-lg bg-[#16171b] border border-zinc-700/80 rounded-2xl shadow-2xl p-5 sm:p-6 z-10 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-zinc-800">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">Choose Avatar</h3>
            <p className="text-xs text-zinc-400 mt-0.5">Select one of the 8 built-in profile avatars</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors disabled:opacity-50 cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Avatars Grid (Responsive 2 cols on tiny, 4 cols on standard/desktop) */}
        <div className="grid grid-cols-2 min-[400px]:grid-cols-4 gap-4 sm:gap-5 py-2">
          {BUILT_IN_AVATARS.map((avatarUrl, index) => {
            const isSelected = selectedAvatar === avatarUrl;
            return (
              <button
                key={avatarUrl}
                type="button"
                onClick={() => setSelectedAvatar(avatarUrl)}
                className={`group relative flex flex-col items-center justify-center p-2 rounded-2xl transition-all cursor-pointer focus:outline-none ${
                  isSelected
                    ? 'bg-zinc-800/90 ring-2 ring-emerald-500 shadow-lg shadow-emerald-950/40'
                    : 'bg-zinc-900/60 hover:bg-zinc-800/50 border border-zinc-800 hover:border-zinc-700'
                }`}
                aria-label={`Avatar option ${index + 1}`}
              >
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border border-zinc-700/80 shadow-inner group-hover:scale-105 transition-transform duration-200">
                  <img
                    src={avatarUrl}
                    alt={`Avatar ${index + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {isSelected && (
                    <div className="absolute inset-0 bg-emerald-950/30 backdrop-blur-[1px] flex items-center justify-center">
                      <div className="w-6 h-6 rounded-full bg-emerald-500 text-zinc-950 flex items-center justify-center shadow-md">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                    </div>
                  )}
                </div>
                <span className="text-[11px] font-medium text-zinc-400 mt-2 font-mono group-hover:text-zinc-200">
                  Avatar {index + 1}
                </span>
              </button>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-5 mt-4 border-t border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white hover:bg-zinc-800 border border-zinc-700 transition-colors disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 active:scale-95 transition-all shadow-md shadow-emerald-950/50 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving Avatar...</span>
              </>
            ) : (
              <span>Save Avatar</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
