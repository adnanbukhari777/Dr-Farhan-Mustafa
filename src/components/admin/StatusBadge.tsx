import React from 'react';
import { PublicationStatus } from '../../types';
import { CheckCircle2, Clock, AlertTriangle, FileEdit } from 'lucide-react';

interface StatusBadgeProps {
  status: PublicationStatus | 'pending_verification' | 'verified' | 'needs_doctor_approval' | 'rejected' | string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm' }) => {
  const isSm = size === 'sm';
  const pad = isSm ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  switch (status) {
    case 'published':
    case 'verified':
      return (
        <span className={`inline-flex items-center gap-1 font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 ${pad}`}>
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span className="capitalize">{status === 'verified' ? 'Verified' : 'Published'}</span>
        </span>
      );
    case 'needs_verification':
    case 'pending_verification':
      return (
        <span className={`inline-flex items-center gap-1 font-medium rounded-full bg-amber-50 text-amber-700 border border-amber-200 ${pad}`}>
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Needs Verification</span>
        </span>
      );
    case 'needs_doctor_approval':
      return (
        <span className={`inline-flex items-center gap-1 font-medium rounded-full bg-purple-50 text-purple-700 border border-purple-200 ${pad}`}>
          <Clock className="w-3.5 h-3.5" />
          <span>Doctor Review</span>
        </span>
      );
    case 'draft':
      return (
        <span className={`inline-flex items-center gap-1 font-medium rounded-full bg-slate-100 text-slate-700 border border-slate-200 ${pad}`}>
          <FileEdit className="w-3.5 h-3.5" />
          <span>Draft</span>
        </span>
      );
    case 'rejected':
      return (
        <span className={`inline-flex items-center gap-1 font-medium rounded-full bg-rose-50 text-rose-700 border border-rose-200 ${pad}`}>
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Rejected</span>
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center font-medium rounded-full bg-gray-100 text-gray-700 ${pad}`}>
          {status}
        </span>
      );
  }
};
