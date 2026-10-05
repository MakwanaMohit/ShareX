import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle } from 'lucide-react';
import { resourceApi } from '../api';
import { useToast } from '../context/ToastContext';
import ResourceCard from '../components/ResourceCard';

export default function MyListingsPage() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [, setActionId] = useState(null);
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
      showSuccess(newStatus ? 'Item is now available.' : 'Item is marked in use.');
    } catch (err) {
      showError('Failed to update status.');
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this listing permanently?')) return;
    try {
      setActionId(id);
      await resourceApi.delete(id);
      setResources((prev) => prev.filter((item) => item._id !== id));
      showSuccess('Listing deleted.');
    } catch (err) {
      showError('Failed to delete listing.');
    } finally {
      setActionId(null);
    }
  };

  const availableCount = resources.filter((r) => r.isAvailable).length;

  return (
    <div className="space-y-6 pb-16 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#01140F] dark:text-[#f0f6f4] tracking-tight">
            My Listings
          </h1>
          <p className="text-xs text-[#516B71] dark:text-[#8fa6a4]">
            {resources.length} {resources.length === 1 ? 'item' : 'items'} shared ({availableCount} currently available)
          </p>
        </div>

        <Link
          to="/resources/new"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#01140F] dark:bg-[#36586A] text-white text-xs font-semibold hover:bg-[#36586A] dark:hover:bg-[#47768E] transition"
        >
          <PlusCircle className="w-3.5 h-3.5 text-[#AAA86D] dark:text-[#c4c184]" />
          <span>List Item</span>
        </Link>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-[#14201e] rounded-2xl border border-[#A3B0AF]/20 dark:border-[#283d39] p-4 space-y-3 animate-pulse">
              <div className="aspect-[16/10] bg-[#A3B0AF]/15 dark:bg-[#253935] rounded-xl" />
              <div className="h-4 bg-[#A3B0AF]/15 dark:bg-[#253935] rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : resources.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-[#14201e] rounded-2xl border border-[#A3B0AF]/20 dark:border-[#283d39] p-8 space-y-3">
          <p className="text-sm font-semibold text-[#01140F] dark:text-[#f0f6f4]">No listings yet</p>
          <p className="text-xs text-[#516B71] dark:text-[#8fa6a4]">
            Share textbooks, equipment, or tools you no longer need.
          </p>
          <Link
            to="/resources/new"
            className="inline-block mt-2 px-4 py-2 rounded-xl text-xs font-semibold bg-[#01140F] dark:bg-[#36586A] text-white hover:bg-[#36586A] dark:hover:bg-[#47768E] transition"
          >
            List an Item
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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
