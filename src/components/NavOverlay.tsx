import React, { useEffect, useRef, useState } from 'react';
import { PageId } from '../types';
import { CLINIC_INFO } from '../data/clinicData';
import { 
  X, 
  ArrowRight, 
  Phone, 
  MapPin, 
  Calendar, 
  Bot, 
  Shield, 
  Clock,
  ExternalLink 
} from 'lucide-react';
import { WhatsAppIcon } from './WhatsAppIcon';

interface NavOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  onOpenAI?: () => void;
}

export const NavOverlay: React.FC<NavOverlayProps> = ({
  isOpen,
  onClose,
  currentPage,
  onNavigate,
  onOpenAI
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [isRendered, setIsRendered] = useState<boolean>(isOpen);
  const [isAnimated, setIsAnimated] = useState<boolean>(false);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Exact 10 links required by user specification
  const navLinks: { id: PageId; label: string; num: string }[] = [
    { id: 'home', label: 'Home', num: '01' },
    { id: 'about', label: 'About Doctor', num: '02' },
    { id: 'services', label: 'Care & Services', num: '03' },
    { id: 'appointments', label: 'Appointments', num: '04' },
    { id: 'fees', label: 'Consultation Fees', num: '05' },
    { id: 'patient-forms', label: 'Patient Forms', num: '06' },
    { id: 'resources', label: 'Resources', num: '07' },
    { id: 'reviews', label: 'Reviews', num: '08' },
    { id: 'blog', label: 'Blog', num: '09' },
    { id: 'contact', label: 'Contact', num: '10' },
  ];

  // Lifecycle for smooth opening & closing animations
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      setIsRendered(true);
      document.body.style.overflow = 'hidden';

      // Trigger entry animation on next frame
      const timer = requestAnimationFrame(() => {
        setIsAnimated(true);
        closeButtonRef.current?.focus();
      });

      return () => cancelAnimationFrame(timer);
    } else {
      setIsAnimated(false);
      const timer = setTimeout(() => {
        setIsRendered(false);
        document.body.style.overflow = 'unset';
        if (previousActiveElement.current) {
          previousActiveElement.current.focus();
        }
      }, 450);

      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Focus Trapping and Escape key listener
  useEffect(() => {
    if (!isOpen || !isRendered) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
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
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isRendered, onClose]);

  if (!isRendered) return null;

  const handleLinkClick = (page: PageId) => {
    onNavigate(page);
    onClose();
  };

  const handleAIClick = () => {
    onClose();
    if (onOpenAI) {
      setTimeout(() => {
        onOpenAI();
      }, 150);
    }
  };

  return (
    <div
      ref={overlayRef}
      id="fullscreen-nav-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Main Navigation Menu"
      className="fixed inset-0 z-50 overflow-hidden flex flex-col lg:flex-row select-none"
    >
      {/* Top Mobile/Desktop Floating Close Button Container */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-60">
        <button
          ref={closeButtonRef}
          onClick={onClose}
          id="nav-overlay-close-btn"
          aria-label="Close navigation menu"
          className="nav-close-btn"
        >
          <span className="hidden sm:inline">Close</span>
          <X className="w-4 h-4 text-[#25B3C2] nav-close-icon" />
        </button>
      </div>

      {/* =========================================================================
          LEFT PANEL: ~64% Width (Desktop) / Full Width (Mobile)
          Layered Aqua & Teal Gradient with 2-Column Primary Navigation
          ========================================================================= */}
      <div
        className="nav-panel-left w-full lg:w-[64%] h-full flex flex-col justify-between overflow-y-auto p-6 sm:p-10 lg:p-14 border-b lg:border-b-0 border-[#63CED6]/30 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{
          transform: isAnimated ? 'translate3d(0, 0, 0)' : 'translate3d(-100%, 0, 0)',
        }}
      >
        <div className="space-y-8 max-w-3xl relative z-10">
          {/* Header area */}
          <div className="space-y-1.5 pt-2">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#105B62] block">
              Practice Directory
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-[#0A0E0D] tracking-tight">
              Navigation Menu
            </h2>
          </div>

          {/* 2-Column Minimalist Navigation Links (Desktop) / Single Column (Mobile) */}
          <nav
            className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2.5 sm:gap-y-3 pt-2"
            aria-label="Main Site Links"
          >
            {navLinks.map((item, index) => {
              const isActive = currentPage === item.id;
              // Stagger delay between 30ms and 40ms (35ms)
              const transitionDelay = isAnimated ? `${index * 35}ms` : '0ms';

              return (
                <div
                  key={item.id}
                  style={{
                    transform: isAnimated ? 'translate3d(0, 0, 0)' : 'translate3d(0, 10px, 0)',
                    opacity: isAnimated ? 1 : 0,
                    transition: `transform 480ms cubic-bezier(0.16, 1, 0.3, 1) ${transitionDelay}, opacity 480ms ease ${transitionDelay}`,
                  }}
                >
                  <button
                    onClick={() => handleLinkClick(item.id)}
                    className={`nav-link-item w-full group ${isActive ? 'active' : ''}`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {/* Left Accent Bar */}
                    <span className="nav-link-accent-bar" aria-hidden="true" />

                    <div className="flex items-center gap-3">
                      <span className="nav-link-num text-xs font-mono font-bold text-[#105B62] transition-colors">
                        {item.num}
                      </span>
                      <span
                        className="nav-link-label text-base sm:text-lg font-medium tracking-tight text-[#111314] transition-colors flex items-center"
                      >
                        {item.label}
                        {isActive && (
                          <span className="nav-link-active-dot" aria-hidden="true" title="Current Page" />
                        )}
                      </span>
                    </div>

                    <ArrowRight className="nav-link-arrow w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </nav>
        </div>

        {/* Left Panel Footer: Hospital Notice & Emergency Strip */}
        <div className="pt-8 mt-6 border-t border-[#105B62]/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#105B62] relative z-10">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#105B62] animate-pulse"></span>
            <span className="font-medium text-[#105B62]">HealthPro Medical Complex, Faisal Town, Lahore</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleLinkClick('privacy')}
              className="text-[#105B62] hover:text-[#0A0E0D] font-medium transition-colors"
            >
              Privacy
            </button>
            <span className="text-[#105B62]/60">•</span>
            <button
              onClick={() => handleLinkClick('terms')}
              className="text-[#105B62] hover:text-[#0A0E0D] font-medium transition-colors"
            >
              Terms
            </button>
            <span className="text-[#105B62]/60">•</span>
            <button
              onClick={() => handleLinkClick('admin')}
              className="text-[#0A0E0D] font-bold hover:text-[#105B62] inline-flex items-center gap-1 transition-colors"
            >
              <Shield className="w-3 h-3 text-[#105B62]" /> Staff Portal
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          RIGHT PANEL: ~36% Width (Desktop) / Full Width (Mobile)
          Layered Charcoal & Teal Gradient + Doctor Profile + Paired CTAs
          ========================================================================= */}
      <div
        className="nav-panel-right w-full lg:w-[36%] h-full flex flex-col justify-between overflow-y-auto p-6 sm:p-10 lg:p-12 text-[#F7FFFF] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{
          transform: isAnimated ? 'translate3d(0, 0, 0)' : 'translate3d(100%, 0, 0)',
        }}
      >
        {/* Subtle illuminated divider accent at top */}
        <div className="nav-panel-divider-accent hidden lg:block" aria-hidden="true" />

        <div
          className="space-y-6 pt-2"
          style={{
            opacity: isAnimated ? 1 : 0,
            transform: isAnimated ? 'translate3d(0, 0, 0)' : 'translate3d(0, 10px, 0)',
            transition: 'opacity 480ms ease 200ms, transform 480ms cubic-bezier(0.16, 1, 0.3, 1) 200ms',
          }}
        >
          {/* Wordmark & Qualification */}
          <div className="space-y-2">
            <div className="inline-block px-2.5 py-1 bg-[#105B62]/40 border border-[#63CED6]/40 rounded-[2px] text-[11px] font-bold tracking-wider text-[#F7FFFF] uppercase">
              {CLINIC_INFO.qualifications}
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F7FFFF] uppercase">
              {CLINIC_INFO.doctorName}
            </h3>
            <p className="text-xs text-[#9FBCBF] font-medium leading-relaxed">
              Consultant Physician & Internal Medicine Specialist practicing in Faisal Town, Lahore.
            </p>
          </div>

          {/* Short Professional Introduction */}
          <p className="text-xs text-[#F7FFFF]/90 leading-relaxed">
            Providing comprehensive clinical evaluations, chronic condition management (diabetes & hypertension), and evidence-based diagnostic care at HealthPro Medical Complex.
          </p>

          {/* Clinic Address & Contact Information in Minimalist Group */}
          <div className="space-y-2.5 pt-2 text-xs border-t border-[#105B62]/40">
            <div className="nav-contact-row">
              <MapPin className="w-4 h-4 text-[#25B3C2] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#F7FFFF] block font-semibold">{CLINIC_INFO.clinicName}</strong>
                <span className="text-[#9FBCBF] text-[11px] block">{CLINIC_INFO.address}</span>
              </div>
            </div>

            <div className="nav-contact-row">
              <Phone className="w-4 h-4 text-[#25B3C2] shrink-0 mt-0.5" />
              <a
                href={`tel:${CLINIC_INFO.phoneIntl}`}
                className="text-[#F7FFFF] hover:text-[#56C4CF] transition-colors font-medium"
              >
                {CLINIC_INFO.phone}
              </a>
            </div>

            <div className="nav-contact-row">
              <WhatsAppIcon className="w-4 h-4 text-[#25B3C2] shrink-0 mt-0.5" aria-hidden="true" />
              <a
                href={CLINIC_INFO.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#F7FFFF] hover:text-[#56C4CF] transition-colors font-medium inline-flex items-center gap-1.5"
              >
                WhatsApp Support <ExternalLink className="w-3 h-3 text-[#25B3C2]" aria-hidden="true" />
              </a>
            </div>

            <div className="nav-contact-row pt-1">
              <Clock className="w-4 h-4 text-[#25B3C2] shrink-0 mt-0.5" />
              <span className="text-[#9FBCBF] text-[11px] leading-tight">
                Outpatient consultations strictly by prior confirmed appointment.
              </span>
            </div>
          </div>

          {/* Social Profiles */}
          <div className="pt-2 border-t border-[#105B62]/40 flex items-center gap-4">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#9FBCBF]">
              Official Channels:
            </span>
            <div className="flex items-center gap-3.5">
              <a
                href={CLINIC_INFO.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Dr Farhan Mustafa Facebook Profile"
                className="nav-social-icon"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>

              <a
                href={CLINIC_INFO.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Dr Farhan Mustafa Instagram Profile"
                className="nav-social-icon"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>

              <a
                href={CLINIC_INFO.tiktokUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Dr Farhan Mustafa TikTok Profile"
                className="nav-social-icon"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* =====================================================================
            CTA BUTTONS: Strictly Paired
            Aqua Primary Button on LEFT (Top on Mobile)
            Charcoal Secondary Button on RIGHT (Bottom on Mobile)
            ===================================================================== */}
        <div
          className="pt-6 mt-6 border-t border-[#105B62]/40 flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
          style={{
            opacity: isAnimated ? 1 : 0,
            transform: isAnimated ? 'translate3d(0, 0, 0)' : 'translate3d(0, 10px, 0)',
            transition: 'opacity 480ms ease 240ms, transform 480ms cubic-bezier(0.16, 1, 0.3, 1) 240ms',
          }}
        >
          {/* Aqua Primary Button (Physically First/Left) */}
          <button
            onClick={() => handleLinkClick('appointments')}
            id="nav-overlay-book-btn"
            className="nav-btn-aqua-primary w-full sm:w-1/2 text-xs uppercase tracking-wider font-bold !min-h-[44px]"
          >
            <Calendar className="w-3.5 h-3.5 mr-1 text-[#F7FFFF]" />
            <span>Book Appointment</span>
          </button>

          {/* Charcoal Secondary Button (Physically Second/Right) */}
          <button
            onClick={handleAIClick}
            id="nav-overlay-ai-btn"
            className="nav-btn-charcoal-ai w-full sm:w-1/2 text-xs uppercase tracking-wider font-bold !min-h-[44px]"
          >
            <Bot className="w-[18px] h-[18px] text-[#25B3C2]" aria-hidden="true" />
            <span>Ask AI Receptionist</span>
          </button>
        </div>
      </div>
    </div>
  );
};
