import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Star,
  Save,
} from 'lucide-react';
import { userApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function ProfilePage() {
  const { user, updateCurrentUser, logout } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    contactInfo: '',
    profilePicture: '',
  });

  const [loading, setLoading] = useState(false);
  const [deactivating, setDeactivating] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        contactInfo: user.contactInfo || '',
        profilePicture: user.profilePicture || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await userApi.updateProfile({
        name: formData.name.trim(),
        contactInfo: formData.contactInfo.trim(),
        profilePicture: formData.profilePicture.trim(),
      });

      if (res.data?.data?.user) {
        updateCurrentUser(res.data.data.user);
        showSuccess('Profile updated.');
      }
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async () => {
    if (!window.confirm('Are you sure you want to deactivate your account?')) return;
    try {
      setDeactivating(true);
      await userApi.deleteProfile();
      showSuccess('Account deactivated.');
      await logout();
      navigate('/login');
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to deactivate account.');
    } finally {
      setDeactivating(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#01140F] dark:text-[#f0f6f4] tracking-tight">
          Profile Settings
        </h1>
        <p className="text-xs text-[#516B71] dark:text-[#8fa6a4]">
          Manage your personal details and contact preferences.
        </p>
      </div>

      {/* User card */}
      <div className="bg-white dark:bg-[#14201e] rounded-2xl border border-[#A3B0AF]/25 dark:border-[#283d39] p-5 flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-[#36586A] dark:bg-[#50829C] text-[#AAA86D] dark:text-[#f0f6f4] text-lg font-bold flex items-center justify-center uppercase overflow-hidden shrink-0">
          {formData.profilePicture ? (
            <img src={formData.profilePicture} alt="" className="w-full h-full object-cover" />
          ) : (
            user?.name?.charAt(0) || 'U'
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-sm text-[#01140F] dark:text-[#f0f6f4] truncate">{user?.name}</h3>
          <p className="text-xs text-[#516B71] dark:text-[#8fa6a4] truncate">{user?.email}</p>
          <div className="flex items-center gap-2 mt-1 text-[11px] text-[#516B71] dark:text-[#8fa6a4]">
            <span className="capitalize">{user?.role || 'student'}</span>
            <span>•</span>
            <span className="flex items-center gap-0.5 text-[#01140F] dark:text-[#f0f6f4] font-semibold">
              <Star className="w-3 h-3 fill-[#AAA86D] dark:fill-[#c4c184] text-[#AAA86D] dark:text-[#c4c184]" />
              {user?.rating?.average?.toFixed(1) || '0.0'} ({user?.rating?.count || 0} reviews)
            </span>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-[#14201e] rounded-2xl border border-[#A3B0AF]/25 dark:border-[#283d39] p-6 space-y-4 text-xs">
        <div>
          <label className="block font-semibold text-[#01140F] dark:text-[#f0f6f4] mb-1">Full Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#A3B0AF]/30 dark:border-[#283d39] bg-white dark:bg-[#0e1716] focus:outline-none focus:ring-2 focus:ring-[#36586A]/30 text-[#01140F] dark:text-[#f0f6f4]"
          />
        </div>

        <div>
          <label className="block font-semibold text-[#A3B0AF] dark:text-[#6c8280] mb-1">College Email</label>
          <input
            type="email"
            value={user?.email || ''}
            disabled
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#A3B0AF]/20 dark:border-[#283d39] bg-[#F7F8FA] dark:bg-[#0e1716]/60 text-[#A3B0AF] dark:text-[#6c8280] cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block font-semibold text-[#01140F] dark:text-[#f0f6f4] mb-1">Contact Info (Phone / Telegram)</label>
          <input
            type="text"
            name="contactInfo"
            value={formData.contactInfo}
            onChange={handleChange}
            placeholder="+91 98765 43210"
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#A3B0AF]/30 dark:border-[#283d39] bg-white dark:bg-[#0e1716] focus:outline-none focus:ring-2 focus:ring-[#36586A]/30 text-[#01140F] dark:text-[#f0f6f4]"
          />
          <span className="text-[11px] text-[#A3B0AF] dark:text-[#6c8280] mt-0.5 block">Shared only with accepted borrow partners.</span>
        </div>

        <div>
          <label className="block font-semibold text-[#01140F] dark:text-[#f0f6f4] mb-1">Profile Picture URL</label>
          <input
            type="url"
            name="profilePicture"
            value={formData.profilePicture}
            onChange={handleChange}
            placeholder="https://..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#A3B0AF]/30 dark:border-[#283d39] bg-white dark:bg-[#0e1716] focus:outline-none focus:ring-2 focus:ring-[#36586A]/30 text-[#01140F] dark:text-[#f0f6f4]"
          />
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 rounded-xl font-bold text-white bg-[#01140F] dark:bg-[#36586A] hover:bg-[#36586A] dark:hover:bg-[#47768E] transition flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            {loading ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>

      {/* Account actions */}
      <div className="p-4 bg-white dark:bg-[#14201e] rounded-2xl border border-[#A3B0AF]/20 dark:border-[#283d39] flex items-center justify-between text-xs">
        <div>
          <span className="font-semibold text-[#01140F] dark:text-[#f0f6f4] block">Deactivate Account</span>
          <span className="text-[11px] text-[#A3B0AF] dark:text-[#6c8280]">Temporarily disable your profile and listings</span>
        </div>
        <button
          onClick={handleDeactivate}
          disabled={deactivating}
          className="text-xs font-semibold text-rose-700 dark:text-rose-400 hover:underline"
        >
          {deactivating ? 'Deactivating...' : 'Deactivate'}
        </button>
      </div>
    </div>
  );
}
