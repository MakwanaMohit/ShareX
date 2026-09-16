import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  CheckCircle2,
  Check,
  Package,
  Clock,
  Sparkles,
  Inbox,
  RotateCcw,
  IndianRupee,
  Gift,
} from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';

const notificationIcons = {
  borrow_request: Inbox,
  request_accepted: CheckCircle2,
  request_rejected: RotateCcw,
  return_reminder: Clock,
  transaction_complete: Sparkles,
  deposit_update: IndianRupee,
};

export default function NotificationsPage() {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications();
  const [filter, setFilter] = useState('all'); // 'all', 'unread'

  const filteredList = notifications.filter((n) => {
    if (filter === 'unread') return !n.isRead;
    return true;
  });

  return (
    <div className="space-y-8 pb-16 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Notifications
            </h1>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700">
                {unreadCount} unread
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Stay updated with your borrow requests, returns, and campus exchanges
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition"
            >
              <Check className="w-4 h-4" />
              Mark all as read
            </button>
          )}

          <div className="inline-flex p-1 bg-slate-100 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition ${
                filter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1.5 rounded-lg transition ${
                filter === 'unread' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Unread only
            </button>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 animate-pulse space-y-2">
              <div className="h-4 bg-slate-200 rounded w-1/2" />
              <div className="h-3 bg-slate-200 rounded w-1/4" />
            </div>
          ))}
        </div>
      ) : filteredList.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 p-8 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center mx-auto">
            <Bell className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">
              {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              You'll be notified whenever someone requests your resources or responds to your borrows.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredList.map((n) => {
            const Icon = notificationIcons[n.type] || Bell;
            return (
              <div
                key={n._id}
                onClick={() => !n.isRead && markAsRead(n._id)}
                className={`p-4 sm:p-5 rounded-2xl border transition flex items-start justify-between gap-4 cursor-pointer ${
                  !n.isRead
                    ? 'bg-indigo-50/70 border-indigo-200 shadow-sm'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      !n.isRead
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="space-y-1">
                    <p className={`text-xs sm:text-sm ${!n.isRead ? 'font-bold text-slate-900' : 'text-slate-700'}`}>
                      {n.message}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                      <span>
                        {new Date(n.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>

                      {n.relatedResource && (
                        <Link
                          to={`/resources/${n.relatedResource._id || n.relatedResource}`}
                          className="font-semibold text-indigo-600 hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          View Resource: {n.relatedResource.title || 'Details'} →
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                {!n.isRead && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      markAsRead(n._id);
                    }}
                    title="Mark as read"
                    className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-100 transition shrink-0"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
