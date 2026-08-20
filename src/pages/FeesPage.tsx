import React from 'react';
import { PageId } from '../types';
import { CLINIC_INFO } from '../data/clinicData';
import { Breadcrumb } from '../components/Breadcrumb';
import { EmergencyBanner } from '../components/EmergencyBanner';
import { ShieldCheck, HelpCircle, Phone, MessageCircle, Calendar, CheckCircle2, Info } from 'lucide-react';

interface FeesPageProps {
  onNavigate: (page: PageId) => void;
}

export const FeesPage: React.FC<FeesPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-16">
      
      {/* Header Block */}
      <div className="bg-[#2097A2] text-white py-12 px-4 sm:px-6 lg:px-8 border-b-4 border-[#27BAC8]">
        <div className="max-w-7xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-[#A4E0E5] block">
            Transparent Pricing
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-white">
            Consultation Fees & Policies
          </h1>
          <p className="text-sm sm:text-base text-white/90 font-normal max-w-2xl">
            Clear information regarding consultation categories and fee confirmation at HealthPro Medical Complex.
          </p>
        </div>
      </div>

      <Breadcrumb items={[{ label: 'Consultation Fees' }]} onNavigate={onNavigate} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 space-y-10">
        <EmergencyBanner />

        {/* Primary Fee Notice Card */}
        <div className="bg-white p-8 rounded-xs border border-[#E2E8F0] space-y-4 max-w-4xl mx-auto text-center">
          <div className="w-12 h-12 rounded-full bg-[#2097A2]/10 border border-[#2097A2]/30 flex items-center justify-center mx-auto">
            <Info className="w-6 h-6 text-[#2097A2]" />
          </div>

          <h2 className="text-xl sm:text-2xl font-semibold text-[#0A0A0A]">
            Current Consultation Fee Schedule
          </h2>

          <p className="text-sm text-[#5B6467] leading-relaxed max-w-2xl mx-auto">
            Please contact the clinic reception directly to confirm the current consultation fee. Fees depend on the specific appointment type (comprehensive initial in-clinic evaluation, periodic chronic disease follow-up, or online video consultation).
          </p>

          <div className="pt-2 flex flex-wrap justify-center gap-4">
            <a
              href={CLINIC_INFO.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-[#2097A2] hover:bg-[#1B808A] text-white text-xs font-bold uppercase tracking-wider rounded-xs transition-colors inline-flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Confirm Fee via WhatsApp</span>
            </a>
            
            <a
              href={`tel:${CLINIC_INFO.phoneIntl}`}
              className="px-6 py-3 bg-[#FAFAFA] border border-[#CBD5E1] hover:border-[#2097A2] text-[#0A0A0A] text-xs font-bold uppercase tracking-wider rounded-xs transition-colors inline-flex items-center gap-2"
            >
              <Phone className="w-4 h-4 text-[#2097A2]" />
              <span>Call Clinic: {CLINIC_INFO.phone}</span>
            </a>
          </div>
        </div>

        {/* Consultation Categories Breakdown */}
        <div className="max-w-5xl mx-auto space-y-6">
          <h3 className="text-lg font-semibold text-[#0A0A0A] text-center sm:text-left">
            What Is Included in Your Consultation
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Initial In-Clinic */}
            <div className="bg-white p-6 rounded-xs border border-[#E2E8F0] space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#2097A2] bg-[#2097A2]/10 px-2.5 py-1 rounded-xs inline-block">
                  In-Clinic
                </span>
                <h4 className="text-base font-semibold text-[#0A0A0A]">
                  Initial Comprehensive Evaluation
                </h4>
                <p className="text-xs text-[#5B6467] leading-relaxed">
                  For new patients presenting with diagnostic questions, multi-system symptoms, or initial assessments for hypertension and diabetes.
                </p>
                <ul className="space-y-2 text-xs text-[#5B6467] pt-2 border-t border-[#E2E8F0]">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2097A2] shrink-0 mt-0.5" />
                    <span>Complete medical history review</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2097A2] shrink-0 mt-0.5" />
                    <span>Systematic physical examination</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2097A2] shrink-0 mt-0.5" />
                    <span>Review of previous lab and imaging records</span>
                  </li>
                </ul>
              </div>

              <div className="pt-4 border-t border-[#E2E8F0]">
                <span className="text-xs text-[#5B6467] block italic">
                  Fee confirmed upon scheduling
                </span>
              </div>
            </div>

            {/* Follow-Up Review */}
            <div className="bg-white p-6 rounded-xs border border-[#E2E8F0] space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#2097A2] bg-[#2097A2]/10 px-2.5 py-1 rounded-xs inline-block">
                  Follow-Up
                </span>
                <h4 className="text-base font-semibold text-[#0A0A0A]">
                  Periodic Review & Lab Monitoring
                </h4>
                <p className="text-xs text-[#5B6467] leading-relaxed">
                  For established patients monitoring chronic conditions such as blood pressure control, HbA1c progress, or drug dosage titration.
                </p>
                <ul className="space-y-2 text-xs text-[#5B6467] pt-2 border-t border-[#E2E8F0]">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2097A2] shrink-0 mt-0.5" />
                    <span>Monitoring metrics comparison</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2097A2] shrink-0 mt-0.5" />
                    <span>Ongoing medication adjustment</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2097A2] shrink-0 mt-0.5" />
                    <span>Lifestyle target evaluation</span>
                  </li>
                </ul>
              </div>

              <div className="pt-4 border-t border-[#E2E8F0]">
                <span className="text-xs text-[#5B6467] block italic">
                  Fee confirmed upon scheduling
                </span>
              </div>
            </div>

            {/* Online Video */}
            <div className="bg-white p-6 rounded-xs border border-[#E2E8F0] space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#2097A2] bg-[#2097A2]/10 px-2.5 py-1 rounded-xs inline-block">
                  Digital Consultation
                </span>
                <h4 className="text-base font-semibold text-[#0A0A0A]">
                  Online Video Consultation
                </h4>
                <p className="text-xs text-[#5B6467] leading-relaxed">
                  For out-of-city patients or non-urgent second opinions requiring review of diagnostic reports and remote clinical guidance.
                </p>
                <ul className="space-y-2 text-xs text-[#5B6467] pt-2 border-t border-[#E2E8F0]">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2097A2] shrink-0 mt-0.5" />
                    <span>Digital laboratory report assessment</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2097A2] shrink-0 mt-0.5" />
                    <span>Direct video consultation slot</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2097A2] shrink-0 mt-0.5" />
                    <span>Written consultation summary</span>
                  </li>
                </ul>
              </div>

              <div className="pt-4 border-t border-[#E2E8F0]">
                <span className="text-xs text-[#5B6467] block italic">
                  Fee confirmed upon scheduling
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* Payment and Billing Transparency */}
        <div className="bg-white p-8 rounded-xs border border-[#E2E8F0] max-w-4xl mx-auto space-y-4">
          <h3 className="text-base font-semibold text-[#0A0A0A]">
            Clinic Payment Terms & Transparency
          </h3>
          <ul className="space-y-2.5 text-xs sm:text-sm text-[#5B6467]">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#2097A2] shrink-0 mt-0.5" />
              <span>
                <strong>Direct Settlement:</strong> Consultation fees are payable directly at the HealthPro Medical Complex reception desk at the time of your visit.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#2097A2] shrink-0 mt-0.5" />
              <span>
                <strong>No Hidden Charges:</strong> All consultation charges are communicated clearly prior to your visit.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#2097A2] shrink-0 mt-0.5" />
              <span>
                <strong>Online Payments:</strong> Payment instructions for remote video consultations are supplied by clinic staff upon slot confirmation.
              </span>
            </li>
          </ul>
        </div>

      </div>

    </div>
  );
};
