import React, { useState, useEffect } from 'react';
import { Bell, Check, Clock } from 'lucide-react';
import { notificationApi } from '../api/client';
import { NotificationResponse } from '../types';

export const NotificationDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await notificationApi.getAll();
      if (res.data.success) {
        setNotifications(res.data.data);
      }
    } catch (e) {
      console.error('Failed to fetch notifications', e);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // 30s poll
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationApi.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (e) {
      console.error('Failed to mark notification as read', e);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationApi.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (e) {
      console.error('Failed to mark all as read', e);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition focus:outline-none"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white ring-2 ring-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-80 md:w-96 rounded-xl bg-white shadow-xl border border-slate-200 z-50 overflow-hidden">
            <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-900 text-sm">Notifications</span>
                {unreadCount > 0 && (
                  <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-0.5 rounded-full font-medium">
                    {unreadCount} new
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs font-medium text-emerald-600 hover:text-emerald-700"
                >
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-sm">
                  No notifications yet.
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => !n.isRead && handleMarkAsRead(n.id)}
                    className={`p-3.5 hover:bg-slate-50 transition cursor-pointer flex gap-3 ${
                      !n.isRead ? 'bg-emerald-50/40' : ''
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <p className={`text-xs ${!n.isRead ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                          {n.title}
                        </p>
                        {!n.isRead && (
                          <span className="w-2 h-2 rounded-full bg-emerald-600 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        {n.message}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
