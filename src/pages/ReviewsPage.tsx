import React from 'react';
import { PageId } from '../types';
import { CLINIC_INFO } from '../data/clinicData';
import { PageHero } from '../components/PageHero';
import { EmergencyBanner } from '../components/EmergencyBanner';
import { ReviewsSlider } from '../components/ReviewsSlider';
import { Star, ExternalLink, ShieldCheck, CheckCircle2, Info, MapPin, Calendar } from 'lucide-react';

interface ReviewsPageProps {
  onNavigate: (page: PageId) => void;
}

export const ReviewsPage: React.FC<ReviewsPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-light-blue pb-20">
      
      {/* Standardized Master Page Hero */}
      <PageHero
        title="Google Reviews & Ratings"
        eyebrow="Patient Feedback & Transparency"
        subtitle="Authentic, independently hosted reviews on Dr. Farhan Mustafa's official Google Business Profile."
        breadcrumbs={[{ label: 'Reviews' }]}
        onNavigate={onNavigate}
        actions={
          <>
            <button
              onClick={() => onNavigate('appointments')}
              className="btn-primary text-xs !min-h-[44px]"
            >
              <Calendar className="w-4 h-4 text-white" />
              <span>Book Appointment</span>
            </button>
            <a
              href={CLINIC_INFO.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary text-xs !min-h-[44px]"
            >
              <ExternalLink className="w-[18px] h-[18px] text-[#25B3C2]" aria-hidden="true" />
              <span>View Google Maps Profile</span>
            </a>
          </>
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-12">
        <EmergencyBanner />

        {/* Rating Hero Block */}
        <div className="card-standard p-8 sm:p-12 max-w-3xl mx-auto text-center space-y-6 shadow-md">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--brand-blue)]/10 text-[var(--brand-blue)] text-xs font-bold uppercase rounded-[var(--radius-sharp)] border border-[var(--border-subtle)]">
            <ShieldCheck className="w-4 h-4 text-[var(--brand-aqua)]" />
            <span>Independently Verified Google Profile</span>
          </div>

          <div className="flex items-center justify-center gap-1.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-8 h-8 fill-[var(--color-star-gold)] text-[var(--color-star-gold)]" />
            ))}
          </div>

          <div className="space-y-1">
            <div className="text-5xl sm:text-6xl font-extrabold text-[var(--brand-charcoal)] tracking-tight">
              {CLINIC_INFO.googleRating} <span className="text-2xl font-normal text-[var(--color-muted-gray)]">/ 5.0</span>
            </div>
            <p className="text-base text-[var(--brand-charcoal)] font-semibold">
              Based on {CLINIC_INFO.googleReviewCount} Patient Reviews on Google
            </p>
            <p className="text-xs text-[var(--color-muted-gray)]">
              Last verified record date: <strong>{CLINIC_INFO.ratingVerifiedDate}</strong>
            </p>
          </div>

          <p className="text-xs sm:text-sm text-neutral-600 max-w-lg mx-auto leading-relaxed">
            Google Business Profile reviews are submitted directly by patients who have visited HealthPro Medical Complex in Faisal Town, Lahore.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={CLINIC_INFO.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary w-full sm:w-auto text-xs"
            >
              <span>View All 263 Reviews on Google</span>
              <ExternalLink className="w-4 h-4 text-white" />
            </a>

            <button
              onClick={() => onNavigate('appointments')}
              className="btn-secondary w-full sm:w-auto text-xs"
            >
              <Calendar className="w-[18px] h-[18px] text-[#25B3C2]" aria-hidden="true" />
              <span>Book an Appointment</span>
            </button>
          </div>

        </div>

        {/* Interactive Verified Reviews Section */}
        <section aria-labelledby="patient-reviews-heading" className="section-gradient-reviews text-white p-8 md:p-12 rounded-[var(--radius-sm)] border border-[var(--border-strong)] space-y-8 shadow-md">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[var(--footer-icon-blue)] block">
              Patient Testimonials
            </span>
            <h2 id="patient-reviews-heading" className="text-2xl sm:text-3xl font-medium tracking-tight text-white">
              Recent Verified Patient Feedback
            </h2>
            <p className="text-xs sm:text-sm text-neutral-300">
              Browse feedback submitted on Google regarding clinical communication, diagnostic clarity, and treatment outcomes.
            </p>
          </div>

          <ReviewsSlider />
        </section>

        {/* Ethical Review Transparency Policy */}
        <div className="card-standard p-8 max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5 text-[var(--brand-aqua)]" />
            <h2 className="text-lg font-bold text-[var(--brand-charcoal)]">
              Our Healthcare Review & Testimonial Policy
            </h2>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-neutral-700 leading-relaxed">
            <p>
              In accordance with international healthcare transparency principles and medical advertising ethics:
            </p>

            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-[var(--brand-blue)] shrink-0 mt-0.5" />
                <span>
                  <strong>No Fabricated Testimonials:</strong> We do not publish artificial testimonials, paid endorsements, or unverifiable patient quotes.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-[var(--brand-blue)] shrink-0 mt-0.5" />
                <span>
                  <strong>Direct Google Linkage:</strong> All review metrics link directly to Google Maps and our verified Google Place ID (<code className="bg-light-aqua px-1.5 py-0.5 rounded-[var(--radius-sharp)] text-[var(--brand-deep-teal)]">{CLINIC_INFO.googlePlaceId}</code>).
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-[var(--brand-blue)] shrink-0 mt-0.5" />
                <span>
                  <strong>Patient Confidentiality:</strong> We respect patient privacy and never share private medical details or identifiable records in public forums.
                </span>
              </li>
            </ul>
          </div>
        </div>

      </div>

    </div>
  );
};
