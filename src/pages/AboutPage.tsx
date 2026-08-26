import React from 'react';
import { PageId } from '../types';
import { CLINIC_INFO } from '../data/clinicData';
import { PageHero } from '../components/PageHero';
import { DoctorPhotoPlaceholder } from '../components/DoctorPhotoPlaceholder';
import { EmergencyBanner } from '../components/EmergencyBanner';
import { ShieldCheck, Award, BookOpen, CheckCircle2, Calendar, Phone, MapPin, Sparkles } from 'lucide-react';
import { WhatsAppIcon } from '../components/WhatsAppIcon';

interface AboutPageProps {
  onNavigate: (page: PageId) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-light-blue pb-20">
      
      {/* Standardized Inner Page Hero */}
      <PageHero
        title="About Dr. Farhan Mustafa"
        eyebrow="Physician Profile & Background"
        subtitle="Consultant Physician & Specialist in Internal Medicine, Hypertension, Diabetes, and Complex Adult Health at HealthPro Medical Complex, Lahore."
        breadcrumbs={[{ label: 'About Doctor' }]}
        onNavigate={onNavigate}
        actions={
          <>
            <button
              onClick={() => onNavigate('appointments')}
              className="btn-primary text-xs !min-h-[44px]"
            >
              <Calendar className="button-icon text-white" />
              <span>Book Appointment</span>
            </button>
            <a
              href={CLINIC_INFO.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary text-xs !min-h-[44px]"
            >
              <WhatsAppIcon className="button-icon text-[#25B3C2]" aria-hidden="true" />
              <span>WhatsApp Front Desk</span>
            </a>
          </>
        }
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-12">
        <EmergencyBanner />

        {/* Profile Card & Credentials */}
        <section aria-labelledby="physician-overview-heading" className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Column: Photo Placeholder & Badges */}
          <div className="lg:col-span-5 space-y-6">
            <DoctorPhotoPlaceholder className="w-full min-h-[380px]" />

            <div className="card-standard p-6 space-y-4">
              <span className="text-xs font-bold uppercase tracking-widest text-[var(--brand-blue)] flex items-center gap-1.5">
                <Award className="w-4 h-4 text-[var(--brand-aqua)]" />
                Confirmed Qualifications
              </span>
              <ul className="space-y-3 text-xs sm:text-sm text-[var(--brand-charcoal)]">
                <li className="flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-[var(--brand-blue)] shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold">FCPS (Internal Medicine)</strong>
                    <span className="text-xs text-[var(--color-muted-gray)] block">Fellow of the College of Physicians and Surgeons Pakistan</span>
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-[var(--brand-blue)] shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold">MRCP (UK)</strong>
                    <span className="text-xs text-[var(--color-muted-gray)] block">Member of the Royal College of Physicians, United Kingdom</span>
                  </div>
                </li>
              </ul>
            </div>

            <div className="card-standard p-6 space-y-3 text-xs text-[var(--color-muted-gray)]">
              <span className="text-xs font-bold uppercase tracking-widest text-[var(--brand-blue)] flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[var(--brand-aqua)]" />
                Practice Location
              </span>
              <p className="font-bold text-[var(--brand-charcoal)] text-sm">{CLINIC_INFO.clinicName}</p>
              <p className="leading-relaxed">{CLINIC_INFO.address}</p>
              <div className="pt-2 text-xs font-medium text-[var(--brand-deep-teal)] bg-light-aqua p-2.5 rounded-[var(--radius-sm)] border border-[var(--border-subtle)]">
                Consultations conducted strictly by confirmed appointment.
              </div>
            </div>
          </div>

          {/* Right Column: Narrative & Practice Pillars */}
          <div className="lg:col-span-7 space-y-8">
            
            <div className="card-standard p-8 space-y-6">
              <span className="text-xs font-bold uppercase tracking-widest text-[var(--brand-blue)] block">
                Clinical Background & Scope
              </span>
              
              <h2 id="physician-overview-heading" className="text-2xl sm:text-3xl font-medium text-[var(--brand-charcoal)] tracking-tight">
                Dedicated to evidence-based adult medical care in Lahore
              </h2>

              <div className="space-y-4 text-sm text-neutral-700 leading-relaxed">
                <p>
                  Dr. Farhan Mustafa is a Consultant Physician and Internal Medicine Specialist practicing in Faisal Town, Lahore. With dual postgraduate qualifications including <strong>FCPS (Internal Medicine, Pakistan)</strong> and <strong>MRCP (UK)</strong>, Dr. Farhan provides comprehensive diagnostic evaluations, non-surgical management of complex medical conditions, and long-term care for adult patients.
                </p>

                <p>
                  Internal medicine focuses on understanding the interconnected nature of adult physiology. Whether evaluating non-specific fatigue and fever or managing simultaneous chronic conditions such as hypertension, cardiometabolic risk, and type 2 diabetes, Dr. Farhan emphasizes individualized patient discussions, methodical diagnostic investigations, and clear treatment plans.
                </p>
              </div>

              <div className="border-t border-[var(--border-subtle)] pt-6 space-y-4">
                <h3 className="text-base font-bold text-[var(--brand-charcoal)]">
                  Core Clinical Practice Principles
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="card-standard p-4 space-y-1">
                    <strong className="text-xs font-bold uppercase tracking-wide text-[var(--brand-blue)] block">
                      Thorough Clinical History
                    </strong>
                    <p className="text-xs text-neutral-600 leading-relaxed">
                      Taking the time to understand your complete symptom history, medication timeline, and lifestyle factors.
                    </p>
                  </div>

                  <div className="card-standard p-4 space-y-1">
                    <strong className="text-xs font-bold uppercase tracking-wide text-[var(--brand-blue)] block">
                      Diagnostic Precision
                    </strong>
                    <p className="text-xs text-neutral-600 leading-relaxed">
                      Ordering and reviewing targeted laboratory and imaging investigations to reach an accurate diagnosis.
                    </p>
                  </div>

                  <div className="card-standard p-4 space-y-1">
                    <strong className="text-xs font-bold uppercase tracking-wide text-[var(--brand-blue)] block">
                      Chronic Disease Control
                    </strong>
                    <p className="text-xs text-neutral-600 leading-relaxed">
                      Long-term therapeutic management to prevent vascular, renal, and cardiac complications from hypertension and diabetes.
                    </p>
                  </div>

                  <div className="card-standard p-4 space-y-1">
                    <strong className="text-xs font-bold uppercase tracking-wide text-[var(--brand-blue)] block">
                      Clear Communication
                    </strong>
                    <p className="text-xs text-neutral-600 leading-relaxed">
                      Explaining diagnoses and medicines in clear, understandable language with no confusing medical jargon.
                    </p>
                  </div>
                </div>
              </div>

            </div>

            {/* Verification Note for Transparency */}
            <div className="card-standard bg-light-aqua border border-[var(--border-default)] p-6 space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-[var(--brand-blue)] block">
                Healthcare Transparency Statement
              </span>
              <p className="text-xs text-neutral-700 leading-relaxed">
                In strict adherence to medical ethics and accurate public representation, all credentials displayed on this portal reflect verified medical qualifications. Additional institutional affiliations and specific schedule parameters are maintained through our administrative verification protocol.
              </p>
            </div>

            {/* Paired Action Buttons: Blue Left, Black Right */}
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
              <button
                onClick={() => onNavigate('appointments')}
                className="btn-primary w-full sm:w-auto"
              >
                <Calendar className="button-icon text-white" />
                <span>Book In-Clinic Appointment</span>
              </button>
              
              <a
                href={CLINIC_INFO.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary w-full sm:w-auto"
              >
                <WhatsAppIcon className="button-icon text-[#25B3C2]" aria-hidden="true" />
                <span>Contact via WhatsApp</span>
              </a>
            </div>

          </div>

        </section>
      </main>

    </div>
  );
};

