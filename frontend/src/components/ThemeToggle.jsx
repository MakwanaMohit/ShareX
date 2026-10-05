import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle({ className = '' }) {
  const { toggleTheme, isDark } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative p-2 rounded-xl text-[#516B71] dark:text-[#9bb0ad] hover:text-[#01140F] dark:hover:text-[#f0f6f4] hover:bg-[#F7F8FA] dark:hover:bg-[#162422] border border-transparent hover:border-[#A3B0AF]/25 dark:hover:border-[#3b524e]/50 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#36586A] active:scale-95 ${className}`}
      aria-label={isDark ? 'Dark theme active. Click to switch to light mode' : 'Light theme active. Click to switch to dark mode'}
      title={isDark ? 'Dark mode (Click to switch to Light mode)' : 'Light mode (Click to switch to Dark mode)'}
    >
      <div className="relative w-4 h-4 flex items-center justify-center">
        {isDark ? (
          <Moon className="w-4 h-4 text-[#AAA86D] dark:text-[#c4c184] transition-transform duration-300 -rotate-12 hover:rotate-0" />
        ) : (
          <Sun className="w-4 h-4 text-[#516B71] hover:text-[#01140F] transition-transform duration-300 rotate-0 hover:rotate-45" />
        )}
      </div>
    </button>
  );
}
