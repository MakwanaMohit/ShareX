import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();
  const { showSuccess } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim() || !formData.email.trim() || !formData.password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      const user = await register(
        formData.name.trim(),
        formData.email.trim(),
        formData.password
      );
      showSuccess(`Welcome to ShareX, ${user.name}! Your account is ready.`);
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.join(', ') || 'Registration failed.';
      setError(msg);
    } finally {
      setLoading(false);
    }
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
            Create an Account
          </h2>
          <p className="text-xs text-[#516B71] dark:text-[#8fa6a4]">
            Join fellow students sharing academic resources
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-rose-800 dark:text-rose-300 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Form */}
        <div className="bg-white dark:bg-[#14201e] rounded-2xl border border-[#A3B0AF]/25 dark:border-[#283d39] p-6 space-y-4 shadow-xs">
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-[#01140F] dark:text-[#f0f6f4] mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Mohit Makwana"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#A3B0AF]/30 dark:border-[#283d39] bg-white dark:bg-[#0e1716] focus:outline-none focus:ring-2 focus:ring-[#36586A]/30 text-[#01140F] dark:text-[#f0f6f4] placeholder:text-[#A3B0AF] dark:placeholder:text-[#6c8280]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#01140F] dark:text-[#f0f6f4] mb-1">
                College Email
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="24ceubt910@ddu.ac.in"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#A3B0AF]/30 dark:border-[#283d39] bg-white dark:bg-[#0e1716] focus:outline-none focus:ring-2 focus:ring-[#36586A]/30 text-[#01140F] dark:text-[#f0f6f4] placeholder:text-[#A3B0AF] dark:placeholder:text-[#6c8280]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#01140F] dark:text-[#f0f6f4] mb-1">
                Password <span className="font-normal text-[#516B71] dark:text-[#8fa6a4]">(Min 6 characters)</span>
              </label>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#A3B0AF]/30 dark:border-[#283d39] bg-white dark:bg-[#0e1716] focus:outline-none focus:ring-2 focus:ring-[#36586A]/30 text-[#01140F] dark:text-[#f0f6f4]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#01140F] dark:text-[#f0f6f4] mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#A3B0AF]/30 dark:border-[#283d39] bg-white dark:bg-[#0e1716] focus:outline-none focus:ring-2 focus:ring-[#36586A]/30 text-[#01140F] dark:text-[#f0f6f4]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-[#01140F] dark:bg-[#36586A] hover:bg-[#36586A] dark:hover:bg-[#47768E] disabled:opacity-50 transition shadow-xs mt-2"
            >
              {loading ? 'Creating account...' : 'Create Student Account'}
            </button>
          </form>
        </div>

        {/* Login prompt */}
        <p className="text-center text-xs text-[#516B71] dark:text-[#8fa6a4]">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-[#36586A] dark:text-[#50829C] hover:underline">
            Log in instead →
          </Link>
        </p>
      </div>
    </div>
  );
}
