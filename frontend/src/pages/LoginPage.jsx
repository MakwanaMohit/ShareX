import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const { showSuccess } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || (typeof location.state?.from === 'string' ? location.state.from : null) || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    try {
      setLoading(true);
      const user = await login(email.trim(), password);
      showSuccess(`Welcome back, ${user.name}!`);
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid email or password.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-10 px-4">
      <div className="max-w-sm w-full space-y-5">
        {/* Brand header */}
        <div className="text-center space-y-1">
          <div className="w-10 h-10 rounded-xl bg-[#01140F] dark:bg-[#14201e] border border-transparent dark:border-[#3b524e] flex items-center justify-center text-[#AAA86D] dark:text-[#c4c184] text-base font-black mx-auto mb-3">
            S
          </div>
          <h2 className="text-2xl font-bold text-[#01140F] dark:text-[#f0f6f4] tracking-tight">
            Log in to ShareX
          </h2>
          <p className="text-xs text-[#516B71] dark:text-[#8fa6a4]">
            Campus Student Resource Exchange
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-rose-800 dark:text-rose-300 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Login Form */}
        <div className="bg-white dark:bg-[#14201e] rounded-2xl border border-[#A3B0AF]/25 dark:border-[#283d39] p-6 space-y-4 shadow-xs">
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-[#01140F] dark:text-[#f0f6f4] mb-1">
                College Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@ddu.ac.in"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#A3B0AF]/30 dark:border-[#283d39] bg-white dark:bg-[#0e1716] focus:outline-none focus:ring-2 focus:ring-[#36586A]/30 text-[#01140F] dark:text-[#f0f6f4] placeholder:text-[#A3B0AF] dark:placeholder:text-[#6c8280]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#01140F] dark:text-[#f0f6f4] mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#A3B0AF]/30 dark:border-[#283d39] bg-white dark:bg-[#0e1716] focus:outline-none focus:ring-2 focus:ring-[#36586A]/30 text-[#01140F] dark:text-[#f0f6f4]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-[#01140F] dark:bg-[#36586A] hover:bg-[#36586A] dark:hover:bg-[#47768E] disabled:opacity-50 transition shadow-xs"
            >
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="pt-3 border-t border-[#F7F8FA] dark:border-[#1e302d] flex items-center justify-between text-[11px]">
            <span className="text-[#A3B0AF] dark:text-[#6c8280]">Test accounts:</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleDemoFill('24ceubt910@ddu.ac.in', 'mypassword123')}
                className="text-[#36586A] dark:text-[#50829C] hover:underline font-semibold"
              >
                Student Demo
              </button>
              <span className="text-[#A3B0AF] dark:text-[#6c8280]">•</span>
              <button
                type="button"
                onClick={() => handleDemoFill('admin@ddu.ac.in', 'admin12345')}
                className="text-[#83727E] dark:text-[#b89fae] hover:underline font-semibold"
              >
                Admin Demo
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-[#516B71] dark:text-[#8fa6a4]">
          Need an account?{' '}
          <Link to="/register" className="font-semibold text-[#36586A] dark:text-[#50829C] hover:underline">
            Sign up →
          </Link>
        </p>
      </div>
    </div>
  );
}
