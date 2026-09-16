import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  Users,
  Layers,
  Clock,
  Trash2,
  CheckCircle2,
  XCircle,
  Search,
  IndianRupee,
  Star,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { adminApi } from '../api';
import { useToast } from '../context/ToastContext';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState('users'); // 'users', 'resources', 'transactions'
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
  }, [fetchAdminData]);

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
    <div className="space-y-8 pb-16 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Admin Management Portal
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-700">
              Campus Admin
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            System moderation, student accounts, resources inventory, and audit logs
          </p>
        </div>

        <button
          onClick={fetchAdminData}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition shadow-sm self-start"
        >
          <RefreshCw className="w-3.5 h-3.5 text-indigo-600" /> Refresh Data
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Total Registered Users</span>
            <span className="text-2xl font-black text-slate-900">{users.length}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Total Campus Listings</span>
            <span className="text-2xl font-black text-indigo-600">{resources.length}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Completed / Total Exchanges</span>
            <span className="text-2xl font-black text-emerald-600">
              {transactions.filter((t) => t.completedAt).length} / {transactions.length}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Navigation Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'users'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-200'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Manage Users ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('resources')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'resources'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Moderate Resources ({resources.length})
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'transactions'
                ? 'bg-slate-800 text-white shadow-md'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Transaction Logs ({transactions.length})
          </button>
        </div>

        {activeTab !== 'transactions' && (
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 w-4 h-4 text-slate-400 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`Filter ${activeTab}...`}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
            />
          </div>
        )}
      </div>

      {/* Tab 1: Users */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Rating</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/80 transition">
                    <td className="p-4 font-bold text-slate-900 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs uppercase">
                        {u.name?.charAt(0) || 'U'}
                      </div>
                      {u.name}
                    </td>
                    <td className="p-4 text-slate-600">{u.email}</td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-md font-bold uppercase text-[10px] ${
                          u.role === 'admin'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 font-semibold text-amber-600 flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      {u.rating?.average?.toFixed(1) || '0.0'} ({u.rating?.count || 0})
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                          u.isActive
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {u.isActive ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Active
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 text-rose-600" /> Deactivated
                          </>
                        )}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => handleToggleUserStatus(u)}
                        disabled={actionId === u._id}
                        className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition ${
                          u.isActive
                            ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        }`}
                      >
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleChangeUserRole(u)}
                        disabled={actionId === u._id}
                        className="px-2.5 py-1 rounded-lg font-bold text-[11px] bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition"
                      >
                        Toggle Role
                      </button>
                      <button
                        onClick={() => handleDeleteUser(u._id, u.name)}
                        disabled={actionId === u._id}
                        className="px-2.5 py-1 rounded-lg font-bold text-[11px] bg-rose-50 text-rose-700 hover:bg-rose-100 transition"
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
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Resource</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Deposit</th>
                  <th className="p-4">Owner</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredResources.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50/80 transition">
                    <td className="p-4 font-bold text-slate-900 max-w-xs">
                      <Link to={`/resources/${r._id}`} className="hover:text-indigo-600">
                        {r.title}
                      </Link>
                    </td>
                    <td className="p-4 uppercase font-semibold text-slate-600">{r.category}</td>
                    <td className="p-4 font-bold capitalize text-indigo-600">{r.listingType}</td>
                    <td className="p-4 font-semibold text-slate-800">₹{r.securityDeposit || 0}</td>
                    <td className="p-4 text-slate-600">{r.owner?.name || r.owner?.email || 'Student'}</td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                          r.isAvailable ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {r.isAvailable ? 'Available' : 'Lent Out'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDeleteResource(r._id, r.title)}
                        disabled={actionId === r._id}
                        className="px-3 py-1 rounded-lg font-bold text-[11px] bg-rose-50 text-rose-700 hover:bg-rose-100 transition inline-flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remove
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
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Resource</th>
                  <th className="p-4">Lender</th>
                  <th className="p-4">Borrower</th>
                  <th className="p-4">Deposit</th>
                  <th className="p-4">Deposit Status</th>
                  <th className="p-4">Completed Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map((tx) => (
                  <tr key={tx._id} className="hover:bg-slate-50/80 transition">
                    <td className="p-4 font-bold text-slate-900">{tx.resource?.title || 'Resource'}</td>
                    <td className="p-4 font-semibold text-slate-700">{tx.lender?.name || 'Lender'}</td>
                    <td className="p-4 font-semibold text-slate-700">{tx.borrower?.name || 'Borrower'}</td>
                    <td className="p-4 font-bold text-slate-900">₹{tx.depositAmount || 0}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-full font-bold text-[11px] bg-indigo-50 text-indigo-700 uppercase">
                        {tx.depositStatus}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500">
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
