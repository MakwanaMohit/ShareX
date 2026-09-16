import React from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Cpu,
  Calculator,
  FlaskConical,
  Package,
  Star,
  IndianRupee,
  Gift,
  HandCoins,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

const categoryIcons = {
  book: BookOpen,
  calculator: Calculator,
  'lab-equipment': FlaskConical,
  electronics: Cpu,
  other: Package,
};

const categoryLabels = {
  book: 'Book & Notes',
  calculator: 'Calculator',
  'lab-equipment': 'Lab Equipment',
  electronics: 'Electronics',
  other: 'Other Item',
};

const conditionColors = {
  new: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  good: 'bg-blue-50 text-blue-700 border-blue-200',
  fair: 'bg-amber-50 text-amber-700 border-amber-200',
  poor: 'bg-rose-50 text-rose-700 border-rose-200',
};

export default function ResourceCard({ resource, isOwner = false, onToggle, onDelete }) {
  const CategoryIcon = categoryIcons[resource.category] || Package;
  const mainImage = resource.images && resource.images.length > 0 ? resource.images[0] : null;

  return (
    <div className="group bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden">
      {/* Image container */}
      <div className="relative aspect-video w-full bg-slate-100 overflow-hidden">
        {mainImage ? (
          <img
            src={mainImage}
            alt={resource.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}

        <div
          className={`w-full h-full flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-slate-100 text-slate-400 ${
            mainImage ? 'hidden' : 'flex'
          }`}
        >
          <CategoryIcon className="w-10 h-10 text-indigo-400 mb-1" />
          <span className="text-xs font-medium text-slate-600">
            {categoryLabels[resource.category] || 'Resource'}
          </span>
        </div>

        {/* Listing Type Tag */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          {resource.listingType === 'donate' ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-600 text-white shadow-sm">
              <Gift className="w-3.5 h-3.5" /> Free Donation
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-600 text-white shadow-sm">
              <HandCoins className="w-3.5 h-3.5" /> For Lend
            </span>
          )}
        </div>

        {/* Availability Badge */}
        <div className="absolute top-3 right-3">
          {resource.isAvailable ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/90 backdrop-blur text-white shadow-sm">
              <CheckCircle2 className="w-3.5 h-3.5" /> Available
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-700/90 backdrop-blur text-white shadow-sm">
              <XCircle className="w-3.5 h-3.5" /> In Use
            </span>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Tags row */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700">
              <CategoryIcon className="w-3 h-3 text-indigo-600" />
              {categoryLabels[resource.category] || resource.category}
            </span>
            <span
              className={`px-2 py-0.5 rounded-md text-[11px] font-medium border capitalize ${
                conditionColors[resource.condition] || 'bg-slate-100 text-slate-700'
              }`}
            >
              Condition: {resource.condition}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-bold text-base text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
            <Link to={`/resources/${resource._id}`}>{resource.title}</Link>
          </h3>

          {/* Description */}
          {resource.description && (
            <p className="text-xs text-slate-600 line-clamp-2 mt-1 leading-relaxed">
              {resource.description}
            </p>
          )}
        </div>

        {/* Bottom Details & Owner Info */}
        <div className="pt-3 border-t border-slate-100 space-y-3">
          <div className="flex items-center justify-between text-xs">
            {/* Owner avatar & name */}
            {resource.owner && (
              <Link
                to={`/users/${resource.owner._id || resource.owner}`}
                className="flex items-center gap-2 group/owner hover:text-indigo-600 transition"
              >
                <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-[10px] uppercase shrink-0 overflow-hidden">
                  {resource.owner.profilePicture ? (
                    <img
                      src={resource.owner.profilePicture}
                      alt={resource.owner.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    resource.owner.name?.charAt(0) || 'U'
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-slate-700 group-hover/owner:text-indigo-600 truncate max-w-[110px]">
                    {resource.owner.name || 'Owner'}
                  </span>
                  {resource.owner.rating && resource.owner.rating.count > 0 ? (
                    <span className="flex items-center gap-0.5 text-[10px] text-amber-600 font-medium">
                      <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                      {resource.owner.rating.average.toFixed(1)}
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-600">New user</span>
                  )}
                </div>
              </Link>
            )}

            {/* Deposit tag */}
            <div className="text-right">
              {resource.listingType === 'donate' ? (
                <span className="font-bold text-emerald-600 text-sm">FREE</span>
              ) : (
                <div>
                  <span className="text-[10px] text-slate-600 block">Security Deposit</span>
                  <span className="font-bold text-slate-900 text-sm flex items-center justify-end">
                    <IndianRupee className="w-3.5 h-3.5" />
                    {resource.securityDeposit || 0}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          {isOwner ? (
            <div className="grid grid-cols-3 gap-1.5 pt-1">
              <Link
                to={`/resources/${resource._id}/edit`}
                className="py-1.5 px-2 text-center text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
              >
                Edit
              </Link>
              <button
                onClick={() => onToggle && onToggle(resource._id)}
                className={`py-1.5 px-2 text-center text-xs font-semibold rounded-lg transition ${
                  resource.isAvailable
                    ? 'text-amber-700 bg-amber-50 hover:bg-amber-100'
                    : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                }`}
              >
                {resource.isAvailable ? 'Set In Use' : 'Set Available'}
              </button>
              <button
                onClick={() => onDelete && onDelete(resource._id)}
                className="py-1.5 px-2 text-center text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition"
              >
                Delete
              </button>
            </div>
          ) : (
            <Link
              to={`/resources/${resource._id}`}
              className="w-full block py-2 text-center text-xs font-bold text-indigo-600 hover:text-white bg-indigo-50 hover:bg-indigo-600 rounded-xl transition duration-200 shadow-sm"
            >
              View Resource Details →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
