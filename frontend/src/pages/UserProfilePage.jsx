import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  User,
  Star,
  Calendar,
  Layers,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  MessageSquare,
} from 'lucide-react';
import { userApi, reviewApi, resourceApi } from '../api';
import ResourceCard from '../components/ResourceCard';
import { useToast } from '../context/ToastContext';

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

      // Filter resources belonging to this user
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
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-500 font-medium text-sm">Loading student profile...</p>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 p-8 space-y-4">
        <h3 className="text-xl font-bold text-slate-800">Student Not Found</h3>
        <p className="text-xs text-slate-500">This user profile is not available.</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Explore
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16 max-w-5xl mx-auto">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Marketplace
      </Link>

      {/* Hero Profile Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-black text-3xl sm:text-4xl flex items-center justify-center uppercase overflow-hidden shadow-md shrink-0">
          {profileUser.profilePicture ? (
            <img
              src={profileUser.profilePicture}
              alt={profileUser.name}
              className="w-full h-full object-cover"
            />
          ) : (
            profileUser.name?.charAt(0) || 'U'
          )}
        </div>

        <div className="space-y-3 flex-1 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {profileUser.name}
              </h1>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center justify-center sm:justify-start gap-1">
                <Calendar className="w-3.5 h-3.5" /> Joined campus exchange on{' '}
                {new Date(profileUser.createdAt).toLocaleDateString()}
              </p>
            </div>

            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 self-center sm:self-start">
              <ShieldCheck className="w-3.5 h-3.5" /> Verified Student
            </div>
          </div>

          {/* Rating badge */}
          <div className="inline-flex items-center gap-3 p-3 bg-amber-50/70 border border-amber-200/80 rounded-2xl">
            <div className="flex items-center gap-1 text-lg font-black text-amber-600">
              <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
              {profileUser.rating?.average?.toFixed(1) || '0.0'}
            </div>
            <div className="text-left text-xs">
              <span className="font-bold text-amber-900 block">Trust Rating</span>
              <span className="text-[11px] text-amber-700">
                {profileUser.rating?.count || 0} reviews received
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Listed Resources */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-600" />
          Resources Shared by {profileUser.name} ({userResources.length})
        </h2>

        {userResources.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-400">
            No active resources listed by this student at the moment.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {userResources.map((res) => (
              <ResourceCard key={res._id} resource={res} />
            ))}
          </div>
        )}
      </section>

      {/* Peer Reviews */}
      <section className="space-y-4 pt-4 border-t border-slate-200">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
          Classmate Reviews & Feedback ({userReviews.length})
        </h2>

        {userReviews.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-400">
            No student reviews yet for this profile.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {userReviews.map((rev) => (
              <div
                key={rev._id}
                className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs uppercase">
                      {rev.reviewer?.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-800">
                        {rev.reviewer?.name || 'Classmate'}
                      </h4>
                      <span className="text-[10px] text-slate-400 block">
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-xs text-amber-500 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    {rev.rating}/5
                  </div>
                </div>

                {rev.comment && (
                  <p className="text-xs text-slate-600 pl-10 leading-relaxed italic">
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
