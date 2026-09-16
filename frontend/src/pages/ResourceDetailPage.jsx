import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  BookOpen,
  Calculator,
  FlaskConical,
  Cpu,
  Package,
  Calendar,
  IndianRupee,
  Star,
  CheckCircle2,
  XCircle,
  Edit,
  Trash2,
  User,
  ShieldCheck,
  Gift,
  HandCoins,
  ArrowLeft,
  Sparkles,
  Phone,
  MessageCircle,
} from 'lucide-react';
import { resourceApi, reviewApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import BorrowModal from '../components/BorrowModal';

const categoryIcons = {
  book: BookOpen,
  calculator: Calculator,
  'lab-equipment': FlaskConical,
  electronics: Cpu,
  other: Package,
};

const categoryLabels = {
  book: 'Book & Notes',
  calculator: 'Calculator',
  'lab-equipment': 'Lab Equipment',
  electronics: 'Electronics',
  other: 'Other Item',
};

const conditionColors = {
  new: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  good: 'bg-blue-50 text-blue-700 border-blue-200',
  fair: 'bg-amber-50 text-amber-700 border-amber-200',
  poor: 'bg-rose-50 text-rose-700 border-rose-200',
};

export default function ResourceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { showSuccess, showError } = useToast();

  const [resource, setResource] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [selectedImage, setSelectedImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [borrowModalOpen, setBorrowModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchResourceDetails = useCallback(async () => {
    try {
      setLoading(true);
      const res = await resourceApi.getById(id);
      const resData = res.data?.data?.resource;
      setResource(resData);
      if (resData?.images && resData.images.length > 0) {
        setSelectedImage(resData.images[0]);
      }

      // Fetch reviews for this resource
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
  }, [fetchResourceDetails]);

  const isOwner = user && resource && (user._id === resource.owner?._id || user.id === resource.owner?._id || user._id === resource.owner);

  const handleToggleAvailability = async () => {
    try {
      setActionLoading(true);
      const res = await resourceApi.toggleAvailability(resource._id);
      const newStatus = res.data?.data?.isAvailable;
      setResource((prev) => ({ ...prev, isAvailable: newStatus }));
      showSuccess(newStatus ? 'Resource marked as available.' : 'Resource marked as unavailable.');
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to update availability.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this resource listing?')) return;
    try {
      setActionLoading(true);
      await resourceApi.delete(resource._id);
      showSuccess('Resource listing deleted successfully.');
      navigate('/my-listings');
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to delete resource.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-500 font-medium text-sm">Loading resource details...</p>
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 p-8 space-y-4">
        <h3 className="text-xl font-bold text-slate-800">Resource Not Found</h3>
        <p className="text-xs text-slate-500">This resource may have been deleted or does not exist.</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Explore
        </Link>
      </div>
    );
  }

  const CategoryIcon = categoryIcons[resource.category] || Package;

  return (
    <div className="space-y-8 pb-16 max-w-6xl mx-auto">
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-indigo-600 transition p-1 rounded-lg"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Images (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="aspect-square w-full rounded-3xl bg-slate-100 border border-slate-200 overflow-hidden relative shadow-sm">
            {selectedImage ? (
              <img
                src={selectedImage}
                alt={resource.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}

            <div
              className={`w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-slate-100 text-slate-400 ${
                selectedImage ? 'hidden' : 'flex'
              }`}
            >
              <CategoryIcon className="w-16 h-16 text-indigo-400 mb-2" />
              <span className="text-sm font-semibold text-slate-600">
                {categoryLabels[resource.category] || 'Resource Image'}
              </span>
            </div>

            {/* Listing Type Overlay */}
            <div className="absolute top-4 left-4">
              {resource.listingType === 'donate' ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-md">
                  <Gift className="w-4 h-4" /> Free Campus Donation
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-600 text-white shadow-md">
                  <HandCoins className="w-4 h-4" /> Available for Lend
                </span>
              )}
            </div>
          </div>

          {/* Thumbnail row if multiple images */}
          {resource.images && resource.images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {resource.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-16 h-16 rounded-xl border-2 overflow-hidden shrink-0 transition ${
                    selectedImage === img
                      ? 'border-indigo-600 ring-2 ring-indigo-200'
                      : 'border-slate-200 hover:border-slate-400'
                  }`}
                >
                  <img src={img} alt={`thumbnail-${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Details & Actions (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Header & Badges */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                <CategoryIcon className="w-3.5 h-3.5" />
                {categoryLabels[resource.category] || resource.category}
              </span>
              <span
                className={`px-3 py-1 rounded-lg text-xs font-bold border capitalize ${
                  conditionColors[resource.condition] || 'bg-slate-100 text-slate-700'
                }`}
              >
                Condition: {resource.condition}
              </span>
              {resource.isAvailable ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Available Now
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                  <XCircle className="w-3.5 h-3.5 text-slate-500" /> Currently In Use
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
              {resource.title}
            </h1>

            <div className="flex items-center gap-2 text-xs text-slate-600">
              <Calendar className="w-3.5 h-3.5" />
              Listed on {new Date(resource.createdAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          </div>

          {/* Pricing & Deposit Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-50 to-indigo-50/40 border border-slate-200/80 flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-slate-600 block">Pricing / Deposit</span>
              {resource.listingType === 'donate' ? (
                <span className="text-2xl font-black text-emerald-600">100% Free Donation</span>
              ) : (
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-slate-900 flex items-center">
                    <IndianRupee className="w-6 h-6" />
                    {resource.securityDeposit || 0}
                  </span>
                  <span className="text-xs text-slate-600 font-medium">(Refundable Security Deposit)</span>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900">Description</h3>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              {resource.description || 'No additional description provided by the owner.'}
            </p>
          </div>

          {/* Owner Profile Card */}
          {resource.owner && (
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Listed By Student
              </h3>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <Link
                  to={`/users/${resource.owner._id || resource.owner}`}
                  className="flex items-center gap-3 group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-lg uppercase overflow-hidden">
                    {resource.owner.profilePicture ? (
                      <img
                        src={resource.owner.profilePicture}
                        alt={resource.owner.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      resource.owner.name?.charAt(0) || 'U'
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition">
                      {resource.owner.name}
                    </h4>
                    {resource.owner.rating && (
                      <div className="flex items-center gap-1.5 text-xs text-amber-600 font-medium mt-0.5">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{resource.owner.rating.average?.toFixed(1) || '0.0'}</span>
                        <span className="text-slate-600">({resource.owner.rating.count || 0} reviews)</span>
                      </div>
                    )}
                  </div>
                </Link>

                <Link
                  to={`/users/${resource.owner._id || resource.owner}`}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition"
                >
                  View Profile & Reviews →
                </Link>
              </div>

              {resource.owner.contactInfo && (
                <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-600">
                  <Phone className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Contact: {resource.owner.contactInfo}</span>
                </div>
              )}
            </div>
          )}

          {/* Action Area */}
          <div className="pt-2">
            {isOwner ? (
              <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-900">
                  <Sparkles className="w-4 h-4 text-indigo-600" /> You are the owner of this listing
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <Link
                    to={`/resources/${resource._id}/edit`}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition shadow-sm"
                  >
                    <Edit className="w-3.5 h-3.5" /> Edit Listing
                  </Link>
                  <button
                    onClick={handleToggleAvailability}
                    disabled={actionLoading}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-bold text-indigo-700 bg-white border border-indigo-200 hover:bg-indigo-50 transition shadow-sm"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {resource.isAvailable ? 'Set In Use' : 'Set Available'}
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={actionLoading}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-bold text-rose-700 bg-white border border-rose-200 hover:bg-rose-50 transition shadow-sm"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>
            ) : (
              <div>
                {isAuthenticated ? (
                  resource.isAvailable ? (
                    <button
                      onClick={() => setBorrowModalOpen(true)}
                      className="w-full py-3.5 px-6 rounded-2xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition duration-200 flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      Request to Borrow This Resource
                    </button>
                  ) : (
                    <div className="w-full py-3 px-4 rounded-2xl text-xs font-semibold text-center text-slate-500 bg-slate-100 border border-slate-200">
                      This item is currently lent out to another student.
                    </div>
                  )
                ) : (
                  <Link
                    to="/login"
                    className="w-full py-3.5 px-6 rounded-2xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition duration-200 flex items-center justify-center gap-2"
                  >
                    Log In to Request Borrow
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Resource Reviews Section ────────────────────────────────────────── */}
      <section className="pt-8 border-t border-slate-200 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">
            Resource Reviews ({reviews.length})
          </h3>
        </div>

        {reviews.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-400">
            No reviews for this item yet. Reviews will appear here after completed borrows.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((rev) => (
              <div
                key={rev._id}
                className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs uppercase">
                      {rev.reviewer?.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <span className="font-semibold text-xs text-slate-800">
                        {rev.reviewer?.name || 'Fellow Student'}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-amber-500 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    {rev.rating}/5
                  </div>
                </div>
                {rev.comment && (
                  <p className="text-xs text-slate-600 pl-9 leading-relaxed">{rev.comment}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Borrow Request Modal */}
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
