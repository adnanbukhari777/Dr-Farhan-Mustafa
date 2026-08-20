import React, { useState } from 'react';
import { useCMS } from '../../context/CMSContext';
import { StatusBadge } from './StatusBadge';
import { FeeItem, ScheduleItem, PublicationStatus } from '../../types';
import { DollarSign, Clock, Check, AlertCircle, Edit2, Plus, Calendar } from 'lucide-react';

export const FeesModule: React.FC = () => {
  const { fees, updateFee, addFee, schedules, updateSchedule } = useCMS();
  const [editingFee, setEditingFee] = useState<FeeItem | null>(null);

  const handleSaveFee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFee) return;
    updateFee(editingFee.id, editingFee);
    setEditingFee(null);
  };

  return (
    <div className="space-y-8">
      {/* Consultation Fees Section */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-[#2097A2]" />
              Consultation Fees & Transparent Billing
            </h2>
            <p className="text-sm text-slate-600">
              Manage in-clinic, online video consultation, and follow-up fee rules. Items marked "Needs Verification" will clearly prompt patients on the public site until verified.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {fees.map((fee) => (
            <div
              key={fee.id}
              className="bg-slate-50 rounded-xl p-5 border border-slate-200 flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#2097A2] bg-[#2097A2]/10 px-2 py-0.5 rounded">
                    {fee.consultationType}
                  </span>
                  <StatusBadge status={fee.status} />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1">{fee.serviceName}</h3>
                <div className="text-2xl font-bold text-slate-900 mb-2">
                  {fee.amountPkr === 'Contact Clinic' ? (
                    <span className="text-sm font-semibold text-amber-700 bg-amber-100/70 px-2.5 py-1 rounded-md">
                      Contact Clinic
                    </span>
                  ) : (
                    <span>{fee.amountPkr}</span>
                  )}
                </div>
                <p className="text-xs text-slate-600 mb-3">{fee.notes}</p>
                <div className="text-xs text-slate-500">
                  <strong>Follow-up window:</strong> {fee.validityDays} days
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <button
                  onClick={() => setEditingFee(fee)}
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg transition flex items-center gap-1"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Edit Fee Rule
                </button>
                {fee.status !== 'published' && (
                  <button
                    onClick={() => updateFee(fee.id, { status: 'published' })}
                    className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold"
                  >
                    Publish
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Outpatient Consultation Schedules */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#2097A2]" />
            Outpatient Clinic Timings & Schedule
          </h2>
          <p className="text-sm text-slate-600">
            Set weekly clinic hours at HealthPro Medical Complex, Faisal Town.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase border-b border-slate-200">
              <tr>
                <th className="p-3">Day of Week</th>
                <th className="p-3">Consultation Type</th>
                <th className="p-3">Hours (Start - End)</th>
                <th className="p-3">Status</th>
                <th className="p-3">Scheduling Note</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {schedules.map((sch) => (
                <tr key={sch.id} className="hover:bg-slate-50/80">
                  <td className="p-3 font-bold text-slate-900">{sch.dayOfWeek}</td>
                  <td className="p-3 uppercase font-medium text-slate-600">{sch.consultationType}</td>
                  <td className="p-3">
                    {sch.isActive ? (
                      <span className="font-mono text-slate-800">{sch.startTime} - {sch.endTime}</span>
                    ) : (
                      <span className="text-rose-600 font-semibold">Closed for routine visits</span>
                    )}
                  </td>
                  <td className="p-3">
                    <StatusBadge status={sch.status} />
                  </td>
                  <td className="p-3 text-slate-600">{sch.notes}</td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => {
                        const newActive = !sch.isActive;
                        updateSchedule(sch.id, { isActive: newActive });
                      }}
                      className="px-2.5 py-1 text-xs rounded border border-slate-200 hover:bg-slate-100 font-medium"
                    >
                      {sch.isActive ? 'Set Closed' : 'Set Open'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Fee Modal */}
      {editingFee && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-900">Edit Fee: {editingFee.serviceName}</h3>
              <button
                onClick={() => setEditingFee(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveFee} className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Fee Amount (PKR) or Status</label>
                <input
                  type="text"
                  value={editingFee.amountPkr}
                  onChange={(e) => setEditingFee({ ...editingFee, amountPkr: e.target.value })}
                  placeholder="e.g. PKR 2,500 or Contact Clinic"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Follow-up Validity Window (Days)</label>
                <input
                  type="number"
                  value={editingFee.validityDays}
                  onChange={(e) => setEditingFee({ ...editingFee, validityDays: parseInt(e.target.value) || 7 })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Fee Description & Terms</label>
                <textarea
                  rows={3}
                  value={editingFee.notes}
                  onChange={(e) => setEditingFee({ ...editingFee, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Verification Status</label>
                <select
                  value={editingFee.status}
                  onChange={(e) => setEditingFee({ ...editingFee, status: e.target.value as PublicationStatus })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                >
                  <option value="published">Published (Verified)</option>
                  <option value="needs_verification">Needs Verification</option>
                  <option value="draft">Draft</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingFee(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#2097A2] hover:bg-[#27BAC8] rounded-lg"
                >
                  Save Fee Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
