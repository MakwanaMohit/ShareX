import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Layers,
  Clock,
  Trash2,
  CheckCircle2,
  XCircle,
  Search,
  Star,
  RefreshCw,
} from 'lucide-react';
import { adminApi } from '../api';
import { useToast } from '../context/ToastContext';
import { useRefresh } from '../context/RefreshContext';

export default function AdminDashboardPage() {
  const { refreshTick } = useRefresh();
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [resources, setResources] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { showSuccess, showError } = useToast();

  const fetchAdminData = useCallback(async () => {
    try {
      setLoading(true);
      const [usersRes, resRes, txRes] = await Promise.all([
        adminApi.getUsers(),
        adminApi.getResources(),
        adminApi.getTransactions(),
      ]);

      setUsers(usersRes.data?.data?.users || []);
      setResources(resRes.data?.data?.resources || []);
      setTransactions(txRes.data?.data?.transactions || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
      showError('Could not load administrative data. Admin access required.');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData, refreshTick]);

  // User Actions
  const handleToggleUserStatus = async (userObj) => {
    try {
      setActionId(userObj._id);
      const updated = { isActive: !userObj.isActive };
      await adminApi.updateUser(userObj._id, updated);
      showSuccess(`User "${userObj.name}" ${!userObj.isActive ? 'activated' : 'deactivated'}.`);
      setUsers((prev) =>
        prev.map((u) => (u._id === userObj._id ? { ...u, isActive: !userObj.isActive } : u))
      );
    } catch (err) {
      showError('Failed to update user status.');
    } finally {
      setActionId(null);
    }
  };

  const handleChangeUserRole = async (userObj) => {
    const newRole = userObj.role === 'admin' ? 'student' : 'admin';
    if (!window.confirm(`Change role of "${userObj.name}" to "${newRole}"?`)) return;
    try {
      setActionId(userObj._id);
      await adminApi.updateUser(userObj._id, { role: newRole });
      showSuccess(`User role changed to ${newRole}.`);
      setUsers((prev) =>
        prev.map((u) => (u._id === userObj._id ? { ...u, role: newRole } : u))
      );
    } catch (err) {
      showError('Failed to change user role.');
    } finally {
      setActionId(null);
    }
  };

  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`Are you sure you want to permanently delete user "${name}"?`)) return;
    try {
      setActionId(id);
      await adminApi.deleteUser(id);
      showSuccess(`User "${name}" deleted.`);
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      showError('Failed to delete user.');
    } finally {
      setActionId(null);
    }
  };

  // Resource Actions
  const handleDeleteResource = async (id, title) => {
    if (!window.confirm(`Are you sure you want to remove resource listing "${title}"?`)) return;
    try {
      setActionId(id);
      await adminApi.deleteResource(id);
      showSuccess(`Resource "${title}" removed.`);
      setResources((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      showError('Failed to delete resource.');
    } finally {
      setActionId(null);
    }
  };

  // Filtered lists
  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredResources = resources.filter(
    (r) =>
      r.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-16 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#01140F] dark:text-[#f0f6f4] tracking-tight">
              Admin Overview
            </h1>
            <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[#83727E]/15 text-[#83727E] dark:text-[#b89fae]">
              Moderator
            </span>
          </div>
          <p className="text-xs text-[#516B71] dark:text-[#8fa6a4] mt-0.5">
            Campus moderation, accounts, resource listings, and exchange audits
          </p>
        </div>

        <button
          onClick={fetchAdminData}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#01140F] dark:text-[#f0f6f4] bg-white dark:bg-[#14201e] border border-[#A3B0AF]/30 dark:border-[#283d39] hover:bg-[#F7F8FA] dark:hover:bg-[#1c2c29] rounded-xl transition shadow-xs self-start"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#36586A] dark:text-[#50829C] ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 rounded-xl bg-white dark:bg-[#14201e] border border-[#A3B0AF]/25 dark:border-[#283d39] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-[#516B71] dark:text-[#8fa6a4] block">Total Students</span>
            <span className="text-xl font-bold text-[#01140F] dark:text-[#f0f6f4]">{users.length}</span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-[#83727E]/10 dark:bg-[#83727E]/20 text-[#83727E] dark:text-[#b89fae] flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#14201e] border border-[#A3B0AF]/25 dark:border-[#283d39] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-[#516B71] dark:text-[#8fa6a4] block">Active Listings</span>
            <span className="text-xl font-bold text-[#36586A] dark:text-[#50829C]">{resources.length}</span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-[#36586A]/10 dark:bg-[#50829C]/20 text-[#36586A] dark:text-[#50829C] flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#14201e] border border-[#A3B0AF]/25 dark:border-[#283d39] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-[#516B71] dark:text-[#8fa6a4] block">Total Exchanges</span>
            <span className="text-xl font-bold text-[#6B8B78] dark:text-[#81ac90]">
              {transactions.filter((t) => t.completedAt).length} / {transactions.length}
            </span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-[#6B8B78]/10 dark:bg-[#6B8B78]/20 text-[#6B8B78] dark:text-[#81ac90] flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Navigation Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-1.5 bg-[#F7F8FA] dark:bg-[#14201e] p-1 rounded-xl border border-[#A3B0AF]/20 dark:border-[#283d39]">
          <button
            onClick={() => { setActiveTab('users'); setSearchTerm(''); }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'users'
                ? 'bg-white dark:bg-[#192825] text-[#01140F] dark:text-[#f0f6f4] shadow-xs'
                : 'text-[#516B71] dark:text-[#8fa6a4] hover:text-[#01140F] dark:hover:text-[#f0f6f4]'
            }`}
          >
            Users ({users.length})
          </button>
          <button
            onClick={() => { setActiveTab('resources'); setSearchTerm(''); }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'resources'
                ? 'bg-white dark:bg-[#192825] text-[#01140F] dark:text-[#f0f6f4] shadow-xs'
                : 'text-[#516B71] dark:text-[#8fa6a4] hover:text-[#01140F] dark:hover:text-[#f0f6f4]'
            }`}
          >
            Resources ({resources.length})
          </button>
          <button
            onClick={() => { setActiveTab('transactions'); setSearchTerm(''); }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'transactions'
                ? 'bg-white dark:bg-[#192825] text-[#01140F] dark:text-[#f0f6f4] shadow-xs'
                : 'text-[#516B71] dark:text-[#8fa6a4] hover:text-[#01140F] dark:hover:text-[#f0f6f4]'
            }`}
          >
            Transactions ({transactions.length})
          </button>
        </div>

        {activeTab !== 'transactions' && (
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 w-3.5 h-3.5 text-[#516B71] dark:text-[#8fa6a4] top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`Filter ${activeTab}...`}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-[#A3B0AF]/30 dark:border-[#283d39] text-xs focus:outline-none focus:ring-2 focus:ring-[#36586A]/30 bg-white dark:bg-[#14201e] text-[#01140F] dark:text-[#f0f6f4] placeholder:text-[#A3B0AF] dark:placeholder:text-[#6c8280]"
            />
          </div>
        )}
      </div>

      {/* Tab 1: Users */}
      {activeTab === 'users' && (
        <div className="bg-white dark:bg-[#14201e] rounded-2xl border border-[#A3B0AF]/25 dark:border-[#283d39] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F8FA] dark:bg-[#0e1716] border-b border-[#A3B0AF]/20 dark:border-[#283d39] text-[#516B71] dark:text-[#8fa6a4] font-medium">
                <tr>
                  <th className="p-3.5 font-semibold">User</th>
                  <th className="p-3.5 font-semibold">Email</th>
                  <th className="p-3.5 font-semibold">Role</th>
                  <th className="p-3.5 font-semibold">Rating</th>
                  <th className="p-3.5 font-semibold">Status</th>
                  <th className="p-3.5 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#A3B0AF]/15 dark:divide-[#283d39]">
                {filteredUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-[#F7F8FA]/60 dark:hover:bg-[#192825]/60 transition">
                    <td className="p-3.5 font-semibold text-[#01140F] dark:text-[#f0f6f4] flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-[#36586A]/10 dark:bg-[#50829C]/20 text-[#36586A] dark:text-[#50829C] font-bold flex items-center justify-center text-[10px] uppercase">
                        {u.name?.charAt(0) || 'U'}
                      </div>
                      {u.name}
                    </td>
                    <td className="p-3.5 text-[#516B71] dark:text-[#8fa6a4]">{u.email}</td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-md font-medium capitalize text-[11px] ${
                          u.role === 'admin'
                            ? 'bg-[#83727E]/15 text-[#83727E] dark:text-[#b89fae]'
                            : 'bg-[#F7F8FA] dark:bg-[#192825] text-[#516B71] dark:text-[#8fa6a4]'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3.5 text-[#01140F] dark:text-[#f0f6f4] flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-[#AAA86D] text-[#AAA86D] dark:text-[#c4c184] dark:fill-[#c4c184]" />
                      <span className="font-semibold">{u.rating?.average?.toFixed(1) || '0.0'}</span>
                      <span className="text-[#A3B0AF] dark:text-[#6c8280] text-[10px]">({u.rating?.count || 0})</span>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-medium text-[11px] ${
                          u.isActive
                            ? 'text-[#6B8B78] dark:text-[#81ac90] bg-[#6B8B78]/10 dark:bg-[#6B8B78]/20'
                            : 'text-[#83727E] dark:text-[#b89fae] bg-[#83727E]/10 dark:bg-[#83727E]/20'
                        }`}
                      >
                        {u.isActive ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-[#6B8B78] dark:text-[#81ac90]" /> Active
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 text-[#83727E] dark:text-[#b89fae]" /> Deactivated
                          </>
                        )}
                      </span>
                    </td>
                    <td className="p-3.5 text-right space-x-1.5">
                      <button
                        onClick={() => handleToggleUserStatus(u)}
                        disabled={actionId === u._id}
                        className="px-2 py-1 rounded-lg text-[11px] font-semibold text-[#01140F] dark:text-[#f0f6f4] hover:bg-[#F7F8FA] dark:hover:bg-[#1c2c29] border border-[#A3B0AF]/30 dark:border-[#283d39] transition"
                      >
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleChangeUserRole(u)}
                        disabled={actionId === u._id}
                        className="px-2 py-1 rounded-lg text-[11px] font-semibold text-[#36586A] dark:text-[#50829C] hover:bg-[#36586A]/10 dark:hover:bg-[#50829C]/20 border border-[#36586A]/20 dark:border-[#50829C]/30 transition"
                      >
                        Role
                      </button>
                      <button
                        onClick={() => handleDeleteUser(u._id, u.name)}
                        disabled={actionId === u._id}
                        className="px-2 py-1 rounded-lg text-[11px] font-semibold text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 transition"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Resources */}
      {activeTab === 'resources' && (
        <div className="bg-white dark:bg-[#14201e] rounded-2xl border border-[#A3B0AF]/25 dark:border-[#283d39] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F8FA] dark:bg-[#0e1716] border-b border-[#A3B0AF]/20 dark:border-[#283d39] text-[#516B71] dark:text-[#8fa6a4] font-medium">
                <tr>
                  <th className="p-3.5 font-semibold">Resource</th>
                  <th className="p-3.5 font-semibold">Category</th>
                  <th className="p-3.5 font-semibold">Type</th>
                  <th className="p-3.5 font-semibold">Deposit</th>
                  <th className="p-3.5 font-semibold">Owner</th>
                  <th className="p-3.5 font-semibold">Status</th>
                  <th className="p-3.5 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#A3B0AF]/15 dark:divide-[#283d39]">
                {filteredResources.map((r) => (
                  <tr key={r._id} className="hover:bg-[#F7F8FA]/60 dark:hover:bg-[#192825]/60 transition">
                    <td className="p-3.5 font-semibold text-[#01140F] dark:text-[#f0f6f4] max-w-xs truncate">
                      <Link to={`/resources/${r._id}`} className="hover:text-[#36586A] dark:hover:text-[#50829C]">
                        {r.title}
                      </Link>
                    </td>
                    <td className="p-3.5 text-[#516B71] dark:text-[#8fa6a4] capitalize">{r.category}</td>
                    <td className="p-3.5 font-medium capitalize text-[#36586A] dark:text-[#50829C]">{r.listingType}</td>
                    <td className="p-3.5 font-semibold text-[#01140F] dark:text-[#f0f6f4]">₹{r.securityDeposit || 0}</td>
                    <td className="p-3.5 text-[#516B71] dark:text-[#8fa6a4]">{r.owner?.name || r.owner?.email || 'Student'}</td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-full font-medium text-[11px] ${
                          r.isAvailable
                            ? 'bg-[#6B8B78]/10 text-[#6B8B78] dark:text-[#81ac90]'
                            : 'bg-[#F7F8FA] dark:bg-[#192825] text-[#516B71] dark:text-[#8fa6a4]'
                        }`}
                      >
                        {r.isAvailable ? 'Available' : 'Lent Out'}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleDeleteResource(r._id, r.title)}
                        disabled={actionId === r._id}
                        className="px-2.5 py-1 rounded-lg font-semibold text-[11px] text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 transition inline-flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" /> Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Transactions */}
      {activeTab === 'transactions' && (
        <div className="bg-white dark:bg-[#14201e] rounded-2xl border border-[#A3B0AF]/25 dark:border-[#283d39] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F8FA] dark:bg-[#0e1716] border-b border-[#A3B0AF]/20 dark:border-[#283d39] text-[#516B71] dark:text-[#8fa6a4] font-medium">
                <tr>
                  <th className="p-3.5 font-semibold">Resource</th>
                  <th className="p-3.5 font-semibold">Lender</th>
                  <th className="p-3.5 font-semibold">Borrower</th>
                  <th className="p-3.5 font-semibold">Deposit</th>
                  <th className="p-3.5 font-semibold">Deposit Status</th>
                  <th className="p-3.5 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#A3B0AF]/15 dark:divide-[#283d39]">
                {transactions.map((tx) => (
                  <tr key={tx._id} className="hover:bg-[#F7F8FA]/60 dark:hover:bg-[#192825]/60 transition">
                    <td className="p-3.5 font-semibold text-[#01140F] dark:text-[#f0f6f4]">{tx.resource?.title || 'Resource'}</td>
                    <td className="p-3.5 text-[#01140F] dark:text-[#f0f6f4]">{tx.lender?.name || 'Lender'}</td>
                    <td className="p-3.5 text-[#01140F] dark:text-[#f0f6f4]">{tx.borrower?.name || 'Borrower'}</td>
                    <td className="p-3.5 font-semibold text-[#01140F] dark:text-[#f0f6f4]">₹{tx.depositAmount || 0}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-full font-medium text-[11px] bg-[#36586A]/10 dark:bg-[#50829C]/20 text-[#36586A] dark:text-[#50829C] uppercase">
                        {tx.depositStatus}
                      </span>
                    </td>
                    <td className="p-3.5 text-[#516B71] dark:text-[#8fa6a4]">
                      {tx.completedAt ? new Date(tx.completedAt).toLocaleDateString() : 'In Progress'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
