import React, { useState } from 'react';
import { useCMS } from '../../context/CMSContext';
import { AiKnowledgeItem } from '../../types';
import {
  Brain,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Edit2,
  Trash2,
  Globe,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  ShieldCheck,
  Languages,
  BookOpen
} from 'lucide-react';

export const AiKnowledgeModule: React.FC = () => {
  const {
    aiKnowledge,
    updateAiKnowledgeItem,
    addAiKnowledgeItem,
    deleteAiKnowledgeItem,
    aiSettings,
    updateAiSettings,
    showNotification
  } = useCMS();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [editingItem, setEditingItem] = useState<AiKnowledgeItem | null>(null);
  const [isCreating, setIsCreating] = useState<boolean>(false);

  // Form State
  const [formCategory, setFormCategory] = useState<AiKnowledgeItem['category']>('faqs');
  const [formTopic, setFormTopic] = useState<string>('');
  const [formQuestionEn, setFormQuestionEn] = useState<string>('');
  const [formQuestionUrdu, setFormQuestionUrdu] = useState<string>('');
  const [formQuestionRoman, setFormQuestionRoman] = useState<string>('');
  const [formAnswerContent, setFormAnswerContent] = useState<string>('');
  const [formKeywords, setFormKeywords] = useState<string>('');
  const [formIsPublished, setFormIsPublished] = useState<boolean>(true);
  const [formIsVerified, setFormIsVerified] = useState<boolean>(true);

  const categories: { id: string; label: string }[] = [
    { id: 'all', label: 'All Knowledge' },
    { id: 'doctor', label: 'Doctor Profile' },
    { id: 'location', label: 'Location & Directions' },
    { id: 'timings', label: 'Clinic Timings' },
    { id: 'fees', label: 'Fees & Billing' },
    { id: 'services', label: 'Clinical Services' },
    { id: 'appointments', label: 'Appointment Booking' },
    { id: 'faqs', label: 'General FAQs' },
    { id: 'emergency', label: 'Emergency Protocols' },
  ];

  const filteredItems = aiKnowledge.filter((item) => {
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      item.topic.toLowerCase().includes(query) ||
      item.questionEn.toLowerCase().includes(query) ||
      (item.questionUrdu && item.questionUrdu.includes(query)) ||
      (item.questionRoman && item.questionRoman.toLowerCase().includes(query)) ||
      item.answerContent.toLowerCase().includes(query);
    return matchesCat && matchesSearch;
  });

  const openCreateModal = () => {
    setEditingItem(null);
    setFormCategory('faqs');
    setFormTopic('');
    setFormQuestionEn('');
    setFormQuestionUrdu('');
    setFormQuestionRoman('');
    setFormAnswerContent('');
    setFormKeywords('');
    setFormIsPublished(true);
    setFormIsVerified(true);
    setIsCreating(true);
  };

  const openEditModal = (item: AiKnowledgeItem) => {
    setEditingItem(item);
    setFormCategory(item.category);
    setFormTopic(item.topic);
    setFormQuestionEn(item.questionEn);
    setFormQuestionUrdu(item.questionUrdu || '');
    setFormQuestionRoman(item.questionRoman || '');
    setFormAnswerContent(item.answerContent);
    setFormKeywords(item.keywords.join(', '));
    setFormIsPublished(item.isPublished);
    setFormIsVerified(item.isVerified);
    setIsCreating(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTopic.trim() || !formQuestionEn.trim() || !formAnswerContent.trim()) {
      showNotification('Topic, English question, and Answer content are required.', 'error');
      return;
    }

    const keywordsArray = formKeywords
      .split(',')
      .map(k => k.trim())
      .filter(Boolean);

    if (editingItem) {
      updateAiKnowledgeItem(editingItem.id, {
        category: formCategory,
        topic: formTopic.trim(),
        questionEn: formQuestionEn.trim(),
        questionUrdu: formQuestionUrdu.trim() || undefined,
        questionRoman: formQuestionRoman.trim() || undefined,
        answerContent: formAnswerContent.trim(),
        keywords: keywordsArray,
        isPublished: formIsPublished,
        isVerified: formIsVerified,
      });
    } else {
      addAiKnowledgeItem({
        category: formCategory,
        topic: formTopic.trim(),
        questionEn: formQuestionEn.trim(),
        questionUrdu: formQuestionUrdu.trim() || undefined,
        questionRoman: formQuestionRoman.trim() || undefined,
        answerContent: formAnswerContent.trim(),
        keywords: keywordsArray,
        isPublished: formIsPublished,
        isVerified: formIsVerified,
        sortOrder: aiKnowledge.length + 1,
      });
    }

    setIsCreating(false);
    setEditingItem(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & AI Enable/Disable Switch */}
      <div className="bg-white border border-slate-200 p-6 rounded-none shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-[#1A365D] text-white flex items-center justify-center">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">AI Receptionist Knowledge Base</h2>
              <p className="text-xs text-slate-500">
                Grounding dataset for Dr. Farhan’s AI Receptionist. The model is strictly constrained to this verified knowledge.
              </p>
            </div>
          </div>
        </div>

        {/* Global AI Master Switch */}
        <div className="flex items-center gap-4 bg-slate-50 p-3 border border-slate-200">
          <div>
            <div className="text-xs font-bold text-slate-900">AI Receptionist Service</div>
            <div className="text-[11px] text-slate-500">
              {aiSettings.isEnabled ? 'Active (Accepting patient chats)' : 'Disabled / Offline mode'}
            </div>
          </div>

          <button
            onClick={() => updateAiSettings({ isEnabled: !aiSettings.isEnabled })}
            className={`px-3 py-1.5 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              aiSettings.isEnabled
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-rose-600 hover:bg-rose-700 text-white'
            }`}
          >
            {aiSettings.isEnabled ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
            <span>{aiSettings.isEnabled ? 'AI ENABLED' : 'AI DISABLED'}</span>
          </button>
        </div>
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-4">
          <div className="text-[11px] font-bold uppercase text-slate-400">Total Facts</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{aiKnowledge.length}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Approved clinic knowledge items</div>
        </div>
        <div className="bg-white border border-slate-200 p-4">
          <div className="text-[11px] font-bold uppercase text-slate-400">Published / Active</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">
            {aiKnowledge.filter(k => k.isPublished).length}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Live in AI grounding index</div>
        </div>
        <div className="bg-white border border-slate-200 p-4">
          <div className="text-[11px] font-bold uppercase text-slate-400">Languages Covered</div>
          <div className="text-2xl font-black text-[#2097A2] mt-1">3</div>
          <div className="text-[10px] text-slate-500 mt-0.5">English, اردو (Urdu), Roman Urdu</div>
        </div>
        <div className="bg-white border border-slate-200 p-4">
          <div className="text-[11px] font-bold uppercase text-slate-400">Model Engine</div>
          <div className="text-sm font-bold text-slate-900 mt-2 font-mono">
            {aiSettings.modelName || 'gemini-3.7-flash'}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Temperature: {aiSettings.temperature}</div>
        </div>
      </div>

      {/* Filters, Search & Add Button */}
      <div className="bg-white border border-slate-200 p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search knowledge by topic, question in English, Urdu, or Roman Urdu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:border-[#2097A2] focus:outline-hidden"
            />
          </div>

          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-[#2097A2] hover:bg-[#1B808A] text-white text-xs font-bold uppercase flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Knowledge Item</span>
          </button>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1 text-xs font-medium border transition cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-[#1A365D] text-white border-[#1A365D]'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Knowledge Items List */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="bg-white border border-slate-200 p-12 text-center text-slate-500">
            <BookOpen className="w-8 h-8 mx-auto text-slate-300 mb-2" />
            <p className="font-semibold text-sm">No knowledge items match your filter.</p>
            <p className="text-xs mt-1">Try resetting the category filter or add a new clinic fact.</p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-slate-200 p-4 hover:border-[#2097A2]/50 transition space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-wider">
                      {item.category}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900">{item.topic}</h3>
                    {item.isPublished ? (
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-semibold px-1.5 py-0.2 bg-emerald-50 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" /> Published
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] text-amber-700 font-semibold px-1.5 py-0.2 bg-amber-50 border border-amber-200">
                        Draft
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => openEditModal(item)}
                    className="p-1.5 text-slate-600 hover:text-[#2097A2] hover:bg-slate-100 transition cursor-pointer"
                    title="Edit Fact"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deleteAiKnowledgeItem(item.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                    title="Delete Fact"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Multilingual Questions Accordion Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 bg-slate-50 p-2.5 text-xs border border-slate-100">
                <div>
                  <span className="font-bold text-[10px] text-slate-400 uppercase">English Query:</span>
                  <p className="text-slate-800 mt-0.5">{item.questionEn}</p>
                </div>
                {item.questionUrdu && (
                  <div dir="rtl">
                    <span className="font-bold text-[10px] text-slate-400 uppercase">اردو سوال:</span>
                    <p className="text-slate-800 mt-0.5 font-medium">{item.questionUrdu}</p>
                  </div>
                )}
                {item.questionRoman && (
                  <div>
                    <span className="font-bold text-[10px] text-slate-400 uppercase">Roman Urdu:</span>
                    <p className="text-slate-800 mt-0.5 italic">{item.questionRoman}</p>
                  </div>
                )}
              </div>

              {/* Grounded Clinic Fact Answer */}
              <div className="text-xs text-slate-700 leading-relaxed bg-white p-3 border-l-2 border-[#2097A2]">
                <div className="font-bold text-[10px] uppercase text-[#2097A2] mb-1">Approved Knowledge Grounding:</div>
                <p>{item.answerContent}</p>
              </div>

              {/* Keywords Tagging */}
              {item.keywords && item.keywords.length > 0 && (
                <div className="flex flex-wrap items-center gap-1 text-[11px] text-slate-500">
                  <span className="text-[10px] font-semibold text-slate-400">Match Keywords:</span>
                  {item.keywords.map((kw, i) => (
                    <span key={i} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 font-mono text-[10px]">
                      {kw}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Edit / Create Knowledge Modal */}
      {isCreating && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
        >
          <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-bold text-base text-slate-900">
                {editingItem ? 'Edit Clinic Knowledge Fact' : 'Add New Verified Clinic Knowledge Fact'}
              </h3>
              <button
                onClick={() => setIsCreating(false)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 text-xs focus:bg-white focus:outline-hidden"
                  >
                    <option value="doctor">Doctor Profile & Credentials</option>
                    <option value="location">Location & Directions</option>
                    <option value="timings">Clinic Timings & Hours</option>
                    <option value="fees">Consultation Fees & Billing</option>
                    <option value="services">Clinical Services & Diseases</option>
                    <option value="appointments">Appointments & Booking</option>
                    <option value="faqs">General FAQs</option>
                    <option value="emergency">Emergency Protocols</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Topic / Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Clinic Timings in Faisal Town"
                    value={formTopic}
                    onChange={(e) => setFormTopic(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 text-xs focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              {/* English Question */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">English User Query / Prompt *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. What are Dr. Farhan Mustafa consultation hours?"
                  value={formQuestionEn}
                  onChange={(e) => setFormQuestionEn(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 text-xs focus:bg-white focus:outline-hidden"
                />
              </div>

              {/* Urdu Question */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">اردو سوال (Urdu Script)</label>
                <input
                  type="text"
                  dir="rtl"
                  placeholder="مثال: کلینک کے اوقات کار اور چیک اپ کا وقت کیا ہے؟"
                  value={formQuestionUrdu}
                  onChange={(e) => setFormQuestionUrdu(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 text-xs focus:bg-white focus:outline-hidden"
                />
              </div>

              {/* Roman Urdu Question */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Roman Urdu Query</label>
                <input
                  type="text"
                  placeholder="e.g. Clinic timings aur checkup ka time kya hai?"
                  value={formQuestionRoman}
                  onChange={(e) => setFormQuestionRoman(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 text-xs focus:bg-white focus:outline-hidden"
                />
              </div>

              {/* Grounded Answer Content */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Approved Grounding Answer *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Enter the official, verified clinical or administrative fact..."
                  value={formAnswerContent}
                  onChange={(e) => setFormAnswerContent(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 text-xs focus:bg-white focus:outline-hidden leading-relaxed"
                />
                <p className="text-[10px] text-slate-400 mt-0.5">
                  The AI Receptionist will strictly adhere to this text without hallucinating extra details.
                </p>
              </div>

              {/* Keywords */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Keywords for Exact & Semantic Matching (Comma-separated)</label>
                <input
                  type="text"
                  placeholder="e.g. timings, hours, days, schedule, auqat, kab baithte hain"
                  value={formKeywords}
                  onChange={(e) => setFormKeywords(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 text-xs focus:bg-white focus:outline-hidden"
                />
              </div>

              {/* Switches */}
              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsPublished}
                    onChange={(e) => setFormIsPublished(e.target.checked)}
                    className="w-4 h-4 text-[#2097A2]"
                  />
                  <span className="font-semibold text-slate-700">Publish in Active Knowledge Base</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsVerified}
                    onChange={(e) => setFormIsVerified(e.target.checked)}
                    className="w-4 h-4 text-[#2097A2]"
                  />
                  <span className="font-semibold text-slate-700">Doctor Verified</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold uppercase text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#2097A2] hover:bg-[#1B808A] text-white font-bold uppercase text-xs cursor-pointer"
                >
                  {editingItem ? 'Save Changes' : 'Publish Fact'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
