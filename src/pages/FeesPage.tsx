import React from 'react';
import { PageId } from '../types';
import { CLINIC_INFO } from '../data/clinicData';
import { PageHero } from '../components/PageHero';
import { EmergencyBanner } from '../components/EmergencyBanner';
import { ShieldCheck, HelpCircle, Phone, Calendar, CheckCircle2, Info } from 'lucide-react';
import { WhatsAppIcon } from '../components/WhatsAppIcon';

interface FeesPageProps {
  onNavigate: (page: PageId) => void;
}

export const FeesPage: React.FC<FeesPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-light-blue pb-20">
      
      {/* Standardized Master Page Hero */}
      <PageHero
        title="Consultation Fees & Policies"
        eyebrow="Transparent Pricing"
        subtitle="Clear information regarding consultation categories and fee confirmation at HealthPro Medical Complex."
        breadcrumbs={[{ label: 'Consultation Fees' }]}
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
              <span>Confirm Fee via WhatsApp</span>
            </a>
          </>
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-10">
        <EmergencyBanner />

        {/* Primary Fee Notice Card */}
        <div className="card-standard p-8 max-w-4xl mx-auto text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-[var(--brand-blue)]/10 border border-[var(--border-subtle)] flex items-center justify-center mx-auto">
            <Info className="w-6 h-6 text-[var(--brand-blue)]" />
          </div>

          <span className="text-xs font-bold uppercase tracking-widest text-[var(--brand-blue)] block">
            Transparent Pricing Policy
          </span>

          <h2 className="text-xl sm:text-2xl md:text-3xl font-medium text-[var(--brand-charcoal)] tracking-tight">
            Current Consultation Fee Schedule
          </h2>

          <p className="text-sm text-neutral-600 leading-relaxed max-w-2xl mx-auto">
            Please contact the clinic reception directly to confirm the current consultation fee. Fees depend on the specific appointment type (comprehensive initial in-clinic evaluation, periodic chronic disease follow-up, or online video consultation).
          </p>

          <div className="pt-4 flex flex-col sm:flex-row justify-center items-center gap-4">
            <a
              href={CLINIC_INFO.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary w-full sm:w-auto text-xs"
            >
              <WhatsAppIcon className="button-icon text-white" aria-hidden="true" />
              <span>Confirm Fee via WhatsApp</span>
            </a>
            
            <a
              href={`tel:${CLINIC_INFO.phoneIntl}`}
              className="btn-secondary w-full sm:w-auto text-xs"
            >
              <Phone className="button-icon text-[#25B3C2]" aria-hidden="true" />
              <span>Call Clinic: {CLINIC_INFO.phone}</span>
            </a>
          </div>
        </div>

        {/* Consultation Categories Breakdown */}
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="text-center sm:text-left space-y-1">
            <span className="text-xs font-bold uppercase tracking-widest text-[var(--brand-blue)] block">
              Service Categories
            </span>
            <h3 className="text-xl sm:text-2xl font-medium text-[var(--brand-charcoal)] tracking-tight">
              What Is Included in Your Consultation
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Initial In-Clinic */}
            <div className="card-standard p-6 flex flex-col justify-between group border-t-4 border-t-[var(--brand-blue)]">
              <div className="space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--brand-blue)] bg-[var(--brand-blue)]/10 px-2.5 py-1 rounded-[var(--radius-sharp)] inline-block border border-[var(--border-subtle)]">
                  In-Clinic
                </span>
                <h4 className="text-base font-bold text-[var(--brand-charcoal)] group-hover:text-[var(--brand-blue)] transition-colors">
                  Initial Comprehensive Evaluation
                </h4>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  For new patients presenting with diagnostic questions, multi-system symptoms, or initial assessments for hypertension and diabetes.
                </p>
                <ul className="space-y-2 text-xs text-neutral-600 pt-3 border-t border-[var(--border-subtle)]">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[var(--brand-blue)] shrink-0 mt-0.5" />
                    <span>Complete medical history review</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[var(--brand-blue)] shrink-0 mt-0.5" />
                    <span>Systematic physical examination</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[var(--brand-blue)] shrink-0 mt-0.5" />
                    <span>Review of previous lab and imaging records</span>
                  </li>
                </ul>
              </div>

              <div className="pt-4 mt-4 border-t border-[var(--border-subtle)]">
                <span className="text-xs text-[var(--color-muted-gray)] block italic">
                  Fee confirmed upon scheduling
                </span>
              </div>
            </div>

            {/* Follow-Up Review */}
            <div className="card-standard p-6 flex flex-col justify-between group border-t-4 border-t-[var(--brand-aqua)]">
              <div className="space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--brand-deep-teal)] bg-[var(--brand-aqua)]/15 px-2.5 py-1 rounded-[var(--radius-sharp)] inline-block border border-[var(--border-subtle)]">
                  Follow-Up
                </span>
                <h4 className="text-base font-bold text-[var(--brand-charcoal)] group-hover:text-[var(--brand-blue)] transition-colors">
                  Periodic Review & Lab Monitoring
                </h4>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  For established patients monitoring chronic conditions such as blood pressure control, HbA1c progress, or drug dosage titration.
                </p>
                <ul className="space-y-2 text-xs text-neutral-600 pt-3 border-t border-[var(--border-subtle)]">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[var(--brand-blue)] shrink-0 mt-0.5" />
                    <span>Monitoring metrics comparison</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[var(--brand-blue)] shrink-0 mt-0.5" />
                    <span>Ongoing medication adjustment</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[var(--brand-blue)] shrink-0 mt-0.5" />
                    <span>Lifestyle target evaluation</span>
                  </li>
                </ul>
              </div>

              <div className="pt-4 mt-4 border-t border-[var(--border-subtle)]">
                <span className="text-xs text-[var(--color-muted-gray)] block italic">
                  Fee confirmed upon scheduling
                </span>
              </div>
            </div>

            {/* Online Video */}
            <div className="card-standard p-6 flex flex-col justify-between group border-t-4 border-t-[var(--brand-blue)]">
              <div className="space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--brand-blue)] bg-[var(--brand-blue)]/10 px-2.5 py-1 rounded-[var(--radius-sharp)] inline-block border border-[var(--border-subtle)]">
                  Digital Consultation
                </span>
                <h4 className="text-base font-bold text-[var(--brand-charcoal)] group-hover:text-[var(--brand-blue)] transition-colors">
                  Online Video Consultation
                </h4>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  For out-of-city patients or non-urgent second opinions requiring review of diagnostic reports and remote clinical guidance.
                </p>
                <ul className="space-y-2 text-xs text-neutral-600 pt-3 border-t border-[var(--border-subtle)]">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[var(--brand-blue)] shrink-0 mt-0.5" />
                    <span>Digital laboratory report assessment</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[var(--brand-blue)] shrink-0 mt-0.5" />
                    <span>Direct video consultation slot</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[var(--brand-blue)] shrink-0 mt-0.5" />
                    <span>Written consultation summary</span>
                  </li>
                </ul>
              </div>

              <div className="pt-4 mt-4 border-t border-[var(--border-subtle)]">
                <span className="text-xs text-[var(--color-muted-gray)] block italic">
                  Fee confirmed upon scheduling
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* Payment and Billing Transparency */}
        <div className="card-standard p-8 max-w-4xl mx-auto space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-[var(--brand-blue)] block">
            Billing Policies
          </span>
          <h3 className="text-lg font-bold text-[var(--brand-charcoal)]">
            Clinic Payment Terms & Transparency
          </h3>
          <ul className="space-y-2.5 text-xs sm:text-sm text-neutral-700">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[var(--brand-blue)] shrink-0 mt-0.5" />
              <span>
                <strong>Direct Settlement:</strong> Consultation fees are payable directly at the HealthPro Medical Complex reception desk at the time of your visit.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[var(--brand-blue)] shrink-0 mt-0.5" />
              <span>
                <strong>No Hidden Charges:</strong> All consultation charges are communicated clearly prior to your visit.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[var(--brand-blue)] shrink-0 mt-0.5" />
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
