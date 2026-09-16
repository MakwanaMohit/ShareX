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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <IndianRupee className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Update Deposit Status</h3>
            <p className="text-xs text-slate-500">Manage security deposit for this transaction</p>
          </div>
        </div>

        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 mb-5 space-y-1.5 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-500">Deposit Amount:</span>
            <span className="font-bold text-slate-800 flex items-center">
              <IndianRupee className="w-3 h-3" />
              {transaction.depositAmount}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Borrower:</span>
            <span className="font-semibold text-slate-800">{transaction.borrower?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Current Status:</span>
            <span className="font-semibold uppercase tracking-wider text-indigo-600">
              {transaction.depositStatus}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">Select New Status</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDepositStatus('refunded')}
                className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between ${
                  depositStatus === 'refunded'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <RefreshCw className="w-5 h-5 text-emerald-600" />
                  {depositStatus === 'refunded' && (
                    <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                      <Check className="w-3 h-3" />
                    </span>
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-xs">Refund to Student</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Item returned in expected condition.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setDepositStatus('retained')}
                className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between ${
                  depositStatus === 'retained'
                    ? 'border-rose-500 bg-rose-50 text-rose-900 ring-2 ring-rose-500'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <ShieldAlert className="w-5 h-5 text-rose-600" />
                  {depositStatus === 'retained' && (
                    <span className="w-4 h-4 rounded-full bg-rose-600 text-white flex items-center justify-center">
                      <Check className="w-3 h-3" />
                    </span>
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-xs">Retain Deposit</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Item damaged, lost, or violated terms.
                  </p>
                </div>
              </button>
            </div>
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
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition shadow-md shadow-indigo-200"
            >
              {loading ? 'Updating...' : 'Confirm Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
