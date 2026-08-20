import React from 'react';
import { AlertTriangle, PhoneCall } from 'lucide-react';
import { CLINIC_INFO } from '../data/clinicData';

export const EmergencyBanner: React.FC = () => {
  return (
    <aside 
      id="emergency-safety-banner"
      className="bg-red-50 border-l-4 border-red-700 py-3 px-4 sm:px-6 my-6 max-w-7xl mx-auto rounded-r-xs"
      role="note"
      aria-label="Medical emergency instructions"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm text-red-950 leading-relaxed">
          <strong className="font-semibold text-red-900 uppercase tracking-wide">For Immediate Medical Emergencies: </strong>
          If you or someone in your care is experiencing severe chest pain, sudden weakness/numbness, difficulty breathing, or acute severe injury, please contact <strong>Rescue 1122</strong> or immediately proceed to the nearest emergency medical facility.
        </div>
      </div>
    </aside>
  );
};
