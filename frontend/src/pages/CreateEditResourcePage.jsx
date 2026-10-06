import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Plus,
  Trash2,
  IndianRupee,
  ArrowLeft,
  Upload,
  Play,
  Film,
} from 'lucide-react';
import { resourceApi, uploadApi } from '../api';
import { useToast } from '../context/ToastContext';
import { formatMediaUrl, getYouTubeEmbedUrl } from '../utils/media';

const sampleImagePresets = [
  { label: 'Physics Book', url: 'https://images.unsplash.com/photo-1532012164546-f432f2e3edd4?w=600&auto=format&fit=crop&q=80' },
  { label: 'Calculator', url: 'https://images.unsplash.com/photo-1587145820266-a5951ee6f620?w=600&auto=format&fit=crop&q=80' },
  { label: 'Lab Coat', url: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=600&auto=format&fit=crop&q=80' },
  { label: 'Electronics Kit', url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80' },
];

export default function CreateEditResourcePage() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const imageFileInputRef = useRef(null);
  const videoFileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    category: 'book',
    condition: 'good',
    listingType: 'lend',
    securityDeposit: 0,
    acceptedPaymentMethods: ['pay_on_collection', 'razorpay'],
    description: '',
    images: [],
    videos: [],
  });

  const [imageUrlInput, setImageUrlInput] = useState('');
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEditing);
  const [error, setError] = useState('');

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
              acceptedPaymentMethods:
                Array.isArray(r.acceptedPaymentMethods) && r.acceptedPaymentMethods.length > 0
                  ? r.acceptedPaymentMethods
                  : ['pay_on_collection', 'razorpay'],
              description: r.description || '',
              images: r.images || [],
              videos: r.videos || [],
            });
          }
        } catch (err) {
          showError('Failed to load resource.');
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

  const handlePaymentMethodToggle = (method) => {
    setFormData((prev) => {
      const exists = prev.acceptedPaymentMethods.includes(method);
      if (exists) {
        if (prev.acceptedPaymentMethods.length === 1) {
          showError('Please keep at least one payment method selected.');
          return prev;
        }
        return {
          ...prev,
          acceptedPaymentMethods: prev.acceptedPaymentMethods.filter((m) => m !== method),
        };
      } else {
        return {
          ...prev,
          acceptedPaymentMethods: [...prev.acceptedPaymentMethods, method],
        };
      }
    });
  };

  // Image actions
  const handleAddImageUrl = (urlToAdd) => {
    const url = urlToAdd || imageUrlInput.trim();
    if (!url) return;
    if (formData.images.includes(url)) {
      showError('Image URL already added.');
      return;
    }
    setFormData((prev) => ({ ...prev, images: [...prev.images, url] }));
    if (!urlToAdd) setImageUrlInput('');
  };

  const handleUploadImages = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    try {
      setUploadingImage(true);
      const data = new FormData();
      files.forEach((f) => data.append('files', f));

      const res = await uploadApi.uploadMultipleProductMedia(data);
      const uploadedFiles = res.data?.data?.files || [];
      const newUrls = uploadedFiles.map((f) => f.url);

      if (newUrls.length > 0) {
        setFormData((prev) => ({ ...prev, images: [...prev.images, ...newUrls] }));
        showSuccess(`Uploaded ${newUrls.length} photo(s) to local storage.`);
      }
    } catch (err) {
      console.error('Image upload failed:', err);
      showError(err.response?.data?.message || 'Failed to upload photo files');
    } finally {
      setUploadingImage(false);
      if (imageFileInputRef.current) imageFileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  // Video actions
  const handleAddVideoUrl = () => {
    const url = videoUrlInput.trim();
    if (!url) return;
    if (formData.videos.includes(url)) {
      showError('Video URL already added.');
      return;
    }
    setFormData((prev) => ({ ...prev, videos: [...prev.videos, url] }));
    setVideoUrlInput('');
  };

  const handleUploadVideo = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingVideo(true);
      const data = new FormData();
      data.append('file', file);

      const res = await uploadApi.uploadProductMedia(data);
      const fileUrl = res.data?.data?.url;

      if (fileUrl) {
        setFormData((prev) => ({ ...prev, videos: [...prev.videos, fileUrl] }));
        showSuccess('Video uploaded to local storage successfully.');
      }
    } catch (err) {
      console.error('Video upload failed:', err);
      showError(err.response?.data?.message || 'Failed to upload video file');
    } finally {
      setUploadingVideo(false);
      if (videoFileInputRef.current) videoFileInputRef.current.value = '';
    }
  };

  const handleRemoveVideo = (index) => {
    setFormData((prev) => ({
      ...prev,
      videos: prev.videos.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim()) {
      setError('Please enter a title.');
      return;
    }

    if (
      formData.listingType === 'lend' &&
      Number(formData.securityDeposit) > 0 &&
      (!formData.acceptedPaymentMethods || formData.acceptedPaymentMethods.length === 0)
    ) {
      setError('Please select at least one accepted payment method for the deposit.');
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
        acceptedPaymentMethods:
          formData.listingType === 'donate' ? ['pay_on_collection'] : formData.acceptedPaymentMethods,
        description: formData.description.trim(),
        images: formData.images,
        videos: formData.videos,
      };

      if (isEditing) {
        await resourceApi.update(id, payload);
        showSuccess('Resource updated successfully.');
        navigate(`/resources/${id}`);
      } else {
        const res = await resourceApi.create(payload);
        const newResource = res.data?.data?.resource;
        showSuccess('Resource listed successfully.');
        navigate(`/resources/${newResource?._id || ''}`);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save resource.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#36586A] dark:border-[#50829C] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div>
        <Link
          to={isEditing ? `/resources/${id}` : '/'}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#516B71] dark:text-[#8fa6a4] hover:text-[#01140F] dark:hover:text-[#f0f6f4] transition mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </Link>
        <h1 className="text-2xl font-bold text-[#01140F] dark:text-[#f0f6f4] tracking-tight">
          {isEditing ? 'Edit Listing' : 'List an Item'}
        </h1>
        <p className="text-xs text-[#516B71] dark:text-[#8fa6a4]">
          Share study materials, tools, or equipment with photos and demonstration videos.
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-rose-800 dark:text-rose-300 text-xs font-medium">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-[#14201e] rounded-2xl border border-[#A3B0AF]/25 dark:border-[#283d39] p-6 space-y-5">
        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-[#01140F] dark:text-[#f0f6f4] mb-1.5">
            Title <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. Engineering Mathematics - Kreyszig (10th Ed)"
            required
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#A3B0AF]/30 dark:border-[#283d39] bg-white dark:bg-[#0e1716] focus:outline-none focus:ring-2 focus:ring-[#36586A]/30 text-xs text-[#01140F] dark:text-[#f0f6f4] placeholder:text-[#A3B0AF] dark:placeholder:text-[#6c8280]"
          />
        </div>

        {/* Category & Condition */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#01140F] dark:text-[#f0f6f4] mb-1.5">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-xl border border-[#A3B0AF]/30 dark:border-[#283d39] focus:outline-none focus:ring-2 focus:ring-[#36586A]/30 text-xs text-[#01140F] dark:text-[#f0f6f4] bg-white dark:bg-[#0e1716]"
            >
              <option value="book">Books & Notes</option>
              <option value="calculator">Calculator</option>
              <option value="lab-equipment">Lab Gear</option>
              <option value="electronics">Electronics</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#01140F] dark:text-[#f0f6f4] mb-1.5">Condition</label>
            <select
              name="condition"
              value={formData.condition}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-xl border border-[#A3B0AF]/30 dark:border-[#283d39] focus:outline-none focus:ring-2 focus:ring-[#36586A]/30 text-xs text-[#01140F] dark:text-[#f0f6f4] bg-white dark:bg-[#0e1716]"
            >
              <option value="new">Like New</option>
              <option value="good">Good</option>
              <option value="fair">Fair (Usable)</option>
              <option value="poor">Heavily Used</option>
            </select>
          </div>
        </div>

        {/* Listing Type & Deposit */}
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-[#01140F] dark:text-[#f0f6f4]">Listing Type</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, listingType: 'lend' }))}
              className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                formData.listingType === 'lend'
                  ? 'border-[#01140F] bg-[#01140F] dark:border-[#36586A] dark:bg-[#36586A] text-white'
                  : 'border-[#A3B0AF]/30 dark:border-[#283d39] text-[#516B71] dark:text-[#8fa6a4] hover:border-[#01140F] dark:hover:border-[#50829C]'
              }`}
            >
              <div className="text-xs font-bold">Lend for Semester</div>
              <div className={`text-[11px] ${formData.listingType === 'lend' ? 'text-white/80' : 'text-[#A3B0AF] dark:text-[#6c8280]'}`}>
                Temporarily borrow
              </div>
            </button>

            <button
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, listingType: 'donate', securityDeposit: 0 }))}
              className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                formData.listingType === 'donate'
                  ? 'border-[#6B8B78] bg-[#6B8B78] text-white'
                  : 'border-[#A3B0AF]/30 dark:border-[#283d39] text-[#516B71] dark:text-[#8fa6a4] hover:border-[#6B8B78]'
              }`}
            >
              <div className="text-xs font-bold">Free Donation</div>
              <div className={`text-[11px] ${formData.listingType === 'donate' ? 'text-white/80' : 'text-[#A3B0AF] dark:text-[#6c8280]'}`}>
                Give away permanently
              </div>
            </button>
          </div>

          {formData.listingType === 'lend' && (
            <div className="pt-2 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#01140F] dark:text-[#f0f6f4] mb-1">
                  Refundable Deposit (₹)
                </label>
                <div className="relative flex items-center max-w-xs">
                  <IndianRupee className="absolute left-3 w-3.5 h-3.5 text-[#516B71] dark:text-[#8fa6a4]" />
                  <input
                    type="number"
                    min="0"
                    name="securityDeposit"
                    value={formData.securityDeposit}
                    onChange={handleChange}
                    placeholder="0"
                    className="w-full pl-8 pr-3 py-2 rounded-xl border border-[#A3B0AF]/30 dark:border-[#283d39] bg-white dark:bg-[#0e1716] focus:outline-none focus:ring-2 focus:ring-[#36586A]/30 text-xs font-medium text-[#01140F] dark:text-[#f0f6f4]"
                  />
                </div>
              </div>

              {Number(formData.securityDeposit) > 0 && (
                <div className="pt-1">
                  <label className="block text-xs font-semibold text-[#01140F] dark:text-[#f0f6f4] mb-1.5">
                    Accepted Deposit Payment Methods <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <label
                      className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition text-xs ${
                        formData.acceptedPaymentMethods.includes('pay_on_collection')
                          ? 'border-[#36586A] bg-[#36586A]/5 dark:bg-[#36586A]/20 dark:border-[#50829C]'
                          : 'border-[#A3B0AF]/30 dark:border-[#283d39] hover:border-[#36586A]'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.acceptedPaymentMethods.includes('pay_on_collection')}
                        onChange={() => handlePaymentMethodToggle('pay_on_collection')}
                        className="mt-0.5 accent-[#36586A]"
                      />
                      <div>
                        <div className="font-semibold text-[#01140F] dark:text-[#f0f6f4]">Pay on Collection</div>
                        <div className="text-[11px] text-[#516B71] dark:text-[#8fa6a4]">
                          Borrower pays cash or direct transfer upon meeting
                        </div>
                      </div>
                    </label>

                    <label
                      className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition text-xs ${
                        formData.acceptedPaymentMethods.includes('razorpay')
                          ? 'border-[#36586A] bg-[#36586A]/5 dark:bg-[#36586A]/20 dark:border-[#50829C]'
                          : 'border-[#A3B0AF]/30 dark:border-[#283d39] hover:border-[#36586A]'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.acceptedPaymentMethods.includes('razorpay')}
                        onChange={() => handlePaymentMethodToggle('razorpay')}
                        className="mt-0.5 accent-[#36586A]"
                      />
                      <div>
                        <div className="font-semibold text-[#01140F] dark:text-[#f0f6f4]">Razorpay (Online)</div>
                        <div className="text-[11px] text-[#516B71] dark:text-[#8fa6a4]">
                          Deposit held securely online via UPI, Cards, or Netbanking
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-[#01140F] dark:text-[#f0f6f4] mb-1.5">
            Description (Optional)
          </label>
          <textarea
            rows={3}
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Edition, notes, pickup details on campus..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#A3B0AF]/30 dark:border-[#283d39] bg-white dark:bg-[#0e1716] focus:outline-none focus:ring-2 focus:ring-[#36586A]/30 text-xs text-[#01140F] dark:text-[#f0f6f4] resize-none placeholder:text-[#A3B0AF] dark:placeholder:text-[#6c8280]"
          />
        </div>

        {/* Photos Section */}
        <div className="space-y-3 pt-2 border-t border-[#F7F8FA] dark:border-[#1e302d]">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-[#01140F] dark:text-[#f0f6f4]">
              Product Photos ({formData.images.length})
            </label>
            <input
              type="file"
              ref={imageFileInputRef}
              onChange={handleUploadImages}
              accept="image/*"
              multiple
              className="hidden"
            />
            <button
              type="button"
              onClick={() => imageFileInputRef.current?.click()}
              disabled={uploadingImage}
              className="px-2.5 py-1 rounded-lg border border-[#A3B0AF]/30 dark:border-[#283d39] bg-[#F7F8FA] dark:bg-[#192825] hover:bg-[#A3B0AF]/20 dark:hover:bg-[#283d39] text-[#01140F] dark:text-[#f0f6f4] text-[11px] font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Upload className="w-3 h-3 text-[#36586A] dark:text-[#50829C]" />
              {uploadingImage ? 'Uploading...' : 'Upload Photos'}
            </button>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={imageUrlInput}
              onChange={(e) => setImageUrlInput(e.target.value)}
              placeholder="Or paste photo URL / path (https://... or /uploads/...)"
              className="flex-1 px-3 py-2 rounded-xl border border-[#A3B0AF]/30 dark:border-[#283d39] bg-white dark:bg-[#0e1716] focus:outline-none focus:ring-2 focus:ring-[#36586A]/30 text-xs text-[#01140F] dark:text-[#f0f6f4] placeholder:text-[#A3B0AF] dark:placeholder:text-[#6c8280]"
            />
            <button
              type="button"
              onClick={() => handleAddImageUrl()}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-white bg-[#01140F] dark:bg-[#36586A] hover:bg-[#36586A] dark:hover:bg-[#47768E] transition flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>

          {/* Quick presets */}
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {sampleImagePresets.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleAddImageUrl(preset.url)}
                className="text-[10px] px-2.5 py-1 bg-[#F7F8FA] dark:bg-[#192825] hover:bg-[#A3B0AF]/20 dark:hover:bg-[#283d39] rounded-lg text-[#516B71] dark:text-[#8fa6a4] transition cursor-pointer"
              >
                + {preset.label}
              </button>
            ))}
          </div>

          {/* Image thumbnails */}
          {formData.images.length > 0 && (
            <div className="flex gap-2 pt-2 overflow-x-auto pb-1">
              {formData.images.map((img, index) => (
                <div key={index} className="relative group rounded-xl overflow-hidden w-20 h-16 border border-[#A3B0AF]/30 dark:border-[#283d39] bg-[#F7F8FA] dark:bg-[#0e1716] shrink-0">
                  <img src={formatMediaUrl(img)} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-1 right-1 p-1 rounded-full bg-rose-600 text-white shadow-sm hover:bg-rose-700 transition cursor-pointer"
                    title="Remove photo"
                  >
                    <Trash2 className="w-2.5 h-2.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Videos Section */}
        <div className="space-y-3 pt-2 border-t border-[#F7F8FA] dark:border-[#1e302d]">
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-xs font-semibold text-[#01140F] dark:text-[#f0f6f4]">
                Product Videos & Demos ({formData.videos.length})
              </label>
              <span className="text-[10px] text-[#A3B0AF] dark:text-[#6c8280]">
                YouTube link, video URL, or uploaded video file
              </span>
            </div>
            <input
              type="file"
              ref={videoFileInputRef}
              onChange={handleUploadVideo}
              accept="video/*"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => videoFileInputRef.current?.click()}
              disabled={uploadingVideo}
              className="px-2.5 py-1 rounded-lg border border-[#A3B0AF]/30 dark:border-[#283d39] bg-[#F7F8FA] dark:bg-[#192825] hover:bg-[#A3B0AF]/20 dark:hover:bg-[#283d39] text-[#01140F] dark:text-[#f0f6f4] text-[11px] font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Film className="w-3 h-3 text-[#36586A] dark:text-[#50829C]" />
              {uploadingVideo ? 'Uploading...' : 'Upload Video File'}
            </button>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={videoUrlInput}
              onChange={(e) => setVideoUrlInput(e.target.value)}
              placeholder="Paste YouTube (https://youtu.be/...) or direct video link"
              className="flex-1 px-3 py-2 rounded-xl border border-[#A3B0AF]/30 dark:border-[#283d39] bg-white dark:bg-[#0e1716] focus:outline-none focus:ring-2 focus:ring-[#36586A]/30 text-xs text-[#01140F] dark:text-[#f0f6f4] placeholder:text-[#A3B0AF] dark:placeholder:text-[#6c8280]"
            />
            <button
              type="button"
              onClick={handleAddVideoUrl}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-white bg-[#01140F] dark:bg-[#36586A] hover:bg-[#36586A] dark:hover:bg-[#47768E] transition flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add Video
            </button>
          </div>

          {/* Video list */}
          {formData.videos.length > 0 && (
            <div className="space-y-2 pt-1">
              {formData.videos.map((vid, idx) => {
                const isYt = Boolean(getYouTubeEmbedUrl(vid));
                const isLocal = vid.startsWith('/uploads/');
                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-[#A3B0AF]/25 dark:border-[#283d39] bg-[#F7F8FA] dark:bg-[#162422] text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-[#36586A] dark:bg-[#50829C] text-white flex items-center justify-center shrink-0">
                        <Play className="w-3.5 h-3.5 fill-white" />
                      </div>
                      <div className="min-w-0">
                        <span className="font-semibold text-[#01140F] dark:text-[#f0f6f4] block truncate">
                          {isYt ? 'YouTube Video Demo' : isLocal ? 'Uploaded Video File' : 'Video Link'}
                        </span>
                        <span className="text-[10px] text-[#A3B0AF] dark:text-[#6c8280] truncate block max-w-sm">
                          {vid}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveVideo(idx)}
                      className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition shrink-0 cursor-pointer"
                      title="Remove video"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-[#F7F8FA] dark:border-[#1e302d] flex items-center justify-end gap-3">
          <Link
            to={isEditing ? `/resources/${id}` : '/my-listings'}
            className="px-4 py-2 text-xs font-medium text-[#516B71] dark:text-[#8fa6a4] hover:text-[#01140F] dark:hover:text-[#f0f6f4] transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading || uploadingImage || uploadingVideo}
            className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-[#01140F] dark:bg-[#36586A] hover:bg-[#36586A] dark:hover:bg-[#47768E] disabled:opacity-50 transition cursor-pointer"
          >
            {loading ? 'Saving...' : isEditing ? 'Save Changes' : 'Publish Listing'}
          </button>
        </div>
      </form>
    </div>
  );
}
