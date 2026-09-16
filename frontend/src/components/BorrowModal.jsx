import React, { useState } from 'react';
import { X, Calendar, MessageSquare, IndianRupee, Sparkles, Send } from 'lucide-react';
import { borrowApi } from '../api';
import { useToast } from '../context/ToastContext';

export default function BorrowModal({ resource, isOpen, onClose, onSuccess }) {
  // Defaults: startDate today, endDate in 7 days
  const today = new Date().toISOString().split('T')[0];
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(nextWeek);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { showSuccess, showError } = useToast();

  if (!isOpen || !resource) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!startDate || !endDate) {
      setError('Please select both start and end dates.');
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      setError('End date cannot be before start date.');
      return;
    }

    try {
      setLoading(true);
      await borrowApi.sendRequest({
        resourceId: resource._id,
        startDate,
        endDate,
        message: message.trim(),
      });

      showSuccess('Borrow request sent successfully! The owner has been notified.');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send borrow request.';
      setError(msg);
      showError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Request to Borrow</h3>
            <p className="text-xs text-slate-500 font-medium">
              Item: <span className="font-semibold text-slate-800">{resource.title}</span>
            </p>
          </div>
        </div>

        {/* Resource quick summary */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 mb-6 flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-500 block">Owner</span>
            <span className="font-semibold text-slate-800">{resource.owner?.name || 'Fellow Student'}</span>
          </div>
          <div className="text-right">
            <span className="text-slate-500 block">Security Deposit</span>
            <span className="font-bold text-indigo-600 text-sm flex items-center justify-end">
              {resource.listingType === 'donate' ? (
                'FREE (Donation)'
              ) : (
                <>
                  <IndianRupee className="w-3.5 h-3.5" />
                  {resource.securityDeposit || 0}
                </>
              )}
            </span>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Request Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-600" /> Start Date
              </label>
              <input
                type="date"
                min={today}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-medium text-slate-800 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-600" /> End Date
              </label>
              <input
                type="date"
                min={startDate || today}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-medium text-slate-800 bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-indigo-600" /> Message to Owner (Optional)
            </label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Hi! I need this for my upcoming exams. Can we meet on campus?"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs text-slate-800 resize-none placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition shadow-md shadow-indigo-200"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  Send Borrow Request
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
