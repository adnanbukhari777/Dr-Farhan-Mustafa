import React from 'react';
import { PageId, ServiceItem } from '../types';
import { CLINIC_INFO, VERIFIED_SERVICES } from '../data/clinicData';
import { Breadcrumb } from '../components/Breadcrumb';
import { EmergencyBanner } from '../components/EmergencyBanner';
import { 
  ArrowLeft, 
  CheckCircle2, 
  Calendar, 
  FileText, 
  HelpCircle, 
  ShieldAlert, 
  Phone, 
  MessageCircle 
} from 'lucide-react';

interface ServiceDetailPageProps {
  service: ServiceItem | null;
  onNavigate: (page: PageId) => void;
}

export const ServiceDetailPage: React.FC<ServiceDetailPageProps> = ({
  service,
  onNavigate
}) => {
  // Fallback to first verified service if null
  const currentService = service || VERIFIED_SERVICES[0];

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-16">
      
      {/* Header Block */}
      <div className="bg-[#2097A2] text-white py-12 px-4 sm:px-6 lg:px-8 border-b-4 border-[#27BAC8]">
        <div className="max-w-7xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-[#A4E0E5] block">
            {currentService.category}
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-white">
            {currentService.title}
          </h1>
          <p className="text-sm sm:text-base text-white/90 font-normal max-w-2xl">
            {currentService.shortDescription}
          </p>
        </div>
      </div>

      <Breadcrumb 
        items={[
          { label: 'Care & Services', page: 'services' },
          { label: currentService.title }
        ]} 
        onNavigate={onNavigate} 
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 space-y-10">
        <EmergencyBanner />

        {/* Back Link */}
        <button
          onClick={() => onNavigate('services')}
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#2097A2] hover:text-[#0A0A0A] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Services</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Main Content (8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Overview Section */}
            <div className="bg-white p-8 rounded-xs border border-[#E2E8F0] space-y-4">
              <h2 className="text-xl sm:text-2xl font-semibold text-[#0A0A0A]">
                Service Overview
              </h2>
              <p className="text-sm text-[#5B6467] leading-relaxed">
                {currentService.fullDescription}
              </p>
            </div>

            {/* Reasons for Consultation */}
            <div className="bg-white p-8 rounded-xs border border-[#E2E8F0] space-y-4">
              <h3 className="text-lg font-semibold text-[#0A0A0A]">
                Reasons Patients Commonly Seek Consultation
              </h3>
              <p className="text-xs text-[#5B6467]">
                You may consider scheduling an internal medicine review if you experience any of the following:
              </p>
              <ul className="space-y-3 pt-2">
                {currentService.symptomsOrReasons.map((reason, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-[#0A0A0A]">
                    <CheckCircle2 className="w-4 h-4 text-[#2097A2] shrink-0 mt-0.5" />
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* What to Bring */}
            <div className="bg-white p-8 rounded-xs border border-[#E2E8F0] space-y-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#2097A2]" />
                <h3 className="text-lg font-semibold text-[#0A0A0A]">
                  What to Bring to Your Appointment
                </h3>
              </div>
              <p className="text-xs text-[#5B6467]">
                Bringing complete records helps Dr. Farhan review your health history accurately and avoid redundant testing:
              </p>
              <ul className="space-y-3 pt-2">
                {currentService.whatToBring.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-[#5B6467]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2097A2] shrink-0 mt-2"></span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Service FAQs */}
            {currentService.faqs && currentService.faqs.length > 0 && (
              <div className="bg-white p-8 rounded-xs border border-[#E2E8F0] space-y-4">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-[#2097A2]" />
                  <h3 className="text-lg font-semibold text-[#0A0A0A]">
                    Frequently Asked Questions
                  </h3>
                </div>
                <div className="space-y-4 pt-2">
                  {currentService.faqs.map((faq, idx) => (
                    <div key={idx} className="p-4 bg-[#FAFAFA] border border-[#E2E8F0] rounded-xs space-y-1.5">
                      <strong className="text-xs sm:text-sm text-[#0A0A0A] block font-semibold">
                        {faq.question}
                      </strong>
                      <p className="text-xs text-[#5B6467] leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Medical Disclaimer */}
            <div className="bg-[#FAFAFA] border border-[#CBD5E1] p-6 rounded-xs space-y-2">
              <div className="flex items-center gap-2 text-[#0A0A0A]">
                <ShieldAlert className="w-4 h-4 text-[#2097A2]" />
                <span className="text-xs font-bold uppercase tracking-wider">Clinical Disclaimer</span>
              </div>
              <p className="text-xs text-[#5B6467] leading-relaxed">
                The information provided on this page is for general educational orientation and does not constitute individual medical diagnosis or prescriptive treatment. A formal in-person or verified online clinical consultation is required to assess your individual health requirements.
              </p>
            </div>

          </div>

          {/* Sidebar CTA Card (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-xs border-2 border-[#2097A2] space-y-6 sticky top-28">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#2097A2] block">
                  Appointment Request
                </span>
                <h3 className="text-lg font-semibold text-[#0A0A0A] mt-1">
                  Schedule Consultation
                </h3>
                <p className="text-xs text-[#5B6467] mt-1">
                  HealthPro Medical Complex, Faisal Town, Lahore.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <button
                  onClick={() => onNavigate('appointments')}
                  className="w-full py-3.5 bg-[#2097A2] hover:bg-[#1B808A] text-white text-xs font-bold uppercase tracking-wider rounded-xs transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Request Appointment</span>
                </button>

                <a
                  href={CLINIC_INFO.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 bg-white border border-[#CBD5E1] hover:border-[#2097A2] text-[#0A0A0A] text-xs font-bold uppercase tracking-wider rounded-xs transition-colors flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4 text-[#2097A2]" />
                  <span>WhatsApp Clinic</span>
                </a>

                <a
                  href={`tel:${CLINIC_INFO.phoneIntl}`}
                  className="w-full py-2.5 text-center text-xs text-[#5B6467] hover:text-[#2097A2] block font-medium"
                >
                  Or call: {CLINIC_INFO.phone}
                </a>
              </div>

              <div className="border-t border-[#E2E8F0] pt-4 text-[11px] text-[#5B6467] space-y-2">
                <p>
                  <strong>Notice:</strong> In-person and online video appointments are scheduled by prior confirmation.
                </p>
                <p>
                  For acute emergencies, dial 1122 immediately.
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
