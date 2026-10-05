import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-[#A3B0AF]/25 dark:border-[#253935] bg-white dark:bg-[#0c1413] py-10 mt-auto text-xs text-[#516B71] dark:text-[#8fa6a4] transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm tracking-tight text-[#01140F] dark:text-[#f0f6f4]">
              share<span className="text-[#36586A] dark:text-[#50829C]">x</span>
            </span>
            <span className="text-[#A3B0AF] dark:text-[#6c8280]">•</span>
            <span>Campus Resource Exchange</span>
          </div>

          {/* Quick links */}
          <div className="flex flex-wrap items-center gap-5">
            <Link to="/" className="hover:text-[#01140F] dark:hover:text-[#f0f6f4] transition">Explore</Link>
            <Link to="/resources/new" className="hover:text-[#01140F] dark:hover:text-[#f0f6f4] transition">Share Resource</Link>
            <Link to="/requests" className="hover:text-[#01140F] dark:hover:text-[#f0f6f4] transition">Borrow Requests</Link>
          </div>

          <p className="text-[#A3B0AF] dark:text-[#6c8280]">
            © {new Date().getFullYear()} ShareX. Built for students.
          </p>
        </div>
      </div>
    </footer>
  );
}
