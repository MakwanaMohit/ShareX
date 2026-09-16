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
  Sparkles,
  SlidersHorizontal,
  RotateCcw,
  CheckCircle2,
  ShieldCheck,
  Gift,
  ArrowRight,
} from 'lucide-react';
import { resourceApi } from '../api';
import ResourceCard from '../components/ResourceCard';
import { useAuth } from '../context/AuthContext';

const categories = [
  { id: '', label: 'All Items', icon: Sparkles },
  { id: 'book', label: 'Books & Notes', icon: BookOpen },
  { id: 'calculator', label: 'Calculators', icon: Calculator },
  { id: 'lab-equipment', label: 'Lab Equipment', icon: FlaskConical },
  { id: 'electronics', label: 'Electronics', icon: Cpu },
  { id: 'other', label: 'Other', icon: Package },
];

export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();

  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search & Filter state synced with URL params
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
      setError('Could not load resources. Please ensure the backend server is running.');
    } finally {
      setLoading(false);
    }
  }, [search, category, listingType, available]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  // Update URL search params
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
      {/* ─── Hero Section ──────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 text-white shadow-xl px-6 py-12 sm:px-12 sm:py-16">
        {/* Background decorative glowing circles */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 rounded-full bg-purple-500/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-96 h-96 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
            Empowering University Peers
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight text-white">
            Borrow, Lend & Donate{' '}
            <span className="bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 bg-clip-text text-transparent">
              Campus Resources
            </span>
          </h1>

          <p className="text-sm sm:text-base text-indigo-100 max-w-2xl leading-relaxed">
            Stop overspending every semester. Access textbooks, scientific calculators, lab coats, components, and study materials directly from fellow students.
          </p>

          {/* Hero Search Bar */}
          <form onSubmit={handleSearchSubmit} className="pt-2 max-w-xl">
            <div className="relative flex items-center">
              <Search className="absolute left-4 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by title, subject or author (e.g., Physics Vol.1, Casio fx-991EX)..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-12 pr-28 py-3.5 rounded-2xl bg-white/95 text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm font-medium focus:outline-none focus:ring-4 focus:ring-indigo-400/50 shadow-lg"
              />
              <button
                type="submit"
                className="absolute right-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow transition"
              >
                Search
              </button>
            </div>
          </form>

          {/* Call to action buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              to={isAuthenticated ? '/resources/new' : '/login'}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-indigo-900 text-xs sm:text-sm font-bold hover:bg-indigo-50 shadow-md transition"
            >
              <PlusCircle className="w-4 h-4 text-indigo-600" />
              Share an Item Now
            </Link>
            <a
              href="#explore-section"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-700/60 hover:bg-indigo-700 text-white border border-indigo-400/30 text-xs sm:text-sm font-semibold backdrop-blur transition"
            >
              Explore Listings <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* ─── Highlights Row ────────────────────────────────────────────────────── */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <Gift className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-slate-800">Lend or Donate</h4>
            <p className="text-[11px] text-slate-500">Lend for short-term or donate books permanently to juniors.</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-slate-800">Security Deposits</h4>
            <p className="text-[11px] text-slate-500">Set refundable deposits to protect valuable items.</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-slate-800">Verified Peer Ratings</h4>
            <p className="text-[11px] text-slate-500">Real ratings and reviews from campus classmates.</p>
          </div>
        </div>
      </section>

      {/* ─── Explore & Filter Section ────────────────────────────────────────── */}
      <section id="explore-section" className="space-y-6">
        {/* Category Pills Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Explore Campus Resources</h2>
            <p className="text-xs text-slate-500">Find items available for borrowing or donation in your college</p>
          </div>

          {/* Quick Filter Actions */}
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Filters
            </button>
          )}
        </div>

        {/* Category Navigation Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = category === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => updateFilter('category', cat.id)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-150 ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 ring-2 ring-indigo-600 ring-offset-2'
                    : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-indigo-500'}`} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Secondary Filter Bar: Listing Type, Availability, Search tag */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600" /> Filters:
            </span>

            {/* Listing Type buttons */}
            <div className="inline-flex p-1 bg-slate-100 rounded-xl text-xs font-semibold">
              <button
                onClick={() => updateFilter('listingType', '')}
                className={`px-3 py-1 rounded-lg transition ${
                  listingType === '' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Types
              </button>
              <button
                onClick={() => updateFilter('listingType', 'lend')}
                className={`px-3 py-1 rounded-lg transition ${
                  listingType === 'lend' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Lend Only
              </button>
              <button
                onClick={() => updateFilter('listingType', 'donate')}
                className={`px-3 py-1 rounded-lg transition ${
                  listingType === 'donate' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Free Donate
              </button>
            </div>

            {/* Availability Toggle */}
            <button
              onClick={() => updateFilter('available', available === 'true' ? '' : 'true')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition inline-flex items-center gap-1.5 ${
                available === 'true'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <CheckCircle2 className={`w-3.5 h-3.5 ${available === 'true' ? 'text-emerald-600' : 'text-slate-400'}`} />
              Available Now Only
            </button>
          </div>

          {/* Results count */}
          <div className="text-xs font-semibold text-slate-500">
            Showing <span className="text-slate-900 font-bold">{resources.length}</span> items
          </div>
        </div>

        {/* ─── Resource Grid ───────────────────────────────────────────────────── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 animate-pulse"
              >
                <div className="aspect-video bg-slate-200 rounded-xl" />
                <div className="h-4 bg-slate-200 rounded w-3/4" />
                <div className="h-3 bg-slate-200 rounded w-1/2" />
                <div className="h-8 bg-slate-100 rounded-xl" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-rose-200 p-8 space-y-3">
            <p className="text-rose-600 font-bold text-sm">{error}</p>
            <button
              onClick={fetchResources}
              className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition"
            >
              Retry
            </button>
          </div>
        ) : resources.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 p-8 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center mx-auto">
              <Package className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">No resources found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                {hasActiveFilters
                  ? 'Try changing or clearing your search criteria to see more items.'
                  : 'Be the first student to share an item with the campus!'}
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              {hasActiveFilters ? (
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition"
                >
                  Clear All Filters
                </button>
              ) : (
                <Link
                  to={isAuthenticated ? '/resources/new' : '/login'}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md transition"
                >
                  Post First Resource
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {resources.map((resource) => (
              <ResourceCard key={resource._id} resource={resource} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
