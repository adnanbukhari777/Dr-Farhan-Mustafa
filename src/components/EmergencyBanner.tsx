import React from 'react';
import { AlertTriangle, PhoneCall } from 'lucide-react';

export const EmergencyBanner: React.FC = () => {
  return (
    <aside 
      id="emergency-safety-banner"
      className="bg-rose-50/90 border border-rose-200 border-l-4 border-l-rose-600 p-4 my-6 max-w-7xl mx-auto rounded-[3px] shadow-[0_2px_8px_rgba(225,29,72,0.06)]"
      role="note"
      aria-label="Medical emergency instructions"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="text-xs sm:text-sm text-neutral-800 leading-relaxed">
            <strong className="font-bold text-rose-900 uppercase tracking-wide">Emergency Notice: </strong>
            If you are experiencing severe chest pain, acute breathlessness, sudden weakness, or an urgent medical crisis, call <strong>Rescue 1122</strong> or go directly to the nearest hospital emergency room.
          </div>
        </div>
        <a
          href="tel:1122"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase tracking-wider rounded-[3px] shrink-0 transition-colors shadow-xs"
        >
          <PhoneCall className="w-3.5 h-3.5" />
          <span>Call 1122</span>
        </a>
      </div>
    </aside>
  );
};

