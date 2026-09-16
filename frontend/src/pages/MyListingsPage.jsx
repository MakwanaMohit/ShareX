import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Layers,
  PlusCircle,
  Package,
  CheckCircle2,
  XCircle,
  Edit,
  Trash2,
  Sparkles,
  IndianRupee,
  Gift,
  HandCoins,
} from 'lucide-react';
import { resourceApi } from '../api';
import { useToast } from '../context/ToastContext';
import ResourceCard from '../components/ResourceCard';

export default function MyListingsPage() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const { showSuccess, showError } = useToast();

  const fetchMyListings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await resourceApi.getMyListings();
      setResources(res.data?.data?.resources || []);
    } catch (err) {
      console.error('Error fetching my listings:', err);
      showError(err.response?.data?.message || 'Could not load your listings.');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchMyListings();
  }, [fetchMyListings]);

  const handleToggle = async (id) => {
    try {
      setActionId(id);
      const res = await resourceApi.toggleAvailability(id);
      const newStatus = res.data?.data?.isAvailable;
      setResources((prev) =>
        prev.map((item) => (item._id === id ? { ...item, isAvailable: newStatus } : item))
      );
      showSuccess(newStatus ? 'Resource marked as available.' : 'Resource marked as in use.');
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to update availability.');
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this listing?')) return;
    try {
      setActionId(id);
      await resourceApi.delete(id);
      setResources((prev) => prev.filter((item) => item._id !== id));
      showSuccess('Listing deleted successfully.');
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to delete listing.');
    } finally {
      setActionId(null);
    }
  };

  const availableCount = resources.filter((r) => r.isAvailable).length;
  const inUseCount = resources.length - availableCount;

  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Resource Listings
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your shared textbooks, instruments, and equipment
          </p>
        </div>

        <Link
          to="/resources/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 shadow-md shadow-indigo-200 transition"
        >
          <PlusCircle className="w-4 h-4" />
          List Another Item
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Total Items Listed</span>
            <span className="text-2xl font-black text-slate-900">{resources.length}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Currently Available</span>
            <span className="text-2xl font-black text-emerald-600">{availableCount}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Currently Lent Out</span>
            <span className="text-2xl font-black text-amber-600">{inUseCount}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <XCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Listings Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 animate-pulse">
              <div className="aspect-video bg-slate-200 rounded-xl" />
              <div className="h-4 bg-slate-200 rounded w-3/4" />
              <div className="h-8 bg-slate-100 rounded-xl" />
            </div>
          ))}
        </div>
      ) : resources.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 p-8 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center mx-auto">
            <Package className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">No items listed yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Have textbooks from last semester or a scientific calculator you don't use every day? Share it with campus peers!
            </p>
          </div>
          <Link
            to="/resources/new"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md transition"
          >
            <PlusCircle className="w-4 h-4" />
            List Your First Item
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((resource) => (
            <ResourceCard
              key={resource._id}
              resource={resource}
              isOwner={true}
              onToggle={handleToggle}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
