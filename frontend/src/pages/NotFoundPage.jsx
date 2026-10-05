import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Home } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-[65vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-16 h-16 rounded-3xl bg-[#36586A]/10 dark:bg-[#50829C]/20 border border-[#36586A]/20 dark:border-[#50829C]/30 text-[#36586A] dark:text-[#50829C] flex items-center justify-center mb-6 shadow-sm">
        <Sparkles className="w-8 h-8 text-[#AAA86D] dark:text-[#c4c184]" />
      </div>
      <h1 className="text-4xl font-extrabold text-[#01140F] dark:text-[#f0f6f4] tracking-tight">404</h1>
      <h2 className="text-lg font-bold text-[#01140F] dark:text-[#f0f6f4] mt-2">Page Not Found</h2>
      <p className="text-xs text-[#516B71] dark:text-[#8fa6a4] max-w-sm mt-1 mb-6">
        The resource or page you are looking for might have been moved, deleted, or does not exist.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-[#36586A] hover:bg-[#36586A]/90 dark:bg-[#36586A] dark:hover:bg-[#47768E] shadow-md transition"
      >
        <Home className="w-4 h-4" /> Back to Home
      </Link>
    </div>
  );
}
