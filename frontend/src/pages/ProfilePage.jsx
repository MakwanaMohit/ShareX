import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Star,
  Save,
  Upload,
  Camera,
  Trash2,
} from 'lucide-react';
import { userApi, uploadApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatMediaUrl } from '../utils/media';

const avatarPresets = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80',
];

export default function ProfilePage() {
  const { user, updateCurrentUser, logout } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    contactInfo: '',
    profilePicture: '',
  });

  const [loading, setLoading] = useState(false);
  const [processingImage, setProcessingImage] = useState(false);
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

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setProcessingImage(true);
      const uploadData = new FormData();
      uploadData.append('file', file);

      const res = await uploadApi.uploadProfile(uploadData);
      const savedPath = res.data?.data?.url;

      if (savedPath) {
        setFormData((prev) => ({ ...prev, profilePicture: savedPath }));
        showSuccess('Photo uploaded to storage. Click "Save Profile" to finalize.');
      }
    } catch (err) {
      console.error('Image upload failed:', err);
      showError(err.response?.data?.message || 'Failed to upload image file');
    } finally {
      setProcessingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemovePhoto = () => {
    setFormData((prev) => ({ ...prev, profilePicture: '' }));
  };

  const handlePresetSelect = (presetUrl) => {
    setFormData((prev) => ({ ...prev, profilePicture: presetUrl }));
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
        showSuccess('Profile updated successfully.');
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
          Manage your personal details, profile picture, and contact preferences.
        </p>
      </div>

      {/* User profile & avatar card */}
      <div className="bg-white dark:bg-[#14201e] rounded-2xl border border-[#A3B0AF]/25 dark:border-[#283d39] p-5 flex flex-col sm:flex-row sm:items-center gap-5">
        <div className="relative group self-center sm:self-auto shrink-0">
          <div className="w-20 h-20 rounded-2xl bg-[#36586A] dark:bg-[#50829C] text-[#AAA86D] dark:text-[#f0f6f4] text-2xl font-bold flex items-center justify-center uppercase overflow-hidden border border-[#A3B0AF]/20 shadow-sm">
            {formData.profilePicture ? (
              <img
                src={formatMediaUrl(formData.profilePicture)}
                alt={formData.name || 'User'}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            ) : (
              user?.name?.charAt(0) || 'U'
            )}
          </div>

          {/* Quick upload overlay */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={processingImage}
            className="absolute inset-0 bg-black/40 text-white rounded-2xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-[10px] font-semibold"
            title="Upload photo"
          >
            <Camera className="w-5 h-5 mb-0.5" />
            <span>Change</span>
          </button>
        </div>

        <div className="flex-1 min-w-0 text-center sm:text-left">
          <h3 className="font-bold text-base text-[#01140F] dark:text-[#f0f6f4] truncate">
            {formData.name || user?.name}
          </h3>
          <p className="text-xs text-[#516B71] dark:text-[#8fa6a4] truncate">{user?.email}</p>
          <div className="flex items-center justify-center sm:justify-start gap-2 mt-1.5 text-[11px] text-[#516B71] dark:text-[#8fa6a4]">
            <span className="capitalize">{user?.role || 'student'}</span>
            <span>•</span>
            <span className="flex items-center gap-0.5 text-[#01140F] dark:text-[#f0f6f4] font-semibold">
              <Star className="w-3 h-3 fill-[#AAA86D] dark:fill-[#c4c184] text-[#AAA86D] dark:text-[#c4c184]" />
              {user?.rating?.average?.toFixed(1) || '0.0'} ({user?.rating?.count || 0} reviews)
            </span>
          </div>

          {/* Avatar action buttons */}
          <div className="flex items-center justify-center sm:justify-start gap-2 mt-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={processingImage}
              className="px-3 py-1.5 rounded-xl border border-[#A3B0AF]/30 dark:border-[#283d39] bg-[#F7F8FA] dark:bg-[#192825] hover:bg-[#A3B0AF]/20 dark:hover:bg-[#283d39] text-[#01140F] dark:text-[#f0f6f4] text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-[#36586A] dark:text-[#50829C]" />
              {processingImage ? 'Uploading...' : 'Upload Photo'}
            </button>

            {formData.profilePicture && (
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/30 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                Remove
              </button>
            )}
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

        {/* Profile Picture URL or Presets */}
        <div className="space-y-2 pt-1 border-t border-[#F7F8FA] dark:border-[#1e302d]">
          <label className="block font-semibold text-[#01140F] dark:text-[#f0f6f4]">
            Profile Picture File Path or URL
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              name="profilePicture"
              value={formData.profilePicture}
              onChange={handleChange}
              placeholder="/uploads/profiles/... or https://..."
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-[#A3B0AF]/30 dark:border-[#283d39] bg-white dark:bg-[#0e1716] focus:outline-none focus:ring-2 focus:ring-[#36586A]/30 text-[#01140F] dark:text-[#f0f6f4]"
            />
          </div>

          {/* Quick preset avatars */}
          <div>
            <span className="text-[11px] text-[#516B71] dark:text-[#8fa6a4] block mb-1.5">
              Or pick a sample avatar:
            </span>
            <div className="flex items-center gap-2">
              {avatarPresets.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handlePresetSelect(preset)}
                  className={`w-9 h-9 rounded-xl overflow-hidden border transition cursor-pointer ${
                    formData.profilePicture === preset
                      ? 'border-[#36586A] dark:border-[#50829C] ring-2 ring-[#36586A]/40'
                      : 'border-[#A3B0AF]/30 dark:border-[#283d39] opacity-75 hover:opacity-100'
                  }`}
                >
                  <img src={preset} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-3 flex justify-end">
          <button
            type="submit"
            disabled={loading || processingImage}
            className="px-5 py-2.5 rounded-xl font-bold text-white bg-[#01140F] dark:bg-[#36586A] hover:bg-[#36586A] dark:hover:bg-[#47768E] disabled:opacity-50 transition flex items-center gap-1.5 cursor-pointer"
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
          className="text-xs font-semibold text-rose-700 dark:text-rose-400 hover:underline cursor-pointer"
        >
          {deactivating ? 'Deactivating...' : 'Deactivate'}
        </button>
      </div>
    </div>
  );
}
