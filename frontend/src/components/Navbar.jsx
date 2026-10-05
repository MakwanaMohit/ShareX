import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  BookOpen,
  PlusCircle,
  Bell,
  User,
  LogOut,
  Shield,
  Layers,
  Inbox,
  Clock,
  Menu,
  X,
  ChevronDown,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import ThemeToggle from './ThemeToggle';
import { formatMediaUrl } from '../utils/media';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  const userMenuRef = useRef(null);
  const notifMenuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(event.target)) {
        setNotifDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    setNotifDropdownOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Explore', path: '/' },
    ...(isAuthenticated
      ? [
          { name: 'My Listings', path: '/my-listings' },
          { name: 'Requests', path: '/requests' },
          { name: 'Transactions', path: '/transactions' },
        ]
      : []),
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/85 dark:bg-[#0c1413]/85 backdrop-blur-md border-b border-[#A3B0AF]/25 dark:border-[#253935] transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#01140F] dark:bg-[#14201e] border border-transparent dark:border-[#3b524e] flex items-center justify-center text-[#AAA86D] dark:text-[#c4c184] text-sm font-black transition-colors">
              S
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-bold text-lg tracking-tight text-[#01140F] dark:text-[#f0f6f4]">
                share<span className="text-[#36586A] dark:text-[#50829C]">x</span>
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-[#516B71] dark:text-[#8fa6a4]">
                campus
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm font-medium transition-colors duration-150 ${
                    isActive
                      ? 'text-[#01140F] dark:text-[#f0f6f4] font-semibold'
                      : 'text-[#516B71] dark:text-[#8fa6a4] hover:text-[#01140F] dark:hover:text-[#f0f6f4]'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Area */}
          <div className="flex items-center gap-2 sm:gap-3">
            {isAuthenticated ? (
              <>
                <Link
                  to="/resources/new"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#01140F] dark:bg-[#36586A] text-white text-xs font-semibold hover:bg-[#36586A] dark:hover:bg-[#47768E] transition-colors"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-[#AAA86D] dark:text-[#c4c184]" />
                  <span>List Item</span>
                </Link>

                {/* Theme Toggle beside Notification Button */}
                <ThemeToggle />

                {/* Notifications */}
                <div className="relative" ref={notifMenuRef}>
                  <button
                    onClick={() => setNotifDropdownOpen((prev) => !prev)}
                    className="relative p-2 rounded-xl text-[#516B71] dark:text-[#8fa6a4] hover:text-[#01140F] dark:hover:text-[#f0f6f4] hover:bg-[#F7F8FA] dark:hover:bg-[#162422] transition"
                    aria-label="Notifications"
                  >
                    <Bell className="w-4 h-4" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#6B8B78]" />
                    )}
                  </button>

                  {notifDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#14201e] rounded-2xl shadow-xl border border-[#A3B0AF]/25 dark:border-[#283d39] py-3 z-50 animate-in fade-in duration-150">
                      <div className="flex items-center justify-between px-4 pb-2.5 border-b border-[#F7F8FA] dark:border-[#1e302d]">
                        <span className="font-bold text-xs text-[#01140F] dark:text-[#f0f6f4]">Notifications</span>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllAsRead}
                            className="text-[11px] text-[#36586A] dark:text-[#50829C] hover:underline flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3 h-3 text-[#6B8B78]" />
                            Mark all read
                          </button>
                        )}
                      </div>

                      <div className="max-h-64 overflow-y-auto divide-y divide-[#F7F8FA] dark:divide-[#1e302d]">
                        {notifications.length === 0 ? (
                          <div className="py-6 text-center text-[#A3B0AF] dark:text-[#6c8280] text-xs">
                            No notifications
                          </div>
                        ) : (
                          notifications.slice(0, 5).map((n) => (
                            <div
                              key={n._id}
                              onClick={() => markAsRead(n._id)}
                              className={`p-3 text-xs transition cursor-pointer hover:bg-[#F7F8FA] dark:hover:bg-[#1c2c29] flex items-start gap-2 ${
                                !n.isRead
                                  ? 'bg-[#F7F8FA] dark:bg-[#192825] font-medium'
                                  : 'text-[#516B71] dark:text-[#8fa6a4]'
                              }`}
                            >
                              <div
                                className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                                  !n.isRead ? 'bg-[#6B8B78]' : 'bg-transparent'
                                }`}
                              />
                              <div className="flex-1">
                                <p className="text-[#01140F] dark:text-[#f0f6f4] leading-snug">{n.message}</p>
                                <span className="text-[10px] text-[#A3B0AF] dark:text-[#6c8280] mt-0.5 block">
                                  {new Date(n.createdAt).toLocaleDateString(undefined, {
                                    month: 'short',
                                    day: 'numeric',
                                  })}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      <div className="pt-2 px-4 border-t border-[#F7F8FA] dark:border-[#1e302d] text-center">
                        <Link
                          to="/notifications"
                          onClick={() => setNotifDropdownOpen(false)}
                          className="text-xs text-[#36586A] dark:text-[#50829C] font-semibold hover:underline"
                        >
                          View all →
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                {/* User Dropdown */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserDropdownOpen((prev) => !prev)}
                    className="flex items-center gap-2 p-1 pl-2 pr-1.5 rounded-xl hover:bg-[#F7F8FA] dark:hover:bg-[#162422] border border-[#A3B0AF]/25 dark:border-[#283d39] transition"
                  >
                    <span className="text-xs font-semibold text-[#01140F] dark:text-[#f0f6f4] max-w-[90px] truncate">
                      {user?.name?.split(' ')[0]}
                    </span>
                    <div className="w-6 h-6 rounded-lg bg-[#36586A] dark:bg-[#50829C] text-[#AAA86D] dark:text-[#f0f6f4] text-[10px] font-bold flex items-center justify-center uppercase overflow-hidden">
                      {user?.profilePicture ? (
                        <img src={formatMediaUrl(user.profilePicture)} alt={user?.name} className="w-full h-full object-cover" />
                      ) : (
                        user?.name?.charAt(0) || 'U'
                      )}
                    </div>
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-[#14201e] rounded-2xl shadow-xl border border-[#A3B0AF]/25 dark:border-[#283d39] py-2 z-50 animate-in fade-in duration-150 text-xs">
                      <div className="px-3.5 py-2 border-b border-[#F7F8FA] dark:border-[#1e302d]">
                        <p className="font-bold text-[#01140F] dark:text-[#f0f6f4] truncate">{user?.name}</p>
                        <p className="text-[11px] text-[#516B71] dark:text-[#8fa6a4] truncate">{user?.email}</p>
                      </div>

                      <div className="py-1">
                        <Link
                          to="/profile"
                          className="flex items-center gap-2 px-3.5 py-2 text-[#01140F] dark:text-[#f0f6f4] hover:bg-[#F7F8FA] dark:hover:bg-[#1c2c29] transition"
                        >
                          <User className="w-3.5 h-3.5 text-[#516B71] dark:text-[#8fa6a4]" />
                          <span>Profile Settings</span>
                        </Link>
                        <Link
                          to="/my-listings"
                          className="flex items-center gap-2 px-3.5 py-2 text-[#01140F] dark:text-[#f0f6f4] hover:bg-[#F7F8FA] dark:hover:bg-[#1c2c29] transition"
                        >
                          <Layers className="w-3.5 h-3.5 text-[#516B71] dark:text-[#8fa6a4]" />
                          <span>My Listings</span>
                        </Link>
                        {isAdmin && (
                          <Link
                            to="/admin"
                            className="flex items-center gap-2 px-3.5 py-2 text-[#83727E] dark:text-[#b89fae] hover:bg-[#F7F8FA] dark:hover:bg-[#1c2c29] font-semibold transition"
                          >
                            <Shield className="w-3.5 h-3.5 text-[#83727E] dark:text-[#b89fae]" />
                            <span>Admin Portal</span>
                          </Link>
                        )}
                      </div>

                      <div className="pt-1 border-t border-[#F7F8FA] dark:border-[#1e302d]">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-3.5 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition font-medium"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Log Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-xs font-semibold text-[#516B71] dark:text-[#8fa6a4] hover:text-[#01140F] dark:hover:text-[#f0f6f4] transition"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#01140F] dark:bg-[#36586A] hover:bg-[#36586A] dark:hover:bg-[#47768E] rounded-xl transition"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile toggle */}
            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="md:hidden p-1.5 rounded-lg text-[#516B71] dark:text-[#8fa6a4] hover:text-[#01140F] dark:hover:text-[#f0f6f4]"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#A3B0AF]/20 dark:border-[#283d39] bg-white dark:bg-[#0c1413] px-4 py-3 space-y-2 text-sm transition-colors">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="block py-1.5 font-medium text-[#516B71] dark:text-[#8fa6a4] hover:text-[#01140F] dark:hover:text-[#f0f6f4]"
            >
              {link.name}
            </Link>
          ))}
          {isAuthenticated && (
            <Link to="/resources/new" className="block py-1.5 font-semibold text-[#36586A] dark:text-[#50829C]">
              + List an Item
            </Link>
          )}
          {isAdmin && (
            <Link to="/admin" className="block py-1.5 font-semibold text-[#83727E] dark:text-[#b89fae]">
              Admin Portal
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
