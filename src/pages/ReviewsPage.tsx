import React from 'react';
import { PageId } from '../types';
import { CLINIC_INFO } from '../data/clinicData';
import { Breadcrumb } from '../components/Breadcrumb';
import { EmergencyBanner } from '../components/EmergencyBanner';
import { Star, ExternalLink, ShieldCheck, CheckCircle2, Info, MapPin } from 'lucide-react';

interface ReviewsPageProps {
  onNavigate: (page: PageId) => void;
}

export const ReviewsPage: React.FC<ReviewsPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-16">
      
      {/* Header Block */}
      <div className="bg-[#2097A2] text-white py-12 px-4 sm:px-6 lg:px-8 border-b-4 border-[#27BAC8]">
        <div className="max-w-7xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-[#A4E0E5] block">
            Patient Feedback & Transparency
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-white">
            Google Reviews & Ratings
          </h1>
          <p className="text-sm sm:text-base text-white/90 font-normal max-w-2xl">
            Authentic, independently hosted reviews on Dr. Farhan Mustafa's official Google Business Profile.
          </p>
        </div>
      </div>

      <Breadcrumb items={[{ label: 'Reviews' }]} onNavigate={onNavigate} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 space-y-10">
        <EmergencyBanner />

        {/* Rating Hero Block */}
        <div className="bg-white p-8 sm:p-12 rounded-xs border border-[#E2E8F0] max-w-3xl mx-auto text-center space-y-6 shadow-xs">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#2097A2]/10 text-[#2097A2] text-xs font-bold uppercase rounded-xs">
            <ShieldCheck className="w-4 h-4" />
            <span>Independently Verified Google Profile</span>
          </div>

          <div className="flex items-center justify-center gap-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-8 h-8 fill-[#FFD700] text-[#FFD700]" />
            ))}
          </div>

          <div className="space-y-1">
            <div className="text-5xl sm:text-6xl font-extrabold text-[#0A0A0A] tracking-tight">
              {CLINIC_INFO.googleRating} <span className="text-2xl font-normal text-[#5B6467]">/ 5.0</span>
            </div>
            <p className="text-base text-[#0A0A0A] font-semibold">
              Based on {CLINIC_INFO.googleReviewCount} Patient Reviews on Google
            </p>
            <p className="text-xs text-[#5B6467]">
              Last verified record date: <strong>{CLINIC_INFO.ratingVerifiedDate}</strong>
            </p>
          </div>

          <p className="text-xs sm:text-sm text-[#5B6467] max-w-lg mx-auto leading-relaxed">
            Google Business Profile reviews are submitted directly by patients who have visited HealthPro Medical Complex in Faisal Town, Lahore.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={CLINIC_INFO.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-8 py-4 bg-[#2097A2] hover:bg-[#1B808A] text-white text-xs font-bold uppercase tracking-wider rounded-xs transition-colors shadow-xs inline-flex items-center justify-center gap-2"
            >
              <span>View All 263 Reviews on Google</span>
              <ExternalLink className="w-4 h-4" />
            </a>

            <button
              onClick={() => onNavigate('appointments')}
              className="w-full sm:w-auto px-6 py-4 bg-[#FAFAFA] border border-[#CBD5E1] hover:border-[#2097A2] text-[#0A0A0A] text-xs font-bold uppercase tracking-wider rounded-xs transition-colors"
            >
              Book an Appointment
            </button>
          </div>

        </div>

        {/* Ethical Review Transparency Policy */}
        <div className="bg-white p-8 rounded-xs border border-[#E2E8F0] max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5 text-[#2097A2]" />
            <h2 className="text-lg font-semibold text-[#0A0A0A]">
              Our Healthcare Review & Testimonial Policy
            </h2>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-[#5B6467] leading-relaxed">
            <p>
              In accordance with international healthcare transparency principles and medical advertising ethics:
            </p>

            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#2097A2] shrink-0 mt-0.5" />
                <span>
                  <strong>No Fabricated Testimonials:</strong> We do not publish artificial testimonials, paid endorsements, or unverifiable patient quotes.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#2097A2] shrink-0 mt-0.5" />
                <span>
                  <strong>Direct Google Linkage:</strong> All review metrics link directly to Google Maps and our verified Google Place ID (<code>{CLINIC_INFO.googlePlaceId}</code>).
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#2097A2] shrink-0 mt-0.5" />
                <span>
                  <strong>Patient Confidentiality:</strong> We respect patient privacy and never share private medical details or identifiable records in public forums.
                </span>
              </li>
            </ul>
          </div>
        </div>

      </div>

    </div>
  );
};
