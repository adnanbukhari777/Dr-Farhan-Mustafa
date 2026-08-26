import React from 'react';
import { PageId } from '../types';
import { PageHero } from '../components/PageHero';
import { CLINIC_INFO } from '../data/clinicData';
import { EmergencyBanner } from '../components/EmergencyBanner';
import { Home, Calendar, Phone, ArrowLeft, HelpCircle } from 'lucide-react';

interface NotFoundPageProps {
  onNavigate: (page: PageId) => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-light-blue pb-16">
      <PageHero
        title="Page Not Found (404)"
        eyebrow="Navigation Notice"
        subtitle="The clinical page or document you are looking for may have been moved, updated, or does not exist."
        breadcrumbs={[{ label: '404 - Not Found' }]}
        onNavigate={onNavigate}
        actions={
          <>
            <button
              onClick={() => onNavigate('home')}
              className="btn-primary text-xs !min-h-[44px]"
            >
              <Home className="w-4 h-4 text-white" />
              <span>Return to Homepage</span>
            </button>
            <button
              onClick={() => onNavigate('appointments')}
              className="btn-secondary text-xs !min-h-[44px]"
            >
              <Calendar className="w-[18px] h-[18px] text-[#25B3C2]" aria-hidden="true" />
              <span>Book Appointment</span>
            </button>
          </>
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        <EmergencyBanner />

        <div className="card-standard p-8 sm:p-12 text-center max-w-2xl mx-auto space-y-6">
          <div className="w-16 h-16 rounded-full bg-[#105B62]/10 border border-[#25B3C2]/30 flex items-center justify-center mx-auto text-[#105B62]">
            <HelpCircle className="w-8 h-8 text-[#25B3C2]" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold text-[#111314]">
              Looking for Clinic Information?
            </h2>
            <p className="text-sm text-[#111314]/80 max-w-lg mx-auto leading-relaxed">
              You can navigate to our primary medical services, consult fees schedule, or contact reception directly for immediate assistance.
            </p>
          </div>

          <div className="pt-4 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => onNavigate('services')}
              className="px-4 py-2.5 bg-white border border-[#25B3C2]/40 hover:border-[#25B3C2] text-[#105B62] font-semibold text-xs rounded-[3px] transition-colors shadow-2xs"
            >
              Care & Services
            </button>
            <button
              onClick={() => onNavigate('fees')}
              className="px-4 py-2.5 bg-white border border-[#25B3C2]/40 hover:border-[#25B3C2] text-[#105B62] font-semibold text-xs rounded-[3px] transition-colors shadow-2xs"
            >
              Consultation Fees
            </button>
            <button
              onClick={() => onNavigate('contact')}
              className="px-4 py-2.5 bg-white border border-[#25B3C2]/40 hover:border-[#25B3C2] text-[#105B62] font-semibold text-xs rounded-[3px] transition-colors shadow-2xs"
            >
              Contact Reception
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
