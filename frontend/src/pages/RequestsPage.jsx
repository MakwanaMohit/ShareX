import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Inbox,
  Send,
  Check,
  X,
  RotateCcw,
  Calendar,
  MessageSquare,
  Star,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { borrowApi } from '../api';
import { useToast } from '../context/ToastContext';

const statusBadgeStyles = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  accepted: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected: 'bg-rose-50 text-rose-700 border-rose-200',
  returned: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  cancelled: 'bg-slate-100 text-slate-600 border-slate-200',
};

export default function RequestsPage() {
  const [activeTab, setActiveTab] = useState('incoming'); // 'incoming' or 'outgoing'
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const { showSuccess, showError } = useToast();

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const [incRes, outRes] = await Promise.all([
        borrowApi.getIncoming(),
        borrowApi.getOutgoing(),
      ]);
      setIncomingRequests(incRes.data?.data?.requests || []);
      setOutgoingRequests(outRes.data?.data?.requests || []);
    } catch (err) {
      console.error('Error fetching borrow requests:', err);
      showError('Failed to load borrow requests.');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleAccept = async (id) => {
    try {
      setActionLoadingId(id);
      await borrowApi.accept(id);
      showSuccess('Borrow request accepted! Transaction created.');
      fetchRequests();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to accept request.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Are you sure you want to decline this borrow request?')) return;
    try {
      setActionLoadingId(id);
      await borrowApi.reject(id);
      showSuccess('Borrow request declined.');
      fetchRequests();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to decline request.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleMarkReturned = async (id) => {
    if (!window.confirm('Confirm that the resource has been safely returned to you?')) return;
    try {
      setActionLoadingId(id);
      await borrowApi.markReturned(id);
      showSuccess('Resource marked as returned! You can now manage deposit & review.');
      fetchRequests();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to mark as returned.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel your borrow request?')) return;
    try {
      setActionLoadingId(id);
      await borrowApi.cancel(id);
      showSuccess('Borrow request cancelled.');
      fetchRequests();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to cancel request.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const pendingIncomingCount = incomingRequests.filter((r) => r.status === 'pending').length;
  const currentList = activeTab === 'incoming' ? incomingRequests : outgoingRequests;

  return (
    <div className="space-y-8 pb-16 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Borrow Requests Hub
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review incoming borrower requests for your items and track your own requests
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('incoming')}
          className={`flex items-center gap-2 pb-4 px-4 text-xs font-bold transition border-b-2 ${
            activeTab === 'incoming'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Inbox className="w-4 h-4" />
          <span>Incoming Requests (As Owner)</span>
          {pendingIncomingCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700">
              {pendingIncomingCount} pending
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('outgoing')}
          className={`flex items-center gap-2 pb-4 px-4 text-xs font-bold transition border-b-2 ${
            activeTab === 'outgoing'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>Outgoing Requests (As Borrower)</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
            {outgoingRequests.length}
          </span>
        </button>
      </div>

      {/* Requests List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white p-5 rounded-2xl border border-slate-200 animate-pulse space-y-3"
            >
              <div className="h-4 bg-slate-200 rounded w-1/3" />
              <div className="h-3 bg-slate-200 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : currentList.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 p-8 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center mx-auto">
            {activeTab === 'incoming' ? <Inbox className="w-8 h-8" /> : <Send className="w-8 h-8" />}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">
              {activeTab === 'incoming' ? 'No incoming requests yet' : 'No outgoing requests'}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              {activeTab === 'incoming'
                ? 'When peers ask to borrow your listed resources, their requests will appear here.'
                : 'Browse the marketplace and find resources you need for your courses.'}
            </p>
          </div>
          {activeTab === 'outgoing' && (
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow transition"
            >
              Explore Resources
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {currentList.map((req) => {
            const isProcessing = actionLoadingId === req._id;
            const peer = activeTab === 'incoming' ? req.requester : req.owner;
            const peerLabel = activeTab === 'incoming' ? 'Requester' : 'Owner';

            const startDate = req.borrowDuration?.startDate
              ? new Date(req.borrowDuration.startDate).toLocaleDateString()
              : 'N/A';
            const endDate = req.borrowDuration?.endDate
              ? new Date(req.borrowDuration.endDate).toLocaleDateString()
              : 'N/A';

            return (
              <div
                key={req._id}
                className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4 hover:border-indigo-200 transition"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center text-sm uppercase overflow-hidden shrink-0">
                      {peer?.profilePicture ? (
                        <img
                          src={peer.profilePicture}
                          alt={peer.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        peer?.name?.charAt(0) || 'U'
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/users/${peer?._id || ''}`}
                          className="text-xs font-bold text-slate-800 hover:text-indigo-600 transition"
                        >
                          {peer?.name || 'Fellow Student'}
                        </Link>
                        <span className="text-[10px] text-slate-400">({peerLabel})</span>
                      </div>
                      {peer?.rating && (
                        <span className="flex items-center gap-1 text-[10px] text-amber-600 font-medium">
                          <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                          {peer.rating.average?.toFixed(1) || '0.0'} ({peer.rating.count || 0})
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border capitalize ${
                        statusBadgeStyles[req.status] || 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {req.status === 'pending' && <Clock className="w-3 h-3" />}
                      {req.status === 'accepted' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                      {req.status === 'returned' && <CheckCircle2 className="w-3 h-3 text-indigo-600" />}
                      {req.status === 'rejected' && <XCircle className="w-3 h-3 text-rose-600" />}
                      {req.status === 'cancelled' && <RotateCcw className="w-3 h-3 text-slate-400" />}
                      Status: {req.status}
                    </span>
                  </div>
                </div>

                {/* Resource & Duration Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block font-medium">Resource Requested:</span>
                    {req.resource ? (
                      <Link
                        to={`/resources/${req.resource._id || req.resource}`}
                        className="font-bold text-indigo-600 hover:text-indigo-800 text-sm flex items-center gap-1 mt-0.5"
                      >
                        {req.resource.title || 'View Resource'}
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    ) : (
                      <span className="text-slate-500 italic">Resource removed</span>
                    )}
                  </div>

                  <div>
                    <span className="text-slate-400 block font-medium">Duration:</span>
                    <span className="font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5">
                      <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                      {startDate} — {endDate}
                    </span>
                  </div>
                </div>

                {/* Optional Message */}
                {req.message && (
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/70 text-xs text-slate-700 flex items-start gap-2">
                    <MessageSquare className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-slate-900">Note: </span>
                      <span>"{req.message}"</span>
                    </div>
                  </div>
                )}

                {/* Actions Row */}
                <div className="pt-2 flex flex-wrap items-center justify-end gap-2">
                  {/* Incoming owner actions */}
                  {activeTab === 'incoming' && req.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleReject(req._id)}
                        disabled={isProcessing}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 disabled:opacity-50 transition"
                      >
                        <X className="w-3.5 h-3.5" /> Decline
                      </button>
                      <button
                        onClick={() => handleAccept(req._id)}
                        disabled={isProcessing}
                        className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 shadow-sm transition"
                      >
                        <Check className="w-3.5 h-3.5" /> Accept Request
                      </button>
                    </>
                  )}

                  {activeTab === 'incoming' && req.status === 'accepted' && (
                    <button
                      onClick={() => handleMarkReturned(req._id)}
                      disabled={isProcessing}
                      className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 shadow-sm transition"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Mark Resource as Returned
                    </button>
                  )}

                  {/* Outgoing requester actions */}
                  {activeTab === 'outgoing' && req.status === 'pending' && (
                    <button
                      onClick={() => handleCancel(req._id)}
                      disabled={isProcessing}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-50 transition"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Cancel My Request
                    </button>
                  )}

                  {/* If returned, link to transactions */}
                  {req.status === 'returned' && (
                    <Link
                      to="/transactions"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition"
                    >
                      <Star className="w-3.5 h-3.5" /> View Transaction & Review →
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
