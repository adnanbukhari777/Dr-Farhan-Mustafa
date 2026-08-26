import React, { useState } from 'react';
import { useCMS } from '../context/CMSContext';
import { PhoneCall, AlertTriangle, X, ShieldAlert, ArrowRight } from 'lucide-react';
import { PageId } from '../types';

interface AnnouncementBarProps {
  onNavigate?: (page: PageId) => void;
}

export const AnnouncementBar: React.FC<AnnouncementBarProps> = ({ onNavigate }) => {
  const { announcements, clinicInfo } = useCMS();
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);

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
          
          {/* Left badge indicator */}
          <div className="hidden sm:flex items-center gap-2 shrink-0 pr-2 border-r border-white/10">
            <span className="inline-block w-2 h-2 rounded-full bg-[#27BAC8] animate-pulse"></span>
            <span className="text-[11px] font-semibold tracking-wider uppercase text-[#A4E0E5]">
              Announcements
            </span>
          </div>

          {/* Center marquee track */}
          <div 
            className="flex-1 overflow-hidden relative"
            tabIndex={0}
            aria-label="Clinic updates marquee"
          >
            {/* Soft gradient edge fade */}
            <div className="hidden sm:block absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#090B0C] to-transparent z-10 pointer-events-none" />
            <div className="hidden sm:block absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#090B0C] to-transparent z-10 pointer-events-none" />

            <div className="animate-marquee-track flex items-center gap-10 whitespace-nowrap text-neutral-200">
              {/* Render twice for continuous loop */}
              {[...displayList, ...displayList].map((item, idx) => (
                <div 
                  key={`${item.id}-${idx}`} 
                  className="inline-flex items-center gap-2.5 text-xs md:text-[13px] hover:text-white transition-colors"
                >
                  {item.badgeText && (
                    <span className="px-1.5 py-0.5 text-[10px] uppercase font-semibold tracking-wider rounded-[2px] bg-[#2097A2]/25 text-[#A4E0E5] border border-[#2097A2]/40">
                      {item.badgeText}
                    </span>
                  )}
                  <span>{item.text}</span>
                  {item.linkUrl && (
                    <button
                      onClick={() => {
                        if (item.linkUrl?.startsWith('http')) {
                          window.open(item.linkUrl, '_blank', 'noopener,noreferrer');
                        } else if (onNavigate && item.linkUrl) {
                          const pageName = item.linkUrl.replace('/', '') as PageId;
                          onNavigate(pageName || 'home');
                        }
                      }}
                      className="text-[#27BAC8] hover:text-[#A4E0E5] font-medium underline underline-offset-2 ml-1 text-xs inline-flex items-center gap-0.5"
                    >
                      {item.linkLabel || 'Learn more'} <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                  <span className="text-white/20 mx-3">•</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right fixed Emergency Help button */}
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

      {/* Emergency Modal Fallback */}
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

