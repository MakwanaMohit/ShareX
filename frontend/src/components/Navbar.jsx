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
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

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

  // Close menus on outside click
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

  // Close mobile menu on route change
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
    { name: 'Explore', path: '/', icon: BookOpen },
    ...(isAuthenticated
      ? [
          { name: 'List an Item', path: '/resources/new', icon: PlusCircle, highlight: true },
          { name: 'My Listings', path: '/my-listings', icon: Layers },
          { name: 'Requests', path: '/requests', icon: Inbox },
          { name: 'Transactions', path: '/transactions', icon: Clock },
        ]
      : []),
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-200 group-hover:scale-105 transition duration-200">
              <Sparkles className="w-5 h-5 text-indigo-100" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-indigo-700 to-purple-700 bg-clip-text text-transparent">
                  ShareX
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Campus
                </span>
              </div>
              <p className="text-[11px] text-slate-600 font-medium leading-none">Student Resource Hub</p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              if (link.highlight) {
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 shadow-sm shadow-indigo-300 transition duration-150"
                  >
                    <Icon className="w-4 h-4" />
                    <span>{link.name}</span>
                  </Link>
                );
              }
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition duration-150 ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Action Area */}
          <div className="flex items-center gap-2.5">
            {isAuthenticated ? (
              <>
                {/* Notifications Dropdown */}
                <div className="relative" ref={notifMenuRef}>
                  <button
                    onClick={() => setNotifDropdownOpen((prev) => !prev)}
                    className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
                    aria-label="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {notifDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-100 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="flex items-center justify-between px-4 pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-slate-800 text-sm">Notifications</h4>
                          {unreadCount > 0 && (
                            <span className="text-xs bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded-full">
                              {unreadCount} new
                            </span>
                          )}
                        </div>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllAsRead}
                            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium inline-flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Mark all read
                          </button>
                        )}
                      </div>

                      <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                        {notifications.length === 0 ? (
                          <div className="py-8 text-center text-slate-400 text-xs">
                            No notifications yet
                          </div>
                        ) : (
                          notifications.slice(0, 5).map((n) => (
                            <div
                              key={n._id}
                              onClick={() => markAsRead(n._id)}
                              className={`p-3 text-xs transition cursor-pointer hover:bg-slate-50 flex items-start gap-2.5 ${
                                !n.isRead ? 'bg-indigo-50/60 font-medium' : ''
                              }`}
                            >
                              <div
                                className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                                  !n.isRead ? 'bg-indigo-600' : 'bg-transparent'
                                }`}
                              />
                              <div className="flex-1">
                                <p className="text-slate-800 leading-snug">{n.message}</p>
                                <span className="text-[10px] text-slate-400 mt-1 block">
                                  {new Date(n.createdAt).toLocaleDateString(undefined, {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      <div className="pt-2 px-4 border-t border-slate-100 text-center">
                        <Link
                          to="/notifications"
                          onClick={() => setNotifDropdownOpen(false)}
                          className="text-xs text-indigo-600 font-semibold hover:text-indigo-800"
                        >
                          View all notifications →
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                {/* User Dropdown */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserDropdownOpen((prev) => !prev)}
                    className="flex items-center gap-2 p-1.5 pl-2.5 pr-2 rounded-xl hover:bg-slate-100 border border-slate-200 transition"
                  >
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-xs uppercase overflow-hidden">
                      {user?.profilePicture ? (
                        <img
                          src={user.profilePicture}
                          alt={user?.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        user?.name?.charAt(0) || 'U'
                      )}
                    </div>
                    <span className="hidden sm:inline-block text-xs font-semibold text-slate-700 max-w-[100px] truncate">
                      {user?.name}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs font-bold text-slate-800 truncate">{user?.name}</p>
                        <p className="text-[11px] text-slate-600 truncate">{user?.email}</p>
                        {user?.rating && (
                          <div className="mt-1 flex items-center gap-1 text-[11px] text-amber-600 font-medium">
                            <span>⭐ {user.rating.average?.toFixed(1) || '0.0'}</span>
                            <span className="text-slate-400">({user.rating.count || 0} reviews)</span>
                          </div>
                        )}
                      </div>

                      <div className="py-1">
                        <Link
                          to="/profile"
                          className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 font-medium transition"
                        >
                          <User className="w-4 h-4" />
                          <span>My Profile</span>
                        </Link>
                        <Link
                          to="/my-listings"
                          className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 font-medium transition"
                        >
                          <Layers className="w-4 h-4" />
                          <span>My Resource Listings</span>
                        </Link>
                        {isAdmin && (
                          <Link
                            to="/admin"
                            className="flex items-center gap-2 px-4 py-2 text-xs text-purple-700 bg-purple-50/50 hover:bg-purple-100 font-semibold transition"
                          >
                            <Shield className="w-4 h-4 text-purple-600" />
                            <span>Admin Portal</span>
                          </Link>
                        )}
                      </div>

                      <div className="pt-1 border-t border-slate-100">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 font-medium transition"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Log Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-2 text-sm font-semibold text-slate-700 hover:text-indigo-600 rounded-lg hover:bg-slate-100 transition"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm shadow-indigo-300 transition"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4 text-indigo-500" />
                <span>{link.name}</span>
              </Link>
            );
          })}
          {isAdmin && (
            <Link
              to="/admin"
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100"
            >
              <Shield className="w-4 h-4 text-purple-600" />
              <span>Admin Portal</span>
            </Link>
          )}
          {!isAuthenticated && (
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <Link
                to="/login"
                className="w-full text-center py-2.5 text-sm font-semibold text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="w-full text-center py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-sm"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
