import React from 'react';
import { PageId, ServiceItem } from '../types';
import { CLINIC_INFO, VERIFIED_SERVICES } from '../data/clinicData';
import { PageHero } from '../components/PageHero';
import { EmergencyBanner } from '../components/EmergencyBanner';
import { 
  ArrowLeft, 
  ArrowRight,
  CheckCircle2, 
  Calendar, 
  FileText, 
  HelpCircle, 
  ShieldAlert, 
  ShieldCheck,
  Phone, 
  Clock,
  Sparkles
} from 'lucide-react';
import { WhatsAppIcon } from '../components/WhatsAppIcon';

interface ServiceDetailPageProps {
  service: ServiceItem | null;
  onNavigate: (page: PageId) => void;
  onSelectService?: (service: ServiceItem) => void;
}

export const ServiceDetailPage: React.FC<ServiceDetailPageProps> = ({
  service,
  onNavigate,
  onSelectService
}) => {
  // Fallback to first verified service if null
  const currentService = service || VERIFIED_SERVICES[0];

  // Related services (exclude current)
  const relatedServices = VERIFIED_SERVICES.filter(s => s.id !== currentService.id).slice(0, 3);

  return (
    <div className="min-h-screen bg-light-blue pb-20">
      
      {/* Standardized Master Page Hero */}
      <PageHero
        title={currentService.title}
        eyebrow={currentService.category}
        subtitle={currentService.shortDescription}
        breadcrumbs={[
          { label: 'Care & Services', page: 'services' },
          { label: currentService.title }
        ]}
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
            <button
              onClick={() => onNavigate('services')}
              className="btn-secondary text-xs !min-h-[44px]"
            >
              <ArrowLeft className="button-icon text-[#25B3C2]" aria-hidden="true" />
              <span>Back to All Services</span>
            </button>
          </>
        }
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-10">
        <EmergencyBanner />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Main Content (8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Overview Section */}
            <article className="card-standard p-8 space-y-4">
              <span className="text-xs font-bold uppercase tracking-widest text-[var(--brand-blue)] block">
                Clinical Overview
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-[var(--brand-charcoal)]">
                Medical Context & Scope
              </h2>
              <p className="text-sm text-neutral-700 leading-relaxed">
                {currentService.fullDescription}
              </p>
            </article>

            {/* Reasons for Consultation */}
            <section aria-labelledby="consult-reasons-heading" className="card-standard p-8 space-y-4">
              <h2 id="consult-reasons-heading" className="text-lg sm:text-xl font-bold text-[var(--brand-charcoal)]">
                Reasons Patients Commonly Seek Consultation
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                You may consider scheduling an internal medicine review with Dr. Farhan Mustafa if you experience any of the following indications:
              </p>
              <ul className="space-y-3 pt-2">
                {currentService.symptomsOrReasons.map((reason, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-[var(--brand-charcoal)]">
                    <CheckCircle2 className="w-4 h-4 text-[var(--brand-blue)] shrink-0 mt-0.5" aria-hidden="true" />
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* What to Bring */}
            <section aria-labelledby="prep-heading" className="card-standard p-8 space-y-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[var(--brand-aqua)]" aria-hidden="true" />
                <h2 id="prep-heading" className="text-lg sm:text-xl font-bold text-[var(--brand-charcoal)]">
                  What to Bring to Your Appointment
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                Bringing complete records helps Dr. Farhan review your health history accurately and avoid redundant diagnostic testing:
              </p>
              <ul className="space-y-3 pt-2">
                {currentService.whatToBring.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-neutral-700">
                    <span className="w-2 h-2 rounded-full bg-[var(--brand-aqua)] shrink-0 mt-1.5" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Service FAQs */}
            {currentService.faqs && currentService.faqs.length > 0 && (
              <section aria-labelledby="service-faq-heading" className="card-standard p-8 space-y-6">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-[var(--brand-aqua)]" aria-hidden="true" />
                  <h2 id="service-faq-heading" className="text-lg sm:text-xl font-bold text-[var(--brand-charcoal)]">
                    Frequently Asked Questions
                  </h2>
                </div>
                <div className="space-y-4">
                  {currentService.faqs.map((faq, idx) => (
                    <div key={idx} className="card-standard p-4 space-y-1.5">
                      <strong className="text-xs sm:text-sm text-[var(--brand-blue)] block font-bold">
                        {faq.question}
                      </strong>
                      <p className="text-xs text-neutral-600 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Medical Disclaimer */}
            <div className="card-standard bg-light-aqua border border-[var(--border-default)] p-6 space-y-2">
              <div className="flex items-center gap-2 text-[var(--brand-blue)]">
                <ShieldAlert className="w-4 h-4 text-[var(--brand-aqua)]" />
                <span className="text-xs font-bold uppercase tracking-wider">Clinical Disclaimer</span>
              </div>
              <p className="text-xs text-neutral-700 leading-relaxed">
                The information provided on this page is for general educational orientation and does not constitute individual medical diagnosis or prescriptive treatment. A formal in-person or verified online clinical consultation is required to assess your individual health requirements.
              </p>
            </div>

          </div>

          {/* Sidebar CTA Card (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <aside aria-label="Appointment Request" className="card-standard p-6 space-y-6 sticky top-28 border-2 border-[var(--brand-aqua)] shadow-md">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[var(--brand-blue)] block">
                  Appointment Request
                </span>
                <h3 className="text-lg font-bold text-[var(--brand-charcoal)] mt-1">
                  Schedule Consultation
                </h3>
                <p className="text-xs text-[var(--color-muted-gray)] mt-1 leading-relaxed">
                  HealthPro Medical Complex, 860-B, Block B, Faisal Town, Lahore.
                </p>
              </div>

              {/* Paired CTAs: Blue Left/Top, Black Right/Bottom */}
              <div className="space-y-3 pt-2">
                <button
                  onClick={() => onNavigate('appointments')}
                  className="btn-primary w-full text-xs"
                >
                  <Calendar className="button-icon text-white" />
                  <span>Request Appointment</span>
                </button>

                <a
                  href={CLINIC_INFO.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary w-full text-xs"
                >
                  <WhatsAppIcon className="button-icon text-[#25B3C2]" aria-hidden="true" />
                  <span>WhatsApp Front Desk</span>
                </a>

                <a
                  href={`tel:${CLINIC_INFO.phoneIntl}`}
                  className="w-full py-2.5 text-center text-xs text-[var(--brand-blue)] hover:text-[var(--brand-deep-teal)] block font-semibold transition-colors"
                >
                  Or call directly: {CLINIC_INFO.phone}
                </a>
              </div>

              <div className="border-t border-[var(--border-subtle)] pt-4 text-[11px] text-[var(--color-muted-gray)] space-y-2">
                <p>
                  <strong>Consultation Hours:</strong> Monday to Saturday, 6:00 PM – 9:00 PM (PKT).
                </p>
                <p className="text-neutral-500">
                  Prior confirmation required for all in-clinic reviews.
                </p>
              </div>
            </aside>
          </div>

        </div>

        {/* Related Care & Services Section (3D Raised Cards) */}
        {relatedServices.length > 0 && (
          <section aria-labelledby="related-services-heading" className="pt-8 border-t border-[var(--border-subtle)] space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[var(--brand-blue)] block">
                  Related Clinical Care
                </span>
                <h2 id="related-services-heading" className="text-xl sm:text-2xl font-medium text-[var(--brand-charcoal)] tracking-tight">
                  Additional Internal Medicine Services
                </h2>
              </div>
              <button
                onClick={() => onNavigate('services')}
                className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[var(--brand-blue)] hover:text-[var(--brand-deep-teal)] transition-colors"
              >
                <span>View All Services</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedServices.map((relService) => (
                <div
                  key={relService.id}
                  className="card-standard p-6 flex flex-col justify-between group cursor-pointer"
                  onClick={() => {
                    if (onSelectService) {
                      onSelectService(relService);
                    }
                    onNavigate('service-detail');
                  }}
                >
                  <div className="space-y-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--brand-blue)] bg-[var(--brand-blue)]/10 px-2 py-0.5 rounded-[var(--radius-sharp)] inline-block border border-[var(--border-subtle)]">
                      {relService.category}
                    </span>
                    <h3 className="text-base font-bold text-[var(--brand-charcoal)] group-hover:text-[var(--brand-blue)] transition-colors leading-snug">
                      {relService.title}
                    </h3>
                    <p className="text-xs text-neutral-600 leading-relaxed line-clamp-2">
                      {relService.shortDescription}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs font-semibold text-[var(--brand-blue)]">
                    <span>Explore details</span>
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      </main>

    </div>
  );
};

