import React, { useState, useRef, useEffect } from 'react';
import { useCMS } from '../context/CMSContext';
import { Bot, X, Send, ArrowRight, ExternalLink } from 'lucide-react';
import { CLINIC_INFO } from '../data/clinicData';
import { PageId } from '../types';

interface AIModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: PageId) => void;
  onOpenAppointmentModal?: () => void;
}

export type ContextualActionType =
  | 'book_appointment'
  | 'manage_appointment'
  | 'get_directions'
  | 'contact_clinic'
  | 'view_services'
  | 'patient_intake';

export interface ContextualAction {
  type: ContextualActionType;
  label: string;
  route?: PageId;
  externalUrl?: string;
  icon: 'arrow' | 'external';
}

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  isEmergency?: boolean;
  contextualAction?: ContextualAction | null;
}

// Strict allowlist for contextual destinations
const ALLOWED_ACTIONS: Record<ContextualActionType, ContextualAction> = {
  book_appointment: {
    type: 'book_appointment',
    label: 'Book Appointment',
    route: 'appointments',
    icon: 'arrow',
  },
  manage_appointment: {
    type: 'manage_appointment',
    label: 'Manage Appointment',
    route: 'appointments',
    icon: 'arrow',
  },
  get_directions: {
    type: 'get_directions',
    label: 'Get Directions',
    externalUrl: CLINIC_INFO.googleMapsUrl,
    icon: 'external',
  },
  contact_clinic: {
    type: 'contact_clinic',
    label: 'Contact Clinic',
    route: 'contact',
    icon: 'arrow',
  },
  view_services: {
    type: 'view_services',
    label: 'View Services',
    route: 'services',
    icon: 'arrow',
  },
  patient_intake: {
    type: 'patient_intake',
    label: 'Complete Pre-Visit Form',
    route: 'patient-forms',
    icon: 'arrow',
  },
};

/**
 * Deterministic contextual action resolver.
 * Maps patient inquiry to at most one lightweight contextual next step.
 * Strictly excludes greetings, medical emergencies, errors, and pure informational answers.
 */
function resolveContextualAction(
  userQuery: string,
  _aiReply: string,
  isEmergency?: boolean,
  isError?: boolean
): ContextualAction | null {
  // Never show action buttons on emergencies or error states
  if (isEmergency || isError) {
    return null;
  }

  const query = userQuery.trim().toLowerCase();

  // Exclude pure greetings, social salutations, or simple closings
  const greetingPattern =
    /^(hi|hello|hey|salam|assalam|assalam-o-alaikum|aoa|good\s+(morning|afternoon|evening)|thanks|thank\s+you|shukriya|bye|goodbye|ok|okay)[!.\s]*$/i;
  if (greetingPattern.test(query)) {
    return null;
  }

  // 1. Rescheduling, cancellation, or checking existing appointment
  if (
    query.includes('reschedul') ||
    query.includes('cancel') ||
    query.includes('lookup') ||
    query.includes('reference code') ||
    query.includes('booking ref') ||
    query.includes('change time') ||
    query.includes('change date') ||
    query.includes('postpone') ||
    query.includes('manage appointment') ||
    query.includes('check my appointment')
  ) {
    return ALLOWED_ACTIONS.manage_appointment;
  }

  // 2. Pre-visit form / clinical intake preparation
  if (
    query.includes('pre-visit') ||
    query.includes('intake') ||
    query.includes('patient form') ||
    query.includes('medical history form') ||
    query.includes('fill form') ||
    query.includes('before visit')
  ) {
    return ALLOWED_ACTIONS.patient_intake;
  }

  // 3. Location, directions, and address
  if (
    query.includes('location') ||
    query.includes('address') ||
    query.includes('where is') ||
    query.includes('direction') ||
    query.includes('how to reach') ||
    query.includes('faisal town') ||
    query.includes('located') ||
    query.includes('map') ||
    query.includes('kahan') ||
    query.includes('kidhar') ||
    query.includes('rasta')
  ) {
    return ALLOWED_ACTIONS.get_directions;
  }

  // 4. Booking and appointment availability
  if (
    query.includes('book') ||
    query.includes('appointment') ||
    query.includes('timing') ||
    query.includes('schedule') ||
    query.includes('consultation') ||
    query.includes('slot') ||
    query.includes('fee') ||
    query.includes('available') ||
    query.includes('milna') ||
    query.includes('checkup')
  ) {
    return ALLOWED_ACTIONS.book_appointment;
  }

  // 5. Contact, phone, receptionist call, or WhatsApp
  if (
    query.includes('contact') ||
    query.includes('phone') ||
    query.includes('whatsapp') ||
    query.includes('number') ||
    query.includes('call') ||
    query.includes('front desk') ||
    query.includes('reception') ||
    query.includes('raabta')
  ) {
    return ALLOWED_ACTIONS.contact_clinic;
  }

  // 6. Medical services, conditions treated, or treatments offered
  if (
    query.includes('service') ||
    query.includes('treat') ||
    query.includes('specialty') ||
    query.includes('specialist') ||
    query.includes('disease') ||
    query.includes('illness') ||
    query.includes('diabetes') ||
    query.includes('hypertension') ||
    query.includes('blood pressure') ||
    query.includes('cholesterol') ||
    query.includes('liver') ||
    query.includes('stomach') ||
    query.includes('internal medicine')
  ) {
    return ALLOWED_ACTIONS.view_services;
  }

  // Default: do not attach action if no specific destination exists
  return null;
}

export const AIModal: React.FC<AIModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const { addAiMessageToSession } = useCMS();

  // Session ID for this chat instance
  const [sessionId] = useState<string>(() => `sess-web-${Date.now()}`);

  // Messages log
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'msg-init',
      sender: 'ai',
      text: "Assalam-o-Alaikum! Welcome to Dr. Farhan Mustafa's Official Clinic Reception. I am your 24/7 administrative assistant at HealthPro Medical Complex, Faisal Town, Lahore.\n\nI can assist with clinic consultation timings, location directions, doctor credentials, fee structures, and appointment bookings.\n\n⚠️ Note: I cannot assess medical symptoms, interpret lab tests, or prescribe medications. In an emergency, please dial Rescue 1122 immediately.",
      timestamp: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      contextualAction: null,
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isNearBottomRef = useRef(true);

  // Maximum three starter suggestions, shown only before first user message
  const starterSuggestions = [
    { label: 'Clinic timings & days', query: 'What are the clinic consultation timings and days?' },
    { label: 'Location in Faisal Town', query: 'Where is Dr. Farhan Mustafa’s clinic located in Faisal Town, Lahore?' },
    { label: 'Consultation fees & booking', query: 'What is the consultation fee and how can I book an appointment?' },
  ];

  const hasUserSentMessage = messages.some((m) => m.sender === 'user');

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle escape key and return focus to launcher
  const handleClose = () => {
    onClose();
    setTimeout(() => {
      document.getElementById('floating-ai-receptionist-btn')?.focus();
    }, 50);
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Click outside handling
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      handleClose();
    }
  };

  // Track if user is scrolled near the bottom
  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const threshold = 120;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    isNearBottomRef.current = distanceFromBottom <= threshold;
  };

  // Scroll to bottom only if user was already near bottom or just sent a message
  useEffect(() => {
    if (isOpen) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg?.sender === 'user' || isNearBottomRef.current) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [messages, isOpen, isLoading]);

  if (!isOpen) return null;

  const executeUserQuery = async (queryText: string) => {
    if (!queryText.trim() || isLoading) return;

    const userText = queryText.trim();
    const nowTime = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

    let detected = 'en';
    if (/[\u0600-\u06FF]/.test(userText)) {
      detected = 'ur';
    }

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: nowTime,
    };

    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          sessionId,
          conversationHistory: nextMessages.slice(-6).map((m) => ({ sender: m.sender, text: m.text })),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const replyText =
          data.reply ||
          'Thank you for reaching out. Please connect with our clinic staff on WhatsApp at https://wa.me/923280145670 or call 0328 0145670 during clinic consultation hours (Mon–Sat 6:00 PM – 9:00 PM).';
        const isEmergency = Boolean(data.isEmergency);

        const contextualAction = resolveContextualAction(userText, replyText, isEmergency, false);

        const aiMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: replyText,
          timestamp: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
          isEmergency,
          contextualAction,
        };

        setMessages((prev) => [...prev, aiMsg]);

        addAiMessageToSession(
          sessionId,
          userText,
          aiMsg.text,
          aiMsg.isEmergency,
          detected,
          data.triageFlag || 'clean'
        );
      } else if (res.status === 429) {
        const rateLimitMsg: ChatMessage = {
          id: `ai-rate-${Date.now()}`,
          sender: 'ai',
          text: 'You have reached the temporary message rate limit. For immediate assistance, please connect with Dr. Farhan’s front desk on WhatsApp at https://wa.me/923280145670 or by phone at 0328 0145670.',
          timestamp: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
          contextualAction: null,
        };
        setMessages((prev) => [...prev, rateLimitMsg]);
      } else {
        throw new Error('API non-200 response');
      }
    } catch {
      const fallbackAiMsg: ChatMessage = {
        id: `ai-fb-${Date.now()}`,
        sender: 'ai',
        text: 'Dr. Farhan Mustafa consults at HealthPro Medical Complex, 860-B, Block B, Faisal Town, Lahore, Monday to Saturday, 6:00 PM – 9:00 PM (PKT). You can book online at /appointments or message our reception directly on WhatsApp at https://wa.me/923280145670.',
        timestamp: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
        isEmergency: false,
        contextualAction: null,
      };
      setMessages((prev) => [...prev, fallbackAiMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeUserQuery(input);
  };

  // Safe inline link and entity renderer
  const renderMessageContent = (text: string) => {
    const tokenRegex = /(https?:\/\/[^\s]+|\/(?:appointments|fees|contact|services|about|patient-forms|resources)\b|\+?92\s?3\d{2}\s?\d{7}|03\d{2}\s?\d{7}\b|1122\b)/gi;
    const parts = text.split(tokenRegex);

    return parts.map((part, index) => {
      if (!part) return null;

      // External URL or WhatsApp link
      if (/^https?:\/\//i.test(part)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#2097A2] hover:underline font-semibold break-all"
          >
            {part}
          </a>
        );
      }

      // Internal clinic route
      if (/^\/(?:appointments|fees|contact|services|about|patient-forms|resources)\b/i.test(part)) {
        const pageId = part.replace('/', '') as PageId;
        return (
          <a
            key={index}
            href={part}
            onClick={(e) => {
              e.preventDefault();
              onNavigate(pageId);
              handleClose();
            }}
            className="text-[#2097A2] hover:underline font-semibold"
          >
            {part}
          </a>
        );
      }

      // Emergency 1122
      if (part === '1122') {
        return (
          <a
            key={index}
            href="tel:1122"
            className="text-red-600 hover:underline font-bold"
          >
            1122
          </a>
        );
      }

      // Pakistani phone number
      if (/^(\+?92\s?3\d{2}\s?\d{7}|03\d{2}\s?\d{7})$/i.test(part.trim())) {
        const raw = part.replace(/\D/g, '');
        const telNumber = raw.startsWith('92') ? `+${raw}` : raw.startsWith('0') ? `+92${raw.slice(1)}` : `+92${raw}`;
        return (
          <a
            key={index}
            href={`tel:${telNumber}`}
            className="text-[#2097A2] hover:underline font-semibold whitespace-nowrap"
          >
            {part}
          </a>
        );
      }

      return part;
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="AI Clinic Receptionist"
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 bg-black/40 sm:bg-transparent pointer-events-auto sm:pointer-events-none transition-opacity"
    >
      <div
        ref={modalRef}
        className="pointer-events-auto fixed inset-3 sm:inset-auto sm:bottom-6 sm:right-6 sm:w-[460px] sm:h-[680px] sm:max-w-[calc(100vw-32px)] sm:max-h-[calc(100dvh-32px)] bg-white border border-slate-200 shadow-2xl rounded-sm sm:rounded-md flex flex-col overflow-hidden animate-fadeIn pb-[env(safe-area-inset-bottom,0px)]"
      >
        {/* Compact Header */}
        <div className="bg-[#1A365D] text-white px-4 py-3 sm:px-5 sm:py-3.5 flex items-center justify-between border-b border-[#2097A2]/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#2097A2] border border-white/20 flex items-center justify-center rounded-sm shrink-0">
              <Bot className="w-5 h-5 text-white" aria-hidden="true" />
            </div>
            <div>
              <h2 className="font-semibold text-sm sm:text-[15px] tracking-tight text-white leading-tight">
                Dr. Farhan’s AI Receptionist
              </h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-[11px] text-emerald-300 font-medium">Online • 24/7 Clinic Guidance</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="w-10 h-10 -mr-1 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 rounded-sm transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-white"
            aria-label="Close AI Receptionist"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Scrollable Conversation Area */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-5 space-y-4 bg-[#F8FAFC]"
        >
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            const isEmergency = msg.isEmergency;

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] px-4 py-3 text-[15px] leading-relaxed break-words [overflow-wrap:anywhere] shadow-2xs ${
                    isUser
                      ? 'bg-[#1A365D] text-white rounded-t-lg rounded-bl-lg'
                      : isEmergency
                      ? 'bg-red-50 border border-red-300 text-red-950 font-medium rounded-t-lg rounded-br-lg'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-t-lg rounded-br-lg'
                  }`}
                >
                  <div className="whitespace-pre-wrap">
                    {renderMessageContent(msg.text)}
                  </div>
                </div>

                {/* Maximum ONE lightweight contextual action link button per AI response */}
                {!isUser && msg.contextualAction && (
                  <div className="mt-2 flex justify-start">
                    {msg.contextualAction.externalUrl ? (
                      <a
                        href={msg.contextualAction.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group inline-flex items-center gap-1.5 min-h-[44px] py-1 px-3 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 hover:text-[#2097A2] border border-slate-200 hover:border-[#2097A2]/50 rounded-sm text-[12px] sm:text-[13px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-[#2097A2] focus-visible:outline-offset-1 shadow-2xs"
                      >
                        <span>{msg.contextualAction.label}</span>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#2097A2] transition-colors" aria-hidden="true" />
                      </a>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          if (msg.contextualAction?.route) {
                            onNavigate(msg.contextualAction.route);
                            handleClose();
                          }
                        }}
                        className="group inline-flex items-center gap-1.5 min-h-[44px] py-1 px-3 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 hover:text-[#2097A2] border border-slate-200 hover:border-[#2097A2]/50 rounded-sm text-[12px] sm:text-[13px] font-medium transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#2097A2] focus-visible:outline-offset-1 shadow-2xs"
                      >
                        <span>{msg.contextualAction.label}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#2097A2] transition-colors" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                )}

                <span className="text-[11px] text-slate-400 mt-1 px-1">
                  {msg.timestamp}
                </span>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-slate-500 pt-1" aria-live="polite">
              <div className="bg-white border border-slate-200 px-3 py-2 flex items-center gap-1.5 shadow-2xs rounded-sm">
                <span className="w-2 h-2 bg-[#2097A2] rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-[#2097A2] rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 bg-[#2097A2] rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
              <span className="text-[12px] italic">Checking clinic facts...</span>
            </div>
          )}

          {/* Starter Suggestions (max 3, only before first user message) */}
          {!hasUserSentMessage && !isLoading && (
            <div className="pt-2">
              <p className="text-[12px] font-medium text-slate-500 mb-2">Common questions:</p>
              <div className="flex flex-wrap gap-2">
                {starterSuggestions.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => executeUserQuery(item.query)}
                    className="text-left text-[13px] font-medium text-slate-700 bg-white hover:bg-slate-50 active:bg-slate-100 border border-slate-300 hover:border-[#2097A2] hover:text-[#2097A2] px-3 py-1.5 rounded-sm transition-colors cursor-pointer shadow-2xs focus-visible:outline-2 focus-visible:outline-[#2097A2]"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Fixed Message Composer */}
        <div className="bg-white border-t border-slate-200 p-3 sm:p-3.5 shrink-0">
          <form onSubmit={handleFormSubmit} className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              placeholder="Ask about timings, location, fees, or appointments..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              className="flex-1 min-h-[44px] px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-sm text-[15px] text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#2097A2] focus:ring-1 focus:ring-[#2097A2] focus:outline-hidden disabled:bg-slate-100 disabled:text-slate-400 transition-colors"
              aria-label="Type your message to the AI Receptionist"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              aria-label="Send message"
              className="min-w-[44px] min-h-[44px] px-4 py-2 bg-[#2097A2] hover:bg-[#1B808A] active:bg-[#166E76] disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold text-xs uppercase tracking-wider rounded-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#2097A2] focus-visible:outline-offset-2 shrink-0"
            >
              <Send className="w-4 h-4" aria-hidden="true" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>

          {/* Micro-Disclaimer */}
          <div className="mt-2 text-[11px] text-slate-500 text-center leading-tight">
            Administrative guidance only • For urgent medical emergencies dial{' '}
            <a href="tel:1122" className="text-red-600 font-semibold hover:underline">
              1122
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
