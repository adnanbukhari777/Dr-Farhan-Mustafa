import React, { useState } from 'react';
import { PageId } from '../types';
import { CLINIC_INFO } from '../data/clinicData';
import { useCMS } from '../context/CMSContext';
import { PageHero } from '../components/PageHero';
import { EmergencyBanner } from '../components/EmergencyBanner';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  ExternalLink, 
  Send, 
  CheckCircle2, 
  ShieldAlert,
  Calendar
} from 'lucide-react';
import { WhatsAppIcon } from '../components/WhatsAppIcon';

interface ContactPageProps {
  onNavigate: (page: PageId) => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ onNavigate }) => {
  const { addContactMessage } = useCMS();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    subject: 'Appointment Inquiry',
    message: '',
    consent: false
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.message || !formData.consent) {
      alert('Please fill all required fields and accept the privacy notice.');
      return;
    }

    addContactMessage({
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      subject: formData.subject,
      message: formData.message,
    });

    setSubmitted(true);

    try {
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
    } catch (err) {
      console.warn('Backend offline, message saved locally in CMSContext.', err);
    }
  };

  return (
    <div className="min-h-screen bg-light-blue pb-16">
      
      {/* Standardized Master Page Hero */}
      <PageHero
        title="Contact & Directions"
        eyebrow="Clinic Inquiries & Location"
        subtitle="Get in touch with HealthPro Medical Complex in Faisal Town, Lahore."
        breadcrumbs={[{ label: 'Contact' }]}
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
              href={`tel:${CLINIC_INFO.phoneIntl}`}
              className="btn-secondary text-xs !min-h-[44px]"
            >
              <Phone className="button-icon text-[#25B3C2]" aria-hidden="true" />
              <span>Call Reception: {CLINIC_INFO.phone}</span>
            </a>
          </>
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-12">
        <EmergencyBanner />

        {/* Two-Column Desktop Layout: Form & Clinic Details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Column: Contact Form (7 cols) */}
          <div className="lg:col-span-7">
            <div className="bg-white p-6 sm:p-8 rounded-xs border border-[#E2E8F0] space-y-6">
              
              <div className="border-b border-[#E2E8F0] pb-4">
                <h2 className="text-xl font-semibold text-[#0A0A0A]">
                  Send a General Inquiry
                </h2>
                <p className="text-xs text-[#5B6467] mt-1">
                  Our clinic reception will respond during operating hours.
                </p>
              </div>

              {submitted ? (
                <div className="bg-green-50 border border-green-200 p-6 rounded-xs space-y-4 text-center">
                  <CheckCircle2 className="w-8 h-8 text-green-700 mx-auto" />
                  <h3 className="text-lg font-semibold text-green-950">
                    Inquiry Received
                  </h3>
                  <p className="text-xs sm:text-sm text-green-800 leading-relaxed max-w-md mx-auto">
                    Thank you, <strong>{formData.name}</strong>. Your message has been forwarded to clinic reception. We will contact you at <strong>{formData.phone}</strong> shortly.
                  </p>
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        setSubmitted(false);
                        setFormData({ name: '', phone: '', email: '', subject: 'Appointment Inquiry', message: '', consent: false });
                      }}
                      className="px-5 py-2.5 bg-[#2097A2] text-white text-xs font-bold uppercase tracking-wider rounded-xs hover:bg-[#1B808A] transition-colors"
                    >
                      Send Another Message
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  
                  {/* Name & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label htmlFor="contact-name" className="text-xs font-semibold text-[#0A0A0A] block">
                        Your Name <span className="text-red-600">*</span>
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        required
                        placeholder="e.g. Tariq Mehmood"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2.5 bg-[#FAFAFA] border border-[#CBD5E1] rounded-xs text-xs sm:text-sm focus:bg-white focus:border-[#2097A2] focus:outline-hidden"
                      />
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="contact-phone" className="text-xs font-semibold text-[#0A0A0A] block">
                        Phone / WhatsApp <span className="text-red-600">*</span>
                      </label>
                      <input
                        id="contact-phone"
                        type="tel"
                        required
                        placeholder="0328 0145670"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-3 py-2.5 bg-[#FAFAFA] border border-[#CBD5E1] rounded-xs text-xs sm:text-sm focus:bg-white focus:border-[#2097A2] focus:outline-hidden"
                      />
                    </div>
                  </div>

                  {/* Email & Subject */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label htmlFor="contact-email" className="text-xs font-semibold text-[#0A0A0A] block">
                        Email Address (Optional)
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        placeholder="name@domain.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3 py-2.5 bg-[#FAFAFA] border border-[#CBD5E1] rounded-xs text-xs sm:text-sm focus:bg-white focus:border-[#2097A2] focus:outline-hidden"
                      />
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="contact-subject" className="text-xs font-semibold text-[#0A0A0A] block">
                        Inquiry Topic
                      </label>
                      <select
                        id="contact-subject"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full px-3 py-2.5 bg-[#FAFAFA] border border-[#CBD5E1] rounded-xs text-xs sm:text-sm focus:bg-white focus:border-[#2097A2] focus:outline-hidden"
                      >
                        <option value="Appointment Inquiry">Appointment Scheduling</option>
                        <option value="Fee Details">Consultation Fees Inquiry</option>
                        <option value="Directions">Location & Directions</option>
                        <option value="Follow-up">Lab Follow-up Question</option>
                        <option value="Other">Other Administrative Inquiry</option>
                      </select>
                    </div>
                  </div>

                  {/* Message */}
                  <div className="space-y-1">
                    <label htmlFor="contact-message" className="text-xs font-semibold text-[#0A0A0A] block">
                      Message <span className="text-red-600">*</span>
                    </label>
                    <textarea
                      id="contact-message"
                      rows={4}
                      required
                      placeholder="Please write your inquiry here..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full p-3 bg-[#FAFAFA] border border-[#CBD5E1] rounded-xs text-xs sm:text-sm focus:bg-white focus:border-[#2097A2] focus:outline-hidden"
                    ></textarea>
                  </div>

                  {/* Form Privacy Notice - Required Rule */}
                  <div className="p-3 bg-[#FAFAFA] border border-[#CBD5E1] rounded-xs text-[11px] text-[#5B6467] leading-relaxed">
                    <strong className="text-[#0A0A0A]">Privacy Notice: </strong>
                    Please do not send urgent or highly sensitive medical information through this form. For medical consultations, please schedule an appointment.
                  </div>

                  {/* Consent */}
                  <div className="pt-2">
                    <label className="flex items-start gap-2.5 text-xs text-[#5B6467] cursor-pointer">
                      <input
                        type="checkbox"
                        required
                        checked={formData.consent}
                        onChange={(e) => setFormData({ ...formData, consent: e.target.checked })}
                        className="mt-0.5 rounded-xs text-[#2097A2] focus:ring-[#2097A2]"
                      />
                      <span>
                        I consent to clinic staff contacting me regarding this inquiry.
                      </span>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full py-4 bg-[#2097A2] hover:bg-[#1B808A] text-white font-bold text-xs uppercase tracking-wider rounded-xs transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send Message</span>
                  </button>

                </form>
              )}

            </div>
          </div>

          {/* Right Column: Clinic Details & Fast Actions (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Clinic Card */}
            <div className="bg-white p-6 sm:p-8 rounded-xs border border-[#E2E8F0] space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#2097A2] block">
                  Clinic Location
                </span>
                <h3 className="text-xl font-semibold text-[#0A0A0A] mt-1">
                  HealthPro Medical Complex
                </h3>
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-[#5B6467]">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#2097A2] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#0A0A0A] block">Address:</strong>
                    {CLINIC_INFO.address}
                    <div className="text-[11px] text-[#5B6467] mt-0.5">Plus Code: {CLINIC_INFO.plusCode}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-[#2097A2] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#0A0A0A] block">Telephone:</strong>
                    <a href={`tel:${CLINIC_INFO.phoneIntl}`} className="text-[#2097A2] font-semibold hover:underline">
                      {CLINIC_INFO.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <WhatsAppIcon className="w-5 h-5 text-[#2097A2] shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <strong className="text-[#0A0A0A] block">WhatsApp:</strong>
                    <a href={CLINIC_INFO.whatsappUrl} target="_blank" rel="noopener noreferrer" className="text-[#2097A2] font-semibold hover:underline">
                      {CLINIC_INFO.whatsapp}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-[#2097A2] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#0A0A0A] block">Consultation Schedule:</strong>
                    Consultations are conducted by prior confirmation. Online requests can be submitted 24/7.
                  </div>
                </div>
              </div>

              <div className="border-t border-[#E2E8F0] pt-6 flex flex-col gap-3">
                <a
                  href={CLINIC_INFO.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 bg-[#2097A2] hover:bg-[#1B808A] text-white text-xs font-bold uppercase tracking-wider rounded-xs transition-colors flex items-center justify-center gap-2 shadow-xs"
                >
                  <span>Open in Google Maps</span>
                  <ExternalLink className="w-4 h-4" />
                </a>

                <button
                  onClick={() => onNavigate('appointments')}
                  className="btn-secondary w-full text-xs"
                >
                  <Calendar className="button-icon text-[#25B3C2]" aria-hidden="true" />
                  <span>Book Appointment Slot</span>
                </button>
              </div>
            </div>

            {/* Emergency Department Notice Card */}
            <div className="bg-red-50 border border-red-200 p-6 rounded-xs space-y-2 text-xs text-red-950">
              <strong className="text-red-900 font-semibold uppercase tracking-wider block">
                Emergency Hospital Notice
              </strong>
              <p className="leading-relaxed">
                For acute emergencies (such as sudden chest pain, loss of consciousness, or severe breathing difficulties), please immediately contact <strong>Rescue 1122</strong> or proceed to the nearest hospital emergency department.
              </p>
            </div>

          </div>

        </div>

        {/* Full-Width Map Block Underneath */}
        <div className="bg-white border border-[#E2E8F0] rounded-xs p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#2097A2] block">
                Map & Navigation
              </span>
              <h3 className="text-xl font-semibold text-[#0A0A0A]">
                HealthPro Medical Complex, Faisal Town, Lahore
              </h3>
            </div>

            <a
              href={CLINIC_INFO.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 bg-[#FAFAFA] border border-[#CBD5E1] hover:border-[#2097A2] text-[#0A0A0A] text-xs font-bold uppercase tracking-wider rounded-xs transition-colors inline-flex items-center gap-2"
            >
              <span>Get Driving Directions</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#2097A2]" />
            </a>
          </div>

          <div className="w-full bg-[#FAFAFA] border border-[#E2E8F0] rounded-xs overflow-hidden">
            {/* Interactive Embedded Google Map */}
            <div className="w-full h-80 sm:h-96 relative">
              <iframe
                title="HealthPro Medical Complex Google Map Location"
                src="https://maps.google.com/maps?q=31.4789,74.3015+(HealthPro+Medical+Complex+Faisal+Town)&t=&z=16&ie=UTF8&iwloc=B&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full"
              ></iframe>
            </div>

            {/* Map Action Bar Below */}
            <div className="p-4 sm:p-6 bg-white border-t border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <h4 className="text-sm font-semibold text-[#0A0A0A]">{CLINIC_INFO.clinicName}</h4>
                <p className="text-xs text-[#5B6467] mt-0.5">
                  {CLINIC_INFO.fullAddress} (Plus Code: <code className="text-[#2097A2] font-mono">{CLINIC_INFO.plusCode}</code>)
                </p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <a
                  href={CLINIC_INFO.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-5 py-2.5 bg-[#2097A2] hover:bg-[#1B808A] text-white text-xs font-bold uppercase tracking-wider rounded-xs transition-colors inline-flex items-center justify-center gap-2 shadow-xs"
                >
                  <span>Open in Google Maps App</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
