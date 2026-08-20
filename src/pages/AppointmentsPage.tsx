import React, { useState, useEffect } from 'react';
import { PageId, AppointmentRecord } from '../types';
import { CLINIC_INFO } from '../data/clinicData';
import { useCMS } from '../context/CMSContext';
import { Breadcrumb } from '../components/Breadcrumb';
import { EmergencyBanner } from '../components/EmergencyBanner';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Search, 
  ShieldCheck, 
  AlertCircle, 
  Phone, 
  MessageCircle, 
  User, 
  Mail, 
  FileText,
  Copy,
  Check,
  CalendarCheck,
  RotateCcw,
  Ban,
  ArrowRight,
  Globe
} from 'lucide-react';

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
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-300">Pending Clinic Confirmation (New)</span>;
      case 'confirmed':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300">Confirmed by Clinic</span>;
      case 'rescheduled':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-800 border border-indigo-300">Rescheduled</span>;
      case 'checked_in':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-300">Checked In at Reception</span>;
      case 'completed':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-300">Completed</span>;
      case 'cancelled':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-300">Cancelled</span>;
      case 'no_show':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">No Show</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-16">
      
      {/* Header Block */}
      <div className="bg-[#2097A2] text-white py-12 px-4 sm:px-6 lg:px-8 border-b-4 border-[#27BAC8]">
        <div className="max-w-7xl mx-auto space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#A4E0E5]">
              Online Scheduling
            </span>
            <span className="text-[11px] px-2 py-0.5 bg-white/10 rounded text-white font-mono">
              Asia/Karachi (PKT)
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-white">
            Schedule a Consultation
          </h1>
          <p className="text-sm sm:text-base text-white/90 font-normal max-w-2xl">
            Book an in-clinic visit with Dr. Farhan Mustafa at HealthPro Medical Complex or a secure online telehealth consultation.
          </p>
        </div>
      </div>

      <Breadcrumb items={[{ label: 'Appointments' }]} onNavigate={onNavigate} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 space-y-8">
        <EmergencyBanner />

        {/* Important Scheduling Notice */}
        <div className="bg-[#E6F7F8] border-l-4 border-[#2097A2] p-5 rounded-r-xs flex items-start gap-3">
          <Clock className="w-5 h-5 text-[#2097A2] shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-[#0A0A0A] leading-relaxed">
            <strong>Staff Confirmation Workflow: </strong>
            To prevent overbooking and protect dedicated diagnostic time (20–30 min/patient), every submitted request is set to <strong>New</strong> until clinic staff confirms your consultation slot via WhatsApp (+92 328 0145670) or direct phone call.
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Booking Form (7 cols) */}
          <div className="lg:col-span-7">
            <div className="bg-white p-6 sm:p-8 rounded-xs border border-[#E2E8F0] space-y-6 shadow-xs">
              
              <div className="border-b border-[#E2E8F0] pb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-[#0A0A0A]">
                    Patient Appointment Booking
                  </h2>
                  <p className="text-xs text-[#5B6467] mt-1">
                    Select your preferred date, available time slot, and consultation mode.
                  </p>
                </div>
                <span className="text-[11px] text-[#2097A2] bg-[#E6F7F8] px-2.5 py-1 rounded font-semibold flex items-center gap-1">
                  <Globe className="w-3 h-3" />
                  Timezone: PKT
                </span>
              </div>

              {bookingError && (
                <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{bookingError}</span>
                </div>
              )}

              {formSubmitted ? (
                /* Success / Confirmation State */
                <div className="bg-green-50 border border-green-200 p-6 rounded-xs space-y-4">
                  <div className="flex items-center gap-3 text-green-900">
                    <CheckCircle2 className="w-6 h-6 text-green-700 shrink-0" />
                    <h3 className="font-semibold text-base sm:text-lg">
                      Appointment Request Submitted!
                    </h3>
                  </div>

                  <p className="text-xs sm:text-sm text-green-800 leading-relaxed">
                    Thank you, <strong>{formData.fullName}</strong>. Your request for an <strong>{formData.appointmentType === 'in-clinic' ? 'In-Clinic Consultation' : 'Online Video Consultation'}</strong> on <strong>{formData.preferredDate}</strong> at <strong>{formatTime12h(formData.preferredTimeSlot)}</strong> is queued for clinic confirmation.
                  </p>

                  <div className="p-4 bg-white border border-green-300 rounded-xs flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#5B6467] block">
                        Your Unique Reference Code:
                      </span>
                      <span className="text-xl font-mono font-bold text-[#0A0A0A]">
                        {generatedRef}
                      </span>
                    </div>
                    <button
                      onClick={handleCopyRef}
                      className="px-3 py-1.5 bg-[#FAFAFA] border border-[#CBD5E1] hover:border-[#2097A2] text-xs font-semibold text-[#0A0A0A] rounded-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied' : 'Copy Code'}</span>
                    </button>
                  </div>

                  {/* Smart Pre-Visit Callout */}
                  <div className="p-4 bg-[#E6F7F8] border border-[#2097A2]/30 rounded-xs space-y-2">
                    <div className="flex items-center gap-2 text-[#2097A2] font-semibold text-xs uppercase tracking-wide">
                      <FileText className="w-4 h-4" />
                      <span>Next Recommended Step: Smart Pre-Visit Intake</span>
                    </div>
                    <p className="text-xs text-[#0A0A0A] leading-relaxed">
                      Save consultation time by providing your medical background, ongoing medications, and known allergies before your visit.
                    </p>
                    <button
                      onClick={() => onNavigate('patient-forms')}
                      className="mt-1 px-4 py-2 bg-[#2097A2] hover:bg-[#1B808A] text-white text-xs font-bold uppercase tracking-wider rounded-xs flex items-center gap-2 transition"
                    >
                      <span>Complete Pre-Visit Form Now</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Calendar Sync & WhatsApp Actions */}
                  <div className="pt-2 flex flex-wrap gap-2.5">
                    {/* Add to Google Calendar */}
                    <a
                      href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent('Dr. Farhan Mustafa Consultation')}&dates=${formData.preferredDate.replace(/-/g, '')}T${formData.preferredTimeSlot.replace(':', '')}00/${formData.preferredDate.replace(/-/g, '')}T${(parseInt(formData.preferredTimeSlot.split(':')[0]) + Math.floor((parseInt(formData.preferredTimeSlot.split(':')[1]) + 30) / 60)).toString().padStart(2, '0')}${((parseInt(formData.preferredTimeSlot.split(':')[1]) + 30) % 60).toString().padStart(2, '0')}00&details=${encodeURIComponent(`Consultation Reference: ${generatedRef}\nPatient: ${formData.fullName}\nFormat: ${formData.appointmentType}\nContact: +92 328 0145670\nLocation: HealthPro Medical Complex, Faisal Town, Lahore`)}&location=${encodeURIComponent('HealthPro Medical Complex, 860-B, Block B, Faisal Town, Lahore, Pakistan')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2.5 bg-[#1A365D] hover:bg-[#152C4D] text-white text-xs font-bold uppercase tracking-wider rounded-xs transition-colors inline-flex items-center gap-1.5 shadow-xs"
                    >
                      <CalendarCheck className="w-4 h-4" />
                      <span>Add to Google Calendar</span>
                    </a>

                    <a
                      href={`https://wa.me/923280145670?text=Hello%20Dr.%20Farhan%20Mustafa%20Clinic%2C%20I%20have%20submitted%20an%20appointment%20request%20with%20reference%20${generatedRef}%20for%20${encodeURIComponent(formData.fullName)}%20on%20${formData.preferredDate}%20at%20${formData.preferredTimeSlot}.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2.5 bg-[#2097A2] hover:bg-[#1B808A] text-white text-xs font-bold uppercase tracking-wider rounded-xs transition-colors inline-flex items-center gap-1.5"
                    >
                      <MessageCircle className="w-4 h-4" />
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
                      className="px-3.5 py-2.5 bg-white border border-[#CBD5E1] text-[#0A0A0A] text-xs font-bold uppercase tracking-wider rounded-xs hover:border-[#2097A2] transition-colors"
                    >
                      New Booking
                    </button>
                  </div>
                </div>
              ) : (
                /* Main Form Fields */
                <form onSubmit={handleSubmit} className="space-y-5">
                  
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label htmlFor="patient-fullname" className="text-xs font-semibold text-[#0A0A0A] block">
                      Full Patient Name <span className="text-red-600">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-[#5B6467] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        id="patient-fullname"
                        type="text"
                        required
                        placeholder="e.g. Muhammad Tariq"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="w-full pl-9 pr-3 py-2.5 bg-[#FAFAFA] border border-[#CBD5E1] rounded-xs text-xs sm:text-sm focus:bg-white focus:border-[#2097A2] focus:outline-hidden"
                      />
                    </div>
                  </div>

                  {/* Phone & WhatsApp Number */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label htmlFor="patient-phone" className="text-xs font-semibold text-[#0A0A0A] block">
                        Mobile / WhatsApp Number <span className="text-red-600">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-[#5B6467] absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          id="patient-phone"
                          type="tel"
                          required
                          placeholder="0328 0145670"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full pl-9 pr-3 py-2.5 bg-[#FAFAFA] border border-[#CBD5E1] rounded-xs text-xs sm:text-sm focus:bg-white focus:border-[#2097A2] focus:outline-hidden"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="patient-email" className="text-xs font-semibold text-[#0A0A0A] block">
                        Email Address (Optional)
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-[#5B6467] absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          id="patient-email"
                          type="email"
                          placeholder="patient@example.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full pl-9 pr-3 py-2.5 bg-[#FAFAFA] border border-[#CBD5E1] rounded-xs text-xs sm:text-sm focus:bg-white focus:border-[#2097A2] focus:outline-hidden"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Appointment Type */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#0A0A0A] block">
                      Consultation Format <span className="text-red-600">*</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <label 
                        className={`p-3.5 border rounded-xs flex items-center gap-3 cursor-pointer transition-all ${
                          formData.appointmentType === 'in-clinic' 
                            ? 'border-[#2097A2] bg-[#2097A2]/5' 
                            : 'border-[#CBD5E1] bg-[#FAFAFA]'
                        }`}
                      >
                        <input
                          type="radio"
                          name="appointmentType"
                          value="in-clinic"
                          checked={formData.appointmentType === 'in-clinic'}
                          onChange={() => setFormData({ ...formData, appointmentType: 'in-clinic' })}
                          className="text-[#2097A2] focus:ring-[#2097A2]"
                        />
                        <div>
                          <strong className="text-xs sm:text-sm text-[#0A0A0A] block">In-Clinic Consultation</strong>
                          <span className="text-[11px] text-[#5B6467]">HealthPro Medical Complex, Faisal Town</span>
                        </div>
                      </label>

                      <label 
                        className={`p-3.5 border rounded-xs flex items-center gap-3 cursor-pointer transition-all ${
                          formData.appointmentType === 'online' 
                            ? 'border-[#2097A2] bg-[#2097A2]/5' 
                            : 'border-[#CBD5E1] bg-[#FAFAFA]'
                        }`}
                      >
                        <input
                          type="radio"
                          name="appointmentType"
                          value="online"
                          checked={formData.appointmentType === 'online'}
                          onChange={() => setFormData({ ...formData, appointmentType: 'online' })}
                          className="text-[#2097A2] focus:ring-[#2097A2]"
                        />
                        <div>
                          <strong className="text-xs sm:text-sm text-[#0A0A0A] block">Online Video Consultation</strong>
                          <span className="text-[11px] text-[#5B6467]">Follow-up & Lab Report Reviews</span>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Preferred Date */}
                  <div className="space-y-1.5">
                    <label htmlFor="preferred-date" className="text-xs font-semibold text-[#0A0A0A] flex items-center justify-between">
                      <span>Preferred Consultation Date <span className="text-red-600">*</span></span>
                      <span className="text-[11px] text-[#5B6467] font-normal">Mon–Sat (Evening Clinic: 6:00 PM – 9:00 PM)</span>
                    </label>
                    <input
                      id="preferred-date"
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={formData.preferredDate}
                      onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                      className="w-full px-3 py-2.5 bg-[#FAFAFA] border border-[#CBD5E1] rounded-xs text-xs sm:text-sm focus:bg-white focus:border-[#2097A2] focus:outline-hidden"
                    />
                  </div>

                  {/* Dynamic Time Slot Selector */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-[#0A0A0A]">
                        Available Time Slots (20 Min Intervals) <span className="text-red-600">*</span>
                      </label>
                      {isLoadingSlots && (
                        <span className="text-[11px] text-[#2097A2] animate-pulse">Checking live slot availability...</span>
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
                            className={`p-2.5 rounded-xs text-xs font-semibold border transition text-center flex flex-col items-center justify-center gap-0.5 ${
                              isSelected
                                ? 'bg-[#2097A2] text-white border-[#2097A2] shadow-xs'
                                : slot.isAvailable
                                ? 'bg-white border-[#CBD5E1] text-[#0A0A0A] hover:border-[#2097A2] hover:bg-[#E6F7F8]'
                                : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed line-through'
                            }`}
                          >
                            <span className="font-mono">{slot.label}</span>
                            <span className={`text-[9px] uppercase tracking-wider ${isSelected ? 'text-white/90' : slot.isAvailable ? 'text-emerald-600' : 'text-slate-400'}`}>
                              {slot.isAvailable ? 'Available' : 'Booked'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Clinical Reason Category */}
                  <div className="space-y-1.5">
                    <label htmlFor="reason-category" className="text-xs font-semibold text-[#0A0A0A] block">
                      Clinical Consultation Category
                    </label>
                    <select
                      id="reason-category"
                      value={formData.reasonCategory}
                      onChange={(e) => setFormData({ ...formData, reasonCategory: e.target.value })}
                      className="w-full px-3 py-2.5 bg-[#FAFAFA] border border-[#CBD5E1] rounded-xs text-xs sm:text-sm focus:bg-white focus:border-[#2097A2] focus:outline-hidden"
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
                    <label htmlFor="patient-notes" className="text-xs font-semibold text-[#0A0A0A] block">
                      Brief Note for Clinic Coordinator
                    </label>
                    <textarea
                      id="patient-notes"
                      rows={2}
                      placeholder="e.g. Bringing fasting blood sugar logs and previous ECG reports..."
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full px-3 py-2.5 bg-[#FAFAFA] border border-[#CBD5E1] rounded-xs text-xs sm:text-sm focus:bg-white focus:border-[#2097A2] focus:outline-hidden"
                    ></textarea>
                  </div>

                  {/* Communication Preference */}
                  <div className="space-y-1.5">
                    <span className="text-xs font-semibold text-[#0A0A0A] block">
                      Preferred Confirmation Channel
                    </span>
                    <div className="flex gap-4 text-xs text-[#0A0A0A]">
                      <label className="inline-flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="communicationPref"
                          value="whatsapp"
                          checked={formData.communicationPref === 'whatsapp'}
                          onChange={() => setFormData({ ...formData, communicationPref: 'whatsapp' })}
                          className="text-[#2097A2]"
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
                          className="text-[#2097A2]"
                        />
                        <span>Phone Call</span>
                      </label>
                    </div>
                  </div>

                  {/* Consent Checkbox */}
                  <div className="pt-2 border-t border-[#E2E8F0]">
                    <label className="flex items-start gap-2.5 text-xs text-[#5B6467] cursor-pointer">
                      <input
                        type="checkbox"
                        required
                        checked={formData.consentAgreed}
                        onChange={(e) => setFormData({ ...formData, consentAgreed: e.target.checked })}
                        className="mt-0.5 rounded-xs text-[#2097A2] focus:ring-[#2097A2]"
                      />
                      <span>
                        I understand that this request creates a tentative booking subject to clinic staff confirmation. I consent to clinic staff contacting me to confirm details and clinic arrival instructions.
                      </span>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full py-4 bg-[#2097A2] hover:bg-[#1B808A] text-white font-bold text-xs uppercase tracking-wider rounded-xs transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CalendarCheck className="w-4 h-4" />
                    <span>Submit Appointment Request</span>
                  </button>

                </form>
              )}

            </div>
          </div>

          {/* Right Column: Lookup, Reschedule, Cancellation & Clinic Guidelines (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Appointment Status Lookup Card */}
            <div className="bg-white p-6 rounded-xs border border-[#E2E8F0] space-y-4 shadow-xs">
              <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-3">
                <Search className="w-4 h-4 text-[#2097A2]" />
                <h3 className="text-sm font-semibold text-[#0A0A0A] uppercase tracking-wide">
                  Appointment Lookup & Management
                </h3>
              </div>
              <p className="text-xs text-[#5B6467]">
                Check status, request rescheduling, submit cancellation, or complete your Smart Pre-Visit form.
              </p>

              <form onSubmit={handleLookup} className="space-y-3">
                <div>
                  <label htmlFor="lookup-ref" className="text-[11px] font-semibold text-[#0A0A0A] block">
                    Reference Code (e.g. DFM-2026-XXXX)
                  </label>
                  <input
                    id="lookup-ref"
                    type="text"
                    required
                    placeholder="DFM-2026-1082"
                    value={lookupRef}
                    onChange={(e) => setLookupRef(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAFAFA] border border-[#CBD5E1] rounded-xs text-xs focus:bg-white focus:border-[#2097A2] focus:outline-hidden uppercase font-mono"
                  />
                </div>

                <div>
                  <label htmlFor="lookup-phone" className="text-[11px] font-semibold text-[#0A0A0A] block">
                    Registered Mobile Number
                  </label>
                  <input
                    id="lookup-phone"
                    type="tel"
                    required
                    placeholder="0321 4455667"
                    value={lookupPhone}
                    onChange={(e) => setLookupPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAFAFA] border border-[#CBD5E1] rounded-xs text-xs focus:bg-white focus:border-[#2097A2] focus:outline-hidden"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#0A0A0A] hover:bg-[#2097A2] text-white text-xs font-bold uppercase tracking-wider rounded-xs transition-colors cursor-pointer"
                >
                  Verify & Lookup Appointment
                </button>
              </form>

              {lookupError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-xs text-rose-700 rounded-xs">
                  {lookupError}
                </div>
              )}

              {/* Matched Appointment Detailed Panel */}
              {matchedAppointment && (
                <div className="p-4 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xs space-y-3 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="font-mono font-bold text-[#2097A2] text-sm">
                      {matchedAppointment.referenceCode}
                    </span>
                    {getStatusBadge(matchedAppointment.status)}
                  </div>

                  <div className="space-y-1 text-slate-700">
                    <div><strong>Patient:</strong> {matchedAppointment.patientName}</div>
                    <div><strong>Format:</strong> {matchedAppointment.appointmentType === 'in-clinic' ? 'In-Clinic Visit' : 'Online Video Consultation'}</div>
                    <div><strong>Date & Time:</strong> {matchedAppointment.preferredDate} at {formatTime12h(matchedAppointment.preferredTimeSlot)} (PKT)</div>
                    <div><strong>Category:</strong> {matchedAppointment.reasonCategory}</div>
                    {matchedAppointment.cancellationReason && (
                      <div className="text-rose-700"><strong>Cancellation Note:</strong> {matchedAppointment.cancellationReason}</div>
                    )}
                  </div>

                  {/* Actions for Matched Appointment */}
                  <div className="pt-2 border-t border-slate-200 flex flex-col gap-2">
                    {/* Pre-Visit Form Shortcut */}
                    <button
                      onClick={() => onNavigate('patient-forms')}
                      className="w-full py-2 bg-[#2097A2] hover:bg-[#1B808A] text-white rounded-xs font-semibold text-xs flex items-center justify-center gap-1.5 transition"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Complete Pre-Visit Intake Form</span>
                    </button>

                    {/* Google Calendar Sync */}
                    {matchedAppointment.status !== 'cancelled' && (
                      <a
                        href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent('Dr. Farhan Mustafa Consultation')}&dates=${matchedAppointment.preferredDate.replace(/-/g, '')}T${matchedAppointment.preferredTimeSlot.replace(':', '')}00/${matchedAppointment.preferredDate.replace(/-/g, '')}T${(parseInt(matchedAppointment.preferredTimeSlot.split(':')[0]) + Math.floor((parseInt(matchedAppointment.preferredTimeSlot.split(':')[1]) + 30) / 60)).toString().padStart(2, '0')}${((parseInt(matchedAppointment.preferredTimeSlot.split(':')[1]) + 30) % 60).toString().padStart(2, '0')}00&details=${encodeURIComponent(`Consultation Reference: ${matchedAppointment.referenceCode}\nPatient: ${matchedAppointment.patientName}\nFormat: ${matchedAppointment.appointmentType}\nContact: +92 328 0145670\nLocation: HealthPro Medical Complex, Faisal Town, Lahore`)}&location=${encodeURIComponent('HealthPro Medical Complex, 860-B, Block B, Faisal Town, Lahore, Pakistan')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-1.5 px-2 bg-[#1A365D] hover:bg-[#152C4D] text-white rounded-xs font-semibold text-[11px] flex items-center justify-center gap-1.5 transition"
                      >
                        <CalendarCheck className="w-3.5 h-3.5" />
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
                          className="py-1.5 px-2 bg-white border border-[#CBD5E1] hover:border-[#2097A2] text-slate-700 rounded-xs font-semibold text-[11px] flex items-center justify-center gap-1"
                        >
                          <RotateCcw className="w-3 h-3 text-indigo-600" />
                          <span>Reschedule</span>
                        </button>

                        <button
                          onClick={() => {
                            setIsCancelling(true);
                            setIsRescheduling(false);
                          }}
                          className="py-1.5 px-2 bg-white border border-rose-200 hover:bg-rose-50 text-rose-700 rounded-xs font-semibold text-[11px] flex items-center justify-center gap-1"
                        >
                          <Ban className="w-3 h-3 text-rose-600" />
                          <span>Cancel</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Reschedule Drawer/Box */}
                  {isRescheduling && (
                    <div className="mt-3 p-3 bg-white border border-indigo-200 rounded-xs space-y-3">
                      <div className="font-semibold text-indigo-900 text-xs flex items-center gap-1">
                        <RotateCcw className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Select New Date & Slot:</span>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-700 block mb-1">New Date</label>
                        <input
                          type="date"
                          min={new Date().toISOString().split('T')[0]}
                          value={rescheduleDate}
                          onChange={(e) => setRescheduleDate(e.target.value)}
                          className="w-full px-2 py-1.5 border border-slate-300 rounded-xs text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-700 block mb-1">New Time Slot</label>
                        <select
                          value={rescheduleSlot}
                          onChange={(e) => setRescheduleSlot(e.target.value)}
                          className="w-full px-2 py-1.5 border border-slate-300 rounded-xs text-xs"
                        >
                          {rescheduleSlots.map((s) => (
                            <option key={s.time} value={s.time} disabled={!s.isAvailable}>
                              {s.label} {!s.isAvailable ? '(Booked)' : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-700 block mb-1">Reason for Rescheduling</label>
                        <input
                          type="text"
                          placeholder="e.g. Work conflict, travel delay..."
                          value={rescheduleReason}
                          onChange={(e) => setRescheduleReason(e.target.value)}
                          className="w-full px-2 py-1.5 border border-slate-300 rounded-xs text-xs"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleConfirmReschedule}
                          className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xs text-xs font-semibold"
                        >
                          Confirm Reschedule
                        </button>
                        <button
                          onClick={() => setIsRescheduling(false)}
                          className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-xs text-xs"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Cancellation Drawer/Box */}
                  {isCancelling && (
                    <div className="mt-3 p-3 bg-white border border-rose-200 rounded-xs space-y-3">
                      <div className="font-semibold text-rose-900 text-xs flex items-center gap-1">
                        <Ban className="w-3.5 h-3.5 text-rose-600" />
                        <span>Confirm Cancellation Request:</span>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-700 block mb-1">Reason for Cancellation</label>
                        <textarea
                          rows={2}
                          placeholder="Please let us know why you need to cancel..."
                          value={cancellationReason}
                          onChange={(e) => setCancellationReason(e.target.value)}
                          className="w-full px-2 py-1.5 border border-slate-300 rounded-xs text-xs"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleConfirmCancellation}
                          className="flex-1 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xs text-xs font-semibold"
                        >
                          Submit Cancellation
                        </button>
                        <button
                          onClick={() => setIsCancelling(false)}
                          className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-xs text-xs"
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
            <div className="bg-[#FAFAFA] p-6 rounded-xs border border-[#E2E8F0] space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#2097A2]">
                Clinic Attendance Guidelines
              </h3>
              
              <ul className="space-y-3 text-xs text-[#5B6467]">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#2097A2] shrink-0 mt-0.5" />
                  <span>
                    <strong>Arrival Time:</strong> Please arrive 10 minutes prior to your confirmed slot at HealthPro Medical Complex, Faisal Town.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#2097A2] shrink-0 mt-0.5" />
                  <span>
                    <strong>Diagnostic Records:</strong> Bring previous prescription slips, blood sugar/BP logs, and recent lab reports.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#2097A2] shrink-0 mt-0.5" />
                  <span>
                    <strong>WhatsApp Support:</strong> Send lab PDFs directly to WhatsApp <strong>+92 328 0145670</strong> before arrival.
                  </span>
                </li>
              </ul>
            </div>

            {/* Direct Support */}
            <div className="bg-white p-6 rounded-xs border border-[#E2E8F0] space-y-3 text-center shadow-xs">
              <span className="text-xs font-bold uppercase tracking-widest text-[#2097A2] block">
                Direct Clinic Helpdesk
              </span>
              <p className="text-xs text-[#5B6467]">
                For instant assistance with appointments or urgent directions:
              </p>
              <div className="flex flex-col gap-2 pt-1">
                <a
                  href="https://wa.me/923280145670"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-4 bg-[#2097A2] text-white text-xs font-semibold rounded-xs hover:bg-[#1B808A] transition-colors flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp: +92 328 0145670</span>
                </a>
                <a
                  href={`tel:${CLINIC_INFO.phoneIntl}`}
                  className="py-2.5 px-4 bg-[#FAFAFA] border border-[#CBD5E1] text-[#0A0A0A] text-xs font-semibold rounded-xs hover:border-[#2097A2] transition-colors flex items-center justify-center gap-2"
                >
                  <Phone className="w-3.5 h-3.5 text-[#2097A2]" />
                  <span>Call: {CLINIC_INFO.phone}</span>
                </a>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
