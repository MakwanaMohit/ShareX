import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  IndianRupee,
  Star,
  CheckCircle2,
  RefreshCw,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Calendar,
  Layers,
  Award,
} from 'lucide-react';
import { transactionApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ReviewModal from '../components/ReviewModal';
import DepositModal from '../components/DepositModal';

const depositBadgeStyles = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  refunded: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  retained: 'bg-rose-50 text-rose-700 border-rose-200',
};

export default function TransactionsPage() {
  const { user } = useAuth();
  const { showError } = useToast();

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'completed'

  // Modals state
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
  }, [fetchTransactions]);

  const filteredTransactions = transactions.filter((tx) => {
    if (filter === 'active') return !tx.completedAt;
    if (filter === 'completed') return Boolean(tx.completedAt);
    return true;
  });

  return (
    <div className="space-y-8 pb-16 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Transactions & Deposits
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track resource borrowing history, manage security deposits, and rate your exchange peers
          </p>
        </div>

        {/* Filter Pills */}
        <div className="inline-flex p-1 bg-slate-100 rounded-2xl text-xs font-semibold self-start">
          <button
            onClick={() => setFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl transition ${
              filter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({transactions.length})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-3.5 py-1.5 rounded-xl transition ${
              filter === 'active' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3.5 py-1.5 rounded-xl transition ${
              filter === 'completed' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Completed
          </button>
        </div>
      </div>

      {/* Transactions List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 animate-pulse space-y-3">
              <div className="h-4 bg-slate-200 rounded w-1/3" />
              <div className="h-3 bg-slate-200 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 p-8 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center mx-auto">
            <Clock className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">No transactions recorded</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Transactions are created automatically whenever a lender accepts a borrow request.
            </p>
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow transition"
          >
            Browse Marketplace
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTransactions.map((tx) => {
            const isLender = tx.lender?._id === user?._id || tx.lender === user?._id;
            const peer = isLender ? tx.borrower : tx.lender;
            const myRole = isLender ? 'Lender (You)' : 'Borrower (You)';

            return (
              <div
                key={tx._id}
                className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-5 hover:border-indigo-200 transition"
              >
                {/* Top status bar */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-700">
                      {myRole}
                    </span>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Started: {new Date(tx.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {tx.completedAt ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Completed & Returned ({new Date(tx.completedAt).toLocaleDateString()})
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        <Clock className="w-3.5 h-3.5 text-indigo-600" />
                        In Progress / Lent Out
                      </span>
                    )}
                  </div>
                </div>

                {/* Resource and Peer Information */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  {/* Resource info */}
                  <div>
                    <span className="text-slate-400 block font-medium mb-1">Resource:</span>
                    {tx.resource ? (
                      <Link
                        to={`/resources/${tx.resource._id || tx.resource}`}
                        className="font-bold text-slate-900 hover:text-indigo-600 text-sm flex items-center gap-1"
                      >
                        {tx.resource.title || 'View Resource'}
                        <ArrowRight className="w-3.5 h-3.5 text-indigo-500" />
                      </Link>
                    ) : (
                      <span className="text-slate-400 italic">Resource removed</span>
                    )}
                  </div>

                  {/* Peer student */}
                  <div>
                    <span className="text-slate-400 block font-medium mb-1">
                      {isLender ? 'Borrower:' : 'Lender:'}
                    </span>
                    {peer ? (
                      <Link
                        to={`/users/${peer._id || peer}`}
                        className="font-bold text-slate-800 hover:text-indigo-600 flex items-center gap-1.5"
                      >
                        <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] flex items-center justify-center">
                          {peer.name?.charAt(0) || 'U'}
                        </div>
                        {peer.name}
                      </Link>
                    ) : (
                      <span className="text-slate-400">User</span>
                    )}
                  </div>

                  {/* Deposit Info */}
                  <div>
                    <span className="text-slate-400 block font-medium mb-1">Security Deposit:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm flex items-center">
                        <IndianRupee className="w-3.5 h-3.5" />
                        {tx.depositAmount || 0}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border capitalize ${
                          depositBadgeStyles[tx.depositStatus] || 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {tx.depositStatus === 'refunded' && <RefreshCw className="w-3 h-3 text-emerald-600" />}
                        {tx.depositStatus === 'retained' && <ShieldAlert className="w-3 h-3 text-rose-600" />}
                        Deposit: {tx.depositStatus}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 flex flex-wrap items-center justify-end gap-2 border-t border-slate-100">
                  {/* Lender Deposit Management Button */}
                  {isLender && tx.depositAmount > 0 && (
                    <button
                      onClick={() => setDepositModalTx(tx)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
                    >
                      <IndianRupee className="w-3.5 h-3.5 text-indigo-600" />
                      Update Deposit Status
                    </button>
                  )}

                  {/* Leave Review Button */}
                  <button
                    onClick={() => setReviewModalTx(tx)}
                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200 transition"
                  >
                    <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                    Leave a Review
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
