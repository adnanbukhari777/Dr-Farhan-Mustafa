import React, { useState } from 'react';
import { useCMS } from '../../context/CMSContext';
import { StatusBadge } from './StatusBadge';
import { UserCheck, Award, Plus, Trash2, Edit2, ShieldAlert } from 'lucide-react';
import { CredentialItem } from '../../types';

export const DoctorProfileModule: React.FC = () => {
  const { doctorProfile, updateDoctorProfile, credentials, updateCredential, addCredential, deleteCredential, clinicInfo, updateClinicInfo } = useCMS();
  
  const [profileData, setProfileData] = useState(doctorProfile);
  const [newCred, setNewCred] = useState<Partial<CredentialItem>>({
    title: '',
    credentialType: 'fellowship',
    institution: '',
    year: 'Verified',
    verificationCode: '',
    status: 'published'
  });
  const [isAddingCred, setIsAddingCred] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateDoctorProfile(profileData);
    updateClinicInfo({
      doctorName: profileData.name,
      title: profileData.title,
      qualifications: profileData.qualifications,
    });
  };

  const handleAddCred = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCred.title || !newCred.institution) return;
    addCredential({
      title: newCred.title,
      credentialType: newCred.credentialType as any,
      institution: newCred.institution,
      year: newCred.year || 'Verified',
      verificationCode: newCred.verificationCode,
      status: (newCred.status as any) || 'published'
    });
    setIsAddingCred(false);
    setNewCred({ title: '', credentialType: 'fellowship', institution: '', year: 'Verified', verificationCode: '', status: 'published' });
  };

  return (
    <div className="space-y-8">
      {/* Doctor Profile Information */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-[#2097A2]" />
              Doctor Profile & Clinical Biography
            </h2>
            <p className="text-sm text-slate-600">
              Manage Dr. Farhan Mustafa's clinical title, PMDC registration details, specialty, and care philosophy.
            </p>
          </div>
          <StatusBadge status={doctorProfile.status} />
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Doctor Full Name</label>
              <input
                type="text"
                required
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-[#2097A2]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Official Clinical Designation</label>
              <input
                type="text"
                required
                value={profileData.title}
                onChange={(e) => setProfileData({ ...profileData, title: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-[#2097A2]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Board Qualifications / Degrees</label>
              <input
                type="text"
                required
                value={profileData.qualifications}
                onChange={(e) => setProfileData({ ...profileData, qualifications: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-[#2097A2]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">PMDC Registration Number</label>
              <input
                type="text"
                required
                value={profileData.pmdcNumber}
                onChange={(e) => setProfileData({ ...profileData, pmdcNumber: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:outline-none focus:border-[#2097A2]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Clinical Specialty</label>
              <input
                type="text"
                required
                value={profileData.specialty}
                onChange={(e) => setProfileData({ ...profileData, specialty: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-[#2097A2]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Official Doctor Photo / Portrait (About the Physician Image)
            </label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <img
                src={profileData.photoUrl || '/assets/images/doctor/dr-farhan-about.jpg'}
                alt="Doctor portrait preview"
                className="w-20 h-20 rounded-lg object-cover border border-slate-300 shadow-xs bg-white"
                referrerPolicy="no-referrer"
              />
              <div className="flex-1 space-y-1.5 w-full">
                <input
                  type="text"
                  value={profileData.photoUrl || '/assets/images/doctor/dr-farhan-about.jpg'}
                  onChange={(e) => setProfileData({ ...profileData, photoUrl: e.target.value })}
                  placeholder="/assets/images/doctor/dr-farhan-about.jpg"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono focus:outline-none focus:border-[#2097A2]"
                />
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Saved locally in <code className="text-[#2097A2] font-mono">public/assets/images/doctor/</code></span>
                  <button
                    type="button"
                    onClick={() => setProfileData({ ...profileData, photoUrl: '/assets/images/doctor/dr-farhan-about.jpg' })}
                    className="text-[#2097A2] hover:underline font-medium"
                  >
                    Reset to Default Image
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Experience Summary</label>
            <textarea
              rows={2}
              value={profileData.experienceSummary}
              onChange={(e) => setProfileData({ ...profileData, experienceSummary: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-[#2097A2]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Clinical Philosophy & Patient Care Promise</label>
            <textarea
              rows={3}
              value={profileData.clinicalPhilosophy}
              onChange={(e) => setProfileData({ ...profileData, clinicalPhilosophy: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-[#2097A2]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Full Detailed Biography</label>
            <textarea
              rows={4}
              value={profileData.bioFull}
              onChange={(e) => setProfileData({ ...profileData, bioFull: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-[#2097A2]"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#2097A2] hover:bg-[#27BAC8] text-white font-semibold text-sm rounded-lg transition"
            >
              Save Profile Changes
            </button>
          </div>
        </form>
      </div>

      {/* Credentials & Certifications Manager */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-[#2097A2]" />
              Verified Credentials & Board Accreditations
            </h3>
            <p className="text-xs text-slate-600">
              FCPS, MRCP (UK), and PMDC certified medical degrees.
            </p>
          </div>
          <button
            onClick={() => setIsAddingCred(true)}
            className="px-3 py-2 bg-slate-100 hover:bg-[#2097A2] hover:text-white text-slate-700 text-xs font-semibold rounded-lg transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Add Credential
          </button>
        </div>

        {isAddingCred && (
          <form onSubmit={handleAddCred} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Add New Credential / Degree</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Degree / Fellowship Title *"
                required
                value={newCred.title || ''}
                onChange={(e) => setNewCred({ ...newCred, title: e.target.value })}
                className="px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
              <input
                type="text"
                placeholder="Awarding Body / Institution *"
                required
                value={newCred.institution || ''}
                onChange={(e) => setNewCred({ ...newCred, institution: e.target.value })}
                className="px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <select
                value={newCred.credentialType || 'fellowship'}
                onChange={(e) => setNewCred({ ...newCred, credentialType: e.target.value as any })}
                className="px-3 py-2 border border-slate-300 rounded-lg text-xs"
              >
                <option value="fellowship">Fellowship (FCPS/FRCP)</option>
                <option value="membership">Membership (MRCP)</option>
                <option value="registration">Registration (PMDC)</option>
                <option value="degree">Medical Degree (MBBS/MD)</option>
                <option value="award">Clinical Award</option>
              </select>
              <input
                type="text"
                placeholder="Year / Status (e.g. Verified)"
                value={newCred.year || ''}
                onChange={(e) => setNewCred({ ...newCred, year: e.target.value })}
                className="px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
              <input
                type="text"
                placeholder="Verification Code (Optional)"
                value={newCred.verificationCode || ''}
                onChange={(e) => setNewCred({ ...newCred, verificationCode: e.target.value })}
                className="px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddingCred(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold text-white bg-[#2097A2] hover:bg-[#27BAC8] rounded"
              >
                Save Credential
              </button>
            </div>
          </form>
        )}

        <div className="space-y-3">
          {credentials.map((cred) => (
            <div
              key={cred.id}
              className="flex items-center justify-between p-3.5 bg-slate-50 rounded-lg border border-slate-200"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">{cred.title}</span>
                  <StatusBadge status={cred.status} />
                </div>
                <div className="text-xs text-slate-600">
                  {cred.institution} • <span className="text-emerald-700 font-medium">{cred.year}</span>
                  {cred.verificationCode && <span className="text-slate-400 font-mono ml-2">[{cred.verificationCode}]</span>}
                </div>
              </div>
              <button
                onClick={() => deleteCredential(cred.id)}
                className="text-slate-400 hover:text-rose-600 p-1 rounded"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
