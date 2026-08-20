import React, { useEffect, useRef } from 'react';
import { PageId } from '../types';
import { CLINIC_INFO } from '../data/clinicData';
import { X, ArrowRight, Phone, MessageCircle, MapPin, Calendar, Clock, Shield } from 'lucide-react';

interface NavOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
}

export const NavOverlay: React.FC<NavOverlayProps> = ({
  isOpen,
  onClose,
  currentPage,
  onNavigate
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Focus trapping and Esc key listener
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      closeButtonRef.current?.focus();

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }

        if (e.key === 'Tab' && overlayRef.current) {
          const focusableElements = overlayRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          if (focusableElements.length === 0) return;

          const firstElement = focusableElements[0];
          const lastElement = focusableElements[focusableElements.length - 1];

          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              lastElement.focus();
              e.preventDefault();
            }
          } else {
            if (document.activeElement === lastElement) {
              firstElement.focus();
              e.preventDefault();
            }
          }
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = 'unset';
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleLinkClick = (page: PageId) => {
    onNavigate(page);
    onClose();
  };

  const navLinks: { id: PageId; label: string; num: string }[] = [
    { id: 'home', label: 'Home', num: '01' },
    { id: 'about', label: 'About Doctor', num: '02' },
    { id: 'services', label: 'Care & Services', num: '03' },
    { id: 'appointments', label: 'Appointments & Booking', num: '04' },
    { id: 'fees', label: 'Consultation Fees', num: '05' },
    { id: 'patient-forms', label: 'Patient Forms & Intake', num: '06' },
    { id: 'resources', label: 'Patient Resources', num: '07' },
    { id: 'reviews', label: 'Verified Reviews', num: '08' },
    { id: 'blog', label: 'Medical Blog & Insights', num: '09' },
    { id: 'contact', label: 'Location & Contact', num: '10' },
  ];

  return (
    <div
      ref={overlayRef}
      id="fullscreen-nav-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Site Navigation Menu"
      className="fixed inset-0 z-50 bg-white overflow-y-auto flex flex-col justify-between animate-fadeIn transition-opacity duration-200"
    >
      {/* Top Bar with Brand & Close Button */}
      <div className="border-b border-[#E2E8F0] px-6 py-6 sm:px-12 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="font-semibold text-lg sm:text-xl text-[#0A0A0A] tracking-tight uppercase">
            {CLINIC_INFO.doctorName}
          </span>
          <span className="text-xs text-[#5B6467] font-medium">
            {CLINIC_INFO.title}
          </span>
        </div>

        <button
          ref={closeButtonRef}
          onClick={onClose}
          id="nav-overlay-close-btn"
          aria-label="Close menu"
          className="flex items-center gap-2 px-4 py-2 border border-[#0A0A0A] text-[#0A0A0A] hover:bg-[#0A0A0A] hover:text-white rounded-xs transition-colors cursor-pointer text-xs uppercase font-semibold tracking-wider"
        >
          <span>Close</span>
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main Navigation Content: 2-Column Desktop Grid */}
      <div className="max-w-7xl w-full mx-auto px-6 sm:px-12 py-10 grid grid-cols-1 lg:grid-cols-12 gap-12 grow">
        
        {/* Left Column: Big Nav Links */}
        <div className="lg:col-span-7 flex flex-col justify-center space-y-3 sm:space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-[#2097A2] mb-2 block">
            Navigation Index
          </span>
          <nav className="flex flex-col space-y-1" aria-label="Overlay Navigation Links">
            {navLinks.map((item) => (
              <button
                key={item.id}
                onClick={() => handleLinkClick(item.id)}
                className={`group text-left py-2.5 px-3 -mx-3 rounded-xs flex items-center justify-between transition-all cursor-pointer ${
                  currentPage === item.id 
                    ? 'bg-[#2097A2]/10 text-[#2097A2] font-bold' 
                    : 'text-[#0A0A0A] hover:text-[#2097A2] hover:bg-[#FAFAFA]'
                }`}
              >
                <div className="flex items-baseline gap-4">
                  <span className="text-xs font-mono text-[#5B6467] group-hover:text-[#2097A2]">
                    {item.num}
                  </span>
                  <span className="text-xl sm:text-2xl md:text-3xl font-medium tracking-tight">
                    {item.label}
                  </span>
                </div>
                <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all text-[#2097A2]" />
              </button>
            ))}
          </nav>
        </div>

        {/* Right Column: Fast CTAs & Clinic Contact Card */}
        <div className="lg:col-span-5 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-[#E2E8F0] pt-8 lg:pt-0 lg:pl-12 space-y-8">
          
          {/* Action CTAs */}
          <div className="space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-[#2097A2] block">
              Quick Actions
            </span>
            
            <button
              onClick={() => handleLinkClick('appointments')}
              className="w-full py-4 px-6 bg-[#2097A2] hover:bg-[#1B808A] text-white font-semibold text-sm uppercase tracking-wider rounded-xs flex items-center justify-between transition-all cursor-pointer shadow-xs"
            >
              <span>Book In-Clinic Appointment</span>
              <Calendar className="w-4 h-4" />
            </button>

            <a
              href={CLINIC_INFO.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-6 border-2 border-[#2097A2] text-[#2097A2] hover:bg-[#2097A2] hover:text-white font-semibold text-sm uppercase tracking-wider rounded-xs flex items-center justify-between transition-all"
            >
              <span>Message on WhatsApp</span>
              <MessageCircle className="w-4 h-4" />
            </a>

            <a
              href={`tel:${CLINIC_INFO.phoneIntl}`}
              className="w-full py-3 px-6 bg-[#FAFAFA] border border-[#CBD5E1] text-[#0A0A0A] hover:border-[#2097A2] font-medium text-sm rounded-xs flex items-center justify-between transition-all"
            >
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#2097A2]" />
                <span>Call Clinic: {CLINIC_INFO.phone}</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-[#5B6467]" />
            </a>
          </div>

          {/* Clinic Information Card */}
          <div className="bg-[#FAFAFA] p-6 rounded-xs border border-[#E2E8F0] space-y-4">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-[#2097A2] shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm text-[#0A0A0A]">{CLINIC_INFO.clinicName}</h4>
                <p className="text-xs text-[#5B6467] mt-1 leading-relaxed">{CLINIC_INFO.address}</p>
                <a
                  href={CLINIC_INFO.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#2097A2] font-semibold inline-flex items-center gap-1 mt-2 hover:underline"
                >
                  Open in Google Maps <ArrowRight className="w-3 h-3" />
                </a>
              </div>
            </div>

            <div className="border-t border-[#E2E8F0] pt-4 flex items-start gap-3">
              <Clock className="w-4 h-4 text-[#2097A2] shrink-0 mt-0.5" />
              <div className="text-xs text-[#5B6467]">
                <span className="font-semibold text-[#0A0A0A] block">Schedule Notice:</span>
                In-person & video consultations conducted strictly by confirmed appointment.
              </div>
            </div>
          </div>

          {/* Legal / Policy Links */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-[#5B6467] pt-2">
            <button onClick={() => handleLinkClick('privacy')} className="hover:text-[#2097A2]">Privacy Policy</button>
            <span>•</span>
            <button onClick={() => handleLinkClick('terms')} className="hover:text-[#2097A2]">Terms of Use</button>
            <span>•</span>
            <button onClick={() => handleLinkClick('disclaimer')} className="hover:text-[#2097A2]">Medical Disclaimer</button>
            <span>•</span>
            <button onClick={() => handleLinkClick('admin')} className="text-[#2097A2] font-bold hover:underline inline-flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" /> Staff Portal
            </button>
          </div>

        </div>

      </div>

      {/* Bottom Medical Emergency Strip */}
      <div className="border-t border-[#E2E8F0] bg-[#FAFAFA] px-6 py-4 text-center text-xs text-[#5B6467]">
        <p>
          <strong className="text-red-700">Emergency Care Notice:</strong> This website does not handle immediate medical emergencies. In an acute emergency, dial Rescue 1122 or proceed to the nearest emergency department.
        </p>
      </div>
    </div>
  );
};
