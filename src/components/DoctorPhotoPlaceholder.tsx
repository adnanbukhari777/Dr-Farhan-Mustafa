import React from 'react';
import { CLINIC_INFO } from '../data/clinicData';
import { ShieldCheck, Stethoscope, Award } from 'lucide-react';

interface DoctorPhotoPlaceholderProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const DoctorPhotoPlaceholder: React.FC<DoctorPhotoPlaceholderProps> = ({
  className = '',
  size = 'md'
}) => {
  return (
    <div
      className={`relative overflow-hidden rounded-xs border border-[#E2E8F0] bg-gradient-to-br from-[#2097A2] via-[#1B808A] to-[#0A0A0A] text-white flex flex-col items-center justify-center text-center p-6 shadow-sm ${className}`}
      role="img"
      aria-label={`Official clinic profile placeholder for ${CLINIC_INFO.doctorName}`}
    >
      {/* Decorative background grid pattern */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#FFFFFF_1px,transparent_1px)] [background-size:16px_16px]"></div>
      
      {/* Subtle overlay accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#27BAC8]/20 rounded-full blur-2xl"></div>

      <div className="relative z-10 flex flex-col items-center">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/10 border border-white/25 flex items-center justify-center mb-4 text-white shadow-inner">
          <Stethoscope className="w-8 h-8 sm:w-10 sm:h-10 text-[#A4E0E5]" />
        </div>

        <div className="font-semibold text-lg sm:text-xl tracking-tight text-white uppercase">
          {CLINIC_INFO.doctorName}
        </div>
        
        <p className="text-xs sm:text-sm text-[#A4E0E5] font-medium mt-1">
          {CLINIC_INFO.title}
        </p>

        <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-xs rounded-xs border border-white/20 text-xs font-semibold text-white">
          <ShieldCheck className="w-3.5 h-3.5 text-[#27BAC8]" />
          <span>{CLINIC_INFO.qualifications}</span>
        </div>

        <p className="text-[11px] text-white/70 mt-4 max-w-xs leading-relaxed">
          HealthPro Medical Complex • Faisal Town, Lahore
        </p>
      </div>

      <div className="absolute bottom-2 right-2 text-[10px] text-white/50 font-mono">
        Official Profile
      </div>
    </div>
  );
};
