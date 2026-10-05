import React, { useState } from 'react';
import { X, Star, MessageSquare, Send } from 'lucide-react';
import { reviewApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function ReviewModal({ transaction, isOpen, onClose, onSuccess }) {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const isLender = transaction?.lender?._id === user?._id;
  const peerUser = isLender ? transaction?.borrower : transaction?.lender;
  const peerRoleLabel = isLender ? 'Borrower' : 'Lender';

  const [targetType, setTargetType] = useState('user');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !transaction) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!rating || rating < 1 || rating > 5) {
      setError('Please provide a rating between 1 and 5 stars.');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        transactionId: transaction._id,
        targetType,
        rating,
        comment: comment.trim(),
      };

      if (targetType === 'user') {
        payload.targetUserId = peerUser?._id;
      } else {
        payload.targetResourceId = transaction?.resource?._id;
      }

      await reviewApi.submit(payload);
      showSuccess(`Review for ${targetType === 'user' ? peerUser?.name : 'Resource'} submitted!`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit review.';
      setError(msg);
      showError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#01140F]/70 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#14201e] rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-[#A3B0AF]/40 dark:border-[#283d39] relative text-[#01140F] dark:text-[#f0f6f4] transition-colors">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#A3B0AF] dark:text-[#6c8280] hover:text-[#01140F] dark:hover:text-[#f0f6f4] p-1.5 rounded-full hover:bg-[#F7F8FA] dark:hover:bg-[#1c2c29] transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-[#AAA86D]/15 border border-[#AAA86D]/30 flex items-center justify-center text-[#AAA86D] dark:text-[#c4c184]">
            <Star className="w-6 h-6 fill-[#AAA86D] dark:fill-[#c4c184]" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-[#01140F] dark:text-[#f0f6f4]">Leave a Review</h3>
            <p className="text-xs text-[#516B71] dark:text-[#8fa6a4]">Share your experience with the campus community</p>
          </div>
        </div>

        {/* Target Type Selector */}
        <div className="grid grid-cols-2 gap-2 mb-5 p-1 bg-[#F7F8FA] dark:bg-[#0e1716] rounded-2xl border border-[#A3B0AF]/30 dark:border-[#283d39]">
          <button
            type="button"
            onClick={() => setTargetType('user')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition ${
              targetType === 'user'
                ? 'bg-[#36586A] text-white shadow-sm'
                : 'text-[#516B71] dark:text-[#8fa6a4] hover:text-[#01140F] dark:hover:text-[#f0f6f4]'
            }`}
          >
            Review {peerRoleLabel} ({peerUser?.name || 'Peer'})
          </button>
          <button
            type="button"
            onClick={() => setTargetType('resource')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition ${
              targetType === 'resource'
                ? 'bg-[#36586A] text-white shadow-sm'
                : 'text-[#516B71] dark:text-[#8fa6a4] hover:text-[#01140F] dark:hover:text-[#f0f6f4]'
            }`}
          >
            Review Resource
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-[#83727E]/15 border border-[#83727E]/30 text-[#01140F] dark:text-[#f0f6f4] text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Star rating selector */}
          <div className="text-center py-2">
            <label className="block text-xs font-bold text-[#01140F] dark:text-[#f0f6f4] mb-2">Rating</label>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => {
                const filled = (hoverRating || rating) >= star;
                return (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="p-1 text-[#A3B0AF] hover:scale-125 transition-transform"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        filled ? 'text-[#AAA86D] dark:text-[#c4c184] fill-[#AAA86D] dark:fill-[#c4c184]' : 'text-[#A3B0AF]/40 dark:text-[#3b524e]'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
            <span className="text-xs text-[#AAA86D] dark:text-[#c4c184] font-bold mt-1 inline-block">
              {rating === 5 && 'Outstanding ★★★★★'}
              {rating === 4 && 'Very Good ★★★★☆'}
              {rating === 3 && 'Average ★★★☆☆'}
              {rating === 2 && 'Needs Improvement ★★☆☆☆'}
              {rating === 1 && 'Poor ★☆☆☆☆'}
            </span>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-xs font-bold text-[#01140F] dark:text-[#f0f6f4] mb-1.5 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-[#36586A] dark:text-[#50829C]" /> Comments & Feedback
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={
                targetType === 'user'
                  ? 'How was your communication and experience with this student?'
                  : 'How was the condition and usability of the resource?'
              }
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#A3B0AF]/40 dark:border-[#283d39] focus:outline-none focus:ring-2 focus:ring-[#36586A] text-xs text-[#01140F] dark:text-[#f0f6f4] bg-white dark:bg-[#0e1716] resize-none placeholder:text-[#A3B0AF] dark:placeholder:text-[#6c8280]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#516B71] dark:text-[#8fa6a4] hover:bg-[#F7F8FA] dark:hover:bg-[#1c2c29] transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-[#36586A] hover:bg-[#36586A]/90 dark:bg-[#36586A] dark:hover:bg-[#47768E] disabled:opacity-50 transition shadow-md shadow-[#36586A]/20"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  Submit Review
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
