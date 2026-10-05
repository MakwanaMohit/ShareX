import React from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Cpu,
  Calculator,
  FlaskConical,
  Package,
  IndianRupee,
  Video,
} from 'lucide-react';
import { formatMediaUrl } from '../utils/media';

const categoryIcons = {
  book: BookOpen,
  calculator: Calculator,
  'lab-equipment': FlaskConical,
  electronics: Cpu,
  other: Package,
};

const categoryLabels = {
  book: 'Book',
  calculator: 'Calculator',
  'lab-equipment': 'Lab Equipment',
  electronics: 'Electronics',
  other: 'Other',
};

export default function ResourceCard({ resource, isOwner = false, onToggle, onDelete }) {
  const CategoryIcon = categoryIcons[resource.category] || Package;
  const mainImage = resource.images && resource.images.length > 0 ? resource.images[0] : null;

  return (
    <div className="group bg-white dark:bg-[#14201e] rounded-2xl border border-[#A3B0AF]/25 dark:border-[#283d39] hover:border-[#36586A]/50 dark:hover:border-[#50829C]/50 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden">
      {/* Image frame */}
      <Link to={`/resources/${resource._id}`} className="relative aspect-[16/10] w-full bg-[#F7F8FA] dark:bg-[#0e1716] overflow-hidden block">
        {mainImage ? (
          <img
            src={formatMediaUrl(mainImage)}
            alt={resource.title}
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}

        <div
          className={`w-full h-full flex flex-col items-center justify-center text-[#A3B0AF] dark:text-[#6c8280] ${
            mainImage ? 'hidden' : 'flex'
          }`}
        >
          <CategoryIcon className="w-8 h-8 text-[#516B71]/60 dark:text-[#8fa6a4]/60 mb-1" />
          <span className="text-[11px] font-medium text-[#516B71] dark:text-[#8fa6a4]">
            {categoryLabels[resource.category] || 'Resource'}
          </span>
        </div>

        {/* Status chip */}
        <div className="absolute top-2.5 right-2.5">
          {resource.isAvailable ? (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/95 dark:bg-[#14201e]/95 text-[#6B8B78] dark:text-[#81ac90] border border-[#6B8B78]/20 shadow-xs">
              Available
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/95 dark:bg-[#14201e]/95 text-[#83727E] dark:text-[#b89fae] border border-[#83727E]/20 shadow-xs">
              In Use
            </span>
          )}
        </div>

        {/* Listing Type Tag */}
        {resource.listingType === 'donate' && (
          <div className="absolute top-2.5 left-2.5">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#6B8B78] text-white shadow-xs">
              Free
            </span>
          </div>
        )}

        {/* Video available indicator */}
        {resource.videos && resource.videos.length > 0 && (
          <div className="absolute bottom-2 left-2">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-black/60 text-white backdrop-blur-xs flex items-center gap-1 shadow-xs">
              <Video className="w-2.5 h-2.5 text-[#50829C]" />
              <span>Video</span>
            </span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Metadata line */}
          <div className="flex items-center gap-1.5 text-[11px] text-[#516B71] dark:text-[#8fa6a4] mb-1">
            <span>{categoryLabels[resource.category] || resource.category}</span>
            <span>•</span>
            <span className="capitalize">{resource.condition} condition</span>
          </div>

          {/* Title */}
          <h3 className="font-bold text-sm text-[#01140F] dark:text-[#f0f6f4] line-clamp-1 group-hover:text-[#36586A] dark:group-hover:text-[#50829C] transition-colors">
            <Link to={`/resources/${resource._id}`}>{resource.title}</Link>
          </h3>

          {/* Description snippet */}
          {resource.description && (
            <p className="text-xs text-[#516B71] dark:text-[#8fa6a4] line-clamp-1 mt-1">
              {resource.description}
            </p>
          )}
        </div>

        {/* Bottom row */}
        <div className="pt-2.5 border-t border-[#F7F8FA] dark:border-[#1e302d] flex items-center justify-between text-xs">
          {/* Owner info */}
          {resource.owner ? (
            <Link
              to={`/users/${resource.owner._id || resource.owner}`}
              className="flex items-center gap-1.5 text-[#516B71] dark:text-[#8fa6a4] hover:text-[#01140F] dark:hover:text-[#f0f6f4] truncate max-w-[130px]"
            >
              <div className="w-5 h-5 rounded-full bg-[#36586A]/10 dark:bg-[#50829C]/20 text-[#36586A] dark:text-[#8fa6a4] font-bold text-[9px] flex items-center justify-center shrink-0 overflow-hidden">
                {resource.owner.profilePicture ? (
                  <img src={formatMediaUrl(resource.owner.profilePicture)} alt={resource.owner.name} className="w-full h-full object-cover" />
                ) : (
                  resource.owner.name?.charAt(0) || 'U'
                )}
              </div>
              <span className="text-[11px] truncate">{resource.owner.name}</span>
            </Link>
          ) : <div />}

          {/* Pricing */}
          <div>
            {resource.listingType === 'donate' ? (
              <span className="font-semibold text-xs text-[#6B8B78] dark:text-[#81ac90]">Donation</span>
            ) : (
              <span className="font-bold text-xs text-[#01140F] dark:text-[#f0f6f4] flex items-center">
                <IndianRupee className="w-3 h-3 text-[#516B71] dark:text-[#8fa6a4]" />
                {resource.securityDeposit || 0}
                <span className="text-[10px] font-normal text-[#A3B0AF] dark:text-[#6c8280] ml-0.5">deposit</span>
              </span>
            )}
          </div>
        </div>

        {/* Owner control bar */}
        {isOwner && (
          <div className="pt-2 border-t border-[#F7F8FA] dark:border-[#1e302d] grid grid-cols-3 gap-1.5 text-[11px] font-medium">
            <Link
              to={`/resources/${resource._id}/edit`}
              className="py-1 text-center bg-[#F7F8FA] dark:bg-[#192825] hover:bg-[#A3B0AF]/20 dark:hover:bg-[#283d39] text-[#01140F] dark:text-[#f0f6f4] rounded-lg transition"
            >
              Edit
            </Link>
            <button
              onClick={() => onToggle && onToggle(resource._id)}
              className="py-1 text-center bg-[#F7F8FA] dark:bg-[#192825] hover:bg-[#A3B0AF]/20 dark:hover:bg-[#283d39] text-[#36586A] dark:text-[#50829C] rounded-lg transition"
            >
              {resource.isAvailable ? 'Set Busy' : 'Set Free'}
            </button>
            <button
              onClick={() => onDelete && onDelete(resource._id)}
              className="py-1 text-center bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40 rounded-lg transition"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
