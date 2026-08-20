import React from 'react';
import { PageId } from '../types';
import { CLINIC_INFO } from '../data/clinicData';
import { Breadcrumb } from '../components/Breadcrumb';
import { DoctorPhotoPlaceholder } from '../components/DoctorPhotoPlaceholder';
import { EmergencyBanner } from '../components/EmergencyBanner';
import { ShieldCheck, Award, BookOpen, CheckCircle2, Calendar, Phone, MessageCircle, MapPin } from 'lucide-react';

interface AboutPageProps {
  onNavigate: (page: PageId) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-16">
      
      {/* Page Header Block - Teal / Reference inspired */}
      <div className="bg-[#2097A2] text-white py-12 px-4 sm:px-6 lg:px-8 border-b-4 border-[#27BAC8]">
        <div className="max-w-7xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-[#A4E0E5] block">
            Physician Profile
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-white">
            About Dr. Farhan Mustafa
          </h1>
          <p className="text-sm sm:text-base text-white/90 font-normal max-w-2xl">
            Consultant Physician & Internal Medicine Specialist at HealthPro Medical Complex, Lahore.
          </p>
        </div>
      </div>

      <Breadcrumb items={[{ label: 'About Doctor' }]} onNavigate={onNavigate} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 space-y-12">
        <EmergencyBanner />

        {/* Profile Card & Credentials */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Column: Photo Placeholder & Badges */}
          <div className="lg:col-span-5 space-y-6">
            <DoctorPhotoPlaceholder className="w-full min-h-[380px]" />

            <div className="bg-white p-6 rounded-xs border border-[#E2E8F0] space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#2097A2]">
                Confirmed Qualifications
              </h3>
              <ul className="space-y-3 text-xs sm:text-sm text-[#0A0A0A]">
                <li className="flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-[#2097A2] shrink-0 mt-0.5" />
                  <div>
                    <strong>FCPS (Internal Medicine)</strong>
                    <span className="text-xs text-[#5B6467] block">Fellow of the College of Physicians and Surgeons Pakistan</span>
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-[#2097A2] shrink-0 mt-0.5" />
                  <div>
                    <strong>MRCP (UK)</strong>
                    <span className="text-xs text-[#5B6467] block">Member of the Royal College of Physicians, United Kingdom</span>
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-xs border border-[#E2E8F0] space-y-3 text-xs text-[#5B6467]">
              <span className="text-xs font-bold uppercase tracking-widest text-[#2097A2] block">
                Practice Location
              </span>
              <p className="font-semibold text-[#0A0A0A]">{CLINIC_INFO.clinicName}</p>
              <p>{CLINIC_INFO.address}</p>
              <p className="pt-1">
                Consultations conducted strictly by confirmed appointment.
              </p>
            </div>
          </div>

          {/* Right Column: Narrative & Practice Pillars */}
          <div className="lg:col-span-7 space-y-8">
            
            <div className="bg-white p-8 rounded-xs border border-[#E2E8F0] space-y-6">
              <span className="text-xs font-bold uppercase tracking-widest text-[#2097A2] block">
                Clinical Background & Scope
              </span>
              
              <h2 className="text-2xl sm:text-3xl font-medium text-[#0A0A0A] tracking-tight">
                Dedicated to evidence-based adult medical care in Lahore
              </h2>

              <div className="space-y-4 text-sm text-[#5B6467] leading-relaxed">
                <p>
                  Dr. Farhan Mustafa is a Consultant Physician and Internal Medicine Specialist practicing in Faisal Town, Lahore. With specialized postgraduate qualifications including <strong>FCPS (Pakistan)</strong> and <strong>MRCP (UK)</strong>, Dr. Farhan provides comprehensive diagnostic evaluations, non-surgical management of complex medical conditions, and long-term care for adult patients.
                </p>

                <p>
                  Internal medicine focuses on understanding the interconnected nature of the human body. Whether addressing newly diagnosed symptoms or managing simultaneous chronic conditions such as diabetes and hypertension, Dr. Farhan emphasizes individualized patient discussions, methodical diagnostic investigations, and clear treatment plans.
                </p>
              </div>

              <div className="border-t border-[#E2E8F0] pt-6 space-y-4">
                <h3 className="text-base font-semibold text-[#0A0A0A]">
                  Core Clinical Practice Principles
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-[#FAFAFA] border border-[#E2E8F0] rounded-xs space-y-1">
                    <strong className="text-xs font-bold uppercase tracking-wide text-[#2097A2] block">
                      Thorough Clinical History
                    </strong>
                    <p className="text-xs text-[#5B6467]">
                      Taking the time to understand your complete symptom history, lifestyle factors, and prior treatments.
                    </p>
                  </div>

                  <div className="p-4 bg-[#FAFAFA] border border-[#E2E8F0] rounded-xs space-y-1">
                    <strong className="text-xs font-bold uppercase tracking-wide text-[#2097A2] block">
                      Diagnostic Precision
                    </strong>
                    <p className="text-xs text-[#5B6467]">
                      Ordering and reviewing targeted laboratory and imaging investigations to reach an accurate diagnosis.
                    </p>
                  </div>

                  <div className="p-4 bg-[#FAFAFA] border border-[#E2E8F0] rounded-xs space-y-1">
                    <strong className="text-xs font-bold uppercase tracking-wide text-[#2097A2] block">
                      Chronic Disease Control
                    </strong>
                    <p className="text-xs text-[#5B6467]">
                      Long-term therapeutic management to prevent complications from hypertension and diabetes.
                    </p>
                  </div>

                  <div className="p-4 bg-[#FAFAFA] border border-[#E2E8F0] rounded-xs space-y-1">
                    <strong className="text-xs font-bold uppercase tracking-wide text-[#2097A2] block">
                      Clear Communication
                    </strong>
                    <p className="text-xs text-[#5B6467]">
                      Explaining diagnoses and medicines in clear, understandable language with no confusing medical jargon.
                    </p>
                  </div>
                </div>
              </div>

            </div>

            {/* Verification Note for Transparency */}
            <div className="bg-[#E6F7F8] border border-[#A4E0E5] p-6 rounded-xs space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-[#2097A2] block">
                Healthcare Transparency Statement
              </span>
              <p className="text-xs text-[#0A0A0A] leading-relaxed">
                In strict adherence to medical ethics and accurate public representation, all credentials displayed on this portal reflect verified medical qualifications. Additional institutional affiliations and specific schedule parameters are maintained through our administrative verification protocol.
              </p>
            </div>

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <button
                onClick={() => onNavigate('appointments')}
                className="w-full sm:w-auto px-8 py-4 bg-[#2097A2] hover:bg-[#1B808A] text-white text-xs font-bold uppercase tracking-wider rounded-xs transition-colors shadow-xs"
              >
                Book In-Clinic Appointment
              </button>
              
              <a
                href={CLINIC_INFO.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-4 bg-white border border-[#CBD5E1] hover:border-[#2097A2] text-[#0A0A0A] text-xs font-bold uppercase tracking-wider rounded-xs transition-colors inline-flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4 text-[#2097A2]" />
                <span>Contact via WhatsApp</span>
              </a>
            </div>

          </div>

        </div>
      </div>

    </div>
  );
};
