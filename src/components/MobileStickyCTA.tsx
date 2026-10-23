import React from 'react';
import { CLINIC_INFO } from '../data/clinicData';
import { Calendar, Phone } from 'lucide-react';
import { WhatsAppIcon } from './WhatsAppIcon';
import { PageId } from '../types';

interface MobileStickyCTAProps {
  onNavigate: (page: PageId) => void;
}

export const MobileStickyCTA: React.FC<MobileStickyCTAProps> = ({
  onNavigate
}) => {
  return (
    <div 
      id="mobile-sticky-cta-bar"
      className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur border-t border-[#E2E8F0] shadow-lg px-2 py-2 flex items-stretch justify-between gap-2"
      role="navigation"
      aria-label="Mobile quick actions"
    >
      <a
        href={`tel:${CLINIC_INFO.phoneIntl}`}
        className="min-h-[48px] flex-1 px-2 bg-[#FAFAFA] border border-[#CBD5E1] text-[#0A0A0A] rounded-xs flex flex-col items-center justify-center text-[10px] font-semibold"
      >
        <Phone className="w-4 h-4 text-[#2097A2] mb-0.5" />
        <span>Call</span>
      </a>

      <a
        href={CLINIC_INFO.whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="min-h-[48px] flex-1 px-2 bg-[#FAFAFA] border border-[#CBD5E1] text-[#0A0A0A] rounded-xs flex flex-col items-center justify-center text-[10px] font-semibold"
      >
        <WhatsAppIcon className="w-4 h-4 text-[#2097A2] mb-0.5" aria-hidden="true" />
        <span>WhatsApp</span>
      </a>

      <button
        onClick={() => onNavigate('appointments')}
        className="min-h-[48px] flex-[1.35] px-3 bg-[#2097A2] text-white rounded-xs flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wider shadow-xs cursor-pointer"
      >
        <Calendar className="w-3.5 h-3.5" />
        <span>Book</span>
      </button>
    </div>
  );
};
