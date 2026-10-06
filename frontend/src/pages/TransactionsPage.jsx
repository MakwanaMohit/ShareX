import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  IndianRupee,
  Star,
  ArrowRight,
  RotateCw,
} from 'lucide-react';
import { transactionApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useRefresh } from '../context/RefreshContext';
import ReviewModal from '../components/ReviewModal';
import DepositModal from '../components/DepositModal';

export default function TransactionsPage() {
  const { user } = useAuth();
  const { showError } = useToast();
  const { refreshTick } = useRefresh();

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const [reviewModalTx, setReviewModalTx] = useState(null);
  const [depositModalTx, setDepositModalTx] = useState(null);

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const res = await transactionApi.getAll();
      setTransactions(res.data?.data?.transactions || []);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      showError('Failed to load transaction history.');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions, refreshTick]);

  const filteredTransactions = transactions.filter((tx) => {
    if (filter === 'active') return !tx.completedAt;
    if (filter === 'completed') return Boolean(tx.completedAt);
    return true;
  });

  return (
    <div className="space-y-6 pb-16 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#01140F] dark:text-[#f0f6f4] tracking-tight">
            Transactions & Deposits
          </h1>
          <p className="text-xs text-[#516B71] dark:text-[#8fa6a4]">
            Track past and ongoing exchanges, manage security deposits, and leave reviews.
          </p>
        </div>

        {/* Action Controls & Filter Pills */}
        <div className="flex items-center gap-2">
          <button
            onClick={fetchTransactions}
            disabled={loading}
            title="Refresh transactions"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl border border-[#A3B0AF]/30 dark:border-[#283d39] bg-white dark:bg-[#14201e] text-xs font-semibold text-[#516B71] dark:text-[#8fa6a4] hover:text-[#01140F] dark:hover:text-[#f0f6f4] hover:border-[#36586A] transition shadow-xs cursor-pointer"
          >
            <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#36586A] dark:text-[#50829C]' : ''}`} />
            <span>Refresh</span>
          </button>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-xl transition ${
                filter === 'all'
                  ? 'bg-[#01140F] text-white dark:bg-[#36586a] dark:text-white'
                  : 'text-[#516B71] dark:text-[#8fa6a4] hover:text-[#01140F] dark:hover:text-[#f0f6f4]'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-3 py-1 rounded-xl transition ${
                filter === 'active'
                  ? 'bg-[#01140F] text-white dark:bg-[#36586a] dark:text-white'
                  : 'text-[#516B71] dark:text-[#8fa6a4] hover:text-[#01140F] dark:hover:text-[#f0f6f4]'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-3 py-1 rounded-xl transition ${
                filter === 'completed'
                  ? 'bg-[#01140F] text-white dark:bg-[#36586a] dark:text-white'
                  : 'text-[#516B71] dark:text-[#8fa6a4] hover:text-[#01140F] dark:hover:text-[#f0f6f4]'
              }`}
            >
              Completed
            </button>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white dark:bg-[#14201e] p-5 rounded-2xl border border-[#A3B0AF]/20 dark:border-[#283d39] animate-pulse space-y-2">
              <div className="h-4 bg-[#A3B0AF]/15 dark:bg-[#253935] rounded w-1/3" />
              <div className="h-3 bg-[#A3B0AF]/10 dark:bg-[#1f2f2c] rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-[#14201e] rounded-2xl border border-[#A3B0AF]/20 dark:border-[#283d39] p-8 space-y-2">
          <p className="text-sm font-semibold text-[#01140F] dark:text-[#f0f6f4]">No transactions found</p>
          <p className="text-xs text-[#516B71] dark:text-[#8fa6a4]">
            Transactions are recorded automatically when borrow requests are accepted.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTransactions.map((tx) => {
            const isLender = tx.lender?._id === user?._id || tx.lender === user?._id;
            const peer = isLender ? tx.borrower : tx.lender;
            const myRole = isLender ? 'Lender' : 'Borrower';

            return (
              <div
                key={tx._id}
                className="bg-white dark:bg-[#14201e] rounded-2xl border border-[#A3B0AF]/20 dark:border-[#283d39] p-5 space-y-4 shadow-xs text-xs"
              >
                {/* Header row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#01140F] dark:text-[#f0f6f4]">
                      {tx.resource?.title || 'Resource'}
                    </span>
                    <span className="text-[#A3B0AF] dark:text-[#6c8280]">•</span>
                    <span className="text-[#516B71] dark:text-[#8fa6a4]">
                      {isLender ? 'Borrower' : 'Lender'}: <strong className="text-[#01140F] dark:text-[#f0f6f4]">{peer?.name}</strong>
                    </span>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    tx.completedAt ? 'bg-[#6B8B78]/15 text-[#6B8B78] dark:text-[#81ac90]' : 'bg-[#36586A]/15 text-[#36586A] dark:text-[#50829C]'
                  }`}>
                    {tx.completedAt ? 'Completed' : 'In Progress'}
                  </span>
                </div>

                {/* Details row */}
                <div className="flex flex-wrap items-center gap-5 text-[#516B71] dark:text-[#8fa6a4]">
                  <span>Your Role: <strong className="text-[#01140F] dark:text-[#f0f6f4]">{myRole}</strong></span>
                  {tx.depositAmount > 0 && (
                    <span className="flex items-center gap-1">
                      Deposit: <strong className="text-[#01140F] dark:text-[#f0f6f4]">₹{tx.depositAmount}</strong>
                      <span className="capitalize text-[#A3B0AF] dark:text-[#6c8280]">({tx.depositStatus})</span>
                    </span>
                  )}
                  <span>Started: {new Date(tx.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>

                {/* Actions */}
                <div className="pt-2 border-t border-[#F7F8FA] dark:border-[#1e302d] flex items-center justify-end gap-2">
                  {isLender && tx.depositAmount > 0 && (
                    <button
                      onClick={() => setDepositModalTx(tx)}
                      className="px-3 py-1.5 rounded-xl font-medium text-[#01140F] dark:text-[#f0f6f4] bg-[#F7F8FA] dark:bg-[#192825] hover:bg-[#A3B0AF]/20 dark:hover:bg-[#283d39] transition"
                    >
                      Deposit Status
                    </button>
                  )}

                  <button
                    onClick={() => setReviewModalTx(tx)}
                    className="px-3.5 py-1.5 rounded-xl font-semibold text-white bg-[#01140F] dark:bg-[#36586A] hover:bg-[#36586A] dark:hover:bg-[#47768E] transition flex items-center gap-1"
                  >
                    <Star className="w-3 h-3 text-[#AAA86D] dark:text-[#c4c184]" />
                    Review
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Review Modal */}
      <ReviewModal
        transaction={reviewModalTx}
        isOpen={Boolean(reviewModalTx)}
        onClose={() => setReviewModalTx(null)}
        onSuccess={fetchTransactions}
      />

      {/* Deposit Status Modal */}
      <DepositModal
        transaction={depositModalTx}
        isOpen={Boolean(depositModalTx)}
        onClose={() => setDepositModalTx(null)}
        onSuccess={fetchTransactions}
      />
    </div>
  );
}
