import React from 'react';
import { PageId } from '../types';
import { CLINIC_INFO } from '../data/clinicData';
import { Phone, MessageCircle, Calendar, Bot, Menu } from 'lucide-react';

interface HeaderProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  onOpenMenu: () => void;
  onOpenAI: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPage,
  onNavigate,
  onOpenMenu,
  onOpenAI
}) => {
  return (
    <header 
      id="main-header"
      className="sticky top-0 z-40 bg-white border-b border-[#E2E8F0] shadow-xs transition-all duration-200"
      style={{ minHeight: '100px' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex items-center justify-between py-4 min-h-[100px]">
          
          {/* Brand Wordmark */}
          <div className="flex flex-col cursor-pointer" onClick={() => onNavigate('home')} id="brand-logo-area">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-6 bg-[#2097A2] inline-block rounded-xs"></span>
              <span className="font-semibold text-xl sm:text-2xl text-[#0A0A0A] tracking-tight uppercase">
                {CLINIC_INFO.doctorName}
              </span>
            </div>
            <p className="text-xs text-[#5B6467] font-medium tracking-wide mt-0.5 pl-4.5">
              Consultant Physician • <span className="text-[#2097A2] font-semibold">{CLINIC_INFO.qualifications}</span>
            </p>
          </div>

          {/* Action CTAs & Right-Side Menu */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Direct Call Link */}
            <a
              href={`tel:${CLINIC_INFO.phoneIntl}`}
              id="header-call-btn"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#0A0A0A] border border-[#CBD5E1] rounded-xs hover:border-[#2097A2] hover:text-[#2097A2] transition-colors"
              title={`Call ${CLINIC_INFO.phone}`}
            >
              <Phone className="w-3.5 h-3.5 text-[#2097A2]" />
              <span className="hidden xl:inline">{CLINIC_INFO.phoneDisplay}</span>
              <span className="xl:hidden">Call</span>
            </a>

            {/* WhatsApp Link */}
            <a
              href={CLINIC_INFO.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              id="header-whatsapp-btn"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#0A0A0A] border border-[#CBD5E1] rounded-xs hover:border-[#2097A2] hover:text-[#2097A2] transition-colors"
              title="Chat on WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5 text-[#2097A2]" />
              <span>WhatsApp</span>
            </a>

            {/* Ask AI Trigger */}
            <button
              onClick={onOpenAI}
              id="header-ai-btn"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#2097A2] bg-[#FAFAFA] border border-[#A4E0E5] rounded-xs hover:bg-[#A4E0E5]/20 transition-all cursor-pointer"
              title="Dr. Farhan's AI Receptionist"
            >
              <Bot className="w-3.5 h-3.5 text-[#2097A2]" />
              <span className="hidden sm:inline">Ask AI</span>
            </button>

            {/* Primary Book Appointment CTA */}
            <button
              onClick={() => onNavigate('appointments')}
              id="header-book-btn"
              className="inline-flex items-center justify-center px-4 py-2.5 bg-[#2097A2] hover:bg-[#1B808A] text-white text-xs font-semibold uppercase tracking-wider rounded-xs transition-all shadow-xs"
            >
              <Calendar className="w-3.5 h-3.5 mr-1.5 hidden sm:inline" />
              <span>Book Appointment</span>
            </button>

            {/* Full-screen Menu Button */}
            <button
              onClick={onOpenMenu}
              id="header-menu-toggle-btn"
              className="inline-flex items-center justify-center p-2.5 border border-[#0A0A0A] text-[#0A0A0A] hover:bg-[#0A0A0A] hover:text-white rounded-xs transition-colors cursor-pointer"
              aria-label="Open Full Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
