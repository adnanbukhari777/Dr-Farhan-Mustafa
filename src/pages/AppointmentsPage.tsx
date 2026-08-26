import React, { useState, useEffect } from 'react';
import { PageId, AppointmentRecord } from '../types';
import { CLINIC_INFO } from '../data/clinicData';
import { useCMS } from '../context/CMSContext';
import { PageHero } from '../components/PageHero';
import { EmergencyBanner } from '../components/EmergencyBanner';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Search, 
  ShieldCheck, 
  AlertCircle, 
  Phone, 
  User, 
  Mail, 
  FileText,
  Copy,
  Check,
  CalendarCheck,
  RotateCcw,
  Ban,
  ArrowRight,
  Globe,
  Sparkles
} from 'lucide-react';
import { WhatsAppIcon } from '../components/WhatsAppIcon';

interface AppointmentsPageProps {
  onNavigate: (page: PageId) => void;
}

interface SlotItem {
  time: string;
  label: string;
  isAvailable: boolean;
  status: 'available' | 'booked' | 'break' | 'holiday' | 'blocked' | 'past';
  reason?: string;
}

export const AppointmentsPage: React.FC<AppointmentsPageProps> = ({ onNavigate }) => {
  const { addAppointment, appointments, rescheduleAppointment, cancelAppointment } = useCMS();

  // Helper to get tomorrow's date YYYY-MM-DD
  const getTomorrowDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  // Booking Form State
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    appointmentType: 'in-clinic',
    preferredDate: getTomorrowDate(),
    preferredTimeSlot: '18:00',
    reasonCategory: 'General Internal Medicine Consultation',
    notes: '',
    communicationPref: 'whatsapp',
    consentAgreed: false
  });

  const [availableSlots, setAvailableSlots] = useState<SlotItem[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [generatedRef, setGeneratedRef] = useState('');
  const [copied, setCopied] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  // Appointment Lookup State
  const [lookupRef, setLookupRef] = useState('');
  const [lookupPhone, setLookupPhone] = useState('');
  const [matchedAppointment, setMatchedAppointment] = useState<AppointmentRecord | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);

  // Reschedule & Cancel Modal States
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState(getTomorrowDate());
  const [rescheduleSlot, setRescheduleSlot] = useState('18:20');
  const [rescheduleReason, setRescheduleReason] = useState('');
  const [rescheduleSlots, setRescheduleSlots] = useState<SlotItem[]>([]);

  const [isCancelling, setIsCancelling] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');

  // Fetch slots whenever preferredDate changes
  useEffect(() => {
    fetchSlotsForDate(formData.preferredDate, setAvailableSlots);
  }, [formData.preferredDate]);

  // Fetch slots for reschedule date
  useEffect(() => {
    if (isRescheduling && rescheduleDate) {
      fetchSlotsForDate(rescheduleDate, setRescheduleSlots);
    }
  }, [isRescheduling, rescheduleDate]);

  const fetchSlotsForDate = async (dateStr: string, setFn: React.Dispatch<React.SetStateAction<SlotItem[]>>) => {
    if (!dateStr) return;
    setIsLoadingSlots(true);
    try {
      const res = await fetch(`/api/schedule/slots?date=${dateStr}`);
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data.slots)) {
          setFn(json.data.slots);
          setIsLoadingSlots(false);
          return;
        }
      }
    } catch (err) {
      // Fallback local slot calculation
    }

    // Default 20-min slots 18:00 to 21:00 (Asia/Karachi)
    const times = [
      '18:00', '18:20', '18:40', '19:00', '19:20', '19:40', '20:00', '20:20', '20:40'
    ];
    // Check against local appointments to prevent double-booking
    const bookedForDay = appointments.filter(
      (a) => a.preferredDate === dateStr && a.status !== 'cancelled' && a.status !== 'no_show'
    );
    const mapped: SlotItem[] = times.map((t) => {
      const isBooked = bookedForDay.some((b) => b.preferredTimeSlot === t);
      return {
        time: t,
        label: formatTime12h(t),
        isAvailable: !isBooked,
        status: isBooked ? 'booked' : 'available',
      };
    });
    setFn(mapped);
    setIsLoadingSlots(false);
  };

  const formatTime12h = (time24: string) => {
    if (!time24) return '';
    const [hStr, mStr] = time24.split(':');
    const h = parseInt(hStr, 10);
    const m = mStr || '00';
    if (isNaN(h)) return time24;
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${m} ${ampm}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError(null);

    if (!formData.fullName || !formData.phone || !formData.preferredDate || !formData.consentAgreed) {
      setBookingError('Please complete all required fields and accept the clinical consent.');
      return;
    }

    // Double booking client-side check
    const existingConflict = appointments.find(
      (a) =>
        a.preferredDate === formData.preferredDate &&
        a.preferredTimeSlot === formData.preferredTimeSlot &&
        a.status !== 'cancelled' &&
        a.status !== 'no_show'
    );

    if (existingConflict) {
      setBookingError(`The slot at ${formData.preferredTimeSlot} on ${formData.preferredDate} has just been reserved. Please select another slot.`);
      return;
    }

    // Add to CMS Context store (defaults status to 'new')
    const newRecord = addAppointment({
      patientName: formData.fullName,
      patientPhone: formData.phone,
      patientEmail: formData.email,
      appointmentType: formData.appointmentType as 'in-clinic' | 'online',
      preferredDate: formData.preferredDate,
      preferredTimeSlot: formData.preferredTimeSlot,
      reasonCategory: formData.reasonCategory,
      patientNotes: formData.notes,
      communicationPreference: formData.communicationPref as 'whatsapp' | 'phone'
    });

    setGeneratedRef(newRecord.referenceCode);
    setFormSubmitted(true);

    // Sync with backend API
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName: formData.fullName,
          phone: formData.phone,
          email: formData.email,
          appointmentType: formData.appointmentType,
          date: formData.preferredDate,
          timeSlot: formData.preferredTimeSlot,
          reasonCategory: formData.reasonCategory,
          patientNotes: formData.notes,
          communicationPreference: formData.communicationPref
        })
      });
      if (!res.ok) {
        const data = await res.json();
        if (data.error) {
          console.warn('Backend returned validation message:', data.error);
        }
      }
    } catch (err) {
      console.warn('Saved in local state.', err);
    }
  };

  const handleCopyRef = () => {
    if (generatedRef) {
      navigator.clipboard.writeText(generatedRef);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLookupError(null);
    setMatchedAppointment(null);

    if (!lookupRef || !lookupPhone) {
      setLookupError('Please enter both your appointment reference and mobile number.');
      return;
    }

    const cleanRef = lookupRef.trim().toUpperCase();
    const cleanPhone = lookupPhone.trim().replace(/[^0-9]/g, '');

    // Check in local CMS Context first
    const localMatch = appointments.find(
      (a) =>
        a.referenceCode.toUpperCase() === cleanRef &&
        a.patientPhone.replace(/[^0-9]/g, '').endsWith(cleanPhone.slice(-7))
    );

    if (localMatch) {
      setMatchedAppointment(localMatch);
      return;
    }

    // Check on server
    try {
      const res = await fetch('/api/appointments/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ referenceCode: cleanRef, phone: cleanPhone })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setMatchedAppointment(json.data);
          return;
        }
      }
    } catch (err) {
      // ignore
    }

    setLookupError(`No matching appointment found for reference "${cleanRef}" and mobile "${lookupPhone}". Please check your booking SMS/WhatsApp confirmation.`);
  };

  const handleConfirmReschedule = async () => {
    if (!matchedAppointment) return;
    if (!rescheduleReason.trim()) {
      alert('Please provide a brief reason for rescheduling.');
      return;
    }

    rescheduleAppointment(matchedAppointment.id, rescheduleDate, rescheduleSlot, rescheduleReason);

    // Sync with server
    try {
      await fetch('/api/appointments/reschedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          referenceCode: matchedAppointment.referenceCode,
          phone: matchedAppointment.patientPhone,
          newDate: rescheduleDate,
          newTimeSlot: rescheduleSlot,
          reason: rescheduleReason
        })
      });
    } catch (err) {
      // ignore
    }

    // Refresh matched appointment
    setMatchedAppointment({
      ...matchedAppointment,
      preferredDate: rescheduleDate,
      preferredTimeSlot: rescheduleSlot,
      status: 'rescheduled'
    });
    setIsRescheduling(false);
    setRescheduleReason('');
  };

  const handleConfirmCancellation = async () => {
    if (!matchedAppointment) return;
    if (!cancellationReason.trim()) {
      alert('Please state the reason for cancelling this appointment.');
      return;
    }

    cancelAppointment(matchedAppointment.id, cancellationReason);

    // Sync with server
    try {
      await fetch('/api/appointments/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          referenceCode: matchedAppointment.referenceCode,
          phone: matchedAppointment.patientPhone,
          reason: cancellationReason
        })
      });
    } catch (err) {
      // ignore
    }

    setMatchedAppointment({
      ...matchedAppointment,
      status: 'cancelled',
      cancellationReason
    });
    setIsCancelling(false);
    setCancellationReason('');
  };

  const getStatusBadge = (status: AppointmentRecord['status']) => {
    switch (status) {
      case 'new':
        return <span className="px-2.5 py-1 rounded-[3px] text-xs font-bold bg-amber-50 text-amber-900 border border-amber-300">Pending Clinic Confirmation (New)</span>;
      case 'confirmed':
        return <span className="px-2.5 py-1 rounded-[3px] text-xs font-bold bg-emerald-50 text-emerald-900 border border-emerald-300">Confirmed by Clinic</span>;
      case 'rescheduled':
        return <span className="px-2.5 py-1 rounded-[3px] text-xs font-bold bg-[#ECFAFC] text-[#105B62] border border-[#25B3C2]/40">Rescheduled</span>;
      case 'checked_in':
        return <span className="px-2.5 py-1 rounded-[3px] text-xs font-bold bg-[#ECFAFC] text-[#105B62] border border-[#25B3C2]/40">Checked In at Reception</span>;
      case 'completed':
        return <span className="px-2.5 py-1 rounded-[3px] text-xs font-bold bg-blue-50 text-blue-900 border border-blue-300">Completed</span>;
      case 'cancelled':
        return <span className="px-2.5 py-1 rounded-[3px] text-xs font-bold bg-rose-50 text-rose-900 border border-rose-300">Cancelled</span>;
      case 'no_show':
        return <span className="px-2.5 py-1 rounded-[3px] text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">No Show</span>;
      default:
        return <span className="px-2.5 py-1 rounded-[3px] text-xs font-bold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-light-blue pb-20">
      
      {/* Standardized Master Page Hero */}
      <PageHero
        title="Schedule a Medical Consultation"
        eyebrow="Online Appointment Booking"
        subtitle="Book an in-clinic evaluation with Dr. Farhan Mustafa at HealthPro Medical Complex, Faisal Town, Lahore or schedule a secure online telemedicine consultation."
        breadcrumbs={[{ label: 'Appointments' }]}
        onNavigate={onNavigate}
        actions={
          <>
            <a
              href={`tel:${CLINIC_INFO.phoneIntl}`}
              className="btn-primary text-xs !min-h-[44px]"
            >
              <Phone className="button-icon text-white" />
              <span>Call Reception: {CLINIC_INFO.phone}</span>
            </a>
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

        {/* Important Scheduling Notice */}
        <section aria-label="Scheduling Notice" className="bg-[#ECFAFC] border-l-4 border-[#105B62] p-5 rounded-r-[3px] flex items-start gap-3 shadow-xs">
          <Clock className="w-5 h-5 text-[#105B62] shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-[#111314] leading-relaxed">
            <strong>Staff Confirmation Protocol: </strong>
            To protect dedicated diagnostic evaluation time (20–30 min/patient), every submitted request is designated <strong>New</strong> until front desk staff confirms your slot via WhatsApp (+92 328 0145670) or direct phone call.
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Booking Form (7 cols) */}
          <div className="lg:col-span-7">
            <div className="card-standard p-6 sm:p-8 space-y-6">
              
              <div className="border-b border-[#25B3C2]/15 pb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-[#111314]">
                    Patient Appointment Booking
                  </h2>
                  <p className="text-xs text-neutral-600 mt-1">
                    Select your preferred date, available time slot, and consultation mode.
                  </p>
                </div>
                <span className="text-[11px] text-[#105B62] bg-[#ECFAFC] px-2.5 py-1 rounded-[3px] border border-[#25B3C2]/30 font-bold flex items-center gap-1">
                  <Globe className="w-3 h-3 text-[#25B3C2]" />
                  PKT (UTC+5)
                </span>
              </div>

              {bookingError && (
                <div className="p-4 bg-rose-50 border border-rose-200 text-rose-900 text-xs rounded-[3px] flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{bookingError}</span>
                </div>
              )}

              {formSubmitted ? (
                /* Success / Confirmation State */
                <div className="bg-[#ECFAFC] border border-[#25B3C2]/40 p-6 rounded-[3px] space-y-4 shadow-sm">
                  <div className="flex items-center gap-3 text-[#105B62]">
                    <CheckCircle2 className="w-6 h-6 text-[#105B62] shrink-0" />
                    <h3 className="font-bold text-base sm:text-lg">
                      Appointment Request Submitted Successfully
                    </h3>
                  </div>

                  <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed">
                    Thank you, <strong>{formData.fullName}</strong>. Your request for an <strong>{formData.appointmentType === 'in-clinic' ? 'In-Clinic Consultation' : 'Online Telehealth Consultation'}</strong> on <strong>{formData.preferredDate}</strong> at <strong>{formatTime12h(formData.preferredTimeSlot)}</strong> is queued for clinic confirmation.
                  </p>

                  <div className="p-4 bg-white border border-[#25B3C2]/30 rounded-[3px] flex items-center justify-between shadow-xs">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#105B62] block">
                        Your Unique Reference Code:
                      </span>
                      <span className="text-xl font-mono font-bold text-[#111314]">
                        {generatedRef}
                      </span>
                    </div>
                    <button
                      onClick={handleCopyRef}
                      className="px-3 py-1.5 bg-white border border-[#25B3C2]/40 hover:bg-[#ECFAFC] text-xs font-bold text-[#105B62] rounded-[3px] flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-[#25B3C2]" />}
                      <span>{copied ? 'Copied' : 'Copy Code'}</span>
                    </button>
                  </div>

                  {/* Smart Pre-Visit Callout */}
                  <div className="p-4 bg-white border border-[#25B3C2]/30 rounded-[3px] space-y-2">
                    <div className="flex items-center gap-2 text-[#105B62] font-bold text-xs uppercase tracking-wide">
                      <FileText className="w-4 h-4 text-[#25B3C2]" />
                      <span>Next Recommended Step: Smart Pre-Visit Intake</span>
                    </div>
                    <p className="text-xs text-neutral-600 leading-relaxed">
                      Save valuable consultation time by providing your medical background, ongoing medications, and known allergies before arrival.
                    </p>
                    <button
                      onClick={() => onNavigate('patient-forms')}
                      className="mt-1 btn-primary text-xs !min-h-[38px] flex items-center gap-2"
                    >
                      <span>Complete Pre-Visit Form Now</span>
                      <ArrowRight className="button-icon" />
                    </button>
                  </div>

                  {/* Calendar Sync & Actions */}
                  <div className="pt-2 flex flex-wrap gap-2.5">
                    <a
                      href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent('Dr. Farhan Mustafa Consultation')}&dates=${formData.preferredDate.replace(/-/g, '')}T${formData.preferredTimeSlot.replace(':', '')}00/${formData.preferredDate.replace(/-/g, '')}T${(parseInt(formData.preferredTimeSlot.split(':')[0]) + Math.floor((parseInt(formData.preferredTimeSlot.split(':')[1]) + 30) / 60)).toString().padStart(2, '0')}${((parseInt(formData.preferredTimeSlot.split(':')[1]) + 30) % 60).toString().padStart(2, '0')}00&details=${encodeURIComponent(`Consultation Reference: ${generatedRef}\nPatient: ${formData.fullName}\nFormat: ${formData.appointmentType}\nContact: +92 328 0145670\nLocation: HealthPro Medical Complex, Faisal Town, Lahore`)}&location=${encodeURIComponent('HealthPro Medical Complex, 860-B, Block B, Faisal Town, Lahore, Pakistan')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary text-xs !min-h-[38px] flex items-center gap-1.5"
                    >
                      <CalendarCheck className="button-icon text-[#25B3C2]" />
                      <span>Add to Google Calendar</span>
                    </a>

                    <a
                      href={`https://wa.me/923280145670?text=Hello%20Dr.%20Farhan%20Mustafa%20Clinic%2C%20I%20have%20submitted%20an%20appointment%20request%20with%20reference%20${generatedRef}%20for%20${encodeURIComponent(formData.fullName)}%20on%20${formData.preferredDate}%20at%20${formData.preferredTimeSlot}.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary text-xs !min-h-[38px] flex items-center gap-1.5"
                    >
                      <WhatsAppIcon className="button-icon text-white" aria-hidden="true" />
                      <span>WhatsApp Reception</span>
                    </a>

                    <button
                      onClick={() => {
                        setFormSubmitted(false);
                        setFormData({
                          fullName: '',
                          phone: '',
                          email: '',
                          appointmentType: 'in-clinic',
                          preferredDate: getTomorrowDate(),
                          preferredTimeSlot: '18:00',
                          reasonCategory: 'General Internal Medicine Consultation',
                          notes: '',
                          communicationPref: 'whatsapp',
                          consentAgreed: false
                        });
                      }}
                      className="btn-secondary text-xs !min-h-[38px]"
                    >
                      <CalendarCheck className="button-icon text-[#25B3C2]" aria-hidden="true" />
                      <span>Book Another Slot</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Main Form Fields */
                <form onSubmit={handleSubmit} className="space-y-5">
                  
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label htmlFor="patient-fullname" className="text-xs font-bold text-[#111314] block">
                      Full Patient Name <span className="text-rose-600">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-[#25B3C2] absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
                      <input
                        id="patient-fullname"
                        type="text"
                        required
                        placeholder="e.g. Muhammad Tariq"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="form-input-standard !pl-9 text-xs sm:text-sm"
                      />
                    </div>
                  </div>

                  {/* Phone & WhatsApp Number */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label htmlFor="patient-phone" className="text-xs font-bold text-[#111314] block">
                        Mobile / WhatsApp Number <span className="text-rose-600">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-[#25B3C2] absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
                        <input
                          id="patient-phone"
                          type="tel"
                          required
                          placeholder="0328 0145670"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="form-input-standard !pl-9 text-xs sm:text-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="patient-email" className="text-xs font-bold text-[#111314] block">
                        Email Address (Optional)
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-[#25B3C2] absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
                        <input
                          id="patient-email"
                          type="email"
                          placeholder="patient@example.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="form-input-standard !pl-9 text-xs sm:text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Appointment Type */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#111314] block">
                      Consultation Format <span className="text-rose-600">*</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <label 
                        className={`p-3.5 border rounded-[3px] flex items-center gap-3 cursor-pointer transition-all ${
                          formData.appointmentType === 'in-clinic' 
                            ? 'border-[#105B62] bg-[#ECFAFC] shadow-xs' 
                            : 'border-[#25B3C2]/20 bg-white hover:bg-[#F8FCFD]'
                        }`}
                      >
                        <input
                          type="radio"
                          name="appointmentType"
                          value="in-clinic"
                          checked={formData.appointmentType === 'in-clinic'}
                          onChange={() => setFormData({ ...formData, appointmentType: 'in-clinic' })}
                          className="text-[#105B62] focus:ring-[#25B3C2]"
                        />
                        <div>
                          <strong className="text-xs sm:text-sm text-[#111314] block">In-Clinic Consultation</strong>
                          <span className="text-[11px] text-neutral-600">HealthPro Complex, Faisal Town</span>
                        </div>
                      </label>

                      <label 
                        className={`p-3.5 border rounded-[3px] flex items-center gap-3 cursor-pointer transition-all ${
                          formData.appointmentType === 'online' 
                            ? 'border-[#105B62] bg-[#ECFAFC] shadow-xs' 
                            : 'border-[#25B3C2]/20 bg-white hover:bg-[#F8FCFD]'
                        }`}
                      >
                        <input
                          type="radio"
                          name="appointmentType"
                          value="online"
                          checked={formData.appointmentType === 'online'}
                          onChange={() => setFormData({ ...formData, appointmentType: 'online' })}
                          className="text-[#105B62] focus:ring-[#25B3C2]"
                        />
                        <div>
                          <strong className="text-xs sm:text-sm text-[#111314] block">Online Telehealth</strong>
                          <span className="text-[11px] text-neutral-600">Follow-up & Report Reviews</span>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Preferred Date */}
                  <div className="space-y-1.5">
                    <label htmlFor="preferred-date" className="text-xs font-bold text-[#111314] flex items-center justify-between">
                      <span>Preferred Consultation Date <span className="text-rose-600">*</span></span>
                      <span className="text-[11px] text-neutral-500 font-normal">Mon–Sat (Evening: 6:00 PM – 9:00 PM)</span>
                    </label>
                    <input
                      id="preferred-date"
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={formData.preferredDate}
                      onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                      className="form-input-standard text-xs sm:text-sm"
                    />
                  </div>

                  {/* Dynamic Time Slot Selector */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-[#111314]">
                        Available Time Slots (20 Min Dedicated Window) <span className="text-rose-600">*</span>
                      </label>
                      {isLoadingSlots && (
                        <span className="text-[11px] text-[#105B62] font-semibold animate-pulse">Checking live slot availability...</span>
                      )}
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {availableSlots.map((slot) => {
                        const isSelected = formData.preferredTimeSlot === slot.time;
                        return (
                          <button
                            key={slot.time}
                            type="button"
                            disabled={!slot.isAvailable}
                            onClick={() => setFormData({ ...formData, preferredTimeSlot: slot.time })}
                            className={`p-2.5 rounded-[3px] text-xs font-bold border transition text-center flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                              isSelected
                                ? 'bg-[#105B62] text-[#F7FFFF] border-[#105B62] shadow-sm'
                                : slot.isAvailable
                                ? 'bg-white border-[#25B3C2]/30 text-[#111314] hover:border-[#25B3C2] hover:bg-[#ECFAFC]'
                                : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed line-through'
                            }`}
                          >
                            <span className="font-mono">{slot.label}</span>
                            <span className={`text-[9px] uppercase tracking-wider ${isSelected ? 'text-white/90' : slot.isAvailable ? 'text-emerald-700' : 'text-slate-400'}`}>
                              {slot.isAvailable ? 'Available' : 'Booked'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Clinical Reason Category */}
                  <div className="space-y-1.5">
                    <label htmlFor="reason-category" className="text-xs font-bold text-[#111314] block">
                      Clinical Consultation Category
                    </label>
                    <select
                      id="reason-category"
                      value={formData.reasonCategory}
                      onChange={(e) => setFormData({ ...formData, reasonCategory: e.target.value })}
                      className="form-input-standard text-xs sm:text-sm"
                    >
                      <option value="General Internal Medicine Consultation">General Internal Medicine Consultation</option>
                      <option value="Diabetes & Blood Pressure Review">Diabetes & Blood Pressure Review</option>
                      <option value="Digestive & Gastrointestinal Health">Digestive & Gastrointestinal Health</option>
                      <option value="Preventive Health Checkup">Preventive Health Checkup</option>
                      <option value="Follow-Up & Lab Report Review">Follow-Up & Lab Report Review</option>
                    </select>
                  </div>

                  {/* Note for Clinic Coordinator */}
                  <div className="space-y-1.5">
                    <label htmlFor="patient-notes" className="text-xs font-bold text-[#111314] block">
                      Brief Note for Clinic Coordinator
                    </label>
                    <textarea
                      id="patient-notes"
                      rows={2}
                      placeholder="e.g. Bringing fasting blood sugar logs and previous diagnostic reports..."
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="form-input-standard text-xs sm:text-sm"
                    ></textarea>
                  </div>

                  {/* Communication Preference */}
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-[#111314] block">
                      Preferred Confirmation Channel
                    </span>
                    <div className="flex gap-4 text-xs text-[#111314]">
                      <label className="inline-flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="communicationPref"
                          value="whatsapp"
                          checked={formData.communicationPref === 'whatsapp'}
                          onChange={() => setFormData({ ...formData, communicationPref: 'whatsapp' })}
                          className="text-[#105B62] focus:ring-[#25B3C2]"
                        />
                        <span>WhatsApp Message (+92 328 0145670)</span>
                      </label>
                      <label className="inline-flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="communicationPref"
                          value="phone"
                          checked={formData.communicationPref === 'phone'}
                          onChange={() => setFormData({ ...formData, communicationPref: 'phone' })}
                          className="text-[#105B62] focus:ring-[#25B3C2]"
                        />
                        <span>Phone Call</span>
                      </label>
                    </div>
                  </div>

                  {/* Consent Checkbox */}
                  <div className="pt-2 border-t border-[#25B3C2]/15">
                    <label className="flex items-start gap-2.5 text-xs text-neutral-600 cursor-pointer">
                      <input
                        type="checkbox"
                        required
                        checked={formData.consentAgreed}
                        onChange={(e) => setFormData({ ...formData, consentAgreed: e.target.checked })}
                        className="mt-0.5 rounded-[2px] text-[#105B62] focus:ring-[#25B3C2]"
                      />
                      <span>
                        I understand that this request creates a tentative booking subject to clinic staff confirmation. I consent to clinic staff contacting me to confirm details and clinic arrival instructions.
                      </span>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="btn-primary w-full !py-4 text-xs uppercase tracking-wider"
                  >
                    <CalendarCheck className="w-4 h-4 text-white" />
                    <span>Submit Appointment Request</span>
                  </button>

                </form>
              )}

            </div>
          </div>

          {/* Right Column: Lookup, Reschedule, Cancellation & Clinic Guidelines (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Appointment Status Lookup Card */}
            <div className="card-standard p-6 space-y-4">
              <div className="flex items-center gap-2 border-b border-[#25B3C2]/15 pb-3">
                <Search className="w-4 h-4 text-[#25B3C2]" />
                <h3 className="text-sm font-bold text-[#111314] uppercase tracking-wide">
                  Appointment Lookup & Management
                </h3>
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Check status, request rescheduling, submit cancellation, or complete your Smart Pre-Visit form.
              </p>

              <form onSubmit={handleLookup} className="space-y-3">
                <div>
                  <label htmlFor="lookup-ref" className="text-[11px] font-bold text-[#111314] block">
                    Reference Code (e.g. DFM-2026-XXXX)
                  </label>
                  <input
                    id="lookup-ref"
                    type="text"
                    required
                    placeholder="DFM-2026-1082"
                    value={lookupRef}
                    onChange={(e) => setLookupRef(e.target.value)}
                    className="form-input-standard text-xs uppercase font-mono"
                  />
                </div>

                <div>
                  <label htmlFor="lookup-phone" className="text-[11px] font-bold text-[#111314] block">
                    Registered Mobile Number
                  </label>
                  <input
                    id="lookup-phone"
                    type="tel"
                    required
                    placeholder="0321 4455667"
                    value={lookupPhone}
                    onChange={(e) => setLookupPhone(e.target.value)}
                    className="form-input-standard text-xs"
                  />
                </div>

                <button
                  type="submit"
                  className="btn-secondary w-full text-xs uppercase tracking-wider"
                >
                  <Search className="w-[18px] h-[18px] text-[#25B3C2]" aria-hidden="true" />
                  <span>Verify & Lookup Appointment</span>
                </button>
              </form>

              {lookupError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-xs text-rose-800 rounded-[3px]">
                  {lookupError}
                </div>
              )}

              {/* Matched Appointment Detailed Panel */}
              {matchedAppointment && (
                <div className="p-4 bg-[#ECFAFC] border border-[#25B3C2]/30 rounded-[3px] space-y-3 text-xs">
                  <div className="flex items-center justify-between border-b border-[#25B3C2]/20 pb-2">
                    <span className="font-mono font-bold text-[#105B62] text-sm">
                      {matchedAppointment.referenceCode}
                    </span>
                    {getStatusBadge(matchedAppointment.status)}
                  </div>

                  <div className="space-y-1 text-neutral-800">
                    <div><strong>Patient:</strong> {matchedAppointment.patientName}</div>
                    <div><strong>Format:</strong> {matchedAppointment.appointmentType === 'in-clinic' ? 'In-Clinic Visit' : 'Online Telehealth'}</div>
                    <div><strong>Date & Time:</strong> {matchedAppointment.preferredDate} at {formatTime12h(matchedAppointment.preferredTimeSlot)} (PKT)</div>
                    <div><strong>Category:</strong> {matchedAppointment.reasonCategory}</div>
                    {matchedAppointment.cancellationReason && (
                      <div className="text-rose-800"><strong>Cancellation Note:</strong> {matchedAppointment.cancellationReason}</div>
                    )}
                  </div>

                  {/* Actions for Matched Appointment */}
                  <div className="pt-2 border-t border-[#25B3C2]/20 flex flex-col gap-2">
                    <button
                      onClick={() => onNavigate('patient-forms')}
                      className="btn-primary w-full text-xs !min-h-[36px] flex items-center justify-center gap-1.5"
                    >
                      <FileText className="button-icon text-white" />
                      <span>Complete Pre-Visit Intake Form</span>
                    </button>

                    {matchedAppointment.status !== 'cancelled' && (
                      <a
                        href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent('Dr. Farhan Mustafa Consultation')}&dates=${matchedAppointment.preferredDate.replace(/-/g, '')}T${matchedAppointment.preferredTimeSlot.replace(':', '')}00/${matchedAppointment.preferredDate.replace(/-/g, '')}T${(parseInt(matchedAppointment.preferredTimeSlot.split(':')[0]) + Math.floor((parseInt(matchedAppointment.preferredTimeSlot.split(':')[1]) + 30) / 60)).toString().padStart(2, '0')}${((parseInt(matchedAppointment.preferredTimeSlot.split(':')[1]) + 30) % 60).toString().padStart(2, '0')}00&details=${encodeURIComponent(`Consultation Reference: ${matchedAppointment.referenceCode}\nPatient: ${matchedAppointment.patientName}\nFormat: ${matchedAppointment.appointmentType}\nContact: +92 328 0145670\nLocation: HealthPro Medical Complex, Faisal Town, Lahore`)}&location=${encodeURIComponent('HealthPro Medical Complex, 860-B, Block B, Faisal Town, Lahore, Pakistan')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary w-full text-xs !min-h-[36px] flex items-center justify-center gap-1.5"
                      >
                        <CalendarCheck className="button-icon text-[#25B3C2]" aria-hidden="true" />
                        <span>Add to Google Calendar</span>
                      </a>
                    )}

                    {matchedAppointment.status !== 'cancelled' && matchedAppointment.status !== 'completed' && (
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => {
                            setIsRescheduling(true);
                            setIsCancelling(false);
                          }}
                          className="py-1.5 px-2 bg-white border border-[#25B3C2]/40 hover:bg-[#ECFAFC] text-[#105B62] rounded-[3px] font-bold text-[11px] flex items-center justify-center gap-1 cursor-pointer transition-colors"
                        >
                          <RotateCcw className="w-3 h-3 text-[#25B3C2]" />
                          <span>Reschedule</span>
                        </button>

                        <button
                          onClick={() => {
                            setIsCancelling(true);
                            setIsRescheduling(false);
                          }}
                          className="py-1.5 px-2 bg-white border border-rose-200 hover:bg-rose-50 text-rose-700 rounded-[3px] font-bold text-[11px] flex items-center justify-center gap-1 cursor-pointer transition-colors"
                        >
                          <Ban className="w-3 h-3 text-rose-600" />
                          <span>Cancel</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Reschedule Drawer/Box */}
                  {isRescheduling && (
                    <div className="mt-3 p-3 bg-white border border-[#25B3C2]/40 rounded-[3px] space-y-3">
                      <div className="font-bold text-[#105B62] text-xs flex items-center gap-1">
                        <RotateCcw className="w-3.5 h-3.5 text-[#25B3C2]" />
                        <span>Select New Date & Slot:</span>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-[#111314] block mb-1">New Date</label>
                        <input
                          type="date"
                          min={new Date().toISOString().split('T')[0]}
                          value={rescheduleDate}
                          onChange={(e) => setRescheduleDate(e.target.value)}
                          className="form-input-standard text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-[#111314] block mb-1">New Time Slot</label>
                        <select
                          value={rescheduleSlot}
                          onChange={(e) => setRescheduleSlot(e.target.value)}
                          className="form-input-standard text-xs"
                        >
                          {rescheduleSlots.map((s) => (
                            <option key={s.time} value={s.time} disabled={!s.isAvailable}>
                              {s.label} {!s.isAvailable ? '(Booked)' : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-[#111314] block mb-1">Reason for Rescheduling</label>
                        <input
                          type="text"
                          placeholder="e.g. Work conflict, travel delay..."
                          value={rescheduleReason}
                          onChange={(e) => setRescheduleReason(e.target.value)}
                          className="form-input-standard text-xs"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleConfirmReschedule}
                          className="btn-primary flex-1 text-xs !min-h-[34px]"
                        >
                          Confirm Reschedule
                        </button>
                        <button
                          onClick={() => setIsRescheduling(false)}
                          className="btn-secondary px-3 text-xs !min-h-[34px]"
                        >
                          <Ban className="w-[18px] h-[18px] text-[#25B3C2]" aria-hidden="true" />
                          <span>Cancel</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Cancellation Drawer/Box */}
                  {isCancelling && (
                    <div className="mt-3 p-3 bg-white border border-rose-200 rounded-[3px] space-y-3">
                      <div className="font-bold text-rose-900 text-xs flex items-center gap-1">
                        <Ban className="w-3.5 h-3.5 text-rose-600" />
                        <span>Confirm Cancellation Request:</span>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-[#111314] block mb-1">Reason for Cancellation</label>
                        <textarea
                          rows={2}
                          placeholder="Please let us know why you need to cancel..."
                          value={cancellationReason}
                          onChange={(e) => setCancellationReason(e.target.value)}
                          className="form-input-standard text-xs"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleConfirmCancellation}
                          className="flex-1 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-[3px] text-xs font-bold transition-colors cursor-pointer"
                        >
                          Submit Cancellation
                        </button>
                        <button
                          onClick={() => setIsCancelling(false)}
                          className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-[3px] text-xs font-bold hover:bg-slate-200 transition-colors cursor-pointer"
                        >
                          Keep Slot
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              )}
            </div>

            {/* Clinic Attendance Guidelines */}
            <div className="card-static p-6 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#105B62]">
                Clinic Attendance Guidelines
              </h3>
              
              <ul className="space-y-3 text-xs text-neutral-700">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#25B3C2] shrink-0 mt-0.5" />
                  <span>
                    <strong>Arrival Time:</strong> Please arrive 10 minutes prior to your confirmed slot at HealthPro Medical Complex, Faisal Town.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#25B3C2] shrink-0 mt-0.5" />
                  <span>
                    <strong>Diagnostic Records:</strong> Bring previous prescription slips, blood sugar/BP logs, and recent laboratory reports.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#25B3C2] shrink-0 mt-0.5" />
                  <span>
                    <strong>WhatsApp Support:</strong> Send lab PDFs directly to WhatsApp <strong>+92 328 0145670</strong> prior to arrival.
                  </span>
                </li>
              </ul>
            </div>

            {/* Direct Support */}
            <div className="card-standard p-6 space-y-3 text-center">
              <span className="text-xs font-bold uppercase tracking-widest text-[#105B62] block">
                Direct Clinic Helpdesk
              </span>
              <p className="text-xs text-neutral-600">
                For immediate assistance with scheduling or clinic directions:
              </p>
              <div className="flex flex-col gap-2 pt-1">
                <a
                  href="https://wa.me/923280145670"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary w-full text-xs !min-h-[38px] flex items-center justify-center gap-2"
                >
                  <WhatsAppIcon className="button-icon text-white" aria-hidden="true" />
                  <span>WhatsApp: +92 328 0145670</span>
                </a>
                <a
                  href={`tel:${CLINIC_INFO.phoneIntl}`}
                  className="btn-secondary w-full text-xs !min-h-[38px] flex items-center justify-center gap-2"
                >
                  <Phone className="button-icon text-[#25B3C2]" aria-hidden="true" />
                  <span>Call: {CLINIC_INFO.phone}</span>
                </a>
              </div>
            </div>

          </div>

        </div>

      </main>

    </div>
  );
};

