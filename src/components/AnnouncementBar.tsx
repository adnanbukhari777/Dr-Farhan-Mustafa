import React from 'react';
import { CLINIC_INFO, ANNOUNCEMENTS } from '../data/clinicData';
import { AlertCircle, Phone, ArrowRight } from 'lucide-react';
import { PageId } from '../types';

interface AnnouncementBarProps {
  onNavigate: (page: PageId) => void;
}

export const AnnouncementBar: React.FC<AnnouncementBarProps> = ({ onNavigate }) => {
  const activeAnnouncement = ANNOUNCEMENTS.find(a => a.active) || ANNOUNCEMENTS[0];

  if (!activeAnnouncement) return null;

  return (
    <div 
      id="announcement-strip"
      className="bg-[#0A0A0A] text-white text-xs md:text-sm py-2 px-4 border-b border-neutral-800"
      role="region"
      aria-label="Clinic announcement"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-neutral-300 text-center sm:text-left">
          <span className="inline-block w-2 h-2 rounded-full bg-[#27BAC8] animate-pulse shrink-0"></span>
          <span>{activeAnnouncement.text}</span>
        </div>
        <div className="flex items-center gap-4 text-xs shrink-0">
          <a 
            href={CLINIC_INFO.whatsappUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[#A4E0E5] hover:text-white transition-colors font-medium flex items-center gap-1"
          >
            WhatsApp Support <ArrowRight className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
