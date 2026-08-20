import React, { useState } from 'react';
import { PageId, ResourceItem } from '../types';
import { RESOURCES_LIST, CLINIC_INFO } from '../data/clinicData';
import { Breadcrumb } from '../components/Breadcrumb';
import { EmergencyBanner } from '../components/EmergencyBanner';
import { BookOpen, Clock, FileText, ArrowRight, ShieldCheck, CheckCircle2, Search } from 'lucide-react';

interface ResourcesPageProps {
  onNavigate: (page: PageId) => void;
}

export const ResourcesPage: React.FC<ResourcesPageProps> = ({ onNavigate }) => {
  const [activeRes, setActiveRes] = useState<ResourceItem | null>(null);
  const [search, setSearch] = useState('');

  const filtered = RESOURCES_LIST.filter(r => 
    r.title.toLowerCase().includes(search.toLowerCase()) || 
    r.summary.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-16">
      
      {/* Header Block */}
      <div className="bg-[#2097A2] text-white py-12 px-4 sm:px-6 lg:px-8 border-b-4 border-[#27BAC8]">
        <div className="max-w-7xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-[#A4E0E5] block">
            Health Education & Guides
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-white">
            Patient Resources
          </h1>
          <p className="text-sm sm:text-base text-white/90 font-normal max-w-2xl">
            Practical preparation checklists, chronic disease monitoring protocols, and clinical guidance.
          </p>
        </div>
      </div>

      <Breadcrumb items={[{ label: 'Resources' }]} onNavigate={onNavigate} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 space-y-10">
        <EmergencyBanner />

        {/* Search */}
        <div className="bg-white p-6 rounded-xs border border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-[#0A0A0A]">
              Educational Care Materials
            </h2>
            <p className="text-xs text-[#5B6467]">
              Designed to help patients understand and actively participate in their healthcare.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-[#5B6467] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search resources..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[#FAFAFA] border border-[#CBD5E1] rounded-xs text-xs focus:bg-white focus:border-[#2097A2] focus:outline-hidden"
            />
          </div>
        </div>

        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-[#E2E8F0] hover:border-[#2097A2] p-6 rounded-xs transition-all space-y-4 flex flex-col justify-between group cursor-pointer shadow-2xs"
              onClick={() => setActiveRes(item)}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-[#5B6467]">
                  <span className="font-semibold text-[#2097A2] bg-[#2097A2]/10 px-2 py-0.5 rounded-xs">
                    {item.category}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {item.readTime}
                  </span>
                </div>

                <h3 className="text-base font-semibold text-[#0A0A0A] group-hover:text-[#2097A2] transition-colors leading-snug">
                  {item.title}
                </h3>

                <p className="text-xs text-[#5B6467] leading-relaxed">
                  {item.summary}
                </p>
              </div>

              <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-between text-xs font-semibold text-[#0A0A0A] group-hover:text-[#2097A2]">
                <span>Read guide</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>

        {/* Active Resource Modal / Detail View */}
        {activeRes && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 sm:p-8 rounded-xs space-y-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[#2097A2] bg-[#2097A2]/10 px-2.5 py-1 rounded-xs">
                  {activeRes.category}
                </span>
                <button
                  onClick={() => setActiveRes(null)}
                  className="text-xs font-bold uppercase tracking-wider px-3 py-1 bg-[#FAFAFA] border border-[#CBD5E1] text-[#0A0A0A] rounded-xs hover:bg-[#0A0A0A] hover:text-white transition-colors"
                >
                  Close
                </button>
              </div>

              <div className="space-y-3">
                <h3 className="text-xl sm:text-2xl font-semibold text-[#0A0A0A]">
                  {activeRes.title}
                </h3>
                <div className="flex items-center gap-4 text-xs text-[#5B6467]">
                  <span>Reviewed: {activeRes.publishedDate}</span>
                  <span>•</span>
                  <span>Author: {activeRes.author}</span>
                </div>
              </div>

              <div className="p-4 bg-[#FAFAFA] border-l-4 border-[#2097A2] text-xs text-[#5B6467] leading-relaxed">
                {activeRes.summary}
              </div>

              <div className="text-xs sm:text-sm text-[#0A0A0A] leading-relaxed space-y-4">
                <p>{activeRes.content}</p>
              </div>

              <div className="pt-4 border-t border-[#E2E8F0] flex justify-end">
                <button
                  onClick={() => setActiveRes(null)}
                  className="px-6 py-2.5 bg-[#2097A2] text-white text-xs font-bold uppercase tracking-wider rounded-xs hover:bg-[#1B808A] transition-colors"
                >
                  Close Guide
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
