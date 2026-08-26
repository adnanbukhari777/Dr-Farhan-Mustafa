import React, { useState } from 'react';
import { PageId } from '../types';
import { CLINIC_INFO } from '../data/clinicData';
import { useCMS } from '../context/CMSContext';
import { PageHero } from '../components/PageHero';
import { EmergencyBanner } from '../components/EmergencyBanner';
import { 
  FileCheck2, 
  Lock, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  ClipboardList, 
  HeartPulse, 
  Pill, 
  AlertTriangle,
  Calendar,
  Phone
} from 'lucide-react';

interface PatientFormsPageProps {
  onNavigate: (page: PageId) => void;
}

export const PatientFormsPage: React.FC<PatientFormsPageProps> = ({ onNavigate }) => {
  const { appointments, saveIntake } = useCMS();

  // Step 1: Verification State
  const [isVerified, setIsVerified] = useState(false);
  const [refCode, setRefCode] = useState('');
  const [phone, setPhone] = useState('');
  const [matchedAppointment, setMatchedAppointment] = useState<any | null>(null);
  const [verificationError, setVerificationError] = useState('');

  // Step 2: Intake Form State
  const [intakeData, setIntakeData] = useState({
    visitReason: '',
    symptomDuration: '',
    existingConditions: '',
    currentMedicines: '',
    knownAllergies: '',
    intakeNotes: '',
    consentAgreed: false
  });

  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refCode.trim() || !phone.trim()) {
      setVerificationError('Please enter both your appointment reference code and registered mobile number.');
      return;
    }

    const cleanRef = refCode.trim().toUpperCase();
    const cleanPhone = phone.trim().replace(/[^0-9]/g, '');

    const found = appointments.find(
      (a) =>
        a.referenceCode.toUpperCase() === cleanRef &&
        a.patientPhone.replace(/[^0-9]/g, '').endsWith(cleanPhone.slice(-7))
    );

    if (found) {
      setMatchedAppointment(found);
      setIntakeData({
        visitReason: found.visitReason || '',
        symptomDuration: found.symptomDuration || '',
        existingConditions: found.existingConditions || '',
        currentMedicines: found.currentMedicines || '',
        knownAllergies: found.knownAllergies || '',
        intakeNotes: found.intakeNotes || found.patientNotes || '',
        consentAgreed: false,
      });
      setVerificationError('');
      setIsVerified(true);
      return;
    }

    // Try backend verification
    try {
      const res = await fetch('/api/appointments/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ referenceCode: cleanRef, phone: cleanPhone }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.data) {
          setMatchedAppointment(data.data);
          setIntakeData({
            visitReason: data.data.visitReason || '',
            symptomDuration: data.data.symptomDuration || '',
            existingConditions: data.data.existingConditions || '',
            currentMedicines: data.data.currentMedicines || '',
            knownAllergies: data.data.knownAllergies || '',
            intakeNotes: data.data.intakeNotes || '',
            consentAgreed: false,
          });
          setVerificationError('');
          setIsVerified(true);
          return;
        }
      }
    } catch (err) {
      // ignore
    }

    setVerificationError('No matching appointment record found. Please verify your reference code (e.g. DFM-2026-XXXX) and mobile number.');
  };

  const handleIntakeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!intakeData.visitReason || !intakeData.consentAgreed) {
      alert('Please state your primary visit reason and accept the clinical consent.');
      return;
    }

    if (matchedAppointment) {
      saveIntake(matchedAppointment.id, {
        visitReason: intakeData.visitReason,
        symptomDuration: intakeData.symptomDuration,
        existingConditions: intakeData.existingConditions,
        currentMedicines: intakeData.currentMedicines,
        knownAllergies: intakeData.knownAllergies,
        intakeNotes: intakeData.intakeNotes,
      });

      try {
        await fetch('/api/appointments/intake', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            referenceCode: matchedAppointment.referenceCode,
            phone: matchedAppointment.patientPhone,
            visitReason: intakeData.visitReason,
            symptomDuration: intakeData.symptomDuration,
            existingConditions: intakeData.existingConditions,
            currentMedicines: intakeData.currentMedicines,
            knownAllergies: intakeData.knownAllergies,
            intakeNotes: intakeData.intakeNotes,
          }),
        });
      } catch (err) {
        // Saved locally in CMSContext
      }
    }

    setFormSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-light-blue pb-16">
      
      {/* Standardized Master Page Hero */}
      <PageHero
        title="Pre-Consultation Intake Form"
        eyebrow="Pre-Visit Preparation"
        subtitle="Securely provide essential health background to optimize your scheduled consultation time."
        breadcrumbs={[{ label: 'Patient Forms' }]}
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
              href={`tel:${CLINIC_INFO.phoneIntl}`}
              className="btn-secondary text-xs !min-h-[44px]"
            >
              <Phone className="w-[18px] h-[18px] text-[#25B3C2]" aria-hidden="true" />
              <span>Call Reception: {CLINIC_INFO.phone}</span>
            </a>
          </>
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-10">
        <EmergencyBanner />

        {/* Why Complete Intake Information */}
        <div className="bg-white p-6 sm:p-8 rounded-xs border border-[#E2E8F0] space-y-4 max-w-4xl mx-auto">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-[#2097A2]" />
            <h2 className="text-base sm:text-lg font-semibold text-[#0A0A0A]">
              About the Pre-Visit Intake Process
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#5B6467] leading-relaxed">
            Completing this brief intake form allows Dr. Farhan Mustafa to review your medical background prior to your arrival at HealthPro Medical Complex, ensuring your in-clinic consultation focuses directly on diagnostic assessment and personalized management.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs text-[#0A0A0A]">
            <div className="p-3 bg-[#FAFAFA] border border-[#E2E8F0] rounded-xs flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#2097A2] shrink-0" />
              <span>Restricted to Authorized Staff</span>
            </div>
            <div className="p-3 bg-[#FAFAFA] border border-[#E2E8F0] rounded-xs flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#2097A2] shrink-0" />
              <span>Requires Appointment Reference</span>
            </div>
            <div className="p-3 bg-[#FAFAFA] border border-[#E2E8F0] rounded-xs flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-[#2097A2] shrink-0" />
              <span>No Automated Prescriptions</span>
            </div>
          </div>
        </div>

        {/* Step 1: Verification Guard */}
        {!isVerified ? (
          <div className="bg-white p-8 rounded-xs border-2 border-[#2097A2] max-w-xl mx-auto space-y-6 shadow-xs">
            <div className="space-y-2 text-center">
              <div className="w-12 h-12 rounded-full bg-[#2097A2]/10 border border-[#2097A2]/30 flex items-center justify-center mx-auto">
                <Lock className="w-6 h-6 text-[#2097A2]" />
              </div>
              <h3 className="text-lg font-semibold text-[#0A0A0A]">
                Patient Verification Required
              </h3>
              <p className="text-xs text-[#5B6467]">
                To protect patient privacy, please enter your confirmed <strong>Appointment Reference Code</strong> and <strong>Mobile Number</strong> before accessing the intake form.
              </p>
            </div>

            <form onSubmit={handleVerify} className="space-y-4">
              <div className="space-y-1">
                <label htmlFor="verify-ref" className="text-xs font-semibold text-[#0A0A0A] block">
                  Appointment Reference (e.g. DFM-2026-XXXX) <span className="text-red-600">*</span>
                </label>
                <input
                  id="verify-ref"
                  type="text"
                  required
                  placeholder="e.g. DFM-2026-1234"
                  value={refCode}
                  onChange={(e) => setRefCode(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#FAFAFA] border border-[#CBD5E1] rounded-xs text-xs sm:text-sm focus:bg-white focus:border-[#2097A2] focus:outline-hidden uppercase"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="verify-phone" className="text-xs font-semibold text-[#0A0A0A] block">
                  Registered Mobile Number <span className="text-red-600">*</span>
                </label>
                <input
                  id="verify-phone"
                  type="tel"
                  required
                  placeholder="e.g. 0328 0145670"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#FAFAFA] border border-[#CBD5E1] rounded-xs text-xs sm:text-sm focus:bg-white focus:border-[#2097A2] focus:outline-hidden"
                />
              </div>

              {verificationError && (
                <div className="p-3 bg-red-50 border border-red-200 text-xs text-red-700 rounded-xs">
                  {verificationError}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 bg-[#2097A2] hover:bg-[#1B808A] text-white font-bold text-xs uppercase tracking-wider rounded-xs transition-colors cursor-pointer shadow-xs"
              >
                Verify & Open Intake Form
              </button>

              <div className="text-center pt-2">
                <p className="text-xs text-[#5B6467]">
                  Don't have an appointment reference yet?{' '}
                  <button
                    type="button"
                    onClick={() => onNavigate('appointments')}
                    className="text-[#2097A2] font-semibold hover:underline"
                  >
                    Request an appointment first
                  </button>
                </p>
              </div>
            </form>
          </div>
        ) : formSubmitted ? (
          /* Step 3: Success State */
          <div className="bg-green-50 border border-green-200 p-8 rounded-xs max-w-2xl mx-auto space-y-4 text-center">
            <CheckCircle2 className="w-10 h-10 text-green-700 mx-auto" />
            <h3 className="text-xl font-semibold text-green-950">
              Pre-Visit Intake Information Recorded
            </h3>
            <p className="text-xs sm:text-sm text-green-800 leading-relaxed max-w-lg mx-auto">
              Your health details have been linked securely to appointment reference <strong>{refCode.toUpperCase()}</strong>. Dr. Farhan Mustafa and authorized clinic staff will review this context during your consultation.
            </p>
            <div className="p-4 bg-white border border-green-200 rounded-xs text-xs text-[#5B6467] text-left space-y-2">
              <strong className="text-[#0A0A0A] block">What to remember for your visit:</strong>
              <p>• Please bring original copies of any recent blood tests or imaging.</p>
              <p>• Arrive 10 minutes early at HealthPro Medical Complex, Faisal Town, Lahore.</p>
            </div>
            <div className="pt-2">
              <button
                onClick={() => onNavigate('home')}
                className="px-6 py-3 bg-[#2097A2] text-white text-xs font-bold uppercase tracking-wider rounded-xs hover:bg-[#1B808A] transition-colors"
              >
                Return to Home
              </button>
            </div>
          </div>
        ) : (
          /* Step 2: Intake Form Fields */
          <div className="bg-white p-6 sm:p-10 rounded-xs border border-[#E2E8F0] max-w-3xl mx-auto space-y-8">
            <div className="border-b border-[#E2E8F0] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-xl font-semibold text-[#0A0A0A]">
                  Pre-Consultation Clinical Intake
                </h3>
                <p className="text-xs text-[#5B6467] mt-0.5">
                  Verified for Reference: <strong className="text-[#0A0A0A] uppercase">{refCode}</strong>
                </p>
              </div>
              <span className="text-[11px] font-semibold text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-xs">
                Verified Session
              </span>
            </div>

            <form onSubmit={handleIntakeSubmit} className="space-y-6">
              
              {/* Primary Reason */}
              <div className="space-y-1.5">
                <label htmlFor="intake-reason" className="text-xs font-semibold text-[#0A0A0A] block">
                  Primary Reason for Today's Visit <span className="text-red-600">*</span>
                </label>
                <textarea
                  id="intake-reason"
                  rows={2}
                  required
                  placeholder="e.g. Evaluating elevated blood pressure readings and morning headaches..."
                  value={intakeData.visitReason}
                  onChange={(e) => setIntakeData({ ...intakeData, visitReason: e.target.value })}
                  className="w-full p-3 bg-[#FAFAFA] border border-[#CBD5E1] rounded-xs text-xs sm:text-sm focus:bg-white focus:border-[#2097A2] focus:outline-hidden"
                ></textarea>
              </div>

              {/* Symptom Duration */}
              <div className="space-y-1.5">
                <label htmlFor="intake-duration" className="text-xs font-semibold text-[#0A0A0A] block">
                  Approximate Symptom Duration
                </label>
                <input
                  id="intake-duration"
                  type="text"
                  placeholder="e.g. 2 weeks, 3 months, routine follow-up"
                  value={intakeData.symptomDuration}
                  onChange={(e) => setIntakeData({ ...intakeData, symptomDuration: e.target.value })}
                  className="w-full px-3 py-2.5 bg-[#FAFAFA] border border-[#CBD5E1] rounded-xs text-xs sm:text-sm focus:bg-white focus:border-[#2097A2] focus:outline-hidden"
                />
              </div>

              {/* Existing Conditions */}
              <div className="space-y-1.5">
                <label htmlFor="intake-conditions" className="text-xs font-semibold text-[#0A0A0A] block">
                  Diagnosed Chronic Health Conditions (if any)
                </label>
                <input
                  id="intake-conditions"
                  type="text"
                  placeholder="e.g. Hypertension, Type 2 Diabetes, High Cholesterol, Asthma"
                  value={intakeData.existingConditions}
                  onChange={(e) => setIntakeData({ ...intakeData, existingConditions: e.target.value })}
                  className="w-full px-3 py-2.5 bg-[#FAFAFA] border border-[#CBD5E1] rounded-xs text-xs sm:text-sm focus:bg-white focus:border-[#2097A2] focus:outline-hidden"
                />
              </div>

              {/* Current Medicines */}
              <div className="space-y-1.5">
                <label htmlFor="intake-medicines" className="text-xs font-semibold text-[#0A0A0A] block">
                  Current Prescription Medicines & Supplements (Names & Dosages)
                </label>
                <textarea
                  id="intake-medicines"
                  rows={2}
                  placeholder="e.g. Metformin 500mg (twice daily), Amlodipine 5mg (morning)"
                  value={intakeData.currentMedicines}
                  onChange={(e) => setIntakeData({ ...intakeData, currentMedicines: e.target.value })}
                  className="w-full p-3 bg-[#FAFAFA] border border-[#CBD5E1] rounded-xs text-xs sm:text-sm focus:bg-white focus:border-[#2097A2] focus:outline-hidden"
                ></textarea>
              </div>

              {/* Allergies */}
              <div className="space-y-1.5">
                <label htmlFor="intake-allergies" className="text-xs font-semibold text-[#0A0A0A] block">
                  Known Drug or Food Allergies
                </label>
                <input
                  id="intake-allergies"
                  type="text"
                  placeholder="e.g. Penicillin, NSAIDs, None known"
                  value={intakeData.knownAllergies}
                  onChange={(e) => setIntakeData({ ...intakeData, knownAllergies: e.target.value })}
                  className="w-full px-3 py-2.5 bg-[#FAFAFA] border border-[#CBD5E1] rounded-xs text-xs sm:text-sm focus:bg-white focus:border-[#2097A2] focus:outline-hidden"
                />
              </div>

              {/* General Note */}
              <div className="space-y-1.5">
                <label htmlFor="intake-notes" className="text-xs font-semibold text-[#0A0A0A] block">
                  Additional Notes or Questions for Dr. Farhan
                </label>
                <textarea
                  id="intake-notes"
                  rows={2}
                  placeholder="Any specific questions or concerns you would like to discuss..."
                  value={intakeData.generalNotes}
                  onChange={(e) => setIntakeData({ ...intakeData, generalNotes: e.target.value })}
                  className="w-full p-3 bg-[#FAFAFA] border border-[#CBD5E1] rounded-xs text-xs sm:text-sm focus:bg-white focus:border-[#2097A2] focus:outline-hidden"
                ></textarea>
              </div>

              {/* Explicit Consent Checkbox */}
              <div className="pt-4 border-t border-[#E2E8F0] space-y-3">
                <label className="flex items-start gap-2.5 text-xs text-[#5B6467] cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={intakeData.consentAgreed}
                    onChange={(e) => setIntakeData({ ...intakeData, consentAgreed: e.target.checked })}
                    className="mt-0.5 rounded-xs text-[#2097A2] focus:ring-[#2097A2]"
                  />
                  <span>
                    I confirm that the provided information is accurate to the best of my knowledge and understand it will be utilized solely by Dr. Farhan Mustafa and authorized clinic personnel for clinical evaluation during my scheduled visit.
                  </span>
                </label>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  className="w-full py-4 bg-[#2097A2] hover:bg-[#1B808A] text-white font-bold text-xs uppercase tracking-wider rounded-xs transition-colors cursor-pointer shadow-xs"
                >
                  Submit Pre-Visit Intake Record
                </button>
              </div>

            </form>
          </div>
        )}

      </div>

    </div>
  );
};
