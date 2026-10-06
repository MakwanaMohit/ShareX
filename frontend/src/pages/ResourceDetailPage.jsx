import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Calendar,
  IndianRupee,
  Star,
  ArrowLeft,
  Mail,
  Play,
  Video,
  ChevronLeft,
  ChevronRight,
  Package,
  RotateCw,
} from 'lucide-react';
import { resourceApi, reviewApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useRefresh } from '../context/RefreshContext';
import BorrowModal from '../components/BorrowModal';
import { getYouTubeEmbedUrl, getVimeoEmbedUrl, formatMediaUrl } from '../utils/media';

const categoryLabels = {
  book: 'Book & Notes',
  calculator: 'Calculator',
  'lab-equipment': 'Lab Equipment',
  electronics: 'Electronics',
  other: 'Other Item',
};

export default function ResourceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { showSuccess, showError } = useToast();
  const { refreshTick } = useRefresh();

  const [resource, setResource] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [borrowModalOpen, setBorrowModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchResourceDetails = useCallback(async () => {
    try {
      setLoading(true);
      const res = await resourceApi.getById(id);
      const resData = res.data?.data?.resource;
      setResource(resData);
      setActiveMediaIndex(0);

      try {
        const revRes = await reviewApi.getResourceReviews(id);
        setReviews(revRes.data?.data?.reviews || []);
      } catch (revErr) {
        console.error('Error fetching resource reviews:', revErr);
      }
    } catch (err) {
      console.error('Error fetching resource:', err);
      showError(err.response?.data?.message || 'Could not load resource details.');
    } finally {
      setLoading(false);
    }
  }, [id, showError]);

  useEffect(() => {
    fetchResourceDetails();
  }, [fetchResourceDetails, refreshTick]);

  // Combine images and videos into unified e-commerce media list
  const mediaList = useMemo(() => {
    if (!resource) return [];
    const images = (resource.images || []).map((url) => ({ type: 'image', url }));
    const videos = (resource.videos || []).map((url) => ({ type: 'video', url }));
    return [...images, ...videos];
  }, [resource]);

  const currentMedia = mediaList[activeMediaIndex] || mediaList[0] || null;

  const handlePrevMedia = () => {
    if (mediaList.length <= 1) return;
    setActiveMediaIndex((prev) => (prev - 1 + mediaList.length) % mediaList.length);
  };

  const handleNextMedia = () => {
    if (mediaList.length <= 1) return;
    setActiveMediaIndex((prev) => (prev + 1) % mediaList.length);
  };

  const isOwner = user && resource && (user._id === resource.owner?._id || user.id === resource.owner?._id || user._id === resource.owner);

  const handleToggleAvailability = async () => {
    try {
      setActionLoading(true);
      const res = await resourceApi.toggleAvailability(resource._id);
      const newStatus = res.data?.data?.isAvailable;
      setResource((prev) => ({ ...prev, isAvailable: newStatus }));
      showSuccess(newStatus ? 'Marked as available.' : 'Marked as in use.');
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to update availability.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    try {
      setActionLoading(true);
      await resourceApi.delete(resource._id);
      showSuccess('Listing deleted.');
      navigate('/my-listings');
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to delete listing.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#36586A] dark:border-[#50829C] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="text-center py-20 bg-white dark:bg-[#14201e] rounded-2xl border border-[#A3B0AF]/25 dark:border-[#283d39] p-8 space-y-3">
        <h3 className="text-lg font-bold text-[#01140F] dark:text-[#f0f6f4]">Resource not found</h3>
        <Link to="/" className="text-xs font-semibold text-[#36586A] dark:text-[#50829C] hover:underline">
          Return to Explore
        </Link>
      </div>
    );
  }

  // Render video embed or direct player
  const renderVideoPlayer = (url) => {
    const ytEmbed = getYouTubeEmbedUrl(url);
    if (ytEmbed) {
      return (
        <iframe
          src={ytEmbed}
          title="Product Video"
          className="w-full h-full rounded-2xl border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      );
    }

    const vimeoEmbed = getVimeoEmbedUrl(url);
    if (vimeoEmbed) {
      return (
        <iframe
          src={vimeoEmbed}
          title="Product Video"
          className="w-full h-full rounded-2xl border-0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      );
    }

    return (
      <video
        src={formatMediaUrl(url)}
        controls
        playsInline
        className="w-full h-full object-contain bg-black/95 rounded-2xl"
      />
    );
  };

  return (
    <div className="space-y-10 pb-16 max-w-4xl mx-auto">
      {/* Top action row */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#516B71] dark:text-[#8fa6a4] hover:text-[#01140F] dark:hover:text-[#f0f6f4] transition cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </button>

        <button
          onClick={fetchResourceDetails}
          disabled={loading}
          title="Refresh item details"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#A3B0AF]/30 dark:border-[#283d39] bg-white dark:bg-[#14201e] text-xs font-semibold text-[#516B71] dark:text-[#8fa6a4] hover:text-[#01140F] dark:hover:text-[#f0f6f4] hover:border-[#36586A] transition shadow-xs cursor-pointer"
        >
          <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#36586A] dark:text-[#50829C]' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Media Gallery / Viewer (5 cols) */}
        <div className="md:col-span-5 space-y-3">
          {/* Main Stage */}
          <div className="aspect-[4/3] w-full rounded-2xl bg-white dark:bg-[#14201e] border border-[#A3B0AF]/25 dark:border-[#283d39] overflow-hidden relative flex items-center justify-center shadow-xs">
            {currentMedia ? (
              currentMedia.type === 'video' ? (
                renderVideoPlayer(currentMedia.url)
              ) : (
                <img
                  src={formatMediaUrl(currentMedia.url)}
                  alt={resource.title}
                  className="w-full h-full object-contain p-2"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              )
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-[#A3B0AF] dark:text-[#6c8280] gap-2 p-6 text-center">
                <Package className="w-10 h-10 stroke-1" />
                <span className="text-xs">No photos or videos provided</span>
              </div>
            )}

            {/* Media index indicator badge */}
            {mediaList.length > 0 && (
              <div className="absolute top-2.5 left-2.5 z-10">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-black/60 text-white backdrop-blur-xs flex items-center gap-1">
                  {currentMedia?.type === 'video' ? (
                    <Video className="w-3 h-3 text-[#50829C]" />
                  ) : null}
                  {currentMedia?.type === 'video' ? 'Video' : 'Photo'} {activeMediaIndex + 1} of {mediaList.length}
                </span>
              </div>
            )}

            {/* Prev / Next controls */}
            {mediaList.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrevMedia}
                  aria-label="Previous media"
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/45 hover:bg-black/75 text-white flex items-center justify-center transition shadow-md z-10 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNextMedia}
                  aria-label="Next media"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/45 hover:bg-black/75 text-white flex items-center justify-center transition shadow-md z-10 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnails rail (E-commerce style) */}
          {mediaList.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1 pt-0.5">
              {mediaList.map((media, idx) => {
                const isActive = activeMediaIndex === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveMediaIndex(idx)}
                    className={`relative w-14 h-14 rounded-xl border overflow-hidden shrink-0 transition cursor-pointer ${
                      isActive
                        ? 'border-[#36586A] dark:border-[#50829C] ring-2 ring-[#36586A]/40 scale-[1.02]'
                        : 'border-[#A3B0AF]/25 dark:border-[#283d39] opacity-70 hover:opacity-100'
                    }`}
                  >
                    {media.type === 'video' ? (
                      <div className="w-full h-full bg-[#0c1413] flex flex-col items-center justify-center text-white">
                        <Play className="w-4 h-4 fill-white" />
                        <span className="text-[8px] font-bold tracking-tight text-white/90 mt-0.5 uppercase">
                          Video
                        </span>
                      </div>
                    ) : (
                      <img src={formatMediaUrl(media.url)} alt="" className="w-full h-full object-cover" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Details (7 cols) */}
        <div className="md:col-span-7 space-y-6">
          <div className="space-y-2">
            {/* Tag line */}
            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold text-[#36586A] dark:text-[#50829C]">
                {categoryLabels[resource.category] || resource.category}
              </span>
              <span className="text-[#A3B0AF] dark:text-[#6c8280]">•</span>
              <span className="capitalize text-[#516B71] dark:text-[#8fa6a4]">{resource.condition} condition</span>
              <span className="text-[#A3B0AF] dark:text-[#6c8280]">•</span>
              <span className={`font-semibold ${resource.isAvailable ? 'text-[#6B8B78] dark:text-[#81ac90]' : 'text-[#83727E] dark:text-[#b89fae]'}`}>
                {resource.isAvailable ? 'Available' : 'Currently in use'}
              </span>
            </div>

            <h1 className="text-2xl font-bold text-[#01140F] dark:text-[#f0f6f4] tracking-tight leading-snug">
              {resource.title}
            </h1>

            <div className="text-xs text-[#A3B0AF] dark:text-[#6c8280] flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Listed {new Date(resource.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          </div>

          {/* Pricing & Payment Methods Box */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#14201e] border border-[#A3B0AF]/25 dark:border-[#283d39] space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] text-[#516B71] dark:text-[#8fa6a4] block">Listing Type</span>
                <span className="text-sm font-bold text-[#01140F] dark:text-[#f0f6f4] capitalize">
                  {resource.listingType === 'donate' ? 'Free Campus Donation' : 'Available for Lend'}
                </span>
              </div>
              {resource.listingType === 'lend' && (
                <div className="text-right">
                  <span className="text-[11px] text-[#516B71] dark:text-[#8fa6a4] block">Security Deposit</span>
                  <span className="text-base font-bold text-[#01140F] dark:text-[#f0f6f4] flex items-center justify-end">
                    <IndianRupee className="w-4 h-4 text-[#516B71] dark:text-[#8fa6a4]" />
                    {resource.securityDeposit || 0}
                  </span>
                </div>
              )}
            </div>

            {resource.listingType === 'lend' && resource.securityDeposit > 0 && resource.acceptedPaymentMethods?.length > 0 && (
              <div className="pt-2 border-t border-[#A3B0AF]/15 dark:border-[#283d39] flex items-center justify-between text-[11px]">
                <span className="text-[#516B71] dark:text-[#8fa6a4]">Accepted Payment:</span>
                <div className="flex items-center gap-1.5 flex-wrap justify-end">
                  {resource.acceptedPaymentMethods.includes('pay_on_collection') && (
                    <span className="px-2 py-0.5 rounded-full bg-[#36586A]/10 text-[#36586A] dark:text-[#50829C] font-semibold text-[10px]">
                      Pay on Collection
                    </span>
                  )}
                  {resource.acceptedPaymentMethods.includes('razorpay') && (
                    <span className="px-2 py-0.5 rounded-full bg-[#6B8B78]/15 text-[#6B8B78] dark:text-[#81ac90] font-semibold text-[10px]">
                      Razorpay Online
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          {resource.description && (
            <div className="space-y-1.5">
              <h3 className="text-xs font-bold text-[#01140F] dark:text-[#f0f6f4]">About this item</h3>
              <p className="text-xs text-[#516B71] dark:text-[#8fa6a4] leading-relaxed whitespace-pre-line">
                {resource.description}
              </p>
            </div>
          )}

          {/* Owner Info */}
          {resource.owner && (
            <div className="pt-4 border-t border-[#A3B0AF]/20 dark:border-[#283d39] flex items-center justify-between">
              <Link
                to={`/users/${resource.owner._id || resource.owner}`}
                className="flex items-center gap-2.5 group"
              >
                <div className="w-8 h-8 rounded-full bg-[#36586A]/10 dark:bg-[#50829C]/20 text-[#36586A] dark:text-[#8fa6a4] font-bold flex items-center justify-center text-xs uppercase overflow-hidden">
                  {resource.owner.profilePicture ? (
                    <img src={formatMediaUrl(resource.owner.profilePicture)} alt="" className="w-full h-full object-cover" />
                  ) : (
                    resource.owner.name?.charAt(0) || 'U'
                  )}
                </div>
                <div>
                  <span className="font-semibold text-xs text-[#01140F] dark:text-[#f0f6f4] group-hover:text-[#36586A] dark:group-hover:text-[#50829C] block">
                    {resource.owner.name}
                  </span>
                  {resource.owner.rating && (
                    <span className="text-[11px] text-[#516B71] dark:text-[#8fa6a4] flex items-center gap-1">
                      <Star className="w-3 h-3 fill-[#AAA86D] dark:fill-[#c4c184] text-[#AAA86D] dark:text-[#c4c184]" />
                      {resource.owner.rating.average?.toFixed(1) || '0.0'} ({resource.owner.rating.count || 0})
                    </span>
                  )}
                </div>
              </Link>

              {resource.owner.email && (
                <a
                  href={`mailto:${resource.owner.email}`}
                  className="text-xs text-[#516B71] dark:text-[#8fa6a4] hover:text-[#36586A] dark:hover:text-[#50829C] flex items-center gap-1.5 transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-[#36586A] dark:text-[#50829C]" />
                  <span>{resource.owner.email}</span>
                </a>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="pt-2">
            {isOwner ? (
              <div className="flex items-center gap-2">
                <Link
                  to={`/resources/${resource._id}/edit`}
                  className="px-4 py-2 text-xs font-semibold text-[#01140F] dark:text-[#f0f6f4] bg-white dark:bg-[#14201e] border border-[#A3B0AF]/30 dark:border-[#283d39] rounded-xl hover:bg-[#F7F8FA] dark:hover:bg-[#1c2c29] transition"
                >
                  Edit Listing
                </Link>
                <button
                  onClick={handleToggleAvailability}
                  disabled={actionLoading}
                  className="px-4 py-2 text-xs font-semibold text-[#36586A] dark:text-[#50829C] bg-[#36586A]/10 dark:bg-[#50829C]/20 rounded-xl hover:bg-[#36586A]/20 dark:hover:bg-[#50829C]/30 transition"
                >
                  {resource.isAvailable ? 'Mark In Use' : 'Mark Available'}
                </button>
                <button
                  onClick={handleDelete}
                  disabled={actionLoading}
                  className="px-4 py-2 text-xs font-semibold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 rounded-xl hover:bg-rose-100 dark:hover:bg-rose-900/40 transition"
                >
                  Delete
                </button>
              </div>
            ) : (
              <div>
                {isAuthenticated ? (
                  resource.isAvailable ? (
                    <button
                      onClick={() => setBorrowModalOpen(true)}
                      className="w-full py-3 px-6 rounded-xl text-xs font-bold text-white bg-[#01140F] dark:bg-[#36586A] hover:bg-[#36586A] dark:hover:bg-[#47768E] transition"
                    >
                      Request to Borrow
                    </button>
                  ) : (
                    <div className="w-full py-2.5 text-center text-xs font-medium text-[#A3B0AF] dark:text-[#6c8280] bg-[#F7F8FA] dark:bg-[#0e1716] rounded-xl border border-[#A3B0AF]/20 dark:border-[#283d39]">
                      Currently borrowed by another student
                    </div>
                  )
                ) : (
                  <Link
                    to="/login"
                    state={{ from: location }}
                    className="block text-center w-full py-3 px-6 rounded-xl text-xs font-bold text-white bg-[#01140F] dark:bg-[#36586A] hover:bg-[#36586A] dark:hover:bg-[#47768E] transition"
                  >
                    Log In to Borrow
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reviews */}
      {reviews.length > 0 && (
        <section className="pt-8 border-t border-[#A3B0AF]/20 dark:border-[#283d39] space-y-3">
          <h3 className="text-sm font-bold text-[#01140F] dark:text-[#f0f6f4]">Reviews ({reviews.length})</h3>
          <div className="space-y-2">
            {reviews.map((rev) => (
              <div key={rev._id} className="p-3 bg-white dark:bg-[#14201e] rounded-xl border border-[#A3B0AF]/20 dark:border-[#283d39] space-y-1 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-[#01140F] dark:text-[#f0f6f4]">{rev.reviewer?.name || 'Classmate'}</span>
                  <div className="flex items-center gap-1 text-[#AAA86D] dark:text-[#c4c184]">
                    <Star className="w-3 h-3 fill-[#AAA86D] dark:fill-[#c4c184]" />
                    <span className="font-bold">{rev.rating}</span>
                  </div>
                </div>
                {rev.comment && <p className="text-[#516B71] dark:text-[#8fa6a4]">{rev.comment}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Borrow Modal */}
      <BorrowModal
        resource={resource}
        isOpen={borrowModalOpen}
        onClose={() => setBorrowModalOpen(false)}
        onSuccess={() => {
          fetchResourceDetails();
          navigate('/requests');
        }}
      />
    </div>
  );
}
