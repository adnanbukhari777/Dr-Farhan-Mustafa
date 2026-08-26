import React, { useState } from 'react';
import { PageId, BlogPost } from '../types';
import { BLOG_POSTS, CLINIC_INFO } from '../data/clinicData';
import { PageHero } from '../components/PageHero';
import { EmergencyBanner } from '../components/EmergencyBanner';
import { BookOpen, Calendar, User, ArrowRight, ShieldAlert, ArrowLeft } from 'lucide-react';
import { WhatsAppIcon } from '../components/WhatsAppIcon';

interface BlogPageProps {
  onNavigate: (page: PageId) => void;
}

export const BlogPage: React.FC<BlogPageProps> = ({ onNavigate }) => {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  return (
    <div className="min-h-screen bg-light-blue pb-16">
      
      {/* Standardized Master Page Hero */}
      <PageHero
        title={selectedPost ? selectedPost.title : "Medical Blog & Articles"}
        eyebrow={selectedPost ? (selectedPost.category || "Health Article") : "Health Insights & Education"}
        subtitle={selectedPost ? selectedPost.summary : "Evidence-based medical articles authored by Dr. Farhan Mustafa (FCPS, MRCP UK) for adult health education."}
        breadcrumbs={
          selectedPost 
            ? [{ label: 'Blog', page: 'blog' }, { label: selectedPost.title }] 
            : [{ label: 'Blog' }]
        }
        onNavigate={(page) => {
          if (page === 'blog') {
            setSelectedPost(null);
          } else {
            onNavigate(page);
          }
        }}
        actions={
          selectedPost ? (
            <>
              <button
                onClick={() => setSelectedPost(null)}
                className="btn-secondary text-xs !min-h-[44px]"
              >
                <ArrowLeft className="button-icon text-[#25B3C2]" aria-hidden="true" />
                <span>Back to All Articles</span>
              </button>
              <button
                onClick={() => onNavigate('appointments')}
                className="btn-primary text-xs !min-h-[44px]"
              >
                <Calendar className="button-icon text-white" />
                <span>Book Appointment</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onNavigate('appointments')}
                className="btn-primary text-xs !min-h-[44px]"
              >
                <Calendar className="button-icon text-white" />
                <span>Book Appointment</span>
              </button>
              <a
                href={CLINIC_INFO.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary text-xs !min-h-[44px]"
              >
                <WhatsAppIcon className="button-icon text-[#25B3C2]" aria-hidden="true" />
                <span>WhatsApp Front Desk</span>
              </a>
            </>
          )
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-10">
        <EmergencyBanner />

        {selectedPost ? (
          /* Single Article Detail View */
          <div className="max-w-4xl mx-auto space-y-8">
            <button
              onClick={() => setSelectedPost(null)}
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#2097A2] hover:text-[#090B0D] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to All Articles</span>
            </button>

            <article className="card-standard p-6 sm:p-10 space-y-6">
              {/* Featured Image in Detail View */}
              <div className="w-full aspect-video rounded-[3px] overflow-hidden bg-neutral-100 border border-[#2097A2]/20">
                <img 
                  src={selectedPost.featuredImage || `/assets/images/articles/${selectedPost.slug}.jpg`} 
                  alt={selectedPost.title} 
                  className="w-full h-full object-cover"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (target.src !== `/assets/images/articles/${selectedPost.slug}.jpg`) {
                      target.src = `/assets/images/articles/${selectedPost.slug}.jpg`;
                    }
                  }}
                />
              </div>

              <div className="space-y-3 pt-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#2097A2] bg-[#2097A2]/10 px-2.5 py-1 rounded-[2px] inline-block border border-[#2097A2]/20">
                  {selectedPost.category}
                </span>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-medium text-[#090B0D] leading-tight tracking-tight">
                  {selectedPost.title}
                </h2>
                <div className="flex flex-wrap items-center gap-4 text-xs text-[#5B6467] pt-1">
                  <span className="flex items-center gap-1 font-medium">
                    <User className="w-3.5 h-3.5 text-[#2097A2]" />
                    {selectedPost.author}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-[#2097A2]" />
                    {selectedPost.publishedDate}
                  </span>
                  {selectedPost.readTime && (
                    <>
                      <span>•</span>
                      <span className="font-medium text-[#2097A2]">{selectedPost.readTime}</span>
                    </>
                  )}
                </div>
              </div>

              <div className="p-4 bg-white border-l-4 border-[#2097A2] text-xs sm:text-sm text-neutral-700 leading-relaxed shadow-sm">
                <strong className="text-[#090B0D]">Executive Summary:</strong> {selectedPost.summary}
              </div>

              <div className="text-xs sm:text-sm text-neutral-800 leading-relaxed space-y-4 pt-4 whitespace-pre-line border-t border-[#2097A2]/10">
                {selectedPost.content}
              </div>

              {/* Medical Disclaimer Banner */}
              <div className="bg-[#FFF8E7] border border-[#E6B800]/40 p-5 rounded-[3px] space-y-2 mt-8">
                <div className="flex items-center gap-2 text-[#090B0D]">
                  <ShieldAlert className="w-4 h-4 text-[#D97706]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[#92400E]">Educational Article Disclaimer</span>
                </div>
                <p className="text-xs text-neutral-700 leading-relaxed">
                  This publication is for general informational and educational purposes only and is not intended to substitute for personal clinical consultation, diagnostic testing, or individual medical advice. Always consult a qualified physician regarding any medical symptoms.
                </p>
              </div>

              <div className="pt-6 border-t border-[#2097A2]/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-xs text-[#5B6467] font-medium">
                  Have questions regarding this condition or symptoms?
                </span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onNavigate('appointments')}
                    className="btn-primary"
                  >
                    Schedule a Consultation
                  </button>
                </div>
              </div>
            </article>
          </div>
        ) : (
          /* Article Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {BLOG_POSTS.map((post) => (
              <article
                key={post.id}
                className="card-standard overflow-hidden flex flex-col justify-between group cursor-pointer"
                onClick={() => setSelectedPost(post)}
              >
                {/* 16:9 Featured Image */}
                <div className="w-full aspect-video overflow-hidden bg-neutral-100 border-b border-[#2097A2]/10">
                  <img
                    src={post.featuredImage || `/assets/images/articles/${post.slug}.jpg`}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (target.src !== `/assets/images/articles/${post.slug}.jpg`) {
                        target.src = `/assets/images/articles/${post.slug}.jpg`;
                      }
                    }}
                  />
                </div>

                <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs text-[#5B6467]">
                      <span className="font-bold text-[#2097A2] bg-[#2097A2]/10 px-2 py-0.5 rounded-[2px] border border-[#2097A2]/20">
                        {post.category}
                      </span>
                      <span className="font-medium">{post.readTime || '4 min read'}</span>
                    </div>

                    <h3 className="text-base font-bold text-[#090B0D] group-hover:text-[#2097A2] transition-colors leading-snug">
                      {post.title}
                    </h3>

                    <p className="text-xs text-neutral-600 leading-relaxed line-clamp-3">
                      {post.summary}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-[#2097A2]/10 flex items-center justify-between text-xs font-semibold text-[#2097A2]">
                    <span>Read full article</span>
                    <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

      </div>

    </div>
  );
};
