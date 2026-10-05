import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Star,
  Calendar,
  Layers,
  ArrowLeft,
  ShieldCheck,
} from 'lucide-react';
import { userApi, reviewApi, resourceApi } from '../api';
import ResourceCard from '../components/ResourceCard';
import { useToast } from '../context/ToastContext';
import { formatMediaUrl } from '../utils/media';

export default function UserProfilePage() {
  const { userId } = useParams();
  const [profileUser, setProfileUser] = useState(null);
  const [userReviews, setUserReviews] = useState([]);
  const [userResources, setUserResources] = useState([]);
  const [loading, setLoading] = useState(true);

  const { showError } = useToast();

  const fetchUserData = useCallback(async () => {
    try {
      setLoading(true);
      const [uRes, revRes, resRes] = await Promise.all([
        userApi.getUserById(userId),
        reviewApi.getUserReviews(userId),
        resourceApi.getAll(),
      ]);

      setProfileUser(uRes.data?.data?.user);
      setUserReviews(revRes.data?.data?.reviews || []);

      const allRes = resRes.data?.data?.resources || [];
      setUserResources(allRes.filter((r) => (r.owner?._id || r.owner) === userId));
    } catch (err) {
      console.error('Failed to load user profile:', err);
      showError(err.response?.data?.message || 'Could not load student profile.');
    } finally {
      setLoading(false);
    }
  }, [userId, showError]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  if (loading) {
    return (
      <div className="min-h-[40vh] flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#36586A] dark:border-[#50829C] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-3 text-[#516B71] dark:text-[#8fa6a4] text-xs">Loading student profile...</p>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="text-center py-16 bg-white dark:bg-[#14201e] rounded-2xl border border-[#A3B0AF]/25 dark:border-[#283d39] p-8 space-y-4 max-w-md mx-auto">
        <h3 className="text-base font-bold text-[#01140F] dark:text-[#f0f6f4]">Student Not Found</h3>
        <p className="text-xs text-[#516B71] dark:text-[#8fa6a4]">This user profile is not available.</p>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#01140F] dark:bg-[#36586A] hover:bg-[#36586A] dark:hover:bg-[#47768E] transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Explore
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16 max-w-4xl mx-auto">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-xs text-[#516B71] dark:text-[#8fa6a4] hover:text-[#01140F] dark:hover:text-[#f0f6f4] transition"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Marketplace
      </Link>

      {/* Hero Profile Card */}
      <div className="bg-white dark:bg-[#14201e] rounded-2xl border border-[#A3B0AF]/25 dark:border-[#283d39] p-6 shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-5">
        <div className="w-20 h-20 rounded-2xl bg-[#01140F] dark:bg-[#0c1413] border border-transparent dark:border-[#3b524e] text-[#AAA86D] dark:text-[#c4c184] font-bold text-2xl flex items-center justify-center uppercase overflow-hidden shrink-0">
          {profileUser.profilePicture ? (
            <img
              src={formatMediaUrl(profileUser.profilePicture)}
              alt={profileUser.name}
              className="w-full h-full object-cover"
            />
          ) : (
            profileUser.name?.charAt(0) || 'U'
          )}
        </div>

        <div className="space-y-2 flex-1 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#01140F] dark:text-[#f0f6f4] tracking-tight">
                {profileUser.name}
              </h1>
              <p className="text-xs text-[#516B71] dark:text-[#8fa6a4] mt-0.5 flex items-center justify-center sm:justify-start gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#A3B0AF] dark:text-[#6c8280]" /> Joined campus exchange{' '}
                {new Date(profileUser.createdAt).toLocaleDateString()}
              </p>
            </div>

            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#6B8B78]/10 dark:bg-[#6B8B78]/20 text-[#6B8B78] dark:text-[#81ac90] border border-[#6B8B78]/20 self-center sm:self-start">
              <ShieldCheck className="w-3.5 h-3.5" /> Verified Student
            </span>
          </div>

          {/* Rating */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#F7F8FA] dark:bg-[#0e1716] border border-[#A3B0AF]/20 dark:border-[#283d39] rounded-xl text-xs">
            <Star className="w-3.5 h-3.5 fill-[#AAA86D] text-[#AAA86D] dark:text-[#c4c184] dark:fill-[#c4c184]" />
            <span className="font-bold text-[#01140F] dark:text-[#f0f6f4]">
              {profileUser.rating?.average?.toFixed(1) || '0.0'}
            </span>
            <span className="text-[#A3B0AF] dark:text-[#6c8280]">·</span>
            <span className="text-[#516B71] dark:text-[#8fa6a4]">
              {profileUser.rating?.count || 0} reviews
            </span>
          </div>
        </div>
      </div>

      {/* Listed Resources */}
      <section className="space-y-4">
        <h2 className="text-base font-bold text-[#01140F] dark:text-[#f0f6f4] flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#36586A] dark:text-[#50829C]" />
          Resources Shared by {profileUser.name} ({userResources.length})
        </h2>

        {userResources.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-[#14201e] rounded-2xl border border-[#A3B0AF]/20 dark:border-[#283d39] text-xs text-[#516B71] dark:text-[#8fa6a4]">
            No active resources listed by this student at the moment.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {userResources.map((res) => (
              <ResourceCard key={res._id} resource={res} />
            ))}
          </div>
        )}
      </section>

      {/* Peer Reviews */}
      <section className="space-y-4 pt-4 border-t border-[#A3B0AF]/20 dark:border-[#283d39]">
        <h2 className="text-base font-bold text-[#01140F] dark:text-[#f0f6f4] flex items-center gap-2">
          <Star className="w-4 h-4 fill-[#AAA86D] text-[#AAA86D] dark:text-[#c4c184] dark:fill-[#c4c184]" />
          Reviews & Feedback ({userReviews.length})
        </h2>

        {userReviews.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-[#14201e] rounded-2xl border border-[#A3B0AF]/20 dark:border-[#283d39] text-xs text-[#516B71] dark:text-[#8fa6a4]">
            No student reviews yet for this profile.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {userReviews.map((rev) => (
              <div
                key={rev._id}
                className="p-4 rounded-xl bg-white dark:bg-[#14201e] border border-[#A3B0AF]/25 dark:border-[#283d39] shadow-xs space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#36586A]/10 dark:bg-[#50829C]/20 text-[#36586A] dark:text-[#50829C] font-bold flex items-center justify-center text-[11px] uppercase">
                      {rev.reviewer?.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#01140F] dark:text-[#f0f6f4]">
                        {rev.reviewer?.name || 'Classmate'}
                      </h4>
                      <span className="text-[10px] text-[#A3B0AF] dark:text-[#6c8280] block">
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-[#01140F] dark:text-[#f0f6f4] font-semibold text-xs">
                    <Star className="w-3.5 h-3.5 fill-[#AAA86D] text-[#AAA86D] dark:text-[#c4c184] dark:fill-[#c4c184]" />
                    {rev.rating}/5
                  </div>
                </div>

                {rev.comment && (
                  <p className="text-[#516B71] dark:text-[#8fa6a4] leading-relaxed pl-9 italic text-xs">
                    "{rev.comment}"
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
