import React, { useState } from 'react';
import { useCMS } from '../../context/CMSContext';
import { StatusBadge } from './StatusBadge';
import { ServiceItem, PublicationStatus } from '../../types';
import { Plus, Edit2, Trash2, CheckCircle, Stethoscope, AlertCircle } from 'lucide-react';

export const ServicesModule: React.FC = () => {
  const { services, updateService, addService, deleteService } = useCMS();
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Form states
  const [formData, setFormData] = useState<Partial<ServiceItem>>({
    title: '',
    slug: '',
    category: 'Internal Medicine',
    shortDescription: '',
    fullDescription: '',
    symptomsOrReasons: [],
    whatToBring: [],
    status: 'published',
    isVerified: true
  });

  const [symptomsInput, setSymptomsInput] = useState('');
  const [whatToBringInput, setWhatToBringInput] = useState('');

  const handleOpenEdit = (srv: ServiceItem) => {
    setEditingService(srv);
    setIsCreating(false);
    setFormData(srv);
    setSymptomsInput(srv.symptomsOrReasons.join('\n'));
    setWhatToBringInput(srv.whatToBring.join('\n'));
  };

  const handleOpenCreate = () => {
    setEditingService(null);
    setIsCreating(true);
    setFormData({
      title: '',
      slug: '',
      category: 'General Medicine',
      shortDescription: '',
      fullDescription: '',
      symptomsOrReasons: [],
      whatToBring: [],
      status: 'published',
      isVerified: true
    });
    setSymptomsInput('');
    setWhatToBringInput('');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;

    const slug = formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const symptoms = symptomsInput.split('\n').map(s => s.trim()).filter(Boolean);
    const whatToBring = whatToBringInput.split('\n').map(s => s.trim()).filter(Boolean);

    const payload = {
      ...formData,
      slug,
      symptomsOrReasons: symptoms,
      whatToBring: whatToBring,
      faqs: formData.faqs || [
        { question: 'What should I prepare for this consultation?', answer: 'Please bring your previous medical files and prescription history.' }
      ]
    } as ServiceItem;

    if (isCreating) {
      addService(payload);
    } else if (editingService) {
      updateService(editingService.id, payload);
    }

    setEditingService(null);
    setIsCreating(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-[#2097A2]" />
            Clinical Services CMS
          </h2>
          <p className="text-sm text-slate-600">
            Manage outpatient specialties, clinical descriptions, symptoms, preparation notes, and publish states.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 rounded-lg bg-[#2097A2] hover:bg-[#27BAC8] text-white text-sm font-semibold flex items-center justify-center gap-2 transition"
        >
          <Plus className="w-4 h-4" />
          Add New Service
        </button>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map((service) => (
          <div
            key={service.id}
            className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between hover:border-[#2097A2]/50 transition"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  {service.category}
                </span>
                <StatusBadge status={service.status || (service.isVerified ? 'published' : 'needs_verification')} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">{service.title}</h3>
              <p className="text-xs text-slate-500 font-mono mb-2">slug: /{service.slug}</p>
              <p className="text-sm text-slate-600 line-clamp-2 mb-3">{service.shortDescription}</p>

              <div className="text-xs text-slate-500 space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-100 mb-4">
                <div><strong>Symptoms listed:</strong> {service.symptomsOrReasons.length} entries</div>
                <div><strong>What to bring:</strong> {service.whatToBring.length} items</div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <span className="text-xs text-slate-400">
                {service.isVerified ? '✓ Medically Verified' : '⚠ Pending Verification'}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenEdit(service)}
                  className="p-1.5 rounded-lg text-slate-600 hover:text-[#2097A2] hover:bg-slate-100 transition"
                  title="Edit Service"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteService(service.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                  title="Delete Service"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit / Create Service Modal */}
      {(isCreating || editingService) && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-slate-200 my-8 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-900">
                {isCreating ? 'Create Clinical Service' : `Edit: ${editingService?.title}`}
              </h3>
              <button
                onClick={() => { setEditingService(null); setIsCreating(false); }}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Service Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-[#2097A2]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <input
                    type="text"
                    value={formData.category || ''}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-[#2097A2]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">URL Slug</label>
                  <input
                    type="text"
                    placeholder="auto-generated-if-blank"
                    value={formData.slug || ''}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:outline-none focus:border-[#2097A2]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Workflow Status</label>
                  <select
                    value={formData.status || 'published'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as PublicationStatus })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-[#2097A2]"
                  >
                    <option value="published">Published (Live)</option>
                    <option value="draft">Draft (Hidden)</option>
                    <option value="needs_verification">Needs Verification</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Short Description (Card summary)</label>
                <textarea
                  rows={2}
                  required
                  value={formData.shortDescription || ''}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-[#2097A2]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Clinical Overview & Description</label>
                <textarea
                  rows={4}
                  required
                  value={formData.fullDescription || ''}
                  onChange={(e) => setFormData({ ...formData, fullDescription: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-[#2097A2]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Common Symptoms & Reasons to Visit (1 per line)
                </label>
                <textarea
                  rows={3}
                  value={symptomsInput}
                  onChange={(e) => setSymptomsInput(e.target.value)}
                  placeholder="Unexplained fatigue&#10;Fluctuating blood pressure&#10;Elevated HbA1c"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:outline-none focus:border-[#2097A2]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  What to Bring to the Consultation (1 per line)
                </label>
                <textarea
                  rows={3}
                  value={whatToBringInput}
                  onChange={(e) => setWhatToBringInput(e.target.value)}
                  placeholder="Previous laboratory reports&#10;Current medicine prescriptions&#10;Home blood pressure log"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:outline-none focus:border-[#2097A2]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => { setEditingService(null); setIsCreating(false); }}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold text-white bg-[#2097A2] hover:bg-[#27BAC8] rounded-lg"
                >
                  Save Service Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
