import React, { useEffect, useState } from 'react';
import { useCMS } from '../context/CMSContext';
import { PhoneCall, AlertTriangle, X, ShieldAlert, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { PageId } from '../types';

interface AnnouncementBarProps {
  onNavigate?: (page: PageId) => void;
}

export const AnnouncementBar: React.FC<AnnouncementBarProps> = ({ onNavigate }) => {
  const { announcements, clinicInfo } = useCMS();
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [activeAnnouncementIndex, setActiveAnnouncementIndex] = useState(0);

  const activeAnnouncements = announcements && announcements.length > 0
    ? announcements.filter(a => a.active && a.status !== 'archived')
    : [];

  const displayList = activeAnnouncements.length > 0 ? activeAnnouncements : [
    {
      id: 'default-1',
      text: 'Clinic Administration: Appointment requests are reviewed and confirmed by clinic staff.',
      badgeText: 'Notice',
      active: true
    }
  ];

  const announcementCount = displayList.length;
  const currentAnnouncement = displayList[activeAnnouncementIndex] || displayList[0];

  useEffect(() => {
    setActiveAnnouncementIndex((currentIndex) =>
      currentIndex >= announcementCount ? 0 : currentIndex
    );
  }, [announcementCount]);

  useEffect(() => {
    if (announcementCount <= 1) return;

    const rotationTimer = window.setInterval(() => {
      setActiveAnnouncementIndex((currentIndex) => (currentIndex + 1) % announcementCount);
    }, 8000);

    return () => window.clearInterval(rotationTimer);
  }, [announcementCount]);

  const showPreviousAnnouncement = () => {
    setActiveAnnouncementIndex((currentIndex) =>
      (currentIndex - 1 + announcementCount) % announcementCount
    );
  };

  const showNextAnnouncement = () => {
    setActiveAnnouncementIndex((currentIndex) =>
      (currentIndex + 1) % announcementCount
    );
  };

  const emergencyNumber = (clinicInfo as any)?.emergencyPhone || '1122';
  const emergencyDisplay = (clinicInfo as any)?.emergencyPhoneDisplay || '1122 (Rescue Pakistan)';
  const emergencyNotice = (clinicInfo as any)?.emergencyNotice || 
    'If you are experiencing an acute life-threatening medical emergency (e.g. severe chest pain, sudden breathlessness, collapse, or severe trauma), please call Rescue 1122 immediately or proceed to the nearest emergency department.';

  const handleEmergencyClick = (e: React.MouseEvent) => {
    if (!emergencyNumber) {
      e.preventDefault();
      setShowEmergencyModal(true);
    }
  };

  return (
    <>
      <aside 
        id="announcement-strip"
        className="relative bg-[#090B0C] text-white text-xs md:text-sm py-2 px-3 sm:px-6 border-b border-[#2097A2]/20 z-40 overflow-hidden select-none"
        role="region"
        aria-label="Clinic Announcements and Emergency Help"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 sm:gap-6">
          <div className="hidden sm:flex items-center gap-2 shrink-0 pr-2 border-r border-white/10">
            <span className="inline-block w-2 h-2 rounded-full bg-[#27BAC8] animate-pulse"></span>
            <span className="text-[11px] font-semibold tracking-wider uppercase text-[#A4E0E5]">
              Announcements
            </span>
          </div>

          <div className="flex-1 min-w-0 flex items-center gap-1 sm:gap-2" aria-label="Clinic updates">
            <button
              type="button"
              onClick={showPreviousAnnouncement}
              disabled={announcementCount <= 1}
              aria-label="Show previous announcement"
              className="inline-flex items-center justify-center w-7 h-7 shrink-0 rounded-sm text-[#A4E0E5] hover:bg-white/10 hover:text-white disabled:opacity-35 disabled:cursor-not-allowed transition-colors focus-visible:outline-2 focus-visible:outline-[#27BAC8]"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex-1 min-w-0 text-center text-neutral-200" aria-live="polite" aria-atomic="true">
              <div key={currentAnnouncement.id} className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 text-xs md:text-[13px] leading-snug">
                {currentAnnouncement.badgeText && (
                  <span className="px-1.5 py-0.5 text-[10px] uppercase font-semibold tracking-wider rounded-[2px] bg-[#2097A2]/25 text-[#A4E0E5] border border-[#2097A2]/40">
                    {currentAnnouncement.badgeText}
                  </span>
                )}
                <span>{currentAnnouncement.text}</span>
                {currentAnnouncement.linkUrl && (
                  <button
                    onClick={() => {
                      if (currentAnnouncement.linkUrl?.startsWith('http')) {
                        window.open(currentAnnouncement.linkUrl, '_blank', 'noopener,noreferrer');
                      } else if (onNavigate && currentAnnouncement.linkUrl) {
                        const pageName = currentAnnouncement.linkUrl.replace('/', '') as PageId;
                        onNavigate(pageName || 'home');
                      }
                    }}
                    className="text-[#27BAC8] hover:text-[#A4E0E5] font-medium underline underline-offset-2 text-xs inline-flex items-center gap-0.5"
                  >
                    {currentAnnouncement.linkLabel || 'Learn more'} <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={showNextAnnouncement}
              disabled={announcementCount <= 1}
              aria-label="Show next announcement"
              className="inline-flex items-center justify-center w-7 h-7 shrink-0 rounded-sm text-[#A4E0E5] hover:bg-white/10 hover:text-white disabled:opacity-35 disabled:cursor-not-allowed transition-colors focus-visible:outline-2 focus-visible:outline-[#27BAC8]"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="shrink-0 flex items-center gap-2 pl-2">
            {emergencyNumber ? (
              <a
                id="emergency-call-button"
                href={`tel:${emergencyNumber}`}
                onClick={handleEmergencyClick}
                title={`Call ${emergencyDisplay}`}
                className="inline-flex items-center justify-center gap-1.5 min-h-[32px] px-3 py-1 bg-white hover:bg-neutral-100 text-[#090B0C] text-[11px] md:text-xs font-semibold rounded-[3px] border border-white shadow-[0_1px_3px_rgba(0,0,0,0.3)] hover:-translate-y-0.5 transition-all duration-150 focus-visible:outline-2 focus-visible:outline-[#27BAC8]"
              >
                <PhoneCall className="w-3.5 h-3.5 text-red-600 shrink-0" />
                <span className="whitespace-nowrap">Emergency Help ({emergencyNumber})</span>
              </a>
            ) : (
              <button
                id="emergency-info-button"
                onClick={() => setShowEmergencyModal(true)}
                className="inline-flex items-center justify-center gap-1.5 min-h-[32px] px-3 py-1 bg-white hover:bg-neutral-100 text-[#090B0C] text-[11px] md:text-xs font-semibold rounded-[3px] border border-white shadow-[0_1px_3px_rgba(0,0,0,0.3)] hover:-translate-y-0.5 transition-all duration-150"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span className="whitespace-nowrap">Emergency Info</span>
              </button>
            )}
          </div>
        </div>
      </aside>

      {showEmergencyModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="emergency-modal-title"
        >
          <div className="bg-white rounded-[3px] max-w-lg w-full p-6 shadow-2xl border border-red-200 animate-in fade-in zoom-in-95 duration-150 text-[#090B0C]">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3 text-red-700">
                <ShieldAlert className="w-6 h-6 shrink-0" />
                <h3 id="emergency-modal-title" className="text-lg font-bold">
                  Emergency Medical Protocol
                </h3>
              </div>
              <button
                onClick={() => setShowEmergencyModal(false)}
                className="text-neutral-400 hover:text-neutral-700 p-1"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-neutral-700 text-sm leading-relaxed mb-5">
              {emergencyNotice}
            </p>

            <div className="bg-red-50 border border-red-200 rounded-[3px] p-3.5 mb-5 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-red-900 uppercase">Emergency Helpline</div>
                <div className="text-lg font-bold text-red-700">{emergencyDisplay}</div>
              </div>
              {emergencyNumber && (
                <a
                  href={`tel:${emergencyNumber}`}
                  className="btn-dark !min-h-[40px] !px-4 !bg-red-700 !border-red-800 hover:!bg-red-800"
                >
                  <PhoneCall className="w-4 h-4" /> Call Now
                </a>
              )}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setShowEmergencyModal(false)}
                className="btn-light !min-h-[40px] !px-5"
              >
                Close Notice
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
