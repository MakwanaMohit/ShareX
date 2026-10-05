import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Inbox,
  Send,
  Calendar,
  MessageSquare,
  ArrowRight,
} from 'lucide-react';
import { borrowApi } from '../api';
import { useToast } from '../context/ToastContext';

export default function RequestsPage() {
  const [activeTab, setActiveTab] = useState('incoming');
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
      showSuccess('Borrow request accepted.');
      fetchRequests();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to accept request.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Decline this borrow request?')) return;
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
    if (!window.confirm('Confirm resource has been returned?')) return;
    try {
      setActionLoadingId(id);
      await borrowApi.markReturned(id);
      showSuccess('Resource marked as returned.');
      fetchRequests();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to mark as returned.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel your borrow request?')) return;
    try {
      setActionLoadingId(id);
      await borrowApi.cancel(id);
      showSuccess('Request cancelled.');
      fetchRequests();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to cancel request.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const currentList = activeTab === 'incoming' ? incomingRequests : outgoingRequests;

  return (
    <div className="space-y-6 pb-16 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#01140F] dark:text-[#f0f6f4] tracking-tight">
          Borrow Requests
        </h1>
        <p className="text-xs text-[#516B71] dark:text-[#8fa6a4]">
          Manage incoming requests from peers and track your active borrow inquiries.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#A3B0AF]/20 dark:border-[#283d39] text-xs font-semibold gap-6">
        <button
          onClick={() => setActiveTab('incoming')}
          className={`pb-3 border-b-2 transition flex items-center gap-1.5 ${
            activeTab === 'incoming'
              ? 'border-[#01140F] dark:border-[#50829C] text-[#01140F] dark:text-[#f0f6f4]'
              : 'border-transparent text-[#516B71] dark:text-[#8fa6a4] hover:text-[#01140F] dark:hover:text-[#f0f6f4]'
          }`}
        >
          <Inbox className="w-3.5 h-3.5" />
          <span>Incoming Requests</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#F7F8FA] dark:bg-[#192825] text-[#516B71] dark:text-[#8fa6a4]">
            {incomingRequests.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('outgoing')}
          className={`pb-3 border-b-2 transition flex items-center gap-1.5 ${
            activeTab === 'outgoing'
              ? 'border-[#01140F] dark:border-[#50829C] text-[#01140F] dark:text-[#f0f6f4]'
              : 'border-transparent text-[#516B71] dark:text-[#8fa6a4] hover:text-[#01140F] dark:hover:text-[#f0f6f4]'
          }`}
        >
          <Send className="w-3.5 h-3.5" />
          <span>My Outgoing Requests</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#F7F8FA] dark:bg-[#192825] text-[#516B71] dark:text-[#8fa6a4]">
            {outgoingRequests.length}
          </span>
        </button>
      </div>

      {/* Requests List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white dark:bg-[#14201e] p-5 rounded-2xl border border-[#A3B0AF]/20 dark:border-[#283d39] animate-pulse space-y-2">
              <div className="h-4 bg-[#A3B0AF]/15 dark:bg-[#253935] rounded w-1/3" />
              <div className="h-3 bg-[#A3B0AF]/10 dark:bg-[#1f2f2c] rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : currentList.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-[#14201e] rounded-2xl border border-[#A3B0AF]/20 dark:border-[#283d39] p-8 space-y-2">
          <p className="text-sm font-semibold text-[#01140F] dark:text-[#f0f6f4]">
            {activeTab === 'incoming' ? 'No incoming borrow requests' : 'No outgoing requests'}
          </p>
          <p className="text-xs text-[#516B71] dark:text-[#8fa6a4]">
            {activeTab === 'incoming'
              ? 'When classmates request to borrow your listings, they will show up here.'
              : 'Browse resources to send borrow requests.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {currentList.map((req) => {
            const isProcessing = actionLoadingId === req._id;
            const peer = activeTab === 'incoming' ? req.requester : req.owner;
            const peerRole = activeTab === 'incoming' ? 'Requester' : 'Owner';

            const startDate = req.borrowDuration?.startDate
              ? new Date(req.borrowDuration.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
              : 'N/A';
            const endDate = req.borrowDuration?.endDate
              ? new Date(req.borrowDuration.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
              : 'N/A';

            return (
              <div
                key={req._id}
                className="bg-white dark:bg-[#14201e] rounded-2xl border border-[#A3B0AF]/20 dark:border-[#283d39] p-5 space-y-4 shadow-xs text-xs"
              >
                {/* Header row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#01140F] dark:text-[#f0f6f4]">
                      {req.resource?.title || 'Resource'}
                    </span>
                    <span className="text-[#A3B0AF] dark:text-[#6c8280]">•</span>
                    <span className="text-[#516B71] dark:text-[#8fa6a4]">
                      {peerRole}: <strong className="text-[#01140F] dark:text-[#f0f6f4]">{peer?.name}</strong>
                    </span>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${
                    req.status === 'accepted' ? 'bg-[#6B8B78]/15 text-[#6B8B78] dark:text-[#81ac90]' :
                    req.status === 'pending' ? 'bg-[#AAA86D]/20 text-[#01140F] dark:text-[#c4c184]' :
                    req.status === 'returned' ? 'bg-[#36586A]/15 text-[#36586A] dark:text-[#50829C]' :
                    'bg-[#F7F8FA] dark:bg-[#192825] text-[#A3B0AF] dark:text-[#6c8280]'
                  }`}>
                    {req.status}
                  </span>
                </div>

                {/* Duration & Message */}
                <div className="flex flex-wrap items-center gap-4 text-[#516B71] dark:text-[#8fa6a4]">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#36586A] dark:text-[#50829C]" />
                    {startDate} — {endDate}
                  </span>
                  {req.message && (
                    <span className="flex items-center gap-1 italic text-[#01140F] dark:text-[#f0f6f4]">
                      <MessageSquare className="w-3 h-3 text-[#516B71] dark:text-[#8fa6a4]" />
                      "{req.message}"
                    </span>
                  )}
                </div>

                {/* Action buttons */}
                <div className="pt-2 border-t border-[#F7F8FA] dark:border-[#1e302d] flex items-center justify-end gap-2">
                  {activeTab === 'incoming' && req.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleReject(req._id)}
                        disabled={isProcessing}
                        className="px-3 py-1.5 rounded-xl font-medium text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => handleAccept(req._id)}
                        disabled={isProcessing}
                        className="px-4 py-1.5 rounded-xl font-semibold text-white bg-[#01140F] dark:bg-[#36586A] hover:bg-[#36586A] dark:hover:bg-[#47768E] transition"
                      >
                        Accept
                      </button>
                    </>
                  )}

                  {activeTab === 'incoming' && req.status === 'accepted' && (
                    <button
                      onClick={() => handleMarkReturned(req._id)}
                      disabled={isProcessing}
                      className="px-4 py-1.5 rounded-xl font-semibold text-white bg-[#36586A] dark:bg-[#50829C] hover:bg-[#01140F] dark:hover:bg-[#36586A] transition"
                    >
                      Confirm Returned
                    </button>
                  )}

                  {activeTab === 'outgoing' && req.status === 'pending' && (
                    <button
                      onClick={() => handleCancel(req._id)}
                      disabled={isProcessing}
                      className="px-3 py-1.5 rounded-xl font-medium text-[#516B71] dark:text-[#8fa6a4] hover:text-[#01140F] dark:hover:text-[#f0f6f4] transition"
                    >
                      Cancel Request
                    </button>
                  )}

                  {req.status === 'returned' && (
                    <Link
                      to="/transactions"
                      className="text-[#36586A] dark:text-[#50829C] hover:underline font-semibold flex items-center gap-1"
                    >
                      View in Transactions <ArrowRight className="w-3 h-3" />
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
