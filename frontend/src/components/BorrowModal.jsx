import React, { useState } from 'react';
import { X, Calendar, MessageSquare, IndianRupee, Sparkles, Send } from 'lucide-react';
import { borrowApi } from '../api';
import { useToast } from '../context/ToastContext';

export default function BorrowModal({ resource, isOpen, onClose, onSuccess }) {
  const today = new Date().toISOString().split('T')[0];
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  const acceptedMethods =
    resource?.acceptedPaymentMethods && resource.acceptedPaymentMethods.length > 0
      ? resource.acceptedPaymentMethods
      : ['pay_on_collection', 'razorpay'];

  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(nextWeek);
  const [paymentMethod, setPaymentMethod] = useState(
    acceptedMethods.includes('razorpay') ? 'razorpay' : acceptedMethods[0] || 'pay_on_collection'
  );
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
        paymentMethod: resource.securityDeposit > 0 ? paymentMethod : 'pay_on_collection',
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#01140F]/70 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#14201e] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[#A3B0AF]/40 dark:border-[#283d39] relative text-[#01140F] dark:text-[#f0f6f4] transition-colors">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#A3B0AF] dark:text-[#6c8280] hover:text-[#01140F] dark:hover:text-[#f0f6f4] p-1.5 rounded-full hover:bg-[#F7F8FA] dark:hover:bg-[#1c2c29] transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#36586A]/10 dark:bg-[#50829C]/20 border border-[#36586A]/20 dark:border-[#50829C]/30 flex items-center justify-center text-[#36586A] dark:text-[#50829C]">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-[#01140F] dark:text-[#f0f6f4]">Request to Borrow</h3>
            <p className="text-xs text-[#516B71] dark:text-[#8fa6a4] font-medium">
              Item: <span className="font-bold text-[#01140F] dark:text-[#f0f6f4]">{resource.title}</span>
            </p>
          </div>
        </div>

        {/* Resource quick summary */}
        <div className="bg-[#F7F8FA] dark:bg-[#0e1716] border border-[#A3B0AF]/30 dark:border-[#283d39] rounded-2xl p-4 mb-6 flex items-center justify-between text-xs">
          <div>
            <span className="text-[#516B71] dark:text-[#8fa6a4] block">Owner</span>
            <span className="font-bold text-[#01140F] dark:text-[#f0f6f4]">{resource.owner?.name || 'Fellow Student'}</span>
          </div>
          <div className="text-right">
            <span className="text-[#516B71] dark:text-[#8fa6a4] block">Security Deposit</span>
            <span className="font-bold text-[#36586A] dark:text-[#50829C] text-sm flex items-center justify-end">
              {resource.listingType === 'donate' ? (
                <span className="text-[#6B8B78] dark:text-[#81ac90]">FREE (Donation)</span>
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
          <div className="mb-4 p-3 rounded-xl bg-[#83727E]/15 border border-[#83727E]/30 text-[#01140F] dark:text-[#f0f6f4] text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Request Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#01140F] dark:text-[#f0f6f4] mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#36586A] dark:text-[#50829C]" /> Start Date
              </label>
              <input
                type="date"
                min={today}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#A3B0AF]/40 dark:border-[#283d39] focus:outline-none focus:ring-2 focus:ring-[#36586A] text-xs font-medium text-[#01140F] dark:text-[#f0f6f4] bg-white dark:bg-[#0e1716]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#01140F] dark:text-[#f0f6f4] mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#36586A] dark:text-[#50829C]" /> End Date
              </label>
              <input
                type="date"
                min={startDate || today}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#A3B0AF]/40 dark:border-[#283d39] focus:outline-none focus:ring-2 focus:ring-[#36586A] text-xs font-medium text-[#01140F] dark:text-[#f0f6f4] bg-white dark:bg-[#0e1716]"
              />
            </div>
          </div>

          {resource.listingType === 'lend' && resource.securityDeposit > 0 && (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#01140F] dark:text-[#f0f6f4] flex items-center justify-between">
                <span>Select Deposit Payment Method</span>
                <span className="text-[11px] font-normal text-[#516B71] dark:text-[#8fa6a4]">
                  ₹{resource.securityDeposit} deposit
                </span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {acceptedMethods.includes('pay_on_collection') && (
                  <label
                    className={`flex items-start gap-2.5 p-3 rounded-2xl border cursor-pointer transition text-xs ${
                      paymentMethod === 'pay_on_collection'
                        ? 'border-[#36586A] bg-[#36586A]/5 dark:bg-[#36586A]/20 dark:border-[#50829C]'
                        : 'border-[#A3B0AF]/40 dark:border-[#283d39] hover:border-[#36586A]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="pay_on_collection"
                      checked={paymentMethod === 'pay_on_collection'}
                      onChange={() => setPaymentMethod('pay_on_collection')}
                      className="mt-0.5 accent-[#36586A]"
                    />
                    <div>
                      <div className="font-bold text-[#01140F] dark:text-[#f0f6f4]">Pay on Collection</div>
                      <div className="text-[11px] text-[#516B71] dark:text-[#8fa6a4]">
                        Pay cash / UPI in person when meeting owner
                      </div>
                    </div>
                  </label>
                )}

                {acceptedMethods.includes('razorpay') && (
                  <label
                    className={`flex items-start gap-2.5 p-3 rounded-2xl border cursor-pointer transition text-xs ${
                      paymentMethod === 'razorpay'
                        ? 'border-[#36586A] bg-[#36586A]/5 dark:bg-[#36586A]/20 dark:border-[#50829C]'
                        : 'border-[#A3B0AF]/40 dark:border-[#283d39] hover:border-[#36586A]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="razorpay"
                      checked={paymentMethod === 'razorpay'}
                      onChange={() => setPaymentMethod('razorpay')}
                      className="mt-0.5 accent-[#36586A]"
                    />
                    <div>
                      <div className="font-bold text-[#01140F] dark:text-[#f0f6f4]">Razorpay (Online)</div>
                      <div className="text-[11px] text-[#516B71] dark:text-[#8fa6a4]">
                        Pay deposit via UPI / Cards once request accepted
                      </div>
                    </div>
                  </label>
                )}
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#01140F] dark:text-[#f0f6f4] mb-1.5 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-[#36586A] dark:text-[#50829C]" /> Message to Owner (Optional)
            </label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Hi! I need this for my upcoming exams. Can we meet on campus?"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#A3B0AF]/40 dark:border-[#283d39] focus:outline-none focus:ring-2 focus:ring-[#36586A] text-xs text-[#01140F] dark:text-[#f0f6f4] bg-white dark:bg-[#0e1716] resize-none placeholder:text-[#A3B0AF] dark:placeholder:text-[#6c8280]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
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
