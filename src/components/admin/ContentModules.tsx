import React, { useState } from 'react';
import { useCMS } from '../../context/CMSContext';
import { StatusBadge } from './StatusBadge';
import { FAQItem, ReviewItem, ResourceItem, BlogPost, AnnouncementItem, ContactMessageRecord, PublicationStatus } from '../../types';
import {
  HelpCircle,
  MessageSquare,
  BookOpen,
  FileText,
  Bell,
  Mail,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  Star
} from 'lucide-react';

export const ContentModules: React.FC = () => {
  const {
    announcements, updateAnnouncement, addAnnouncement, deleteAnnouncement,
    faqs, updateFaq, addFaq, deleteFaq,
    reviews, updateReview, addReview,
    resources, updateResource, addResource,
    blogPosts, updateBlogPost, addBlogPost,
    messages, markMessageRead
  } = useCMS();

  const [activeTab, setActiveTab] = useState<'announcements' | 'faqs' | 'reviews' | 'resources' | 'blog' | 'messages'>('announcements');

  // FAQ states
  const [newFaq, setNewFaq] = useState<Partial<FAQItem>>({ question: '', answer: '', category: 'general', status: 'published' });
  const [isAddingFaq, setIsAddingFaq] = useState(false);

  // Announcement states
  const [newAnn, setNewAnn] = useState<Partial<AnnouncementItem>>({ text: '', linkLabel: '', linkUrl: '', badgeText: 'Notice', active: true });
  const [isAddingAnn, setIsAddingAnn] = useState(false);

  // Review states
  const [newReview, setNewReview] = useState<Partial<ReviewItem>>({ patientName: '', rating: 5.0, reviewText: '', source: 'google', reviewDate: new Date().toISOString().split('T')[0], isVerified: true, isFeatured: true, status: 'published' });
  const [isAddingReview, setIsAddingReview] = useState(false);

  // Blog states
  const [newPost, setNewPost] = useState<Partial<BlogPost>>({ title: '', slug: '', category: 'Cardiovascular Health', summary: '', content: '', author: 'Dr. Farhan Mustafa (FCPS, MRCP UK)', status: 'published' });
  const [isAddingPost, setIsAddingPost] = useState(false);

  return (
    <div className="space-y-6">
      {/* Sub navigation tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('announcements')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'announcements' ? 'bg-[#2097A2] text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Bell className="w-4 h-4" />
          Announcements ({announcements.length})
        </button>

        <button
          onClick={() => setActiveTab('faqs')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'faqs' ? 'bg-[#2097A2] text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          FAQs ({faqs.length})
        </button>

        <button
          onClick={() => setActiveTab('reviews')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'reviews' ? 'bg-[#2097A2] text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Star className="w-4 h-4" />
          Reviews & Ratings ({reviews.length})
        </button>

        <button
          onClick={() => setActiveTab('blog')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'blog' ? 'bg-[#2097A2] text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          Medical Blog ({blogPosts.length})
        </button>

        <button
          onClick={() => setActiveTab('resources')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'resources' ? 'bg-[#2097A2] text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Patient Guides ({resources.length})
        </button>

        <button
          onClick={() => setActiveTab('messages')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'messages' ? 'bg-[#2097A2] text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Mail className="w-4 h-4" />
          Inquiries ({messages.length})
        </button>
      </div>

      {/* Announcements Manager */}
      {activeTab === 'announcements' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div>
              <h3 className="text-base font-bold text-slate-900">Top Header Announcement Bars</h3>
              <p className="text-xs text-slate-600">Active alerts displayed at the very top of all website pages.</p>
            </div>
            <button
              onClick={() => setIsAddingAnn(true)}
              className="px-3 py-1.5 bg-[#2097A2] hover:bg-[#27BAC8] text-white text-xs font-semibold rounded-lg flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Alert
            </button>
          </div>

          {isAddingAnn && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newAnn.text) return;
                addAnnouncement({
                  text: newAnn.text,
                  badgeText: newAnn.badgeText || 'Notice',
                  linkLabel: newAnn.linkLabel,
                  linkUrl: newAnn.linkUrl,
                  active: true
                });
                setIsAddingAnn(false);
                setNewAnn({ text: '', badgeText: 'Notice', linkLabel: '', linkUrl: '', active: true });
              }}
              className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 text-xs"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Badge text (e.g. Notice, Clinic Update)"
                  value={newAnn.badgeText || ''}
                  onChange={(e) => setNewAnn({ ...newAnn, badgeText: e.target.value })}
                  className="px-3 py-2 border border-slate-300 rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Link label (e.g. Book Online)"
                  value={newAnn.linkLabel || ''}
                  onChange={(e) => setNewAnn({ ...newAnn, linkLabel: e.target.value })}
                  className="px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <input
                type="text"
                placeholder="Announcement message text *"
                required
                value={newAnn.text || ''}
                onChange={(e) => setNewAnn({ ...newAnn, text: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingAnn(false)}
                  className="px-3 py-1 text-slate-600 hover:bg-slate-200 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1 bg-[#2097A2] text-white font-semibold rounded"
                >
                  Save Alert
                </button>
              </div>
            </form>
          )}

          <div className="space-y-3">
            {announcements.map((ann) => (
              <div
                key={ann.id}
                className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                    {ann.badgeText || 'Notice'}
                  </span>
                  <span className="text-xs text-slate-800 font-medium">{ann.text}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateAnnouncement(ann.id, { active: !ann.active })}
                    className={`text-[11px] font-semibold px-2.5 py-1 rounded border transition ${
                      ann.active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'
                    }`}
                  >
                    {ann.active ? 'Active' : 'Disabled'}
                  </button>
                  <button
                    onClick={() => deleteAnnouncement(ann.id)}
                    className="text-slate-400 hover:text-rose-600 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FAQs Manager */}
      {activeTab === 'faqs' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div>
              <h3 className="text-base font-bold text-slate-900">Frequently Asked Questions</h3>
              <p className="text-xs text-slate-600">Categorized patient questions and evidence-based answers.</p>
            </div>
            <button
              onClick={() => setIsAddingFaq(true)}
              className="px-3 py-1.5 bg-[#2097A2] hover:bg-[#27BAC8] text-white text-xs font-semibold rounded-lg flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add FAQ
            </button>
          </div>

          {isAddingFaq && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newFaq.question || !newFaq.answer) return;
                addFaq({
                  question: newFaq.question,
                  answer: newFaq.answer,
                  category: (newFaq.category as any) || 'general',
                  status: 'published'
                });
                setIsAddingFaq(false);
                setNewFaq({ question: '', answer: '', category: 'general', status: 'published' });
              }}
              className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 text-xs"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Question *"
                  required
                  value={newFaq.question || ''}
                  onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })}
                  className="px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
                <select
                  value={newFaq.category || 'general'}
                  onChange={(e) => setNewFaq({ ...newFaq, category: e.target.value as any })}
                  className="px-3 py-2 border border-slate-300 rounded-lg text-xs"
                >
                  <option value="general">General Medicine</option>
                  <option value="appointments">Appointments & Scheduling</option>
                  <option value="fees">Fees & Payments</option>
                  <option value="services">Specialized Services</option>
                </select>
              </div>
              <textarea
                rows={3}
                placeholder="Answer text *"
                required
                value={newFaq.answer || ''}
                onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingFaq(false)}
                  className="px-3 py-1 text-slate-600 hover:bg-slate-200 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1 bg-[#2097A2] text-white font-semibold rounded"
                >
                  Save FAQ
                </button>
              </div>
            </form>
          )}

          <div className="space-y-3">
            {faqs.map((faq) => (
              <div
                key={faq.id}
                className="bg-white p-4 rounded-xl border border-slate-200 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {faq.category}
                  </span>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={faq.status || 'published'} />
                    <button
                      onClick={() => deleteFaq(faq.id)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <h4 className="text-sm font-bold text-slate-900">{faq.question}</h4>
                <p className="text-xs text-slate-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Patient Reviews Manager */}
      {activeTab === 'reviews' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div>
              <h3 className="text-base font-bold text-slate-900">Google & Patient Reviews (5.0 ★ / 263 Verified)</h3>
              <p className="text-xs text-slate-600">Manage patient testimonials and verified feedback from Lahore consultations.</p>
            </div>
            <button
              onClick={() => setIsAddingReview(true)}
              className="px-3 py-1.5 bg-[#2097A2] hover:bg-[#27BAC8] text-white text-xs font-semibold rounded-lg flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Log Review
            </button>
          </div>

          {isAddingReview && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newReview.patientName || !newReview.reviewText) return;
                addReview({
                  patientName: newReview.patientName,
                  rating: Number(newReview.rating) || 5.0,
                  reviewText: newReview.reviewText,
                  source: 'google',
                  reviewDate: newReview.reviewDate || new Date().toISOString().split('T')[0],
                  isVerified: true,
                  isFeatured: true,
                  status: 'published'
                });
                setIsAddingReview(false);
                setNewReview({ patientName: '', rating: 5.0, reviewText: '', source: 'google', reviewDate: new Date().toISOString().split('T')[0], isVerified: true, isFeatured: true, status: 'published' });
              }}
              className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 text-xs"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Patient Name *"
                  required
                  value={newReview.patientName || ''}
                  onChange={(e) => setNewReview({ ...newReview, patientName: e.target.value })}
                  className="px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
                <select
                  value={newReview.rating || 5.0}
                  onChange={(e) => setNewReview({ ...newReview, rating: parseFloat(e.target.value) })}
                  className="px-3 py-2 border border-slate-300 rounded-lg text-xs"
                >
                  <option value="5.0">5.0 Stars ★★★★★</option>
                  <option value="4.5">4.5 Stars ★★★★½</option>
                  <option value="4.0">4.0 Stars ★★★★☆</option>
                </select>
              </div>
              <textarea
                rows={3}
                placeholder="Review commentary *"
                required
                value={newReview.reviewText || ''}
                onChange={(e) => setNewReview({ ...newReview, reviewText: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingReview(false)}
                  className="px-3 py-1 text-slate-600 hover:bg-slate-200 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1 bg-[#2097A2] text-white font-semibold rounded"
                >
                  Save Review
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-slate-900">{rev.patientName}</span>
                    <span className="text-amber-500 font-bold text-xs">{'★'.repeat(Math.floor(rev.rating))} {rev.rating}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mb-2">{rev.source.toUpperCase()} Verified • {rev.reviewDate}</div>
                  <p className="text-xs text-slate-600 italic">"{rev.reviewText}"</p>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <StatusBadge status={rev.status} />
                  <button
                    onClick={() => updateReview(rev.id, { isFeatured: !rev.isFeatured })}
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                      rev.isFeatured ? 'bg-[#2097A2]/10 text-[#2097A2]' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {rev.isFeatured ? 'Featured on Home' : 'Standard'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Blog Posts Manager */}
      {activeTab === 'blog' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div>
              <h3 className="text-base font-bold text-slate-900">Medical Blog Articles</h3>
              <p className="text-xs text-slate-600">Educational internal medicine guidance authored by Dr. Farhan Mustafa.</p>
            </div>
            <button
              onClick={() => setIsAddingPost(true)}
              className="px-3 py-1.5 bg-[#2097A2] hover:bg-[#27BAC8] text-white text-xs font-semibold rounded-lg flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Write Article
            </button>
          </div>

          {isAddingPost && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newPost.title || !newPost.summary || !newPost.content) return;
                const slug = newPost.slug || newPost.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                addBlogPost({
                  title: newPost.title,
                  slug,
                  category: newPost.category || 'Internal Medicine',
                  summary: newPost.summary,
                  content: newPost.content,
                  author: newPost.author || 'Dr. Farhan Mustafa (FCPS, MRCP UK)',
                  publishedDate: new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }),
                  status: 'published'
                });
                setIsAddingPost(false);
                setNewPost({ title: '', slug: '', category: 'Cardiovascular Health', summary: '', content: '', author: 'Dr. Farhan Mustafa (FCPS, MRCP UK)', status: 'published' });
              }}
              className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 text-xs"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Article Title *"
                  required
                  value={newPost.title || ''}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  className="px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
                <input
                  type="text"
                  placeholder="Category (e.g. Hypertension Care)"
                  value={newPost.category || ''}
                  onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                  className="px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>
              <textarea
                rows={2}
                placeholder="Short Summary / Lead *"
                required
                value={newPost.summary || ''}
                onChange={(e) => setNewPost({ ...newPost, summary: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
              <textarea
                rows={5}
                placeholder="Full Article Content (Markdown / HTML supported) *"
                required
                value={newPost.content || ''}
                onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingPost(false)}
                  className="px-3 py-1 text-slate-600 hover:bg-slate-200 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1 bg-[#2097A2] text-white font-semibold rounded"
                >
                  Publish Article
                </button>
              </div>
            </form>
          )}

          <div className="space-y-3">
            {blogPosts.map((post) => (
              <div
                key={post.id}
                className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 uppercase">
                      {post.category}
                    </span>
                    <StatusBadge status={post.status || 'published'} />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">{post.title}</h4>
                  <p className="text-xs text-slate-500 font-mono">slug: /{post.slug} • By {post.author} ({post.publishedDate})</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => updateBlogPost(post.id, { status: post.status === 'published' ? 'draft' : 'published' })}
                    className="px-3 py-1 text-xs border rounded-lg text-slate-700 hover:bg-slate-50 font-medium"
                  >
                    {post.status === 'published' ? 'Unpublish' : 'Publish'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Patient Inquiries / Contact Messages */}
      {activeTab === 'messages' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-base font-bold text-slate-900">Direct Patient Contact Messages</h3>
            <p className="text-xs text-slate-600">Inquiries submitted through the public website contact form.</p>
          </div>

          <div className="space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`p-4 rounded-xl border transition ${
                  msg.isRead ? 'bg-white border-slate-200' : 'bg-blue-50/40 border-blue-200 shadow-sm'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{msg.name}</span>
                    <span className="text-xs text-slate-500">• {msg.phone}</span>
                    {msg.email && <span className="text-xs text-slate-400">({msg.email})</span>}
                  </div>
                  <span className="text-[11px] text-slate-400">{msg.createdAt}</span>
                </div>
                <div className="text-xs font-bold text-slate-800 mb-1">Subject: {msg.subject}</div>
                <p className="text-xs text-slate-600 bg-slate-50/80 p-3 rounded-lg border border-slate-100 mb-3">{msg.message}</p>
                <div className="flex items-center justify-between">
                  <a
                    href={`https://wa.me/${msg.phone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    Reply on WhatsApp
                  </a>
                  {!msg.isRead && (
                    <button
                      onClick={() => markMessageRead(msg.id)}
                      className="text-xs font-semibold text-slate-600 hover:text-slate-900"
                    >
                      Mark as Read
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
