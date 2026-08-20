import React, { useState } from 'react';
import { PageId, BlogPost } from '../types';
import { BLOG_POSTS, CLINIC_INFO } from '../data/clinicData';
import { Breadcrumb } from '../components/Breadcrumb';
import { EmergencyBanner } from '../components/EmergencyBanner';
import { BookOpen, Calendar, User, ArrowRight, ShieldAlert, ArrowLeft } from 'lucide-react';

interface BlogPageProps {
  onNavigate: (page: PageId) => void;
}

export const BlogPage: React.FC<BlogPageProps> = ({ onNavigate }) => {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-16">
      
      {/* Header Block */}
      <div className="bg-[#2097A2] text-white py-12 px-4 sm:px-6 lg:px-8 border-b-4 border-[#27BAC8]">
        <div className="max-w-7xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-[#A4E0E5] block">
            Health Insights & Education
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-white">
            Medical Blog & Articles
          </h1>
          <p className="text-sm sm:text-base text-white/90 font-normal max-w-2xl">
            Evidence-based medical articles authored by Dr. Farhan Mustafa (FCPS, MRCP UK) for adult health education.
          </p>
        </div>
      </div>

      <Breadcrumb 
        items={selectedPost ? [{ label: 'Blog', page: 'blog' }, { label: selectedPost.title }] : [{ label: 'Blog' }]} 
        onNavigate={onNavigate} 
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 space-y-10">
        <EmergencyBanner />

        {selectedPost ? (
          /* Single Article Detail View */
          <div className="max-w-4xl mx-auto space-y-8">
            <button
              onClick={() => setSelectedPost(null)}
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#2097A2] hover:text-[#0A0A0A] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to All Articles</span>
            </button>

            <article className="bg-white p-6 sm:p-10 rounded-xs border border-[#E2E8F0] space-y-6">
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#2097A2] bg-[#2097A2]/10 px-2.5 py-1 rounded-xs inline-block">
                  {selectedPost.category}
                </span>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-[#0A0A0A] leading-tight">
                  {selectedPost.title}
                </h2>
                <div className="flex flex-wrap items-center gap-4 text-xs text-[#5B6467] pt-1">
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-[#2097A2]" />
                    {selectedPost.author}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#2097A2]" />
                    {selectedPost.publishedDate}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-[#FAFAFA] border-l-4 border-[#2097A2] text-xs sm:text-sm text-[#5B6467] leading-relaxed">
                <strong>Executive Summary:</strong> {selectedPost.summary}
              </div>

              <div className="text-xs sm:text-sm text-[#0A0A0A] leading-relaxed space-y-4 pt-4 whitespace-pre-line border-t border-[#E2E8F0]">
                {selectedPost.content}
              </div>

              {/* Medical Disclaimer Banner */}
              <div className="bg-[#FAFAFA] border border-[#CBD5E1] p-5 rounded-xs space-y-2 mt-8">
                <div className="flex items-center gap-2 text-[#0A0A0A]">
                  <ShieldAlert className="w-4 h-4 text-[#2097A2]" />
                  <span className="text-xs font-bold uppercase tracking-wider">Educational Article Disclaimer</span>
                </div>
                <p className="text-xs text-[#5B6467] leading-relaxed">
                  This publication is for general informational and educational purposes only and is not intended to substitute for personal clinical consultation, diagnostic testing, or individual medical advice. Always consult a qualified physician regarding any medical symptoms.
                </p>
              </div>

              <div className="pt-6 border-t border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-xs text-[#5B6467]">
                  Have questions regarding this topic?
                </span>
                <button
                  onClick={() => onNavigate('appointments')}
                  className="px-6 py-3 bg-[#2097A2] text-white text-xs font-bold uppercase tracking-wider rounded-xs hover:bg-[#1B808A] transition-colors"
                >
                  Schedule a Consultation
                </button>
              </div>
            </article>
          </div>
        ) : (
          /* Article Grid */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {BLOG_POSTS.map((post) => (
              <article
                key={post.id}
                className="bg-white border border-[#E2E8F0] hover:border-[#2097A2] p-8 rounded-xs transition-all flex flex-col justify-between group cursor-pointer shadow-2xs"
                onClick={() => setSelectedPost(post)}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-[#5B6467]">
                    <span className="font-semibold text-[#2097A2] bg-[#2097A2]/10 px-2.5 py-0.5 rounded-xs">
                      {post.category}
                    </span>
                    <span>{post.publishedDate}</span>
                  </div>

                  <h3 className="text-lg font-semibold text-[#0A0A0A] group-hover:text-[#2097A2] transition-colors leading-snug">
                    {post.title}
                  </h3>

                  <p className="text-xs text-[#5B6467] leading-relaxed line-clamp-3">
                    {post.summary}
                  </p>
                </div>

                <div className="pt-6 mt-4 border-t border-[#E2E8F0] flex items-center justify-between text-xs font-semibold text-[#2097A2]">
                  <span>Read full article</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </article>
            ))}
          </div>
        )}

      </div>

    </div>
  );
};
