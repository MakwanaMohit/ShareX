import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  Image as ImageIcon,
  Star,
  ShieldCheck,
  Calendar,
  Save,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import { userApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function ProfilePage() {
  const { user, updateCurrentUser, refreshProfile, logout } = useAuth();
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
        showSuccess('Profile updated successfully!');
      }
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async () => {
    if (!window.confirm('Are you sure you want to deactivate your ShareX account? You will be logged out.')) {
      return;
    }

    try {
      setDeactivating(true);
      await userApi.deleteProfile();
      showSuccess('Account deactivated successfully.');
      await logout();
      navigate('/login');
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to deactivate account.');
    } finally {
      setDeactivating(false);
    }
  };

  return (
    <div className="space-y-8 pb-16 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          My Account Profile
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage your personal information, contact methods, and student identity
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Profile Summary Card (4 cols) */}
        <div className="md:col-span-4 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm text-center space-y-4">
          <div className="relative mx-auto w-24 h-24 rounded-full overflow-hidden bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-3xl shadow-md">
            {formData.profilePicture ? (
              <img
                src={formData.profilePicture}
                alt={user?.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            ) : (
              user?.name?.charAt(0) || 'U'
            )}
          </div>

          <div>
            <h3 className="font-extrabold text-lg text-slate-900">{user?.name}</h3>
            <p className="text-xs text-slate-500">{user?.email}</p>
            <div className="mt-2 inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 capitalize border border-indigo-100">
              <ShieldCheck className="w-3.5 h-3.5" />
              Role: {user?.role || 'student'}
            </div>
          </div>

          {/* Rating overview */}
          <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-2xl text-xs space-y-1">
            <span className="text-amber-800 font-semibold block">Campus Reputation</span>
            <div className="flex items-center justify-center gap-1.5 text-base font-extrabold text-amber-600">
              <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
              {user?.rating?.average?.toFixed(1) || '0.0'}
            </div>
            <span className="text-[11px] text-amber-700">
              Based on {user?.rating?.count || 0} reviews
            </span>
          </div>

          <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-center gap-1">
            <Calendar className="w-3.5 h-3.5" /> Member since{' '}
            {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
          </div>
        </div>

        {/* Edit Form (8 cols) */}
        <div className="md:col-span-8 space-y-6">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5"
          >
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              Edit Details
            </h3>

            {/* Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-indigo-600" /> Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-medium text-slate-800"
              />
            </div>

            {/* Email (Read only) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" /> University Email (Permanent)
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 text-xs font-medium cursor-not-allowed"
              />
            </div>

            {/* Contact Info */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-indigo-600" /> Contact Info (Phone / WhatsApp / Telegram)
              </label>
              <input
                type="text"
                name="contactInfo"
                value={formData.contactInfo}
                onChange={handleChange}
                placeholder="+91 98765 43210 or @telegram_handle"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs text-slate-800 placeholder:text-slate-400"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Visible to accepted borrow partners for easy item handoffs.
              </span>
            </div>

            {/* Profile Picture URL */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-indigo-600" /> Profile Avatar URL
              </label>
              <input
                type="url"
                name="profilePicture"
                value={formData.profilePicture}
                onChange={handleChange}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs text-slate-800 placeholder:text-slate-400"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition shadow-md shadow-indigo-200"
              >
                <Save className="w-4 h-4" />
                {loading ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>

          {/* Account Danger Zone */}
          <div className="p-6 bg-rose-50/60 border border-rose-200 rounded-3xl space-y-3">
            <h4 className="text-xs font-bold text-rose-800 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-600" /> Deactivate Account
            </h4>
            <p className="text-xs text-rose-700 leading-relaxed">
              Temporarily or permanently disable your account. Your active listings will be hidden from the campus marketplace.
            </p>
            <button
              onClick={handleDeactivate}
              disabled={deactivating}
              className="px-4 py-2 rounded-xl text-xs font-bold text-rose-700 bg-white border border-rose-300 hover:bg-rose-100 transition"
            >
              {deactivating ? 'Deactivating...' : 'Deactivate My Account'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
