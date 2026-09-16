import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  BookOpen,
  Calculator,
  FlaskConical,
  Cpu,
  Package,
  Plus,
  Trash2,
  Image as ImageIcon,
  IndianRupee,
  Gift,
  HandCoins,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { resourceApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ResourceCard from '../components/ResourceCard';

const sampleImagePresets = [
  { label: 'Engineering Physics Book', url: 'https://images.unsplash.com/photo-1532012164546-f432f2e3edd4?w=600&auto=format&fit=crop&q=80' },
  { label: 'Scientific Calculator', url: 'https://images.unsplash.com/photo-1587145820266-a5951ee6f620?w=600&auto=format&fit=crop&q=80' },
  { label: 'Lab Coat & Chemistry Set', url: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=600&auto=format&fit=crop&q=80' },
  { label: 'Arduino / Microcontroller Kit', url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80' },
];

export default function CreateEditResourcePage() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    category: 'book',
    condition: 'good',
    listingType: 'lend',
    securityDeposit: 0,
    description: '',
    images: [],
  });

  const [imageUrlInput, setImageUrlInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEditing);
  const [error, setError] = useState('');

  // If editing, load current resource
  useEffect(() => {
    if (isEditing) {
      const fetchResource = async () => {
        try {
          const res = await resourceApi.getById(id);
          const r = res.data?.data?.resource;
          if (r) {
            setFormData({
              title: r.title || '',
              category: r.category || 'book',
              condition: r.condition || 'good',
              listingType: r.listingType || 'lend',
              securityDeposit: r.securityDeposit || 0,
              description: r.description || '',
              images: r.images || [],
            });
          }
        } catch (err) {
          showError('Failed to load resource for editing.');
          navigate('/my-listings');
        } finally {
          setFetchLoading(false);
        }
      };
      fetchResource();
    }
  }, [id, isEditing, navigate, showError]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'listingType' && value === 'donate') {
      setFormData((prev) => ({ ...prev, [name]: value, securityDeposit: 0 }));
    } else if (name === 'securityDeposit') {
      setFormData((prev) => ({ ...prev, [name]: Number(value) || 0 }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAddImage = (urlToAdd) => {
    const url = urlToAdd || imageUrlInput.trim();
    if (!url) return;
    if (formData.images.includes(url)) {
      showError('Image URL already added.');
      return;
    }
    setFormData((prev) => ({ ...prev, images: [...prev.images, url] }));
    if (!urlToAdd) setImageUrlInput('');
  };

  const handleRemoveImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim()) {
      setError('Please provide a title for the resource.');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        title: formData.title.trim(),
        category: formData.category,
        condition: formData.condition,
        listingType: formData.listingType,
        securityDeposit: formData.listingType === 'donate' ? 0 : Number(formData.securityDeposit) || 0,
        description: formData.description.trim(),
        images: formData.images,
      };

      if (isEditing) {
        await resourceApi.update(id, payload);
        showSuccess('Resource listing updated successfully!');
        navigate(`/resources/${id}`);
      } else {
        const res = await resourceApi.create(payload);
        const newResource = res.data?.data?.resource;
        showSuccess('Resource listed successfully on the campus marketplace!');
        navigate(`/resources/${newResource?._id || ''}`);
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.join(', ') || 'Failed to save resource.';
      setError(msg);
      showError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-500 font-medium text-sm">Loading listing data...</p>
      </div>
    );
  }

  // Preview object for live card
  const previewResource = {
    ...formData,
    _id: 'preview',
    isAvailable: true,
    owner: {
      _id: user?._id || 'owner_id',
      name: user?.name || 'You',
      rating: user?.rating || { average: 5.0, count: 1 },
      profilePicture: user?.profilePicture || '',
    },
    createdAt: new Date().toISOString(),
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            to={isEditing ? `/resources/${id}` : '/'}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {isEditing ? 'Edit Resource Listing' : 'List a New Resource'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isEditing
              ? 'Update details, pricing, or description for your listing'
              : 'Share your textbooks, calculators, and lab tools with campus peers'}
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Column (7 cols) */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          {/* Resource Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Resource Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Engineering Physics Vol. 1 (Halliday & Resnick)"
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium text-slate-900 placeholder:text-slate-400"
            />
          </div>

          {/* Category & Condition */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-medium text-slate-800 bg-white"
              >
                <option value="book">Book & Study Notes</option>
                <option value="calculator">Scientific Calculator</option>
                <option value="lab-equipment">Lab Equipment & Coat</option>
                <option value="electronics">Electronics & Components</option>
                <option value="other">Other Item</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Condition <span className="text-rose-500">*</span>
              </label>
              <select
                name="condition"
                value={formData.condition}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-medium text-slate-800 bg-white"
              >
                <option value="new">Brand New / Like New</option>
                <option value="good">Good (Minimal wear)</option>
                <option value="fair">Fair (Usable with notes/marks)</option>
                <option value="poor">Poor (Heavy wear)</option>
              </select>
            </div>
          </div>

          {/* Listing Type & Security Deposit */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-700">Listing Option</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, listingType: 'lend' }))}
                className={`p-4 rounded-2xl border text-left transition flex items-center gap-3 ${
                  formData.listingType === 'lend'
                    ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-500 text-indigo-900'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <HandCoins className="w-5 h-5 text-indigo-600 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold">Lend for Semester</h4>
                  <p className="text-[10px] text-slate-500">Student returns after exams</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, listingType: 'donate', securityDeposit: 0 }))}
                className={`p-4 rounded-2xl border text-left transition flex items-center gap-3 ${
                  formData.listingType === 'donate'
                    ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500 text-emerald-900'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <Gift className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold">Donate Permanently</h4>
                  <p className="text-[10px] text-slate-500">Free gift to junior / peer</p>
                </div>
              </button>
            </div>

            {formData.listingType === 'lend' && (
              <div className="pt-2">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Refundable Security Deposit (₹)
                </label>
                <div className="relative flex items-center max-w-xs">
                  <IndianRupee className="absolute left-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="number"
                    min="0"
                    step="10"
                    name="securityDeposit"
                    value={formData.securityDeposit}
                    onChange={handleChange}
                    placeholder="100"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold text-slate-900"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Deposits are refunded back when the borrower returns the item safely. Set 0 for no deposit.
                </p>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Description & Notes (Optional)
            </label>
            <textarea
              rows={4}
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Provide edition, semester syllabus, highlighted sections, pickup place on campus, etc."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs text-slate-800 resize-none placeholder:text-slate-400"
            />
          </div>

          {/* Image URLs input & sample presets */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-700">
              Photos & Images (URLs)
            </label>

            <div className="flex gap-2">
              <input
                type="url"
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                placeholder="https://example.com/photo.jpg"
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs text-slate-800 placeholder:text-slate-400"
              />
              <button
                type="button"
                onClick={() => handleAddImage()}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Add URL
              </button>
            </div>

            {/* Presets to click */}
            <div>
              <span className="text-[11px] text-slate-500 font-medium block mb-1.5">
                Quick sample image placeholders:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {sampleImagePresets.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAddImage(preset.url)}
                    className="text-[11px] px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg text-slate-700 transition"
                  >
                    + {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Added Images List */}
            {formData.images.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-2">
                {formData.images.map((img, index) => (
                  <div key={index} className="relative group rounded-xl overflow-hidden aspect-video border border-slate-200 bg-slate-100">
                    <img src={img} alt={`upload-${index}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-1 right-1 p-1 rounded-full bg-rose-600 text-white opacity-90 hover:opacity-100 transition shadow"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Link
              to={isEditing ? `/resources/${id}` : '/my-listings'}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-7 py-3 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition shadow-md shadow-indigo-200"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  {isEditing ? 'Update Listing' : 'Publish Resource Listing'}
                </>
              )}
            </button>
          </div>
        </form>

        {/* Live Preview Column (5 cols) */}
        <div className="hidden lg:block lg:col-span-5 sticky top-24 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            Live Marketplace Preview
          </div>
          <ResourceCard resource={previewResource} />
          <p className="text-[11px] text-slate-400 text-center">
            This is how your item will appear to students on the homepage and search results.
          </p>
        </div>
      </div>
    </div>
  );
}
