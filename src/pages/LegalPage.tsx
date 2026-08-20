import React, { useState } from 'react';
import { PageId } from '../types';
import { CLINIC_INFO } from '../data/clinicData';
import { Breadcrumb } from '../components/Breadcrumb';
import { EmergencyBanner } from '../components/EmergencyBanner';
import { ShieldCheck, FileText, AlertTriangle } from 'lucide-react';

interface LegalPageProps {
  initialTab?: 'privacy' | 'terms' | 'disclaimer';
  onNavigate: (page: PageId) => void;
}

export const LegalPage: React.FC<LegalPageProps> = ({
  initialTab = 'privacy',
  onNavigate
}) => {
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms' | 'disclaimer'>(initialTab);

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-16">
      
      {/* Header Block */}
      <div className="bg-[#2097A2] text-white py-12 px-4 sm:px-6 lg:px-8 border-b-4 border-[#27BAC8]">
        <div className="max-w-7xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-[#A4E0E5] block">
            Policies & Clinical Disclaimers
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-white">
            {activeTab === 'privacy' && 'Privacy Policy'}
            {activeTab === 'terms' && 'Terms of Use'}
            {activeTab === 'disclaimer' && 'Medical & AI Disclaimer'}
          </h1>
          <p className="text-sm sm:text-base text-white/90 font-normal max-w-2xl">
            Legal, privacy, and clinical boundaries governing Dr. Farhan Mustafa's clinic web portal.
          </p>
        </div>
      </div>

      <Breadcrumb 
        items={[{ label: activeTab === 'privacy' ? 'Privacy Policy' : activeTab === 'terms' ? 'Terms of Use' : 'Medical Disclaimer' }]} 
        onNavigate={onNavigate} 
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 space-y-8">
        <EmergencyBanner />

        {/* Tab Navigation */}
        <div className="flex border-b border-[#E2E8F0] space-x-4">
          <button
            onClick={() => setActiveTab('privacy')}
            className={`py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'privacy'
                ? 'border-[#2097A2] text-[#2097A2]'
                : 'border-transparent text-[#5B6467] hover:text-[#0A0A0A]'
            }`}
          >
            Privacy Policy
          </button>
          <button
            onClick={() => setActiveTab('terms')}
            className={`py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'terms'
                ? 'border-[#2097A2] text-[#2097A2]'
                : 'border-transparent text-[#5B6467] hover:text-[#0A0A0A]'
            }`}
          >
            Terms of Use
          </button>
          <button
            onClick={() => setActiveTab('disclaimer')}
            className={`py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'disclaimer'
                ? 'border-[#2097A2] text-[#2097A2]'
                : 'border-transparent text-[#5B6467] hover:text-[#0A0A0A]'
            }`}
          >
            Medical & AI Disclaimer
          </button>
        </div>

        {/* Tab Content */}
        <div className="bg-white p-6 sm:p-10 rounded-xs border border-[#E2E8F0] space-y-6 max-w-4xl text-xs sm:text-sm text-[#5B6467] leading-relaxed">
          
          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-[#0A0A0A] mb-2">Patient Data & Privacy Policy</h2>
                <p>Last updated: August 2026</p>
              </div>

              <div className="space-y-3">
                <h3 className="text-base font-semibold text-[#0A0A0A]">1. Information We Collect</h3>
                <p>
                  When you submit an appointment request, contact message, or pre-visit intake form, we collect the minimum information required to coordinate your medical visit: full name, mobile/WhatsApp number, email address (if provided), preferred appointment date, and clinical context you choose to supply.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-base font-semibold text-[#0A0A0A]">2. Use of Information</h3>
                <p>
                  Information provided is used strictly by Dr. Farhan Mustafa and authorized clinic staff to schedule appointments, verify consultation details, and prepare for in-clinic evaluations at HealthPro Medical Complex. We do not sell, rent, or distribute personal data to third parties.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-base font-semibold text-[#0A0A0A]">3. Data Security</h3>
                <p>
                  We implement reasonable technical and organizational safeguards to protect patient information against unauthorized access, loss, or disclosure.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'terms' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-[#0A0A0A] mb-2">Terms of Website Use</h2>
                <p>Last updated: August 2026</p>
              </div>

              <div className="space-y-3">
                <h3 className="text-base font-semibold text-[#0A0A0A]">1. Acceptance of Terms</h3>
                <p>
                  By accessing or using this website, you agree to comply with these terms. This website is an informational and appointment coordination portal for Dr. Farhan Mustafa’s clinical practice at HealthPro Medical Complex, Lahore.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-base font-semibold text-[#0A0A0A]">2. Appointment Scheduling</h3>
                <p>
                  Submission of an appointment request does not constitute a guaranteed or confirmed booking until reviewed and confirmed by clinic staff based on clinical availability.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-base font-semibold text-[#0A0A0A]">3. Intellectual Property</h3>
                <p>
                  All written educational materials, medical descriptions, and brand assets on this website are the property of Dr. Farhan Mustafa and may not be reproduced without written permission.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'disclaimer' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-[#0A0A0A] mb-2">Medical & AI Receptionist Disclaimer</h2>
                <p>Last updated: August 2026</p>
              </div>

              <div className="p-4 bg-red-50 border-l-4 border-red-700 text-red-950 space-y-1">
                <strong>Emergency Medical Notice:</strong>
                <p>
                  This website and any automated tools are NOT intended for emergency triage or acute medical crises. If you are experiencing severe chest pain, sudden numbness, difficulty breathing, or severe injury, please contact Rescue 1122 or report to the nearest hospital emergency department immediately.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-base font-semibold text-[#0A0A0A]">1. Not a Substitute for Medical Advice</h3>
                <p>
                  Content published on this website (including articles, resources, and FAQ answers) is for general educational information only. It does not establish a doctor-patient relationship and cannot replace a direct medical consultation with a qualified healthcare professional.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-base font-semibold text-[#0A0A0A]">2. AI Clinic Receptionist Scope</h3>
                <p>
                  The AI Receptionist is an automated administrative assistant designed solely to answer approved clinic questions (location, timings, appointment policies) and help submit appointment requests. The AI assistant does not diagnose diseases, recommend prescriptions, or interpret diagnostic laboratory results.
                </p>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
