import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';

export default function NotificationsPage() {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications();
  const [filter, setFilter] = useState('all');

  const filteredList = notifications.filter((n) => {
    if (filter === 'unread') return !n.isRead;
    return true;
  });

  return (
    <div className="space-y-6 pb-16 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#01140F] dark:text-[#f0f6f4] tracking-tight">
            Notifications
          </h1>
          <p className="text-xs text-[#516B71] dark:text-[#8fa6a4]">
            Updates on borrow requests, responses, and exchanges.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-xs font-semibold text-[#36586A] dark:text-[#50829C] hover:underline"
            >
              Mark all read
            </button>
          )}

          <div className="flex items-center gap-1 text-xs font-semibold">
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
              onClick={() => setFilter('unread')}
              className={`px-3 py-1 rounded-xl transition ${
                filter === 'unread'
                  ? 'bg-[#01140F] text-white dark:bg-[#36586a] dark:text-white'
                  : 'text-[#516B71] dark:text-[#8fa6a4] hover:text-[#01140F] dark:hover:text-[#f0f6f4]'
              }`}
            >
              Unread
            </button>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-[#14201e] p-4 rounded-xl border border-[#A3B0AF]/20 dark:border-[#283d39] animate-pulse space-y-2">
              <div className="h-3 bg-[#A3B0AF]/15 dark:bg-[#253935] rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filteredList.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-[#14201e] rounded-2xl border border-[#A3B0AF]/20 dark:border-[#283d39] p-8 space-y-2">
          <p className="text-sm font-semibold text-[#01140F] dark:text-[#f0f6f4]">No notifications</p>
          <p className="text-xs text-[#516B71] dark:text-[#8fa6a4]">
            You're all caught up.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredList.map((n) => {
            return (
              <div
                key={n._id}
                onClick={() => !n.isRead && markAsRead(n._id)}
                className={`p-4 rounded-xl border transition flex items-center justify-between gap-4 cursor-pointer text-xs ${
                  !n.isRead
                    ? 'bg-white dark:bg-[#14201e] border-[#36586A]/40 dark:border-[#50829C]/50 font-medium'
                    : 'bg-white dark:bg-[#14201e] border-[#A3B0AF]/20 dark:border-[#283d39] text-[#516B71] dark:text-[#8fa6a4]'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                      !n.isRead ? 'bg-[#6B8B78]' : 'bg-transparent'
                    }`}
                  />
                  <div>
                    <p className="text-[#01140F] dark:text-[#f0f6f4] leading-snug">{n.message}</p>
                    <div className="flex items-center gap-2 text-[11px] text-[#A3B0AF] dark:text-[#6c8280] mt-1">
                      <span>
                        {new Date(n.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {n.relatedResource && (
                        <>
                          <span>•</span>
                          <Link
                            to={`/resources/${n.relatedResource._id || n.relatedResource}`}
                            className="text-[#36586A] dark:text-[#50829C] hover:underline font-semibold"
                            onClick={(e) => e.stopPropagation()}
                          >
                            View Item →
                          </Link>
                        </>
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
                    title="Mark read"
                    className="p-1 rounded text-[#516B71] dark:text-[#8fa6a4] hover:text-[#01140F] dark:hover:text-[#f0f6f4]"
                  >
                    <Check className="w-3.5 h-3.5" />
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
