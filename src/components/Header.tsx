import React from 'react';
import { PageId } from '../types';
import { useCMS } from '../context/CMSContext';
import { Phone, Calendar, Bot, Menu } from 'lucide-react';
import { WhatsAppIcon } from './WhatsAppIcon';

interface HeaderProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  onOpenMenu: () => void;
  onOpenAI: () => void;
  isMenuOpen?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentPage,
  onNavigate,
  onOpenMenu,
  onOpenAI,
  isMenuOpen = false
}) => {
  const { clinicInfo } = useCMS();

  return (
    <header 
      id="main-header"
      className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] transition-all duration-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3.5 sm:py-4">
          
          {/* Brand Wordmark */}
          <div 
            className="flex flex-col cursor-pointer group" 
            onClick={() => onNavigate('home')} 
            id="brand-logo-area"
          >
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-6 bg-[#2097A2] inline-block rounded-[1px] group-hover:bg-[#27BAC8] transition-colors"></span>
              <span className="font-semibold text-lg sm:text-xl md:text-2xl text-[#090B0C] tracking-tight uppercase">
                {clinicInfo.doctorName}
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-[#5B6467] font-medium tracking-wide mt-0.5 pl-3.5">
              Consultant Physician • <span className="text-[#2097A2] font-semibold">{clinicInfo.qualifications}</span>
            </p>
          </div>

          {/* Action CTAs & Navigation */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Direct Call Link */}
            <a
              href={`tel:${clinicInfo.phoneIntl || clinicInfo.phone}`}
              id="header-call-btn"
              className="hidden lg:inline-flex items-center gap-1.5 min-h-[44px] px-3.5 text-xs font-medium text-[#090B0C] bg-white border border-neutral-300 rounded-[3px] shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:-translate-y-0.5 transition-all focus-visible:outline-2 focus-visible:outline-[#2097A2]"
              title={`Call ${clinicInfo.phoneDisplay || clinicInfo.phone}`}
            >
              <Phone className="button-icon text-[#2097A2]" />
              <span>{clinicInfo.phoneDisplay || clinicInfo.phone}</span>
            </a>

            {/* WhatsApp Link */}
            <a
              href={clinicInfo.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              id="header-whatsapp-btn"
              className="btn-interactive hidden sm:inline-flex items-center gap-1.5 min-h-[44px] px-3.5 text-xs font-medium text-[#090B0C] bg-white border border-neutral-300 rounded-[3px] shadow-[0_1px_2px_rgba(0,0,0,0.05)] focus-visible:outline-2 focus-visible:outline-[#2097A2]"
              title="Chat on WhatsApp"
            >
              <WhatsAppIcon className="button-icon text-[#2097A2]" aria-hidden="true" />
              <span>WhatsApp</span>
            </a>

            {/* Ask AI Trigger */}
            <button
              onClick={onOpenAI}
              id="header-ai-btn"
              className="btn-interactive inline-flex items-center gap-1.5 min-h-[44px] px-3 sm:px-3.5 text-xs font-medium text-[#2097A2] bg-[#EFFBFC] border border-[#2097A2]/30 rounded-[3px] cursor-pointer focus-visible:outline-2 focus-visible:outline-[#2097A2]"
              title="Dr. Farhan's AI Clinic Receptionist"
            >
              <Bot className="button-icon text-[#2097A2]" />
              <span className="hidden xs:inline">Ask AI</span>
            </button>

            {/* Primary Book Appointment CTA (Blue Brand Button) */}
            <button
              onClick={() => onNavigate('appointments')}
              id="header-book-btn"
              className="btn-primary !min-h-[44px] !px-4 text-xs tracking-wide"
            >
              <Calendar className="button-icon hidden sm:inline text-white" />
              <span>Book Appointment</span>
            </button>

            {/* Full-screen Menu Button (Animated 3-Line / Hamburger) */}
            <button
              onClick={onOpenMenu}
              id="header-menu-toggle-btn"
              className="btn-interactive inline-flex items-center justify-center min-h-[44px] min-w-[44px] p-2 bg-white text-[#090B0D] border border-neutral-300 rounded-[3px] shadow-[0_1px_2px_rgba(0,0,0,0.05)] cursor-pointer focus-visible:outline-2 focus-visible:outline-[#2097A2]"
              aria-label={isMenuOpen ? "Close navigation menu" : "Open full navigation menu"}
              aria-expanded={isMenuOpen}
              aria-controls="fullscreen-nav-overlay"
            >
              <div className="w-5 h-4 flex flex-col justify-between items-center relative">
                <span 
                  className={`w-full h-0.5 bg-current rounded-[1px] transition-all duration-300 transform ${
                    isMenuOpen ? 'rotate-45 translate-y-[7px]' : ''
                  }`} 
                />
                <span 
                  className={`w-full h-0.5 bg-current rounded-[1px] transition-all duration-200 ${
                    isMenuOpen ? 'opacity-0 scale-x-0' : 'opacity-100'
                  }`} 
                />
                <span 
                  className={`w-full h-0.5 bg-current rounded-[1px] transition-all duration-300 transform ${
                    isMenuOpen ? '-rotate-45 -translate-y-[7px]' : ''
                  }`} 
                />
              </div>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};

