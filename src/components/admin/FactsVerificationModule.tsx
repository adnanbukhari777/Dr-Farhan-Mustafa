import React, { useState } from 'react';
import { useCMS } from '../../context/CMSContext';
import { StatusBadge } from './StatusBadge';
import { CheckCircle, AlertTriangle, Clock, RefreshCw, ShieldCheck, FileCheck, Info } from 'lucide-react';
import { FactVerificationItem } from '../../types';

export const FactsVerificationModule: React.FC = () => {
  const { factsQueue, updateFactStatus } = useCMS();
  const [filter, setFilter] = useState<'all' | 'pending' | 'verified'>('all');
  const [editingItem, setEditingItem] = useState<FactVerificationItem | null>(null);
  const [editSuggestedValue, setEditSuggestedValue] = useState('');
  const [editNotes, setEditNotes] = useState('');

  const filteredFacts = factsQueue.filter(f => {
    if (filter === 'pending') return f.status === 'pending_verification' || f.status === 'needs_doctor_approval';
    if (filter === 'verified') return f.status === 'verified';
    return true;
  });

  const pendingCount = factsQueue.filter(f => f.status === 'pending_verification' || f.status === 'needs_doctor_approval').length;
  const verifiedCount = factsQueue.filter(f => f.status === 'verified').length;

  const handleOpenEdit = (item: FactVerificationItem) => {
    setEditingItem(item);
    setEditSuggestedValue(item.suggestedValue);
    setEditNotes(item.adminNotes || '');
  };

  const handleSaveEdit = (newStatus: FactVerificationItem['status']) => {
    if (!editingItem) return;
    updateFactStatus(editingItem.id, newStatus, editSuggestedValue, editNotes);
    setEditingItem(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Overview Banner */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-6 h-6 text-[#2097A2]" />
            <h2 className="text-xl font-bold text-slate-900">Pre-Launch Facts Verification Queue</h2>
          </div>
          <p className="text-sm text-slate-600">
            Strict compliance safeguards preventing unconfirmed fees, consultation hours, or unverified claims from going live without explicit clinic sign-off.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 text-center">
            <div className="text-xl font-bold text-amber-800">{pendingCount}</div>
            <div className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Pending Action</div>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2 text-center">
            <div className="text-xl font-bold text-emerald-800">{verifiedCount}</div>
            <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Verified</div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${filter === 'all' ? 'bg-[#2097A2] text-white' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          All Items ({factsQueue.length})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${filter === 'pending' ? 'bg-[#2097A2] text-white' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          Pending Review ({pendingCount})
        </button>
        <button
          onClick={() => setFilter('verified')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${filter === 'verified' ? 'bg-[#2097A2] text-white' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          Verified ({verifiedCount})
        </button>
      </div>

      {/* Fact Items List */}
      <div className="space-y-4">
        {filteredFacts.map((fact) => (
          <div
            key={fact.id}
            className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:border-[#2097A2]/40 transition space-y-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#2097A2] bg-[#2097A2]/10 px-2.5 py-1 rounded">
                  {fact.category}
                </span>
                <h3 className="text-base font-bold text-slate-900">{fact.title}</h3>
              </div>
              <StatusBadge status={fact.status} />
            </div>

            <p className="text-sm text-slate-600">{fact.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="font-semibold text-slate-500 uppercase block mb-1">Current Public Display:</span>
                <span className="text-slate-800 font-medium">{fact.currentValue}</span>
              </div>
              <div className="bg-amber-50/50 p-3 rounded-lg border border-amber-100">
                <span className="font-semibold text-amber-700 uppercase block mb-1">Proposed Value for Sign-Off:</span>
                <span className="text-slate-800 font-medium">{fact.suggestedValue}</span>
              </div>
            </div>

            {fact.adminNotes && (
              <div className="bg-blue-50/50 p-2.5 rounded-lg border border-blue-100 text-xs text-blue-800 flex items-start gap-2">
                <Info className="w-4 h-4 shrink-0 text-blue-600 mt-0.5" />
                <span><strong>Internal Note:</strong> {fact.adminNotes}</span>
              </div>
            )}

            {fact.verifiedBy && (
              <div className="text-xs text-slate-400">
                Verified by <span className="text-slate-600 font-medium">{fact.verifiedBy}</span> on {fact.verifiedAt}
              </div>
            )}

            {/* Action Bar */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => handleOpenEdit(fact)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
              >
                Edit & Review
              </button>
              {fact.status !== 'verified' && (
                <button
                  onClick={() => updateFactStatus(fact.id, 'verified', fact.suggestedValue, 'Approved by staff review.')}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition flex items-center gap-1"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  Mark Verified
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Edit Fact Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-semibold text-[#2097A2] uppercase">{editingItem.category}</span>
                <h3 className="text-lg font-bold text-slate-900">{editingItem.title}</h3>
              </div>
              <button
                onClick={() => setEditingItem(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Proposed Value / Value to Publish:
                </label>
                <input
                  type="text"
                  value={editSuggestedValue}
                  onChange={(e) => setEditSuggestedValue(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-[#2097A2]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Verification Notes / Source Reference:
                </label>
                <textarea
                  rows={3}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="e.g. Confirmed with Dr. Farhan via WhatsApp on 18 August 2026..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-[#2097A2]"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 pt-4 border-t border-slate-200">
              <button
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSaveEdit('needs_doctor_approval')}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-purple-700 bg-purple-100 hover:bg-purple-200"
              >
                Escalate to Doctor
              </button>
              <button
                onClick={() => handleSaveEdit('verified')}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700"
              >
                Approve & Mark Verified
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
