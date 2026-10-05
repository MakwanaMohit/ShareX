import React, { useState } from 'react';
import { X, IndianRupee, RefreshCw, ShieldAlert, Check } from 'lucide-react';
import { transactionApi } from '../api';
import { useToast } from '../context/ToastContext';

export default function DepositModal({ transaction, isOpen, onClose, onSuccess }) {
  const [depositStatus, setDepositStatus] = useState(
    transaction?.depositStatus === 'pending' ? 'refunded' : transaction?.depositStatus || 'refunded'
  );
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useToast();

  if (!isOpen || !transaction) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await transactionApi.updateDepositStatus(transaction._id, depositStatus);
      showSuccess(`Deposit status updated to "${depositStatus}".`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to update deposit status.');
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
          <div className="w-12 h-12 rounded-2xl bg-[#36586A]/10 dark:bg-[#50829C]/20 border border-[#36586A]/20 dark:border-[#50829C]/30 flex items-center justify-center text-[#36586A] dark:text-[#50829C]">
            <IndianRupee className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-[#01140F] dark:text-[#f0f6f4]">Update Deposit Status</h3>
            <p className="text-xs text-[#516B71] dark:text-[#8fa6a4]">Manage security deposit for this transaction</p>
          </div>
        </div>

        <div className="p-4 bg-[#F7F8FA] dark:bg-[#0e1716] rounded-2xl border border-[#A3B0AF]/30 dark:border-[#283d39] mb-5 space-y-1.5 text-xs">
          <div className="flex justify-between">
            <span className="text-[#516B71] dark:text-[#8fa6a4]">Deposit Amount:</span>
            <span className="font-bold text-[#01140F] dark:text-[#f0f6f4] flex items-center">
              <IndianRupee className="w-3 h-3" />
              {transaction.depositAmount}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#516B71] dark:text-[#8fa6a4]">Borrower:</span>
            <span className="font-bold text-[#01140F] dark:text-[#f0f6f4]">{transaction.borrower?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#516B71] dark:text-[#8fa6a4]">Current Status:</span>
            <span className="font-bold uppercase tracking-wider text-[#36586A] dark:text-[#50829C]">
              {transaction.depositStatus}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#01140F] dark:text-[#f0f6f4]">Select New Status</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDepositStatus('refunded')}
                className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between ${
                  depositStatus === 'refunded'
                    ? 'border-[#6B8B78] bg-[#6B8B78]/15 text-[#01140F] dark:text-[#f0f6f4] ring-2 ring-[#6B8B78]'
                    : 'border-[#A3B0AF]/40 dark:border-[#283d39] hover:border-[#36586A] dark:hover:border-[#50829C] text-[#01140F] dark:text-[#f0f6f4]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <RefreshCw className="w-5 h-5 text-[#6B8B78]" />
                  {depositStatus === 'refunded' && (
                    <span className="w-4 h-4 rounded-full bg-[#6B8B78] text-white flex items-center justify-center">
                      <Check className="w-3 h-3" />
                    </span>
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-xs text-[#01140F] dark:text-[#f0f6f4]">Refund to Student</h4>
                  <p className="text-[11px] text-[#516B71] dark:text-[#8fa6a4] mt-0.5">
                    Item returned in expected condition.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setDepositStatus('retained')}
                className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between ${
                  depositStatus === 'retained'
                    ? 'border-[#83727E] bg-[#83727E]/15 text-[#01140F] dark:text-[#f0f6f4] ring-2 ring-[#83727E]'
                    : 'border-[#A3B0AF]/40 dark:border-[#283d39] hover:border-[#83727E] text-[#01140F] dark:text-[#f0f6f4]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <ShieldAlert className="w-5 h-5 text-[#83727E]" />
                  {depositStatus === 'retained' && (
                    <span className="w-4 h-4 rounded-full bg-[#83727E] text-white flex items-center justify-center">
                      <Check className="w-3 h-3" />
                    </span>
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-xs text-[#01140F] dark:text-[#f0f6f4]">Retain Deposit</h4>
                  <p className="text-[11px] text-[#516B71] dark:text-[#8fa6a4] mt-0.5">
                    Item damaged, lost, or terms violated.
                  </p>
                </div>
              </button>
            </div>
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
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-[#36586A] hover:bg-[#36586A]/90 dark:bg-[#36586A] dark:hover:bg-[#47768E] disabled:opacity-50 transition shadow-md shadow-[#36586A]/20"
            >
              {loading ? 'Updating...' : 'Confirm Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
