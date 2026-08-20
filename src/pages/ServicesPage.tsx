import React, { useState } from 'react';
import { PageId, ServiceItem } from '../types';
import { VERIFIED_SERVICES, CLINIC_INFO } from '../data/clinicData';
import { Breadcrumb } from '../components/Breadcrumb';
import { EmergencyBanner } from '../components/EmergencyBanner';
import { ArrowRight, CheckCircle2, ShieldCheck, Stethoscope, Search } from 'lucide-react';

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
    <div className="min-h-screen bg-[#FAFAFA] pb-16">
      
      {/* Header Block */}
      <div className="bg-[#2097A2] text-white py-12 px-4 sm:px-6 lg:px-8 border-b-4 border-[#27BAC8]">
        <div className="max-w-7xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-[#A4E0E5] block">
            Clinical Care Areas
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-white">
            Care & Medical Services
          </h1>
          <p className="text-sm sm:text-base text-white/90 font-normal max-w-2xl">
            Specialized internal medicine evaluations and ongoing disease management in Lahore.
          </p>
        </div>
      </div>

      <Breadcrumb items={[{ label: 'Care & Services' }]} onNavigate={onNavigate} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 space-y-8">
        <EmergencyBanner />

        {/* Filter and Search Bar */}
        <div className="bg-white p-6 rounded-xs border border-[#E2E8F0] flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 w-full md:w-auto" role="tablist" aria-label="Service categories">
            {categories.map((cat) => (
              <button
                key={cat}
                role="tab"
                aria-selected={selectedCategory === cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-2 text-xs font-semibold rounded-xs transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#2097A2] text-white'
                    : 'bg-[#FAFAFA] text-[#5B6467] hover:bg-[#E2E8F0] hover:text-[#0A0A0A]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-[#5B6467] absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#FAFAFA] border border-[#CBD5E1] rounded-xs text-xs focus:bg-white focus:border-[#2097A2] focus:outline-hidden"
            />
          </div>

        </div>

        {/* Services List Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className="bg-white border border-[#E2E8F0] hover:border-[#2097A2] p-8 rounded-xs transition-all space-y-6 flex flex-col justify-between group shadow-2xs"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#2097A2] bg-[#2097A2]/10 px-2.5 py-1 rounded-xs">
                    {service.category}
                  </span>
                  <ShieldCheck className="w-4 h-4 text-[#2097A2]" />
                </div>

                <h3 className="text-xl sm:text-2xl font-semibold text-[#0A0A0A] group-hover:text-[#2097A2] transition-colors">
                  {service.title}
                </h3>

                <p className="text-xs sm:text-sm text-[#5B6467] leading-relaxed">
                  {service.shortDescription}
                </p>

                <div className="space-y-2 pt-2 border-t border-[#E2E8F0]">
                  <span className="text-xs font-semibold text-[#0A0A0A] block">
                    Common consultation reasons:
                  </span>
                  <ul className="space-y-1.5 text-xs text-[#5B6467]">
                    {service.symptomsOrReasons.slice(0, 3).map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#2097A2] shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-4 border-t border-[#E2E8F0] flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={() => {
                    onSelectService(service);
                    onNavigate('service-detail');
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 bg-[#FAFAFA] border border-[#CBD5E1] text-[#0A0A0A] hover:bg-[#2097A2] hover:text-white hover:border-[#2097A2] text-xs font-bold uppercase tracking-wider rounded-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>View Details & Preparation</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onNavigate('appointments')}
                  className="w-full sm:w-auto px-5 py-2.5 bg-[#2097A2] hover:bg-[#1B808A] text-white text-xs font-bold uppercase tracking-wider rounded-xs transition-colors flex items-center justify-center cursor-pointer"
                >
                  Book Appointment
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Booking Notice */}
        <div className="bg-[#FAFAFA] border border-[#E2E8F0] p-8 text-center rounded-xs space-y-4">
          <h3 className="text-lg font-semibold text-[#0A0A0A]">
            Need advice on which consultation type to book?
          </h3>
          <p className="text-xs sm:text-sm text-[#5B6467] max-w-xl mx-auto">
            Contact our clinic reception on WhatsApp or call us directly. Our staff will assist you in scheduling the appropriate in-clinic or online consultation.
          </p>
          <div className="flex justify-center gap-4 pt-2">
            <button
              onClick={() => onNavigate('appointments')}
              className="px-6 py-3 bg-[#2097A2] text-white text-xs font-bold uppercase tracking-wider rounded-xs hover:bg-[#1B808A] transition-colors"
            >
              Book In-Clinic Visit
            </button>
            <a
              href={CLINIC_INFO.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-white border border-[#CBD5E1] text-[#0A0A0A] text-xs font-bold uppercase tracking-wider rounded-xs hover:border-[#2097A2] transition-colors"
            >
              WhatsApp Support
            </a>
          </div>
        </div>

      </div>

    </div>
  );
};
