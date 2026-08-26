import React from 'react';
import { PageId } from '../types';
import { useCMS } from '../context/CMSContext';
import { MapPin, Phone, Clock, ShieldCheck, Star } from 'lucide-react';
import { WhatsAppIcon } from './WhatsAppIcon';

interface FooterProps {
  onNavigate: (page: PageId) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { clinicInfo } = useCMS();

  const facebookUrl = (clinicInfo as any)?.facebookUrl || "https://www.facebook.com/profile.php?id=100063857603181";
  const instagramUrl = (clinicInfo as any)?.instagramUrl || "https://www.instagram.com/drfarhanmustaf/?hl=en";
  const tiktokUrl = (clinicInfo as any)?.tiktokUrl || "https://www.tiktok.com/@drfarhan83?lang=en";

  return (
    <footer 
      id="site-footer" 
      className="bg-[#090B0C] text-neutral-300 pt-16 pb-12 border-t border-[#2097A2]/30" 
      role="contentinfo"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-neutral-800">
          
          {/* Brand & Doctor Intro (Col 1-5) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-6 bg-[#2097A2] inline-block rounded-[1px]"></span>
              <span className="font-semibold text-xl sm:text-2xl text-white tracking-tight uppercase">
                {clinicInfo.doctorName}
              </span>
            </div>
            <p className="text-white font-medium text-sm">
              {clinicInfo.title}
            </p>
            <p className="text-xs text-neutral-400 font-normal leading-relaxed max-w-md">
              Specialized clinical care in internal medicine, cardiometabolic health, hypertension, and diabetes management at HealthPro Medical Complex in Faisal Town, Lahore.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center px-2.5 py-1 rounded-[2px] text-xs font-semibold bg-white/10 text-white border border-white/10">
                {clinicInfo.qualifications}
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] text-xs font-semibold bg-white/10 text-white border border-white/10">
                <Star className="w-3.5 h-3.5 fill-[#FFD700] text-[#FFD700]" />
                Google Rating: 5.0 (263 Reviews)
              </span>
            </div>

            {/* Social Channels (Facebook, Instagram, TikTok) */}
            <div className="pt-4">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#27BAC8] mb-2.5">
                Official Social Profiles
              </div>
              <div className="flex items-center gap-4">
                {/* Facebook Icon */}
                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Dr. Farhan Mustafa on Facebook"
                  className="footer-social-icon text-[#27BAC8]"
                >
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>

                {/* Instagram Icon */}
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Dr. Farhan Mustafa on Instagram"
                  className="footer-social-icon text-[#27BAC8]"
                >
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>

                {/* TikTok Icon */}
                <a
                  href={tiktokUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Dr. Farhan Mustafa on TikTok"
                  className="footer-social-icon text-[#27BAC8]"
                >
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Quick Navigation Links (Col 6-8) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#27BAC8]">
              Quick Navigation
            </h4>
            <ul className="space-y-2 text-sm text-neutral-300">
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-white hover:underline transition-colors text-left">
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-white hover:underline transition-colors text-left">
                  About Dr. Farhan
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('services')} className="hover:text-white hover:underline transition-colors text-left">
                  Care & Services
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('appointments')} className="hover:text-white hover:underline transition-colors text-left">
                  Schedule Appointment
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('fees')} className="hover:text-white hover:underline transition-colors text-left">
                  Consultation Fees
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('patient-forms')} className="hover:text-white hover:underline transition-colors text-left">
                  Pre-Visit Patient Forms
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('resources')} className="hover:text-white hover:underline transition-colors text-left">
                  Health Resources
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('reviews')} className="hover:text-white hover:underline transition-colors text-left">
                  Patient Reviews & Rating
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('blog')} className="hover:text-white hover:underline transition-colors text-left">
                  Educational Articles
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('contact')} className="hover:text-white hover:underline transition-colors text-left">
                  Contact & Directions
                </button>
              </li>
            </ul>
          </div>

          {/* Clinic Contact & Location (Col 9-12) */}
          <div className="lg:col-span-4 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#27BAC8]">
              Clinic Location & Inquiries
            </h4>
            
            <div className="space-y-3 text-sm text-neutral-300">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#27BAC8] shrink-0 mt-1" />
                <span className="text-xs sm:text-sm leading-relaxed">
                  {clinicInfo.address}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#27BAC8] shrink-0" />
                <a 
                  href={`tel:${clinicInfo.phoneIntl || clinicInfo.phone}`} 
                  className="text-xs sm:text-sm hover:text-white hover:underline font-semibold"
                >
                  {clinicInfo.phoneDisplay || clinicInfo.phone}
                </a>
              </div>

              <div className="flex items-center gap-3">
                <WhatsAppIcon className="w-4 h-4 text-[#27BAC8] shrink-0" aria-hidden="true" />
                <a 
                  href={clinicInfo.whatsappUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-xs sm:text-sm hover:text-white hover:underline font-semibold"
                >
                  WhatsApp: {clinicInfo.whatsapp}
                </a>
              </div>

              <div className="flex items-start gap-3 pt-1">
                <Clock className="w-4 h-4 text-[#27BAC8] shrink-0 mt-0.5" />
                <span className="text-xs text-neutral-400">
                  {clinicInfo.profileHoursNotice}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <a
                href={clinicInfo.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-[#27BAC8] hover:text-[#A4E0E5] hover:underline inline-flex items-center gap-1"
              >
                <span>Open in Google Maps & Directions →</span>
              </a>
            </div>
          </div>

        </div>

        {/* Emergency Medical Disclaimer */}
        <div className="py-6 border-b border-neutral-800 text-xs text-neutral-400 leading-relaxed">
          <p>
            <strong className="text-white font-semibold uppercase tracking-wider">Medical Emergency Notice: </strong>
            This website and online messaging channels are intended for elective outpatient appointments and general administrative clinic inquiries. In the event of a life-threatening medical emergency, acute chest pain, sudden breathlessness, collapse, or severe trauma, please call <strong className="text-red-400">Rescue 1122</strong> immediately or report to the nearest hospital emergency department.
          </p>
        </div>

        {/* Bottom Copyright & Legal Links */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 gap-4">
          <div>
            &copy; {new Date().getFullYear()} {clinicInfo.doctorName}. All rights reserved.
          </div>
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <button onClick={() => onNavigate('privacy')} className="hover:text-neutral-300 transition-colors">
              Privacy Policy
            </button>
            <span>•</span>
            <button onClick={() => onNavigate('terms')} className="hover:text-neutral-300 transition-colors">
              Terms of Use
            </button>
            <span>•</span>
            <button onClick={() => onNavigate('disclaimer')} className="hover:text-neutral-300 transition-colors">
              Medical Disclaimer
            </button>
            <span>•</span>
            <button 
              onClick={() => onNavigate('admin')} 
              className="hover:text-white font-medium inline-flex items-center gap-1 transition-colors text-neutral-400 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 px-2.5 py-1 rounded-[2px]"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#2097A2]" /> Staff Admin CMS
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};

