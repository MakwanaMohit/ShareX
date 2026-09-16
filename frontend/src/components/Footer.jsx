import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Heart, ShieldCheck, RefreshCw, Users, BookOpen } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4 text-indigo-200" />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-white">ShareX</span>
            </div>
            <p className="text-slate-400 text-sm max-w-sm">
              Empowering students to share textbooks, lab equipment, calculators, and electronics safely within our campus community. Save money, reduce waste, and help peers succeed.
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-400 pt-2">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Verified Student Network
              </span>
              <span className="flex items-center gap-1">
                <RefreshCw className="w-4 h-4 text-indigo-400" /> Safe Deposits
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Explore</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link to="/" className="hover:text-white transition">Browse All Resources</Link>
              </li>
              <li>
                <Link to="/resources/new" className="hover:text-white transition">List an Item</Link>
              </li>
              <li>
                <Link to="/my-listings" className="hover:text-white transition">My Active Listings</Link>
              </li>
              <li>
                <Link to="/requests" className="hover:text-white transition">Borrow Requests</Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Categories</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link to="/?category=book" className="hover:text-white transition">Books & Notes</Link>
              </li>
              <li>
                <Link to="/?category=calculator" className="hover:text-white transition">Calculators & Drafters</Link>
              </li>
              <li>
                <Link to="/?category=lab-equipment" className="hover:text-white transition">Lab Equipment</Link>
              </li>
              <li>
                <Link to="/?category=electronics" className="hover:text-white transition">Electronics & Gadgets</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} ShareX Platform. Built for University Students.</p>
          <p className="flex items-center gap-1">
            Made with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for campus collaboration
          </p>
        </div>
      </div>
    </footer>
  );
}
