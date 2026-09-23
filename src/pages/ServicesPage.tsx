import React, { useState } from 'react';
import { PageId, ServiceItem } from '../types';
import { VERIFIED_SERVICES, CLINIC_INFO } from '../data/clinicData';
import { PageHero } from '../components/PageHero';
import { EmergencyBanner } from '../components/EmergencyBanner';
import { ArrowRight, CheckCircle2, ShieldCheck, Stethoscope, Search, Calendar, Sparkles } from 'lucide-react';
import { WhatsAppIcon } from '../components/WhatsAppIcon';

interface ServicesPageProps {
  onNavigate: (page: PageId) => void;
  onSelectService: (service: ServiceItem) => void;
}

export const ServicesPage: React.FC<ServicesPageProps> = ({
  onNavigate,
  onSelectService
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = ['All', 'General Medicine', 'Chronic Disease Management', 'Internal Medicine', 'Preventive Care'];

  const filteredServices = VERIFIED_SERVICES.filter((s) => {
    const matchesCat = selectedCategory === 'All' || s.category === selectedCategory;
    const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.shortDescription.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-light-blue pb-20">
      
      {/* Standardized Master Page Hero */}
      <PageHero
        title="Clinical Care & Medical Services"
        eyebrow="Specialized Adult Healthcare"
        subtitle="Specialized internal medicine evaluations, non-surgical diagnostics, cardiometabolic management, and comprehensive chronic disease control in Lahore."
        breadcrumbs={[{ label: 'Care & Services' }]}
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
              <span>WhatsApp Inquiries</span>
            </a>
          </>
        }
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-8">
        <EmergencyBanner />

        {/* Filter and Search Bar */}
        <section aria-label="Services filter" className="card-standard p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 w-full md:w-auto" role="tablist" aria-label="Service categories">
            {categories.map((cat) => (
              <button
                key={cat}
                role="tab"
                aria-selected={selectedCategory === cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-2 text-xs font-bold rounded-[var(--radius-sharp)] transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[var(--brand-blue)] text-white shadow-[0_2px_8px_rgba(32,151,162,0.35)]'
                    : 'bg-white text-[var(--brand-charcoal)]/80 border border-[var(--border-subtle)] hover:bg-light-aqua hover:text-[var(--brand-blue)]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-[var(--brand-aqua)] absolute left-3 top-1/2 transform -translate-y-1/2" aria-hidden="true" />
            <input
              type="text"
              placeholder="Search services or symptoms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-[var(--border-default)] focus:border-[var(--brand-aqua)] focus:ring-1 focus:ring-[var(--brand-aqua)] rounded-[var(--radius-sm)] py-2 pl-9 pr-4 text-xs font-medium text-[var(--brand-charcoal)] transition-colors outline-none"
              aria-label="Search clinical services"
            />
          </div>

        </section>

        {/* Services List Grid */}
        <section aria-label="List of medical services" className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredServices.map((service) => (
            <article
              key={service.id}
              className="card-standard card-interactive p-8 space-y-6 flex flex-col justify-between group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--brand-blue)] bg-[var(--brand-blue)]/10 px-2.5 py-1 rounded-[var(--radius-sharp)] border border-[var(--border-subtle)]">
                    {service.category}
                  </span>
                  <ShieldCheck className="card-primary-icon w-4 h-4 text-[var(--brand-aqua)]" aria-hidden="true" />
                </div>

                <h2 className="text-xl sm:text-2xl font-bold text-[var(--brand-charcoal)] group-hover:text-[var(--brand-blue)] transition-colors">
                  {service.title}
                </h2>

                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                  {service.shortDescription}
                </p>

                <div className="space-y-2 pt-3 border-t border-[var(--border-subtle)]">
                  <span className="text-xs font-bold text-[var(--brand-charcoal)] block">
                    Common clinical presentations:
                  </span>
                  <ul className="space-y-1.5 text-xs text-neutral-600">
                    {service.symptomsOrReasons.slice(0, 3).map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[var(--brand-blue)] shrink-0 mt-0.5" aria-hidden="true" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Paired Buttons: Blue Left, Black Right */}
              <div className="pt-4 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={() => onNavigate('appointments')}
                  className="btn-primary w-full sm:w-auto text-xs"
                >
                  <Calendar className="button-icon text-white" />
                  <span>Book Appointment</span>
                </button>
                <button
                  onClick={() => {
                    onSelectService(service);
                    onNavigate('service-detail');
                  }}
                  className="btn-secondary w-full sm:w-auto text-xs"
                >
                  <ArrowRight className="button-icon text-[#25B3C2]" aria-hidden="true" />
                  <span>View Details & Preparation</span>
                </button>
              </div>
            </article>
          ))}
        </section>

        {/* Bottom Guidance Card */}
        <section aria-label="Consultation guidance" className="card-standard p-8 text-center space-y-4">
          <h2 className="text-lg sm:text-xl font-bold text-[var(--brand-charcoal)]">
            Uncertain about which consultation type to book?
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 max-w-xl mx-auto leading-relaxed">
            Contact our clinic reception on WhatsApp or call us directly. Our front desk staff will guide you in scheduling the appropriate in-clinic evaluation.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-2">
            <button
              onClick={() => onNavigate('appointments')}
              className="btn-primary w-full sm:w-auto"
            >
              <Calendar className="button-icon text-white" />
              <span>Book In-Clinic Visit</span>
            </button>
            <a
              href={CLINIC_INFO.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary w-full sm:w-auto"
            >
              <WhatsAppIcon className="button-icon text-[#25B3C2]" aria-hidden="true" />
              <span>WhatsApp Reception</span>
            </a>
          </div>
        </section>

      </main>

    </div>
  );
};

