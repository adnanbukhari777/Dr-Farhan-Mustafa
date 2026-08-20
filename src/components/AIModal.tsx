import React, { useState, useRef, useEffect } from 'react';
import { useCMS } from '../context/CMSContext';
import {
  Bot,
  X,
  Send,
  AlertTriangle,
  Phone,
  MessageCircle,
  Calendar,
  MapPin,
  CheckCircle2,
  Globe,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  Volume2,
  VolumeX,
  Clock
} from 'lucide-react';
import { PageId } from '../types';

interface AIModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: PageId) => void;
  onOpenAppointmentModal?: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  isEmergency?: boolean;
  detectedLang?: string;
  quickActions?: { label: string; actionType: string; payload: string }[];
}

export const AIModal: React.FC<AIModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onOpenAppointmentModal,
}) => {
  const { aiSettings, addAiMessageToSession, logAiSafetyTrigger } = useCMS();

  // Session ID for this chat instance
  const [sessionId] = useState<string>(() => `sess-web-${Date.now()}`);

  // Consent State
  const [hasConsented, setHasConsented] = useState<boolean>(() => {
    return localStorage.getItem('dfm_ai_consent_accepted') === 'true';
  });

  // Language preference
  const [selectedLang, setSelectedLang] = useState<'en' | 'ur' | 'roman_ur'>('en');

  // Text to speech enabled
  const [isSpeechEnabled, setIsSpeechEnabled] = useState<boolean>(false);

  // Messages
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'msg-init',
      sender: 'ai',
      text: "Assalam-o-Alaikum! Welcome to Dr. Farhan Mustafa's Official Clinic Reception. I am your 24/7 administrative AI assistant at HealthPro Medical Complex, Faisal Town, Lahore.\n\nI can help you with consultation timings, location directions, doctor credentials, fee structures, and appointment bookings in English, Urdu (اردو), or Roman Urdu.\n\n⚠️ Please note: I cannot assess medical symptoms, interpret lab tests, or prescribe medications. In an emergency, please dial Rescue 1122 immediately.",
      timestamp: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      quickActions: [
        { label: 'Book Appointment', actionType: 'book_modal', payload: '/appointments' },
        { label: 'Clinic Timings (6-9 PM)', actionType: 'prompt', payload: 'What are the clinic timings and consultation hours?' },
        { label: 'Location & Map', actionType: 'navigate', payload: '/contact' },
        { label: 'Consultation Fees', actionType: 'navigate', payload: '/fees' },
        { label: 'WhatsApp Reception', actionType: 'whatsapp', payload: 'https://wa.me/923280145670' },
      ],
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Quick Prompt Presets by Language
  const promptSuggestions = {
    en: [
      'What are clinic consultation timings?',
      'Where in Faisal Town, Lahore is clinic located?',
      'What are Dr. Farhan qualifications & experience?',
      'How much is the consultation fee?',
      'How to book an in-clinic or video appointment?',
    ],
    ur: [
      'کلینک کے اوقات کار اور چیک اپ کا وقت کیا ہے؟',
      'ڈاکٹر صاحب کا کلینک فیصل ٹاؤن میں کہاں ہے؟',
      'ڈاکٹر فرحان مصطفیٰ کی قابلیت اور اسناد کیا ہیں؟',
      'چیک اپ اور کنسلٹیشن فیس کتنی ہے؟',
      'اپائنٹمنٹ بک کرنے کا کیا طریقہ ہے؟',
    ],
    roman_ur: [
      'Clinic ke timings aur days kya hain?',
      'Dr Farhan ka clinic Lahore me kahan waqia hai?',
      'Doctor sahab ki qualifications kya hain?',
      'Consultation fee kitni hai?',
      'Appointment book karne ka tarika bata dein',
    ],
  };

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  if (!isOpen) return null;

  const handleAcceptConsent = () => {
    setHasConsented(true);
    localStorage.setItem('dfm_ai_consent_accepted', 'true');
  };

  const handleQuickActionClick = (action: { label: string; actionType: string; payload: string }) => {
    if (action.actionType === 'book_modal') {
      if (onOpenAppointmentModal) {
        onOpenAppointmentModal();
      } else {
        onNavigate('appointments');
      }
      onClose();
    } else if (action.actionType === 'navigate') {
      const page = action.payload.replace('/', '') as PageId;
      onNavigate(page);
      onClose();
    } else if (action.actionType === 'whatsapp') {
      window.open(action.payload || 'https://wa.me/923280145670', '_blank', 'noopener,noreferrer');
    } else if (action.actionType === 'tel') {
      window.open(action.payload || 'tel:+923280145670', '_self');
    } else if (action.actionType === 'prompt') {
      executeUserQuery(action.payload);
    }
  };

  const executeUserQuery = async (queryText: string) => {
    if (!queryText.trim() || isLoading) return;

    const userText = queryText.trim();
    const nowTime = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

    // Client-side detected language hint
    let detected = selectedLang;
    if (/[\u0600-\u06FF]/.test(userText)) {
      detected = 'ur';
    }

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: nowTime,
      detectedLang: detected,
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
          conversationHistory: nextMessages.slice(-6).map(m => ({ sender: m.sender, text: m.text })),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const aiMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: data.reply || 'Thank you for your message. Please connect with our clinic staff on WhatsApp at +92 328 0145670.',
          timestamp: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
          isEmergency: Boolean(data.isEmergency),
          quickActions: data.quickActions || [],
        };

        setMessages(prev => [...prev, aiMsg]);

        // Save into CMS state for conversation tracking
        addAiMessageToSession(
          sessionId,
          userText,
          aiMsg.text,
          aiMsg.isEmergency,
          detected,
          data.triageFlag || 'clean'
        );

        // Optional Web Speech API text-to-speech for accessibility
        if (isSpeechEnabled && 'speechSynthesis' in window && !aiMsg.isEmergency) {
          const cleanText = aiMsg.text.replace(/[⚠️*#]/g, '');
          const utterance = new SpeechSynthesisUtterance(cleanText);
          utterance.rate = 1.0;
          window.speechSynthesis.speak(utterance);
        }
      } else if (res.status === 429) {
        // Rate limit hit
        const rateLimitMsg: ChatMessage = {
          id: `ai-rate-${Date.now()}`,
          sender: 'ai',
          text: 'You have reached the maximum message rate for this session. Please connect with Dr. Farhan’s front desk directly on WhatsApp (+92 328 0145670) or by telephone at 0328 0145670.',
          timestamp: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
          quickActions: [
            { label: 'WhatsApp Reception', actionType: 'whatsapp', payload: 'https://wa.me/923280145670' },
            { label: 'Call Clinic Desk', actionType: 'tel', payload: 'tel:+923280145670' },
          ],
        };
        setMessages(prev => [...prev, rateLimitMsg]);
      } else {
        throw new Error('API returned non-200');
      }
    } catch (err) {
      // Offline / network fallback
      const fallbackAiMsg: ChatMessage = {
        id: `ai-fb-${Date.now()}`,
        sender: 'ai',
        text: `Dr. Farhan Mustafa consults at HealthPro Medical Complex, 860-B, Block B, Faisal Town, Lahore, Monday to Saturday, 6:00 PM – 9:00 PM (PKT). For immediate assistance and appointment confirmation, please reach our front desk on WhatsApp (+92 328 0145670).`,
        timestamp: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
        isEmergency: false,
        quickActions: [
          { label: 'Book Appointment', actionType: 'book_modal', payload: '/appointments' },
          { label: 'WhatsApp Desk (+92 328 0145670)', actionType: 'whatsapp', payload: 'https://wa.me/923280145670' },
        ],
      };
      setMessages(prev => [...prev, fallbackAiMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeUserQuery(input);
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `msg-reset-${Date.now()}`,
        sender: 'ai',
        text: "Chat refreshed. How can I assist you with Dr. Farhan Mustafa's clinic schedules, location in Faisal Town, or appointment requests?",
        timestamp: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
        quickActions: [
          { label: 'Book Appointment', actionType: 'book_modal', payload: '/appointments' },
          { label: 'Clinic Timings', actionType: 'prompt', payload: 'What are the clinic timings?' },
          { label: 'Location Map', actionType: 'navigate', payload: '/contact' },
        ],
      },
    ]);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="AI Clinic Receptionist"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn"
    >
      <div className="bg-white w-full max-w-xl h-[680px] max-h-[92vh] rounded-none border border-[#E2E8F0] shadow-2xl flex flex-col justify-between overflow-hidden">
        
        {/* Top Header */}
        <div className="bg-[#1A365D] text-white p-3.5 sm:p-4 flex items-center justify-between border-b border-[#2097A2]/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-none bg-[#2097A2] border border-white/20 flex items-center justify-center shadow-xs">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm tracking-tight">Dr. Farhan’s AI Receptionist</h3>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Grounded & Active
                </span>
              </div>
              <p className="text-[11px] text-white/80 font-normal">HealthPro Medical Complex, Faisal Town, Lahore</p>
            </div>
          </div>

          {/* Quick Hand-Off Icons */}
          <div className="flex items-center gap-1.5">
            <a
              href="https://wa.me/923280145670"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-none transition-colors"
              title="WhatsApp Front Desk (+92 328 0145670)"
            >
              <MessageCircle className="w-4 h-4" />
            </a>
            <a
              href="tel:+923280145670"
              className="p-1.5 bg-[#2097A2] hover:bg-[#1B808A] text-white rounded-none transition-colors"
              title="Call Clinic Reception (0328 0145670)"
            >
              <Phone className="w-4 h-4" />
            </a>
            <button
              onClick={handleResetChat}
              className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-none transition-colors cursor-pointer"
              title="Restart Conversation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-none transition-colors cursor-pointer ml-1"
              aria-label="Close Receptionist"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Emergency Notice Strip */}
        <div className="bg-amber-50 border-b border-amber-200 px-3.5 py-1.5 text-[11px] text-amber-900 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 font-medium">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
            <span>Administrative assistant only. In acute medical emergency, call <strong>Rescue 1122</strong>.</span>
          </div>
          <a
            href="tel:1122"
            className="px-2 py-0.5 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold rounded-none whitespace-nowrap"
          >
            Call 1122
          </a>
        </div>

        {/* First-Time Consent Modal Banner if not yet accepted */}
        {!hasConsented && (
          <div className="bg-[#F8FAFC] border-b border-[#E2E8F0] p-3.5 text-xs text-[#334155] space-y-2">
            <div className="flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-[#2097A2] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-[#0A0A0A]">Patient Privacy & Clinical Information Notice</p>
                <p className="text-[11px] text-[#64748B] mt-0.5 leading-relaxed">
                  {aiSettings.consentText || "Dr. Farhan Mustafa's AI Assistant provides verified logistical and appointment information. It cannot provide medical diagnoses, symptom assessments, or prescription advice."}
                </p>
              </div>
            </div>
            <div className="flex justify-end pt-1">
              <button
                onClick={handleAcceptConsent}
                className="px-3.5 py-1 bg-[#2097A2] hover:bg-[#1B808A] text-white text-xs font-semibold rounded-none cursor-pointer"
              >
                I Understand & Proceed
              </button>
            </div>
          </div>
        )}

        {/* Language Tabs & Audio Toggle */}
        <div className="bg-[#F8FAFC] border-b border-[#E2E8F0] px-3.5 py-2 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-[#64748B] flex items-center gap-1 font-medium mr-1">
              <Globe className="w-3.5 h-3.5 text-[#2097A2]" /> Language:
            </span>
            <button
              onClick={() => setSelectedLang('en')}
              className={`px-2.5 py-0.5 text-xs font-medium border transition-colors cursor-pointer ${
                selectedLang === 'en'
                  ? 'bg-[#1A365D] text-white border-[#1A365D]'
                  : 'bg-white text-[#475569] border-[#CBD5E1] hover:bg-slate-50'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setSelectedLang('ur')}
              className={`px-2.5 py-0.5 text-xs font-medium border transition-colors cursor-pointer ${
                selectedLang === 'ur'
                  ? 'bg-[#1A365D] text-white border-[#1A365D]'
                  : 'bg-white text-[#475569] border-[#CBD5E1] hover:bg-slate-50'
              }`}
            >
              اردو
            </button>
            <button
              onClick={() => setSelectedLang('roman_ur')}
              className={`px-2.5 py-0.5 text-xs font-medium border transition-colors cursor-pointer ${
                selectedLang === 'roman_ur'
                  ? 'bg-[#1A365D] text-white border-[#1A365D]'
                  : 'bg-white text-[#475569] border-[#CBD5E1] hover:bg-slate-50'
              }`}
            >
              Roman Urdu
            </button>
          </div>

          <button
            onClick={() => setIsSpeechEnabled(prev => !prev)}
            className={`p-1 text-xs border rounded-none flex items-center gap-1 cursor-pointer transition-colors ${
              isSpeechEnabled
                ? 'bg-teal-50 border-[#2097A2] text-[#2097A2]'
                : 'bg-white border-[#CBD5E1] text-[#64748B] hover:text-[#0A0A0A]'
            }`}
            title="Toggle Voice Readout"
          >
            {isSpeechEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Message Log */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F8FAFC]">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[88%] p-3.5 text-xs leading-relaxed space-y-2.5 shadow-2xs ${
                  msg.sender === 'user'
                    ? 'bg-[#1A365D] text-white rounded-none'
                    : msg.isEmergency
                    ? 'bg-red-50 border-2 border-red-400 text-red-950 font-medium'
                    : 'bg-white border border-[#E2E8F0] text-[#0F172A]'
                }`}
              >
                <div className="whitespace-pre-line">{msg.text}</div>

                {/* Grounded Quick Action Buttons */}
                {msg.quickActions && msg.quickActions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-black/10">
                    {msg.quickActions.map((qa, i) => (
                      <button
                        key={i}
                        onClick={() => handleQuickActionClick(qa)}
                        className={`px-2.5 py-1 text-[11px] font-semibold transition-colors cursor-pointer border ${
                          msg.isEmergency || qa.actionType === 'tel'
                            ? 'bg-red-600 text-white border-red-700 hover:bg-red-700'
                            : qa.actionType === 'whatsapp'
                            ? 'bg-emerald-700 text-white border-emerald-800 hover:bg-emerald-800'
                            : qa.actionType === 'book_modal'
                            ? 'bg-[#2097A2] text-white border-[#1B808A] hover:bg-[#1B808A]'
                            : 'bg-white text-[#2097A2] border-[#2097A2]/40 hover:bg-[#2097A2] hover:text-white'
                        }`}
                      >
                        {qa.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <span className="text-[10px] text-[#94A3B8] mt-1 px-1">{msg.timestamp}</span>
            </div>
          ))}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-[#64748B]">
              <div className="bg-white border border-[#CBD5E1] p-2.5 flex items-center gap-1.5 shadow-2xs">
                <span className="w-2 h-2 bg-[#2097A2] rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-[#2097A2] rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 bg-[#2097A2] rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
              <span className="text-[11px] italic">Checking verified clinic knowledge...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Prompts Strip */}
        <div className="bg-white border-t border-[#E2E8F0] px-3.5 py-2 overflow-x-auto whitespace-nowrap scrollbar-none flex gap-1.5">
          {promptSuggestions[selectedLang].map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => executeUserQuery(prompt)}
              className="px-2.5 py-1 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#334155] border border-[#CBD5E1] text-[11px] font-medium transition-colors cursor-pointer shrink-0"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Form */}
        <form onSubmit={handleFormSubmit} className="p-3 bg-white border-t border-[#E2E8F0] flex gap-2">
          <input
            type="text"
            placeholder={
              selectedLang === 'ur'
                ? 'کلینک کے اوقات، فیس یا اپائنٹمنٹ کے بارے میں پوچھیں...'
                : selectedLang === 'roman_ur'
                ? 'Clinic timings, fee ya appointment ke mutabiq puchen...'
                : 'Ask about timings, Faisal Town location, fees, or booking...'
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            dir={selectedLang === 'ur' ? 'rtl' : 'ltr'}
            className="flex-1 px-3.5 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-none text-xs text-[#0F172A] focus:bg-white focus:border-[#2097A2] focus:outline-hidden"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-colors flex items-center justify-center gap-1 cursor-pointer ${
              !input.trim() || isLoading ? 'bg-slate-300 cursor-not-allowed' : 'bg-[#2097A2] hover:bg-[#1B808A]'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>

        {/* Legal Micro-Disclaimer */}
        <div className="bg-[#F8FAFC] border-t border-[#E2E8F0] px-3 py-1.5 text-[10px] text-[#64748B] text-center">
          {aiSettings.disclaimerText || "Informational AI Receptionist • Grounded in Published Clinic Facts • Outpatient care by prior appointment"}
        </div>

      </div>
    </div>
  );
};
