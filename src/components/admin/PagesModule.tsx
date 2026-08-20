import React, { useState } from 'react';
import { useCMS } from '../../context/CMSContext';
import { StatusBadge } from './StatusBadge';
import { PageContentItem, HomepageSectionItem, PublicationStatus } from '../../types';
import { Layout, Globe, Edit2, Search, Sliders, Check } from 'lucide-react';

export const PagesModule: React.FC = () => {
  const { pages, updatePage, homepageSections, updateHomepageSection } = useCMS();
  const [activeSubTab, setActiveSubTab] = useState<'pages' | 'homepage'>('pages');
  const [editingPage, setEditingPage] = useState<PageContentItem | null>(null);
  const [editingSection, setEditingSection] = useState<HomepageSectionItem | null>(null);

  const handleSavePage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPage) return;
    updatePage(editingPage.id, editingPage);
    setEditingPage(null);
  };

  const handleSaveSection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSection) return;
    updateHomepageSection(editingSection.id, editingSection);
    setEditingSection(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveSubTab('pages')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
            activeSubTab === 'pages' ? 'bg-[#2097A2] text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Globe className="w-4 h-4" />
          Public Pages & SEO Settings ({pages.length})
        </button>
        <button
          onClick={() => setActiveSubTab('homepage')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
            activeSubTab === 'homepage' ? 'bg-[#2097A2] text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Sliders className="w-4 h-4" />
          Homepage Section Blocks ({homepageSections.length})
        </button>
      </div>

      {activeSubTab === 'pages' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-base font-bold text-slate-900">Page Content & Meta Tags</h3>
            <p className="text-xs text-slate-600">Edit titles, banner headlines, subtitles, and SEO search tags for all 10 public pages.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pages.map((page) => (
              <div
                key={page.id}
                className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-3 hover:border-[#2097A2]/50 transition"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold text-[#2097A2]">/{page.slug}</span>
                    <StatusBadge status={page.status} />
                  </div>
                  <h4 className="text-base font-bold text-slate-900">{page.title}</h4>
                  <div className="text-xs text-slate-600 font-medium mt-1">
                    <strong>Header:</strong> {page.headerTitle}
                  </div>
                  <div className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                    <strong>Subtitle:</strong> {page.headerSubtitle}
                  </div>
                  <div className="mt-3 bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-[11px] text-slate-500">
                    <div className="font-bold text-slate-700">SEO Meta Title:</div>
                    <div className="truncate text-slate-800">{page.metaTitle}</div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => setEditingPage(page)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-[#2097A2] hover:text-white rounded-lg text-slate-700 text-xs font-semibold flex items-center gap-1 transition"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Edit Page & SEO
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSubTab === 'homepage' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-base font-bold text-slate-900">Homepage Dynamic Content Sections</h3>
            <p className="text-xs text-slate-600">Customize headings, subtitles, and visibility of homepage blocks without editing code.</p>
          </div>

          <div className="space-y-3">
            {homepageSections.map((sec) => (
              <div
                key={sec.id}
                className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {sec.sectionName}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${sec.isVisible ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                      {sec.isVisible ? 'Visible' : 'Hidden'}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">{sec.heading}</h4>
                  <p className="text-xs text-slate-600">{sec.subheading}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => updateHomepageSection(sec.id, { isVisible: !sec.isVisible })}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 hover:bg-slate-50"
                  >
                    {sec.isVisible ? 'Hide Section' : 'Show Section'}
                  </button>
                  <button
                    onClick={() => setEditingSection(sec)}
                    className="px-3 py-1.5 bg-[#2097A2] text-white text-xs font-semibold rounded-lg hover:bg-[#27BAC8]"
                  >
                    Edit Content
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit Page Modal */}
      {editingPage && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-900">Edit Page: {editingPage.title}</h3>
              <button
                onClick={() => setEditingPage(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePage} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Header Main Headline *</label>
                <input
                  type="text"
                  required
                  value={editingPage.headerTitle}
                  onChange={(e) => setEditingPage({ ...editingPage, headerTitle: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Header Subtitle *</label>
                <textarea
                  rows={2}
                  required
                  value={editingPage.headerSubtitle}
                  onChange={(e) => setEditingPage({ ...editingPage, headerSubtitle: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="pt-2 border-t border-slate-100">
                <label className="block font-bold text-slate-800 mb-1">Search Engine Meta Title (SEO)</label>
                <input
                  type="text"
                  value={editingPage.metaTitle}
                  onChange={(e) => setEditingPage({ ...editingPage, metaTitle: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Search Engine Meta Description</label>
                <textarea
                  rows={2}
                  value={editingPage.metaDescription}
                  onChange={(e) => setEditingPage({ ...editingPage, metaDescription: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Status</label>
                <select
                  value={editingPage.status}
                  onChange={(e) => setEditingPage({ ...editingPage, status: e.target.value as PublicationStatus })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="needs_verification">Needs Verification</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingPage(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#2097A2] text-white font-semibold rounded-lg hover:bg-[#27BAC8]"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Section Modal */}
      {editingSection && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-900">Edit Section: {editingSection.sectionName}</h3>
              <button
                onClick={() => setEditingSection(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSection} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Heading</label>
                <input
                  type="text"
                  required
                  value={editingSection.heading}
                  onChange={(e) => setEditingSection({ ...editingSection, heading: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Subheading</label>
                <textarea
                  rows={3}
                  value={editingSection.subheading}
                  onChange={(e) => setEditingSection({ ...editingSection, subheading: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingSection(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#2097A2] text-white font-semibold rounded-lg hover:bg-[#27BAC8]"
                >
                  Save Section
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
