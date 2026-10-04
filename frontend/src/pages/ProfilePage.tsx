import React, { useState } from 'react';
import {
  Settings,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AvatarSelectModal } from '../components/profile/AvatarSelectModal';

export const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  // Split name into first and last
  const [firstName, setFirstName] = useState(() => {
    const parts = (user?.name || '').trim().split(' ');
    return parts[0] || '';
  });
  const [lastName, setLastName] = useState(() => {
    const parts = (user?.name || '').trim().split(' ');
    return parts.slice(1).join(' ') || '';
  });

  const [phone, setPhone] = useState(user?.phone || '');
  const [collegeName, setCollegeName] = useState(user?.collegeName || '');
  const [collegeId, setCollegeId] = useState(user?.collegeId || '');
  const [address, setAddress] = useState({
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    zipCode: user?.address?.zipCode || '',
    country: user?.address?.country || 'India',
  });

  const [activeTab, setActiveTab] = useState<'account' | 'address'>('account');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Synchronize form values whenever user state updates
  React.useEffect(() => {
    if (user) {
      const parts = (user.name || '').trim().split(' ');
      setFirstName(parts[0] || '');
      setLastName(parts.slice(1).join(' ') || '');
      setPhone(user.phone || '');
      setCollegeName(user.collegeName || '');
      setCollegeId(user.collegeId || '');
      setAddress({
        street: user.address?.street || '',
        city: user.address?.city || '',
        state: user.address?.state || '',
        zipCode: user.address?.zipCode || '',
        country: user.address?.country || 'India',
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const fullName = [firstName.trim(), lastName.trim()].filter(Boolean).join(' ');
      await updateProfile({
        name: fullName,
        phone,
        collegeName,
        collegeId,
        address,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      // Toast error is already handled in AuthContext
    } finally {
      setSaving(false);
    }
  };

  const initials = (firstName || user?.name || 'U')
    .slice(0, 1)
    .toUpperCase() + (lastName ? lastName.slice(0, 1).toUpperCase() : '');

  const labelClass = 'block text-sm font-semibold text-zinc-300 mb-2.5';
  const fieldClass = 'w-full px-5 py-3.5 rounded-xl bg-[#18191b] border border-[#303238] text-zinc-100 text-base focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/30 transition-all placeholder:text-zinc-500';

  return (
    <div className="page-container py-10">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm font-medium text-zinc-400 mb-6">
          <Settings className="w-4 h-4 text-zinc-400" />
          <span>Settings</span>
          <span className="text-zinc-600">/</span>
          <span className="text-zinc-200">
            {activeTab === 'account' ? 'My Account' : 'Address & Campus'}
          </span>
        </div>

        {/* Tab Navigation Pill Bar */}
        <div className="inline-flex items-center gap-1 p-1 bg-zinc-900/90 border border-zinc-800 rounded-xl mb-8">
          <button
            type="button"
            onClick={() => setActiveTab('account')}
            className={`px-4 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all ${
              activeTab === 'account'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            My Account
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('address')}
            className={`px-4 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all ${
              activeTab === 'address'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Address & Campus
          </button>
        </div>

        {/* Section Header */}
        <div className="mb-6">
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            {activeTab === 'account' ? 'My Account' : 'Address & Campus Details'}
          </h1>
          <p className="text-xs md:text-sm text-zinc-400 mt-1">
            {activeTab === 'account'
              ? 'Manage your account information, such as your name, email address and contact details.'
              : 'Manage your campus location and delivery address preferences for equipment rental.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {activeTab === 'account' && (
            <>
              {/* Avatar Row */}
              <div className="flex items-center gap-4 pb-2">
                <div className="relative">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name || 'User avatar'}
                      className="w-16 h-16 rounded-full object-cover border border-zinc-700 select-none shadow-inner"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 border border-zinc-700 flex items-center justify-center text-white font-bold text-lg select-none shadow-inner">
                      {initials || 'U'}
                    </div>
                  )}
                  <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-zinc-950" />
                </div>

                <div>
                  <button
                    type="button"
                    onClick={() => setIsAvatarModalOpen(true)}
                    className="px-3.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700 transition-colors cursor-pointer"
                  >
                    Change Avatar
                  </button>
                  <p className="text-[11px] text-zinc-500 mt-1.5">
                    Choose from 8 built-in RentPe avatars
                  </p>
                </div>
              </div>

              {/* Names 2-Col Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>
                    First Name
                  </label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First name"
                    className={fieldClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last name"
                    className={fieldClass}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className={labelClass}>
                  Email
                </label>
                <div className="relative flex items-center">
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className={`${fieldClass} bg-[#141517] text-zinc-400 cursor-not-allowed font-mono`}
                  />
                  <span className="absolute right-3 text-[10px] text-zinc-500 font-mono">
                    read-only
                  </span>
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className={labelClass}>
                  Phone Number
                </label>
                <div className="flex items-center rounded-xl bg-[#18191b] border border-[#303238] focus-within:border-zinc-500 focus-within:ring-1 focus-within:ring-zinc-500/30 transition-all px-4 py-1.5">
                  <span className="text-sm mr-2 select-none" role="img" aria-label="India flag">
                    🇮🇳
                  </span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91-83283-92296"
                    className="w-full py-2 bg-transparent text-zinc-100 text-base focus:outline-none placeholder:text-zinc-500"
                  />
                </div>
              </div>

              {/* College / Organization */}
              <div>
                <label className={labelClass}>
                  College / Campus or Company
                </label>
                <input
                  type="text"
                  value={collegeName}
                  onChange={(e) => setCollegeName(e.target.value)}
                  placeholder="e.g. IIT Bombay / Product Designer At Accenture"
                  className={fieldClass}
                />
              </div>

              {/* Student ID / Roll No */}
              <div>
                <label className={labelClass}>
                  Student ID / Roll No (Optional)
                </label>
                <input
                  type="text"
                  value={collegeId}
                  onChange={(e) => setCollegeId(e.target.value)}
                  placeholder="e.g. 21BCE1042"
                  className={fieldClass}
                />
              </div>
            </>
          )}

          {activeTab === 'address' && (
            <>
              {/* Street */}
              <div>
                <label className={labelClass}>
                  Street / Hostel / Room No
                </label>
                <input
                  type="text"
                  value={address.street}
                  onChange={(e) => setAddress({ ...address, street: e.target.value })}
                  placeholder="e.g. Room 204, Hostel Block A"
                  className={fieldClass}
                />
              </div>

              {/* City & State */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>
                    City
                  </label>
                  <input
                    type="text"
                    value={address.city}
                    onChange={(e) => setAddress({ ...address, city: e.target.value })}
                    placeholder="City"
                    className={fieldClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    State
                  </label>
                  <input
                    type="text"
                    value={address.state}
                    onChange={(e) => setAddress({ ...address, state: e.target.value })}
                    placeholder="State"
                    className={fieldClass}
                  />
                </div>
              </div>

              {/* Zip Code & Country */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>
                    Zip Code
                  </label>
                  <input
                    type="text"
                    value={address.zipCode}
                    onChange={(e) => setAddress({ ...address, zipCode: e.target.value })}
                    placeholder="e.g. 400076"
                    className={fieldClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    Country
                  </label>
                  <input
                    type="text"
                    value={address.country}
                    onChange={(e) => setAddress({ ...address, country: e.target.value })}
                    placeholder="India"
                    className={fieldClass}
                  />
                </div>
              </div>
            </>
          )}

          {/* Action Save Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className={`px-5 py-2.5 rounded-lg font-semibold text-xs md:text-sm flex items-center justify-center gap-2 transition-all ${
                saved
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-zinc-950 hover:bg-zinc-200 active:scale-95 shadow-sm'
              } disabled:opacity-60`}
            >
              {saved ? (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Saved
                </>
              ) : saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                </>
              ) : (
                'Save'
              )}
            </button>
          </div>
        </form>
      </div>

      <AvatarSelectModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        currentAvatar={user?.avatar}
        onSave={async (avatarUrl) => {
          await updateProfile({ avatar: avatarUrl });
        }}
      />
    </div>
  );
};
