import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  BookOpen,
  Calculator,
  FlaskConical,
  Cpu,
  Package,
  PlusCircle,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import { resourceApi } from '../api';
import ResourceCard from '../components/ResourceCard';
import { useAuth } from '../context/AuthContext';

const categories = [
  { id: '', label: 'All' },
  { id: 'book', label: 'Books', icon: BookOpen },
  { id: 'calculator', label: 'Calculators', icon: Calculator },
  { id: 'lab-equipment', label: 'Lab Gear', icon: FlaskConical },
  { id: 'electronics', label: 'Electronics', icon: Cpu },
  { id: 'other', label: 'Other', icon: Package },
];

export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();

  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const listingType = searchParams.get('listingType') || '';
  const available = searchParams.get('available') || '';

  const [searchInput, setSearchInput] = useState(search);

  const fetchResources = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (search) params.search = search;
      if (category) params.category = category;
      if (listingType) params.listingType = listingType;
      if (available) params.available = available;

      const res = await resourceApi.getAll(params);
      setResources(res.data?.data?.resources || []);
    } catch (err) {
      console.error('Error fetching resources:', err);
      setError('Could not load resources.');
    } finally {
      setLoading(false);
    }
  }, [search, category, listingType, available]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  const updateFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateFilter('search', searchInput.trim());
  };

  const handleResetFilters = () => {
    setSearchInput('');
    setSearchParams({});
  };

  const hasActiveFilters = search || category || listingType || available;

  return (
    <div className="space-y-10 pb-16">
      {/* ─── Minimal Hero Section ────────────────────────────────────────── */}
      <section className="text-center max-w-2xl mx-auto pt-6 sm:pt-10 space-y-4">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#01140F] dark:text-[#f0f6f4] tracking-tight leading-tight">
          Campus Resource Exchange
        </h1>
        <p className="text-sm text-[#516B71] dark:text-[#8fa6a4] leading-relaxed">
          Borrow textbooks, calculators, and lab tools from classmates. Save money and pass items forward.
        </p>

        {/* Clean Search Bar */}
        <form onSubmit={handleSearchSubmit} className="pt-2 max-w-lg mx-auto">
          <div className="relative flex items-center">
            <Search className="absolute left-4 w-4 h-4 text-[#A3B0AF] dark:text-[#6c8280]" />
            <input
              type="text"
              placeholder="Search books, equipment, tools..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-11 pr-24 py-3 rounded-2xl bg-white dark:bg-[#14201e] text-[#01140F] dark:text-[#f0f6f4] placeholder:text-[#A3B0AF] dark:placeholder:text-[#6c8280] text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#36586A]/30 border border-[#A3B0AF]/30 dark:border-[#283d39] shadow-xs"
            />
            <button
              type="submit"
              className="absolute right-1.5 px-4 py-1.5 bg-[#01140F] dark:bg-[#36586A] hover:bg-[#36586A] dark:hover:bg-[#47768E] text-white rounded-xl text-xs font-semibold transition"
            >
              Search
            </button>
          </div>
        </form>
      </section>

      {/* ─── Streamlined Filters ─────────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-[#A3B0AF]/20 dark:border-[#283d39] pb-4">
          {/* Category tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
            {categories.map((cat) => {
              const isSelected = category === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => updateFilter('category', cat.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition whitespace-nowrap ${
                    isSelected
                      ? 'bg-[#01140F] text-white dark:bg-[#36586a] dark:text-white font-semibold'
                      : 'text-[#516B71] dark:text-[#8fa6a4] hover:text-[#01140F] dark:hover:text-[#f0f6f4] hover:bg-white dark:hover:bg-[#14201e]'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Secondary filter chips */}
          <div className="flex items-center gap-2 text-xs w-full sm:w-auto justify-between sm:justify-end">
            <button
              onClick={() => updateFilter('listingType', listingType === 'lend' ? '' : 'lend')}
              className={`px-3 py-1 rounded-xl transition ${
                listingType === 'lend'
                  ? 'bg-[#36586A] text-white font-semibold'
                  : 'bg-white dark:bg-[#14201e] text-[#516B71] dark:text-[#8fa6a4] border border-[#A3B0AF]/25 dark:border-[#283d39] hover:text-[#01140F] dark:hover:text-[#f0f6f4]'
              }`}
            >
              Lend
            </button>
            <button
              onClick={() => updateFilter('listingType', listingType === 'donate' ? '' : 'donate')}
              className={`px-3 py-1 rounded-xl transition ${
                listingType === 'donate'
                  ? 'bg-[#6B8B78] text-white font-semibold'
                  : 'bg-white dark:bg-[#14201e] text-[#516B71] dark:text-[#8fa6a4] border border-[#A3B0AF]/25 dark:border-[#283d39] hover:text-[#01140F] dark:hover:text-[#f0f6f4]'
              }`}
            >
              Donate
            </button>
            <button
              onClick={() => updateFilter('available', available === 'true' ? '' : 'true')}
              className={`px-3 py-1 rounded-xl transition ${
                available === 'true'
                  ? 'bg-[#6B8B78]/20 text-[#6B8B78] dark:text-[#81ac90] border border-[#6B8B78]/40 font-semibold'
                  : 'bg-white dark:bg-[#14201e] text-[#516B71] dark:text-[#8fa6a4] border border-[#A3B0AF]/25 dark:border-[#283d39] hover:text-[#01140F] dark:hover:text-[#f0f6f4]'
              }`}
            >
              Available Only
            </button>

            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="p-1 text-[#A3B0AF] dark:text-[#6c8280] hover:text-rose-600 dark:hover:text-rose-400 transition"
                title="Reset filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between text-xs text-[#516B71] dark:text-[#8fa6a4]">
          <span>{resources.length} {resources.length === 1 ? 'item' : 'items'} available</span>
          <Link to={isAuthenticated ? '/resources/new' : '/login'} className="font-semibold text-[#36586A] dark:text-[#50829C] hover:underline flex items-center gap-1">
            <PlusCircle className="w-3.5 h-3.5" /> Share an item
          </Link>
        </div>

        {/* ─── Grid ──────────────────────────────────────────────────────── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-white dark:bg-[#14201e] rounded-2xl border border-[#A3B0AF]/20 dark:border-[#283d39] p-4 space-y-3 animate-pulse">
                <div className="aspect-[16/10] bg-[#A3B0AF]/15 dark:bg-[#253935] rounded-xl" />
                <div className="h-4 bg-[#A3B0AF]/15 dark:bg-[#253935] rounded w-3/4" />
                <div className="h-3 bg-[#A3B0AF]/10 dark:bg-[#1f2f2c] rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16 bg-white dark:bg-[#14201e] rounded-2xl border border-[#A3B0AF]/20 dark:border-[#283d39] p-6 space-y-2">
            <p className="text-sm font-semibold text-[#01140F] dark:text-[#f0f6f4]">{error}</p>
            <button
              onClick={fetchResources}
              className="text-xs text-[#36586A] dark:text-[#50829C] hover:underline font-semibold"
            >
              Try reloading
            </button>
          </div>
        ) : resources.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-[#14201e] rounded-2xl border border-[#A3B0AF]/20 dark:border-[#283d39] p-6 space-y-3">
            <p className="text-sm font-semibold text-[#01140F] dark:text-[#f0f6f4]">No items found</p>
            <p className="text-xs text-[#516B71] dark:text-[#8fa6a4]">
              {hasActiveFilters ? 'Try adjusting your filters or search keywords.' : 'Be the first student to list a resource.'}
            </p>
            {hasActiveFilters ? (
              <button
                onClick={handleResetFilters}
                className="text-xs font-semibold text-[#36586A] dark:text-[#50829C] hover:underline"
              >
                Clear all filters
              </button>
            ) : (
              <Link
                to={isAuthenticated ? '/resources/new' : '/login'}
                className="inline-block mt-2 px-4 py-2 rounded-xl text-xs font-semibold bg-[#01140F] dark:bg-[#36586A] text-white hover:bg-[#36586A] dark:hover:bg-[#47768E] transition"
              >
                List Item
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {resources.map((resource) => (
              <ResourceCard key={resource._id} resource={resource} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
