import React from 'react';
import { PageId } from '../types';
import { CLINIC_INFO } from '../data/clinicData';
import { MapPin, Phone, MessageCircle, ArrowRight, ShieldCheck, HeartPulse, Clock, Star } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: PageId) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer id="site-footer" className="bg-[#2097A2] text-white pt-16 pb-12 border-t-4 border-[#27BAC8]" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-white/20">
          
          {/* Brand & Doctor Intro (Col 1-5) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-6 bg-white inline-block rounded-xs"></span>
              <span className="font-semibold text-2xl text-white tracking-tight uppercase">
                {CLINIC_INFO.doctorName}
              </span>
            </div>
            <p className="text-white/90 text-sm font-medium">
              {CLINIC_INFO.title}
            </p>
            <p className="text-xs text-white/80 font-normal leading-relaxed max-w-md">
              Specialized clinical care in internal medicine, chronic disease management, hypertension, and diabetes at HealthPro Medical Complex in Faisal Town, Lahore.
            </p>

            <div className="pt-2 flex flex-wrap gap-2">
              <span className="inline-flex items-center px-2.5 py-1 rounded-xs text-xs font-semibold bg-white/15 text-white border border-white/20">
                {CLINIC_INFO.qualifications}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xs text-xs font-semibold bg-white/15 text-white border border-white/20">
                <Star className="w-3 h-3 fill-[#FFD700] text-[#FFD700]" />
                Google Rating: 5.0 (263 Reviews)
              </span>
            </div>

            <div className="pt-4 flex flex-wrap gap-3">
              <button
                onClick={() => onNavigate('appointments')}
                className="px-4 py-2.5 bg-white text-[#2097A2] hover:bg-[#FAFAFA] text-xs font-bold uppercase tracking-wider rounded-xs transition-all shadow-xs"
              >
                Book Appointment
              </button>
              <a
                href={CLINIC_INFO.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 bg-transparent border border-white text-white hover:bg-white/10 text-xs font-bold uppercase tracking-wider rounded-xs transition-all inline-flex items-center gap-1.5"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Quick Navigation Links (Col 6-8) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#A4E0E5]">
              Quick Navigation
            </h4>
            <ul className="space-y-2 text-sm text-white/90">
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-white transition-colors">
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-white transition-colors">
                  About Dr. Farhan
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('services')} className="hover:text-white transition-colors">
                  Care & Services
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('appointments')} className="hover:text-white transition-colors">
                  Schedule Appointment
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('fees')} className="hover:text-white transition-colors">
                  Consultation Fees
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('patient-forms')} className="hover:text-white transition-colors">
                  Pre-Visit Patient Forms
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('resources')} className="hover:text-white transition-colors">
                  Health Resources
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('reviews')} className="hover:text-white transition-colors">
                  Patient Reviews & Rating
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('blog')} className="hover:text-white transition-colors">
                  Medical Blog & Articles
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('contact')} className="hover:text-white transition-colors">
                  Location & Directions
                </button>
              </li>
            </ul>
          </div>

          {/* Clinic Contact & Location (Col 9-12) */}
          <div className="lg:col-span-4 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#A4E0E5]">
              Clinic Location & Inquiries
            </h4>
            
            <div className="space-y-3 text-sm text-white/90">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#A4E0E5] shrink-0 mt-1" />
                <span className="text-xs sm:text-sm leading-relaxed">
                  {CLINIC_INFO.address}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#A4E0E5] shrink-0" />
                <a href={`tel:${CLINIC_INFO.phoneIntl}`} className="text-xs sm:text-sm hover:underline font-semibold">
                  {CLINIC_INFO.phone}
                </a>
              </div>

              <div className="flex items-center gap-3">
                <MessageCircle className="w-4 h-4 text-[#A4E0E5] shrink-0" />
                <a href={CLINIC_INFO.whatsappUrl} target="_blank" rel="noopener noreferrer" className="text-xs sm:text-sm hover:underline font-semibold">
                  WhatsApp: {CLINIC_INFO.whatsapp}
                </a>
              </div>

              <div className="flex items-start gap-3 pt-1">
                <Clock className="w-4 h-4 text-[#A4E0E5] shrink-0 mt-0.5" />
                <span className="text-xs text-white/80">
                  Appointments by confirmation. Online requests submitted 24/7.
                </span>
              </div>
            </div>

            <div className="pt-2">
              <a
                href={CLINIC_INFO.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-white/15 hover:bg-white/25 px-3 py-2 rounded-xs transition-colors"
              >
                <span>Get Google Directions</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

        </div>

        {/* Emergency Medical Disclaimer */}
        <div className="py-6 border-b border-white/20 text-xs text-white/80 leading-relaxed">
          <p>
            <strong className="text-white font-semibold uppercase tracking-wider">Medical Emergency Notice: </strong>
            This website and online messaging channels are intended for elective outpatient appointments and general administrative clinic inquiries. In the event of a medical emergency, severe acute symptoms, or immediate health crisis, please call <strong>Rescue 1122</strong> or immediately report to the nearest hospital emergency room.
          </p>
        </div>

        {/* Bottom Copyright & Legal Links */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-white/75 gap-4">
          <div>
            &copy; {new Date().getFullYear()} {CLINIC_INFO.doctorName}. All rights reserved.
          </div>
          <div className="flex flex-wrap gap-4">
            <button onClick={() => onNavigate('privacy')} className="hover:text-white transition-colors">
              Privacy Policy
            </button>
            <span>•</span>
            <button onClick={() => onNavigate('terms')} className="hover:text-white transition-colors">
              Terms of Use
            </button>
            <span>•</span>
            <button onClick={() => onNavigate('disclaimer')} className="hover:text-white transition-colors">
              Medical & AI Disclaimer
            </button>
            <span>•</span>
            <button onClick={() => onNavigate('admin')} className="hover:text-white font-medium inline-flex items-center gap-1 transition-colors text-white/90 bg-white/10 px-2 py-0.5 rounded">
              <ShieldCheck className="w-3.5 h-3.5" /> Staff Admin CMS
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
