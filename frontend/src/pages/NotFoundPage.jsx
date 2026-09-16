import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowLeft, Home } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-[65vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-16 h-16 rounded-3xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mb-6 shadow-sm">
        <Sparkles className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">404</h1>
      <h2 className="text-lg font-bold text-slate-700 mt-2">Page Not Found</h2>
      <p className="text-xs text-slate-500 max-w-sm mt-1 mb-6">
        The resource or page you are looking for might have been moved, deleted, or does not exist.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md transition"
      >
        <Home className="w-4 h-4" /> Back to Home
      </Link>
    </div>
  );
}
