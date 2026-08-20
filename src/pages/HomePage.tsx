import React, { useState } from 'react';
import { PageId, ServiceItem } from '../types';
import { CLINIC_INFO, VERIFIED_SERVICES, CLINIC_FAQS, BLOG_POSTS, RESOURCES_LIST } from '../data/clinicData';
import { useCMS } from '../context/CMSContext';
import { 
  Calendar, 
  Bot, 
  MapPin, 
  Phone, 
  MessageCircle, 
  Star, 
  ShieldCheck, 
  ArrowRight, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  Sparkles,
  ExternalLink,
  BookOpen,
  HelpCircle,
  FileText
} from 'lucide-react';

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
  const { doctorProfile } = useCMS();
  const [openFaqId, setOpenFaqId] = useState<string | null>(CLINIC_FAQS[0]?.id || null);

  const toggleFaq = (id: string) => {
    setOpenFaqId(openFaqId === id ? null : id);
  };

  return (
    <div id="home-page-root" className="min-h-screen bg-[#FAFAFA]">
      
      {/* 1. Full-Width Hero Section */}
      <section 
        id="hero-section"
        className="relative bg-gradient-to-br from-[#104D53] via-[#1B808A] to-[#2097A2] text-white py-20 md:py-28 px-4 sm:px-6 lg:px-8 overflow-hidden"
      >
        {/* Subtle geometric medical mesh overlay */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#FFFFFF_1px,transparent_1px)] [background-size:24px_24px]"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#27BAC8]/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          
          {/* Hero Eyebrow */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xs bg-white/15 backdrop-blur-xs border border-white/25 text-xs sm:text-sm font-semibold tracking-wide text-white uppercase">
            <ShieldCheck className="w-4 h-4 text-[#A4E0E5]" />
            <span>Consultant Physician & Internal Medicine Specialist</span>
          </div>

          {/* Master H1 */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight text-white leading-tight">
            Thoughtful medical care, centered on you.
          </h1>

          {/* Master Supporting Text */}
          <p className="text-base sm:text-lg md:text-xl text-white/90 font-normal max-w-2xl mx-auto leading-relaxed">
            Consult Dr. Farhan Mustafa at HealthPro Medical Complex in Faisal Town, Lahore.
          </p>

          {/* Hero Action Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <button
              onClick={() => onNavigate('appointments')}
              id="hero-book-cta"
              className="w-full sm:w-auto px-8 py-4 bg-white text-[#2097A2] hover:bg-[#FAFAFA] text-xs font-bold uppercase tracking-wider rounded-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Appointment</span>
            </button>

            <button
              onClick={onOpenAI}
              id="hero-ai-cta"
              className="w-full sm:w-auto px-6 py-4 bg-white/15 hover:bg-white/25 text-white border border-white/30 text-xs font-bold uppercase tracking-wider rounded-xs transition-all backdrop-blur-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <Bot className="w-4 h-4 text-[#A4E0E5]" />
              <span>Ask the AI Receptionist</span>
            </button>
          </div>

          {/* Tertiary Action Link */}
          <div className="pt-2">
            <a
              href={CLINIC_INFO.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-[#A4E0E5] hover:text-white transition-colors underline underline-offset-4"
            >
              <span>Get Directions to HealthPro Medical Complex</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

        </div>
      </section>

      {/* 2. Trust Strip */}
      <section 
        id="trust-strip"
        className="bg-white border-b border-[#E2E8F0] py-6 px-4 sm:px-6 lg:px-8"
        aria-label="Verified Doctor Credentials & Rating"
      >
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          
          <div className="flex flex-col items-center justify-center p-3">
            <span className="text-sm md:text-base font-bold text-[#0A0A0A]">{CLINIC_INFO.qualifications}</span>
            <span className="text-xs text-[#5B6467] mt-0.5">Specialist Qualifications</span>
          </div>

          <div className="flex flex-col items-center justify-center p-3 border-l border-[#E2E8F0]">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-[#FFD700] text-[#FFD700]" />
              <span className="text-sm md:text-base font-bold text-[#0A0A0A]">{CLINIC_INFO.googleRating} / 5.0</span>
            </div>
            <span className="text-xs text-[#5B6467] mt-0.5">{CLINIC_INFO.googleReviewCount} Google Reviews</span>
          </div>

          <div className="flex flex-col items-center justify-center p-3 border-t md:border-t-0 md:border-l border-[#E2E8F0]">
            <span className="text-sm md:text-base font-bold text-[#0A0A0A]">Faisal Town, Lahore</span>
            <span className="text-xs text-[#5B6467] mt-0.5">HealthPro Medical Complex</span>
          </div>

          <div className="flex flex-col items-center justify-center p-3 border-t md:border-t-0 md:border-l border-[#E2E8F0]">
            <span className="text-sm md:text-base font-bold text-[#2097A2]">By Appointment</span>
            <span className="text-xs text-[#5B6467] mt-0.5">Confirmed Outpatient Slots</span>
          </div>

        </div>
      </section>

      {/* 3. About Dr. Farhan Brief */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left: Doctor Photo */}
          <div className="lg:col-span-5">
            <div className="overflow-hidden rounded-xs border border-[#E2E8F0] bg-white shadow-xs">
              <img
                src={doctorProfile?.photoUrl || '/assets/images/doctor/dr-farhan-about.jpg'}
                alt="Dr. Farhan Mustafa speaking at a lectern."
                className="w-full h-auto object-contain block rounded-xs"
                style={{ width: '100%', height: 'auto' }}
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

          {/* Right: Biography & Philosophy */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-[#2097A2] block">
                About the Physician
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-medium text-[#0A0A0A] tracking-tight">
                {CLINIC_INFO.doctorName}
              </h2>
              <p className="text-sm text-[#2097A2] font-semibold">
                {CLINIC_INFO.title} • {CLINIC_INFO.qualifications}
              </p>
            </div>

            <p className="text-sm sm:text-base text-[#5B6467] leading-relaxed">
              Dr. Farhan Mustafa is a consultant physician and specialist in internal medicine based in Lahore. His clinical practice focuses on diagnostic assessments for complex multi-system conditions, long-term diabetes and blood pressure management, and personalized preventive care for adult patients.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="flex items-start gap-2.5 p-3.5 bg-white border border-[#E2E8F0] rounded-xs">
                <CheckCircle2 className="w-4 h-4 text-[#2097A2] shrink-0 mt-0.5" />
                <div className="text-xs">
                  <strong className="text-[#0A0A0A] block">Diagnostic Accuracy:</strong>
                  Comprehensive review of medical history, prior labs, and clinical symptoms.
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3.5 bg-white border border-[#E2E8F0] rounded-xs">
                <CheckCircle2 className="w-4 h-4 text-[#2097A2] shrink-0 mt-0.5" />
                <div className="text-xs">
                  <strong className="text-[#0A0A0A] block">Patient-Centered:</strong>
                  Transparent discussions, individualized goals, and long-term care plans.
                </div>
              </div>
            </div>

            <div className="pt-4 flex flex-wrap items-center gap-4">
              <button
                onClick={() => onNavigate('about')}
                className="px-6 py-3 bg-[#0A0A0A] text-white hover:bg-[#2097A2] text-xs font-bold uppercase tracking-wider rounded-xs transition-colors"
              >
                Read Full Profile
              </button>
              <button
                onClick={() => onNavigate('appointments')}
                className="px-6 py-3 bg-[#2097A2] text-white hover:bg-[#1B808A] text-xs font-bold uppercase tracking-wider rounded-xs transition-colors"
              >
                Schedule Consultation
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* 4. Featured Care & Services */}
      <section className="bg-white py-16 md:py-24 border-y border-[#E2E8F0] px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2 max-w-2xl">
              <span className="text-xs font-bold uppercase tracking-widest text-[#2097A2] block">
                Clinical Focus Areas
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-medium text-[#0A0A0A] tracking-tight">
                Specialized Internal Medicine Services
              </h2>
              <p className="text-sm text-[#5B6467]">
                Evidence-based care for adult acute and chronic health conditions.
              </p>
            </div>

            <button
              onClick={() => onNavigate('services')}
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#2097A2] hover:text-[#1B808A]"
            >
              <span>View All Services</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {VERIFIED_SERVICES.map((service) => (
              <div
                key={service.id}
                className="bg-[#FAFAFA] border border-[#E2E8F0] hover:border-[#2097A2] p-6 rounded-xs transition-all flex flex-col justify-between group cursor-pointer"
                onClick={() => {
                  onSelectService(service);
                  onNavigate('service-detail');
                }}
              >
                <div className="space-y-3">
                  <span className="text-[11px] font-semibold tracking-wider uppercase text-[#2097A2] bg-[#2097A2]/10 px-2 py-0.5 rounded-xs inline-block">
                    {service.category}
                  </span>
                  <h3 className="text-base sm:text-lg font-semibold text-[#0A0A0A] group-hover:text-[#2097A2] transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-xs text-[#5B6467] leading-relaxed">
                    {service.shortDescription}
                  </p>
                </div>

                <div className="pt-6 mt-4 border-t border-[#E2E8F0] flex items-center justify-between text-xs font-semibold text-[#0A0A0A] group-hover:text-[#2097A2]">
                  <span>Learn more</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 5. Appointment Options */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-[#2097A2] block">
            Flexible Consultations
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-medium text-[#0A0A0A] tracking-tight">
            Consultation Formats
          </h2>
          <p className="text-sm text-[#5B6467]">
            Choose the consultation method that best fits your medical needs and schedule.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          
          {/* In-Clinic Card */}
          <div className="bg-white border-2 border-[#2097A2] p-8 rounded-xs shadow-xs space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#2097A2]/10 text-[#2097A2] text-xs font-bold uppercase rounded-xs">
                <MapPin className="w-3.5 h-3.5" />
                <span>In-Person Consultation</span>
              </div>
              <h3 className="text-xl font-semibold text-[#0A0A0A]">
                HealthPro Medical Complex
              </h3>
              <p className="text-xs sm:text-sm text-[#5B6467] leading-relaxed">
                Comprehensive in-person consultation including full physical examination, direct review of medical records, and personalized management discussion.
              </p>
              <ul className="space-y-2 text-xs text-[#5B6467]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2097A2]" />
                  <span>Located at Faisal Town, Lahore</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2097A2]" />
                  <span>Scheduled by prior confirmation</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => onNavigate('appointments')}
              className="w-full py-3.5 bg-[#2097A2] hover:bg-[#1B808A] text-white text-xs font-bold uppercase tracking-wider rounded-xs transition-colors"
            >
              Request In-Clinic Appointment
            </button>
          </div>

          {/* Online Video Consultation Card */}
          <div className="bg-white border border-[#CBD5E1] hover:border-[#2097A2] p-8 rounded-xs space-y-6 flex flex-col justify-between transition-colors">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FAFAFA] text-[#0A0A0A] border border-[#CBD5E1] text-xs font-bold uppercase rounded-xs">
                <Calendar className="w-3.5 h-3.5 text-[#2097A2]" />
                <span>Online Consultation</span>
              </div>
              <h3 className="text-xl font-semibold text-[#0A0A0A]">
                Video & Follow-Up Review
              </h3>
              <p className="text-xs sm:text-sm text-[#5B6467] leading-relaxed">
                For patients outside Lahore or routine follow-up reviews of lab results, ongoing medication adjustments, and medical second opinions.
              </p>
              <ul className="space-y-2 text-xs text-[#5B6467]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2097A2]" />
                  <span>Digital review of previous lab reports</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2097A2]" />
                  <span>Secure digital consultation slots</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => onNavigate('appointments')}
              className="w-full py-3.5 bg-[#0A0A0A] hover:bg-[#2097A2] text-white text-xs font-bold uppercase tracking-wider rounded-xs transition-colors"
            >
              Request Online Consultation
            </button>
          </div>

        </div>
      </section>

      {/* 6. Google Trust & Reviews Section */}
      <section className="bg-white border-y border-[#E2E8F0] py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <span className="text-xs font-bold uppercase tracking-widest text-[#2097A2] block">
            Google Business Profile Verification
          </span>

          <div className="flex items-center justify-center gap-1.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-6 h-6 fill-[#FFD700] text-[#FFD700]" />
            ))}
          </div>

          <div className="space-y-1">
            <h3 className="text-3xl sm:text-4xl font-bold text-[#0A0A0A]">
              5.0 Star Rating
            </h3>
            <p className="text-sm text-[#5B6467]">
              Based on <strong>263 verified Google reviews</strong> (Observed {CLINIC_INFO.ratingVerifiedDate})
            </p>
          </div>

          <p className="text-xs sm:text-sm text-[#5B6467] max-w-xl mx-auto leading-relaxed">
            In compliance with healthcare transparency standards, all patient ratings are verified through our official Google Business Profile. We do not publish fabricated quotations or unverified reviews.
          </p>

          <div className="pt-2 flex flex-wrap justify-center gap-4">
            <a
              href={CLINIC_INFO.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-[#FAFAFA] border border-[#CBD5E1] hover:border-[#2097A2] text-[#0A0A0A] text-xs font-bold uppercase tracking-wider rounded-xs transition-all inline-flex items-center gap-2"
            >
              <span>View Reviews on Google</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#2097A2]" />
            </a>
            <button
              onClick={() => onNavigate('reviews')}
              className="px-6 py-3 bg-[#2097A2] text-white hover:bg-[#1B808A] text-xs font-bold uppercase tracking-wider rounded-xs transition-all"
            >
              Reviews Policy & Verification
            </button>
          </div>
        </div>
      </section>

      {/* 7. AI Receptionist Callout */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-[#FAFAFA] to-[#E6F7F8] border border-[#A4E0E5] p-8 md:p-12 rounded-xs grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#2097A2]/10 text-[#2097A2] text-xs font-bold uppercase rounded-xs">
              <Bot className="w-4 h-4" />
              <span>Smart Clinic Receptionist</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-medium text-[#0A0A0A]">
              Have a question about appointments or clinic location?
            </h3>
            <p className="text-sm text-[#5B6467] leading-relaxed">
              Dr. Farhan's AI Receptionist is available 24/7 in <strong>English, Urdu, and Roman Urdu</strong> to help you request an appointment, check directions, or understand clinic policies.
            </p>
            <p className="text-xs text-[#5B6467] italic">
              * Note: The AI assistant handles clinic administrative guidance only. It does not provide medical diagnoses, symptom assessments, or prescriptions.
            </p>
          </div>

          <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-center">
            <button
              onClick={onOpenAI}
              className="px-6 py-4 bg-[#2097A2] hover:bg-[#1B808A] text-white text-xs font-bold uppercase tracking-wider rounded-xs transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <Bot className="w-4 h-4" />
              <span>Ask AI Receptionist</span>
            </button>
            <a
              href={CLINIC_INFO.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 bg-white border border-[#2097A2] text-[#2097A2] hover:bg-[#2097A2] hover:text-white text-xs font-bold uppercase tracking-wider rounded-xs transition-all flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp Reception</span>
            </a>
          </div>
        </div>
      </section>

      {/* 8. FAQs Section */}
      <section className="bg-white border-t border-[#E2E8F0] py-16 md:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#2097A2] block">
              Patient Inquiries
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-medium text-[#0A0A0A] tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-[#5B6467]">
              Approved administrative and clinical consultation information.
            </p>
          </div>

          <div className="space-y-4" role="region" aria-label="Frequently Asked Questions Accordion">
            {CLINIC_FAQS.map((faq) => (
              <div
                key={faq.id}
                className="border border-[#E2E8F0] rounded-xs overflow-hidden transition-colors"
              >
                <button
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full text-left p-5 bg-[#FAFAFA] hover:bg-white flex items-center justify-between gap-4 font-semibold text-sm sm:text-base text-[#0A0A0A] transition-colors cursor-pointer"
                  aria-expanded={openFaqId === faq.id}
                >
                  <span>{faq.question}</span>
                  {openFaqId === faq.id ? (
                    <ChevronUp className="w-4 h-4 text-[#2097A2] shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#5B6467] shrink-0" />
                  )}
                </button>

                {openFaqId === faq.id && (
                  <div className="p-5 bg-white border-t border-[#E2E8F0] text-xs sm:text-sm text-[#5B6467] leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="text-center pt-4">
            <button
              onClick={() => onNavigate('contact')}
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#2097A2] hover:underline"
            >
              <span>Have a different question? Contact our clinic staff</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* 9. Location & Contact Snapshot */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white border border-[#E2E8F0] p-6 sm:p-10 rounded-xs">
          
          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs font-bold uppercase tracking-widest text-[#2097A2] block">
              Clinic Location
            </span>
            <h2 className="text-2xl sm:text-3xl font-medium text-[#0A0A0A] tracking-tight">
              HealthPro Medical Complex
            </h2>
            
            <div className="space-y-4 text-xs sm:text-sm text-[#5B6467]">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#2097A2] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#0A0A0A] block">Clinic Address:</strong>
                  {CLINIC_INFO.address}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-[#2097A2] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#0A0A0A] block">Direct Telephone:</strong>
                  <a href={`tel:${CLINIC_INFO.phoneIntl}`} className="text-[#2097A2] font-semibold hover:underline">
                    {CLINIC_INFO.phone}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-[#2097A2] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#0A0A0A] block">Consultation Schedule:</strong>
                  Consultations conducted by confirmed appointment slots. Online booking requests can be submitted 24/7.
                </div>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap gap-3">
              <a
                href={CLINIC_INFO.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 bg-[#2097A2] text-white text-xs font-bold uppercase tracking-wider rounded-xs hover:bg-[#1B808A] transition-colors inline-flex items-center gap-2"
              >
                <span>Get Google Directions</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={() => onNavigate('contact')}
                className="px-5 py-3 bg-[#FAFAFA] border border-[#CBD5E1] text-[#0A0A0A] text-xs font-bold uppercase tracking-wider rounded-xs hover:border-[#2097A2] transition-colors"
              >
                View Contact Page
              </button>
            </div>
          </div>

          {/* Map Preview Graphic */}
          <div className="lg:col-span-6 h-64 sm:h-80 bg-[#FAFAFA] border border-[#E2E8F0] rounded-xs flex flex-col items-center justify-center text-center p-6 relative overflow-hidden">
            <div className="w-12 h-12 rounded-full bg-[#2097A2]/10 border border-[#2097A2]/30 flex items-center justify-center mb-3">
              <MapPin className="w-6 h-6 text-[#2097A2]" />
            </div>
            <h4 className="font-semibold text-sm text-[#0A0A0A]">Faisal Town, Lahore</h4>
            <p className="text-xs text-[#5B6467] mt-1 max-w-xs leading-relaxed">
              HealthPro Medical Complex, 860-B, Block B, Faisal Town, Lahore 54000
            </p>
            <a
              href={CLINIC_INFO.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 px-4 py-2 bg-white border border-[#CBD5E1] hover:border-[#2097A2] text-xs font-semibold text-[#2097A2] rounded-xs shadow-2xs inline-flex items-center gap-1.5"
            >
              <span>Open Interactive Google Map</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

        </div>
      </section>

      {/* 10. Latest Articles Preview */}
      <section className="bg-white border-t border-[#E2E8F0] py-16 md:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2 max-w-2xl">
              <span className="text-xs font-bold uppercase tracking-widest text-[#2097A2] block">
                Educational Articles
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-medium text-[#0A0A0A] tracking-tight">
                Medical Insights for Patients
              </h2>
            </div>
            <button
              onClick={() => onNavigate('blog')}
              className="text-xs font-bold uppercase tracking-wider text-[#2097A2] hover:underline inline-flex items-center gap-1"
            >
              <span>View All Articles</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {BLOG_POSTS.map((post) => (
              <article
                key={post.id}
                className="bg-[#FAFAFA] border border-[#E2E8F0] p-6 rounded-xs flex flex-col justify-between hover:border-[#2097A2] transition-colors cursor-pointer group"
                onClick={() => onNavigate('blog')}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-[#5B6467]">
                    <span className="font-semibold text-[#2097A2]">{post.category}</span>
                    <span>{post.publishedDate}</span>
                  </div>
                  <h3 className="text-base font-semibold text-[#0A0A0A] group-hover:text-[#2097A2] transition-colors leading-snug">
                    {post.title}
                  </h3>
                  <p className="text-xs text-[#5B6467] leading-relaxed line-clamp-3">
                    {post.summary}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-[#E2E8F0] flex items-center justify-between text-xs font-semibold text-[#2097A2]">
                  <span>Read full guide</span>
                  <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </article>
            ))}
          </div>

        </div>
      </section>

      {/* 11. Final Call to Action */}
      <section className="bg-[#0A0A0A] text-white py-16 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <span className="text-xs font-bold uppercase tracking-widest text-[#27BAC8] block">
            Start Your Consultation
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-medium tracking-tight text-white">
            Schedule an appointment with Dr. Farhan Mustafa
          </h2>
          <p className="text-sm text-neutral-300 max-w-xl mx-auto leading-relaxed">
            In-clinic consultations at HealthPro Medical Complex, Faisal Town, Lahore, and secure online video consultations.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => onNavigate('appointments')}
              className="w-full sm:w-auto px-8 py-4 bg-[#2097A2] hover:bg-[#1B808A] text-white text-xs font-bold uppercase tracking-wider rounded-xs transition-colors shadow-sm cursor-pointer"
            >
              Book In-Clinic Appointment
            </button>
            <a
              href={CLINIC_INFO.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-4 bg-white/10 hover:bg-white/20 border border-white/30 text-white text-xs font-bold uppercase tracking-wider rounded-xs transition-colors inline-flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4 text-[#A4E0E5]" />
              <span>WhatsApp: {CLINIC_INFO.phone}</span>
            </a>
          </div>
        </div>
      </section>

    </div>
  );
};
