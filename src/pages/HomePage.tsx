import React, { useState } from 'react';
import { PageId, ServiceItem } from '../types';
import { VERIFIED_SERVICES, CLINIC_FAQS, BLOG_POSTS } from '../data/clinicData';
import { useCMS } from '../context/CMSContext';
import { ReviewsSlider } from '../components/ReviewsSlider';
import { 
  Calendar, 
  Bot, 
  MapPin, 
  Phone, 
  Star, 
  ShieldCheck, 
  ArrowRight, 
  Clock, 
  Plus,
  Minus,
  CheckCircle2, 
  Sparkles,
  ExternalLink,
  BookOpen,
  Award,
  Stethoscope,
  Activity
} from 'lucide-react';
import { WhatsAppIcon } from '../components/WhatsAppIcon';

interface HomePageProps {
  onNavigate: (page: PageId) => void;
  onSelectService: (service: ServiceItem) => void;
  onOpenAI: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  onSelectService,
  onOpenAI
}) => {
  const { clinicInfo, doctorProfile } = useCMS();
  const [openFaqId, setOpenFaqId] = useState<string | null>(CLINIC_FAQS[0]?.id || null);

  const toggleFaq = (id: string) => {
    setOpenFaqId(openFaqId === id ? null : id);
  };

  return (
    <div id="home-page-root" className="min-h-screen">
      
      {/* 1. Full-Width Hero Section with Background Video */}
      <section 
        id="hero-section"
        className="hero-container relative min-h-[560px] md:min-h-[620px] flex items-center justify-center text-white py-16 md:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden bg-[var(--brand-black)]"
      >
        {/* Background Video with Poster Fallback */}
        <video
          className="hero-background-video"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/assets/images/hero-video-poster.webp"
          aria-hidden="true"
        >
          <source src="/assets/videos/dr-farhan-hero.webm" type="video/webm" />
          <source src="/assets/videos/dr-farhan-hero.mp4" type="video/mp4" />
        </video>

        {/* Deep blue brand gradient overlay for high contrast & WCAG AAA readability */}
        <div className="hero-overlay"></div>

        {/* Hero Content */}
        <div className="hero-content relative z-10 max-w-4xl mx-auto text-center space-y-6">
          
          {/* Hero Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-[var(--radius-sm)] bg-white/10 backdrop-blur-md border border-white/25 text-xs sm:text-[13px] font-semibold tracking-wide text-[var(--footer-icon-blue)]">
            <span className="w-2 h-2 rounded-full bg-[var(--brand-aqua)] animate-pulse"></span>
            <span>Consultant Physician & Internal Medicine Specialist</span>
          </div>

          {/* Master H1 */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight text-white leading-tight">
            Thoughtful medical care, centered on you.
          </h1>

          {/* Master Supporting Text */}
          <p className="text-base sm:text-lg md:text-xl text-neutral-200 font-normal max-w-2xl mx-auto leading-relaxed">
            Specialized clinical consultation with {clinicInfo.doctorName} at HealthPro Medical Complex in Faisal Town, Lahore.
          </p>

          {/* Hero Action Buttons: Blue Left, Black Right */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4">
            {/* Primary Blue Button on Left */}
            <button
              onClick={() => onNavigate('appointments')}
              id="hero-book-cta"
              className="btn-primary w-full sm:w-auto min-h-[48px] px-8 text-xs uppercase tracking-wider"
            >
              <Calendar className="button-icon text-white" />
              <span>Book Appointment</span>
            </button>

            {/* Secondary Black Button on Right */}
            <button
              onClick={onOpenAI}
              id="hero-ai-cta"
              className="btn-secondary w-full sm:w-auto min-h-[48px] px-7 text-xs uppercase tracking-wider"
            >
              <Bot className="button-icon text-[#25B3C2]" aria-hidden="true" />
              <span>Ask AI Receptionist</span>
            </button>
          </div>

          {/* Tertiary Action Link */}
          <div className="pt-2">
            <a
              href={clinicInfo.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-[var(--footer-icon-blue)] hover:text-white transition-colors underline underline-offset-4 font-medium"
            >
              <span>Get Directions to HealthPro Medical Complex, Faisal Town</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

        </div>
      </section>

      {/* 2. Trust Strip (Light Blue Background) */}
      <section 
        id="trust-strip"
        className="bg-light-blue border-b border-[var(--border-subtle)] py-6 px-4 sm:px-6 lg:px-8"
        aria-label="Verified Doctor Credentials & Rating"
      >
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          
          <div className="flex flex-col items-center justify-center p-2">
            <span className="text-sm md:text-base font-bold text-[var(--brand-charcoal)]">{clinicInfo.qualifications}</span>
            <span className="text-xs text-[var(--color-muted-gray)] font-medium mt-0.5">Specialist Qualifications</span>
          </div>

          <div className="flex flex-col items-center justify-center p-2 border-l border-[var(--border-subtle)]">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-[var(--color-star-gold)] text-[var(--color-star-gold)]" />
              <span className="text-sm md:text-base font-bold text-[var(--brand-charcoal)]">{clinicInfo.googleRating} / 5.0</span>
            </div>
            <span className="text-xs text-[var(--color-muted-gray)] font-medium mt-0.5">{clinicInfo.googleReviewCount} Google Reviews</span>
          </div>

          <div className="flex flex-col items-center justify-center p-2 border-t md:border-t-0 md:border-l border-[var(--border-subtle)]">
            <span className="text-sm md:text-base font-bold text-[var(--brand-charcoal)]">Faisal Town, Lahore</span>
            <span className="text-xs text-[var(--color-muted-gray)] font-medium mt-0.5">HealthPro Medical Complex</span>
          </div>

          <div className="flex flex-col items-center justify-center p-2 border-t md:border-t-0 md:border-l border-[var(--border-subtle)]">
            <span className="text-sm md:text-base font-bold text-[var(--brand-charcoal)]">Confirmed Slots</span>
            <span className="text-xs text-[var(--color-muted-gray)] font-medium mt-0.5">By Prior Appointment</span>
          </div>

        </div>
      </section>

      {/* 3. About Dr. Farhan (Soft Pink Background) */}
      <section className="bg-soft-pink py-16 md:py-24 px-4 sm:px-6 lg:px-8 border-b border-[var(--border-subtle)]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left: Approved Doctor Photo */}
          <div className="lg:col-span-5">
            <div className="overflow-hidden rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-white shadow-md">
              <img
                src={doctorProfile?.photoUrl || '/assets/images/doctor/dr-farhan-about.jpg'}
                alt="Dr. Farhan Mustafa speaking at a lectern."
                className="w-full h-auto object-contain block rounded-[var(--radius-sm)]"
                style={{ width: '100%', height: 'auto' }}
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

          {/* Right: Biography & Philosophy */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-[var(--brand-blue)] block">
                About the Physician
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-medium text-[var(--brand-charcoal)] tracking-tight">
                {clinicInfo.doctorName}
              </h2>
              <p className="text-sm text-[var(--brand-blue)] font-semibold">
                {clinicInfo.title} • {clinicInfo.qualifications}
              </p>
            </div>

            <p className="text-sm sm:text-base text-neutral-700 leading-relaxed">
              Dr. Farhan Mustafa is an established consultant physician and internal medicine specialist in Lahore. His outpatient practice specializes in thorough diagnostic investigations for complex symptoms, clinical management of hypertension and diabetes, and personalized preventive care for adult patients.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              <div className="card-standard p-4 flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-[var(--brand-blue)] shrink-0 mt-0.5" />
                <div className="text-xs text-neutral-700">
                  <strong className="text-[var(--brand-charcoal)] block mb-0.5 font-bold">Diagnostic Accuracy:</strong>
                  Detailed clinical evaluation of patient history, physical findings, and previous laboratory diagnostics.
                </div>
              </div>

              <div className="card-standard p-4 flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-[var(--brand-blue)] shrink-0 mt-0.5" />
                <div className="text-xs text-neutral-700">
                  <strong className="text-[var(--brand-charcoal)] block mb-0.5 font-bold">Patient Partnership:</strong>
                  Transparent discussions, individualized lifestyle strategies, and structured treatment reviews.
                </div>
              </div>
            </div>

            {/* Paired Action Buttons: Blue Left, Black Right */}
            <div className="pt-4 flex flex-col sm:flex-row items-center gap-3.5">
              <button
                onClick={() => onNavigate('appointments')}
                className="btn-primary w-full sm:w-auto"
              >
                <Calendar className="w-4 h-4 mr-1 text-white" />
                <span>Schedule Consultation</span>
              </button>
              <button
                onClick={() => onNavigate('about')}
                className="btn-secondary w-full sm:w-auto"
              >
                <BookOpen className="w-[18px] h-[18px] text-[#25B3C2]" aria-hidden="true" />
                <span>Read Full Biography</span>
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* 4. Featured Care & Services (Soft Blue Gradient) */}
      <section className="section-gradient-care py-16 md:py-24 border-b border-[var(--border-subtle)] px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2 max-w-2xl">
              <span className="text-xs font-bold uppercase tracking-widest text-[var(--brand-blue)] block">
                Clinical Focus Areas
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-medium text-[var(--brand-charcoal)] tracking-tight">
                Specialized Internal Medicine Services
              </h2>
              <p className="text-sm text-neutral-600">
                Evidence-based diagnostic and therapeutic care for adult acute and chronic health conditions.
              </p>
            </div>

            <button
              onClick={() => onNavigate('services')}
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--brand-blue)] hover:text-[var(--brand-deep-teal)] transition-colors cursor-pointer"
            >
              <span>View All Services</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Services Grid with 3D Card Hover */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {VERIFIED_SERVICES.map((service) => (
              <div
                key={service.id}
                className="card-standard p-6 flex flex-col justify-between group cursor-pointer"
                onClick={() => {
                  onSelectService(service);
                  onNavigate('service-detail');
                }}
              >
                <div className="space-y-3">
                  <span className="text-[10px] font-bold tracking-wider uppercase text-[var(--brand-blue)] bg-[var(--brand-blue)]/10 px-2 py-0.5 rounded-[var(--radius-sharp)] inline-block border border-[var(--border-subtle)]">
                    {service.category}
                  </span>
                  <h3 className="text-base font-bold text-[var(--brand-charcoal)] transition-colors leading-snug">
                    {service.title}
                  </h3>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    {service.shortDescription}
                  </p>
                </div>

                <div className="pt-6 mt-4 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs font-semibold text-[var(--brand-blue)]">
                  <span>Learn more</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 5. Consultation Options (Light Aqua Background) */}
      <section className="bg-light-aqua py-16 md:py-24 px-4 sm:px-6 lg:px-8 border-b border-[var(--border-subtle)]">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[var(--brand-blue)] block">
              Flexible Consultations
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-medium text-[var(--brand-charcoal)] tracking-tight">
              Consultation Formats
            </h2>
            <p className="text-sm text-neutral-600">
              Choose the consultation format that matches your clinical needs and location.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            
            {/* In-Clinic Card */}
            <div className="card-standard p-8 space-y-6 flex flex-col justify-between border-t-4 border-t-[var(--brand-blue)]">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--brand-blue)]/15 text-[var(--brand-blue)] text-xs font-bold uppercase rounded-[var(--radius-sharp)]">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>In-Person Consultation</span>
                </div>
                <h3 className="text-xl font-bold text-[var(--brand-charcoal)]">
                  HealthPro Medical Complex
                </h3>
                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                  Comprehensive in-person consultation including vital sign assessment, physical examination, direct review of medical files, and personalized management discussion.
                </p>
                <ul className="space-y-2.5 text-xs text-neutral-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[var(--brand-blue)]" />
                    <span>Located at Faisal Town, Lahore</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[var(--brand-blue)]" />
                    <span>Individual confirmed appointment slots</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => onNavigate('appointments')}
                className="btn-primary w-full justify-center"
              >
                <Calendar className="w-4 h-4 mr-1 text-white" />
                <span>Request In-Clinic Slot</span>
              </button>
            </div>

            {/* Online Video Consultation Card */}
            <div className="card-standard p-8 space-y-6 flex flex-col justify-between border-t-4 border-t-[var(--brand-aqua)]">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--brand-aqua)]/15 text-[var(--brand-deep-teal)] text-xs font-bold uppercase rounded-[var(--radius-sharp)]">
                  <Calendar className="w-3.5 h-3.5 text-[var(--brand-blue)]" />
                  <span>Online Consultation</span>
                </div>
                <h3 className="text-xl font-bold text-[var(--brand-charcoal)]">
                  Video & Follow-Up Review
                </h3>
                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                  For patients outside Lahore or routine follow-up reviews of lab results, ongoing medication adjustments, and medical second opinions.
                </p>
                <ul className="space-y-2.5 text-xs text-neutral-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[var(--brand-blue)]" />
                    <span>Digital review of diagnostic reports</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[var(--brand-blue)]" />
                    <span>Secure scheduled video consultation</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => onNavigate('appointments')}
                className="btn-secondary w-full justify-center"
              >
                <Calendar className="w-[18px] h-[18px] text-[#25B3C2]" aria-hidden="true" />
                <span>Request Online Video Slot</span>
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* 6. Qualifications & Clinical Strengths (Soft Lilac Background) */}
      <section className="bg-soft-lilac py-16 md:py-24 px-4 sm:px-6 lg:px-8 border-b border-[var(--border-subtle)]">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[var(--brand-blue)] block">
              Professional Standards
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-medium text-[var(--brand-charcoal)] tracking-tight">
              Clinical Excellence & Qualifications
            </h2>
            <p className="text-sm text-neutral-600">
              Rigorous medical credentials and evidence-based diagnostic protocols.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card-standard p-6 space-y-3">
              <div className="w-10 h-10 rounded-[var(--radius-sm)] bg-[var(--brand-blue)]/15 flex items-center justify-center text-[var(--brand-blue)]">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[var(--brand-charcoal)]">FCPS & MRCP (UK)</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Postgraduate fellowship in Internal Medicine from CPSP Pakistan and membership of the Royal College of Physicians UK.
              </p>
            </div>

            <div className="card-standard p-6 space-y-3">
              <div className="w-10 h-10 rounded-[var(--radius-sm)] bg-[var(--brand-blue)]/15 flex items-center justify-center text-[var(--brand-blue)]">
                <Stethoscope className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[var(--brand-charcoal)]">Comprehensive History</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Unrushed consultations dedicating ample time to review previous lab investigations, family history, and lifestyle factors.
              </p>
            </div>

            <div className="card-standard p-6 space-y-3">
              <div className="w-10 h-10 rounded-[var(--radius-sm)] bg-[var(--brand-blue)]/15 flex items-center justify-center text-[var(--brand-blue)]">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[var(--brand-charcoal)]">Rational Therapeutics</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Conservative and evidence-aligned drug prescriptions, avoiding polypharmacy and excessive unnecessary diagnostics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Google Trust & Reviews Section (Deep Blue Gradient) */}
      <section className="section-gradient-reviews text-white py-16 md:py-24 px-4 sm:px-6 lg:px-8 border-b border-[var(--border-strong)]">
        <div className="max-w-7xl mx-auto space-y-10">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[var(--radius-sharp)] bg-white/10 border border-white/20 text-xs font-bold uppercase tracking-wider text-[var(--footer-icon-blue)]">
              <ShieldCheck className="w-3.5 h-3.5 text-[var(--brand-aqua)]" />
              <span>Google Business Profile Verification</span>
            </div>

            <div className="flex items-center justify-center gap-1 pt-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-[var(--color-star-gold)] text-[var(--color-star-gold)]" />
              ))}
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-medium tracking-tight text-white">
              {clinicInfo.googleRating} Star Rating • {clinicInfo.googleReviewCount} Patient Reviews
            </h2>

            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
              In accordance with healthcare ethics and transparency guidelines, all reviews reflect genuine public feedback submitted on our verified Google Maps listing.
            </p>
          </div>

          {/* Interactive Reviews Slider */}
          <ReviewsSlider />

        </div>
      </section>

      {/* 8. AI Clinic Receptionist Callout (Soft Blue-Pink Gradient) */}
      <section className="section-gradient-receptionist py-16 md:py-24 px-4 sm:px-6 lg:px-8 border-b border-[var(--border-subtle)]">
        <div className="max-w-7xl mx-auto">
          <div className="card-standard border border-[var(--border-strong)] p-8 md:p-12 rounded-[var(--radius-sm)] shadow-lg grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white/95 backdrop-blur-md">
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--brand-blue)]/15 text-[var(--brand-blue)] text-xs font-bold uppercase rounded-[var(--radius-sharp)]">
                <Bot className="w-4 h-4 text-[var(--brand-blue)]" />
                <span>Smart Clinic Receptionist</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-[var(--brand-charcoal)] tracking-tight">
                Have questions about booking or clinic location?
              </h3>
              <p className="text-sm text-neutral-700 leading-relaxed">
                Dr. Farhan's AI Receptionist is available 24/7 in <strong>English, Urdu, and Roman Urdu</strong> to assist with outpatient scheduling, fee policies, pre-visit instructions, and directions.
              </p>
              <p className="text-xs text-neutral-500 italic">
                * Administrative clinic guidance only. Not an emergency service or substitute for medical diagnosis.
              </p>
            </div>

            {/* Paired Buttons: Blue Left, Black Right */}
            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3.5 justify-center">
              <button
                onClick={onOpenAI}
                className="btn-primary justify-center min-h-[46px]"
              >
                <Bot className="button-icon text-white" />
                <span>Ask AI Receptionist</span>
              </button>
              <a
                href={clinicInfo.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary justify-center min-h-[46px]"
              >
                <WhatsAppIcon className="button-icon text-[#25B3C2]" aria-hidden="true" />
                <span>WhatsApp Reception</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Location & Interactive Google Map Snapshot (Pale Blue Background) */}
      <section className="bg-light-blue py-16 md:py-24 px-4 sm:px-6 lg:px-8 border-b border-[var(--border-subtle)]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center card-standard p-6 sm:p-10 rounded-[var(--radius-sm)]">
            
            <div className="lg:col-span-5 space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-widest text-[var(--brand-blue)] block">
                  Clinic Location
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-[var(--brand-charcoal)] tracking-tight">
                  HealthPro Medical Complex
                </h2>
              </div>
              
              <div className="space-y-4 text-xs sm:text-sm text-neutral-700">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[var(--brand-blue)] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[var(--brand-charcoal)] block font-bold">Clinic Address:</strong>
                    {clinicInfo.address}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-[var(--brand-blue)] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[var(--brand-charcoal)] block font-bold">Direct Telephone:</strong>
                    <a href={`tel:${clinicInfo.phoneIntl || clinicInfo.phone}`} className="text-[var(--brand-blue)] font-bold hover:underline">
                      {clinicInfo.phoneDisplay || clinicInfo.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-[var(--brand-blue)] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[var(--brand-charcoal)] block font-bold">Consultation Schedule:</strong>
                    {clinicInfo.profileHoursNotice}
                  </div>
                </div>
              </div>

              {/* Paired Buttons: Blue Left, Black Right */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3.5">
                <a
                  href={clinicInfo.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                >
                  <span>Get Google Directions</span>
                  <ExternalLink className="w-3.5 h-3.5 ml-1 text-white" />
                </a>
                <button
                  onClick={() => onNavigate('contact')}
                  className="btn-secondary"
                >
                  <Phone className="w-[18px] h-[18px] text-[#25B3C2]" aria-hidden="true" />
                  <span>Contact Details</span>
                </button>
              </div>
            </div>

            {/* Interactive Google Map Embed */}
            <div className="lg:col-span-7 h-72 sm:h-96 rounded-[var(--radius-sm)] overflow-hidden border border-[var(--border-subtle)] shadow-inner relative">
              <iframe
                title="HealthPro Medical Complex Location"
                src="https://maps.google.com/maps?q=HealthPro%20Medical%20Complex%20Faisal%20Town%20Lahore&t=&z=16&ie=UTF8&iwloc=&output=embed"
                className="w-full h-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

          </div>
        </div>
      </section>

      {/* 10. Educational Articles (Soft Pink Background) */}
      <section className="bg-soft-pink py-16 md:py-24 px-4 sm:px-6 lg:px-8 border-b border-[var(--border-subtle)]">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2 max-w-2xl">
              <span className="text-xs font-bold uppercase tracking-widest text-[var(--brand-blue)] block">
                Patient Education
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-medium text-[var(--brand-charcoal)] tracking-tight">
                Medical Insights & Health Guides
              </h2>
              <p className="text-sm text-neutral-600">
                Evidence-based articles written to help patients manage chronic conditions and make informed healthcare decisions.
              </p>
            </div>
            <button
              onClick={() => onNavigate('blog')}
              className="text-xs font-bold uppercase tracking-wider text-[var(--brand-blue)] hover:text-[var(--brand-deep-teal)] inline-flex items-center gap-1 cursor-pointer"
            >
              <span>View All 6 Articles</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 3x2 Grid with Local AI-Generated 16:9 Featured Images */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {BLOG_POSTS.map((post) => (
              <article
                key={post.id}
                className="card-standard overflow-hidden flex flex-col justify-between group cursor-pointer"
                onClick={() => onNavigate('blog')}
              >
                {/* 16:9 Featured Image */}
                <div className="w-full aspect-video overflow-hidden bg-neutral-100 border-b border-[var(--border-subtle)] relative">
                  <img
                    src={post.featuredImage || `/assets/images/articles/${post.slug}.jpg`}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs text-[var(--color-muted-gray)]">
                      <span className="font-bold text-[var(--brand-blue)] bg-[var(--brand-blue)]/10 px-2 py-0.5 rounded-[var(--radius-sharp)] border border-[var(--border-subtle)]">
                        {post.category}
                      </span>
                      <span className="font-medium">{post.readTime || '4 min read'}</span>
                    </div>
                    <h3 className="text-base font-bold text-[var(--brand-charcoal)] transition-colors leading-snug">
                      {post.title}
                    </h3>
                    <p className="text-xs text-neutral-600 leading-relaxed line-clamp-3">
                      {post.summary}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs font-semibold text-[var(--brand-blue)]">
                    <span>Read full guide</span>
                    <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </article>
            ))}
          </div>

        </div>
      </section>

      {/* 11. FAQs Section (Light Blue to Soft Lilac Gradient) */}
      <section className="section-gradient-faqs py-16 md:py-24 px-4 sm:px-6 lg:px-8 border-b border-[var(--border-subtle)]">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[var(--brand-blue)] block">
              Patient Inquiries
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-medium text-[var(--brand-charcoal)] tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-neutral-600">
              Clear answers regarding appointments, fees, and consultation procedures.
            </p>
          </div>

          <div className="space-y-3" role="region" aria-label="Frequently Asked Questions Accordion">
            {CLINIC_FAQS.map((faq) => {
              const isOpen = openFaqId === faq.id;
              return (
                <div
                  key={faq.id}
                  data-state={isOpen ? 'open' : 'closed'}
                  className="faq-accordion-item overflow-hidden"
                >
                  <button
                    onClick={() => toggleFaq(faq.id)}
                    className="faq-trigger w-full text-left p-5 flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-[var(--brand-charcoal)] transition-colors cursor-pointer"
                    aria-expanded={isOpen}
                    aria-controls={`faq-content-${faq.id}`}
                    id={`faq-header-${faq.id}`}
                  >
                    <span className="faq-question transition-colors">{faq.question}</span>
                    <span className="p-1 rounded-[var(--radius-sharp)] bg-[var(--brand-blue)]/10 text-[var(--brand-blue)] shrink-0">
                      {isOpen ? (
                        <Minus className="w-4 h-4" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                    </span>
                  </button>

                  {isOpen && (
                    <div 
                      id={`faq-content-${faq.id}`}
                      role="region"
                      aria-labelledby={`faq-header-${faq.id}`}
                      className="p-5 pt-0 text-xs sm:text-sm text-neutral-700 leading-relaxed"
                    >
                      <div className="pt-3 border-t border-[var(--border-subtle)]">
                        {faq.answer}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="text-center pt-4">
            <button
              onClick={() => onNavigate('contact')}
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--brand-blue)] hover:underline"
            >
              <span>Have a specific inquiry? Contact our clinic team</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* 12. Final Call to Action (Deep Brand Blue Gradient) */}
      <section className="section-gradient-cta text-white py-16 md:py-24 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <span className="text-xs font-bold uppercase tracking-widest text-[var(--footer-icon-blue)] block">
            Start Your Consultation
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-medium tracking-tight text-white">
            Schedule an appointment with {clinicInfo.doctorName}
          </h2>
          <p className="text-sm text-neutral-200 max-w-xl mx-auto leading-relaxed">
            In-clinic consultations at HealthPro Medical Complex in Faisal Town, Lahore, and secure online video consultations.
          </p>

          {/* Paired Action Buttons: Blue Left, Black Right */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4">
            <button
              onClick={() => onNavigate('appointments')}
              className="btn-primary w-full sm:w-auto min-h-[48px] px-8 text-xs uppercase tracking-wider"
            >
              <Calendar className="button-icon text-white" />
              <span>Book In-Clinic Slot</span>
            </button>
            <a
              href={clinicInfo.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary w-full sm:w-auto min-h-[48px] px-7 text-xs uppercase tracking-wider"
            >
              <WhatsAppIcon className="button-icon text-[#25B3C2]" aria-hidden="true" />
              <span>WhatsApp: {clinicInfo.phone}</span>
            </a>
          </div>
        </div>
      </section>

    </div>
  );
};
