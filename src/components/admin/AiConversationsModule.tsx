import React, { useState } from 'react';
import { useCMS } from '../../context/CMSContext';
import { AiConversationSession, AiSafetyLogRecord } from '../../types';
import {
  MessageSquare,
  ShieldAlert,
  Sliders,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Phone,
  Clock,
  Globe,
  Lock,
  RotateCcw,
  Sparkles,
  Save,
  Search,
  ChevronRight,
  User,
  Bot
} from 'lucide-react';

export const AiConversationsModule: React.FC = () => {
  const {
    aiConversations,
    aiSafetyLogs,
    aiSettings,
    updateAiSettings,
    purgeAiLogs,
    showNotification
  } = useCMS();

  const [activeSubTab, setActiveSubTab] = useState<'conversations' | 'safety_logs' | 'settings'>('conversations');
  const [selectedSession, setSelectedSession] = useState<AiConversationSession | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Editable Settings state
  const [modelName, setModelName] = useState(aiSettings.modelName || 'gemini-3.7-flash');
  const [temperature, setTemperature] = useState(aiSettings.temperature ?? 0.2);
  const [maxTokens, setMaxTokens] = useState(aiSettings.maxTokens ?? 800);
  const [rateLimit, setRateLimit] = useState(aiSettings.rateLimitPer10Min ?? 20);
  const [retentionDays, setRetentionDays] = useState(aiSettings.retentionDays ?? 30);
  const [systemPrompt, setSystemPrompt] = useState(aiSettings.systemPrompt || '');
  const [emergencyAlertText, setEmergencyAlertText] = useState(aiSettings.emergencyAlertText || '');
  const [whatsappNumber, setWhatsappNumber] = useState(aiSettings.whatsappNumber || '+92 328 0145670');
  const [phoneNumber, setPhoneNumber] = useState(aiSettings.phoneNumber || '0328 0145670');
  const [consentText, setConsentText] = useState(aiSettings.consentText || '');

  const filteredSessions = aiConversations.filter(sess => {
    const q = searchQuery.toLowerCase();
    return (
      !searchQuery ||
      sess.sessionId.toLowerCase().includes(q) ||
      sess.userLanguage.toLowerCase().includes(q) ||
      sess.triageFlag.toLowerCase().includes(q) ||
      sess.messages.some(m => m.text.toLowerCase().includes(q))
    );
  });

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateAiSettings({
      modelName,
      temperature,
      maxTokens,
      rateLimitPer10Min: Number(rateLimit),
      retentionDays: Number(retentionDays),
      systemPrompt,
      emergencyAlertText,
      whatsappNumber,
      phoneNumber,
      consentText,
    });
  };

  const handlePurge = () => {
    if (window.confirm(`Are you sure you want to purge AI logs and sessions older than ${retentionDays} days?`)) {
      purgeAiLogs(retentionDays);
    }
  };

  return (
    <div className="space-y-6">
      {/* Module Title Banner */}
      <div className="bg-white border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-[#2097A2] text-white flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">AI Receptionist Conversations & Safety Logs</h2>
              <p className="text-xs text-slate-500">
                Live patient interaction monitoring, red-flag emergency triage flags, and Gemini model parameters.
              </p>
            </div>
          </div>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex items-center bg-slate-100 p-1 border border-slate-200">
          <button
            onClick={() => setActiveSubTab('conversations')}
            className={`px-3 py-1.5 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'conversations' ? 'bg-white text-[#1A365D] shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Chat Sessions ({aiConversations.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('safety_logs')}
            className={`px-3 py-1.5 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'safety_logs' ? 'bg-white text-[#1A365D] shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
            <span>Safety Audits ({aiSafetyLogs.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('settings')}
            className={`px-3 py-1.5 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'settings' ? 'bg-white text-[#1A365D] shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Model & Safety Guardrails</span>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 1. Conversations Sub-tab */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'conversations' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sessions List */}
          <div className="lg:col-span-1 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search sessions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 text-xs focus:outline-hidden focus:border-[#2097A2]"
              />
            </div>

            <div className="bg-white border border-slate-200 divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
              {filteredSessions.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">No conversation sessions found.</div>
              ) : (
                filteredSessions.map((sess) => (
                  <button
                    key={sess.id}
                    onClick={() => setSelectedSession(sess)}
                    className={`w-full text-left p-3.5 transition flex items-start justify-between gap-2 cursor-pointer ${
                      selectedSession?.id === sess.id ? 'bg-teal-50/70 border-l-4 border-[#2097A2]' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900 truncate">{sess.sessionId}</span>
                        {sess.triageFlag === 'emergency' ? (
                          <span className="px-1.5 py-0.2 bg-red-100 text-red-700 text-[9px] font-bold uppercase">
                            Emergency
                          </span>
                        ) : sess.triageFlag === 'medical_advice_refusal' ? (
                          <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 text-[9px] font-bold uppercase">
                            Medical Refusal
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.2 bg-slate-100 text-slate-600 text-[9px] font-bold uppercase">
                            Clean
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2">
                        <span className="flex items-center gap-1">
                          <Globe className="w-3 h-3 text-slate-400" /> {sess.userLanguage}
                        </span>
                        <span>•</span>
                        <span>{sess.messageCount} messages</span>
                      </div>
                      <div className="text-[10px] text-slate-400">{sess.lastActivityAt}</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 mt-2" />
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Session Detail Transcript */}
          <div className="lg:col-span-2 bg-white border border-slate-200 p-5 space-y-4">
            {selectedSession ? (
              <>
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">
                      Session Transcript: <span className="font-mono text-[#2097A2]">{selectedSession.sessionId}</span>
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Started: {selectedSession.startedAt} • Detected Language: {selectedSession.userLanguage}
                    </p>
                  </div>

                  {selectedSession.isEscalated && (
                    <div className="px-2.5 py-1 bg-red-50 text-red-800 border border-red-200 text-xs font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Escalated to {selectedSession.escalationType?.replace('_', ' ').toUpperCase()}</span>
                    </div>
                  )}
                </div>

                {/* Message Timeline */}
                <div className="space-y-3 max-h-[480px] overflow-y-auto p-3 bg-slate-50 border border-slate-200">
                  {selectedSession.messages.map((m, idx) => (
                    <div
                      key={idx}
                      className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 mb-0.5">
                        {m.sender === 'user' ? (
                          <>
                            <span>Patient (Session)</span>
                            <User className="w-3 h-3" />
                          </>
                        ) : (
                          <>
                            <Bot className="w-3 h-3 text-[#2097A2]" />
                            <span className="font-semibold text-[#2097A2]">AI Clinic Receptionist</span>
                          </>
                        )}
                        <span>• {m.timestamp}</span>
                      </div>

                      <div
                        className={`max-w-[85%] p-3 text-xs leading-relaxed ${
                          m.sender === 'user'
                            ? 'bg-[#1A365D] text-white'
                            : m.isEmergency
                            ? 'bg-red-100 text-red-950 border border-red-300 font-medium'
                            : 'bg-white text-slate-800 border border-slate-200 shadow-2xs'
                        }`}
                      >
                        <p className="whitespace-pre-line">{m.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="p-16 text-center text-slate-400 text-xs">
                Select a conversation session from the left to view the interactive transcript.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. Safety Logs Sub-tab */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'safety_logs' && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 p-4 text-xs text-amber-900 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Automated Safety & Regulatory Audit Log</p>
              <p className="mt-0.5 text-amber-800 leading-relaxed">
                Tracks every attempt to request medical diagnosis, prescription dosages, emergency symptoms, or prompt injection. The AI Receptionist intercepts these automatically to protect patient safety.
              </p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-500">
                <tr>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Trigger Type</th>
                  <th className="p-3">User Query Text</th>
                  <th className="p-3">Action Enforced</th>
                  <th className="p-3">IP / Location</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {aiSafetyLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400">
                      No safety triggers logged.
                    </td>
                  </tr>
                ) : (
                  aiSafetyLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="p-3 font-mono text-[11px] text-slate-600 whitespace-nowrap">{log.timestamp}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold uppercase ${
                            log.triggerType === 'emergency_symptoms'
                              ? 'bg-red-100 text-red-800'
                              : log.triggerType === 'medical_diagnosis_attempt'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}
                        >
                          {log.triggerType.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="p-3 text-slate-800 font-medium max-w-xs truncate">{log.userQuery}</td>
                      <td className="p-3 font-semibold text-slate-700">
                        {log.actionTaken.replace(/_/g, ' ').toUpperCase()}
                      </td>
                      <td className="p-3 font-mono text-[11px] text-slate-500">{log.ipAddress || '127.0.0.1'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3. Settings & Model Guardrails Sub-tab */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="bg-white border border-slate-200 p-6 space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <h3 className="font-bold text-base text-slate-900">Gemini Model & Operational Safety Parameters</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Configure Google Gemini model selection, grounding temperature, rate limiting, and clinic emergency text.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* Model Name */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Gemini Model</label>
              <select
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 text-xs focus:bg-white focus:outline-hidden"
              >
                <option value="gemini-3.7-flash">gemini-3.7-flash (Recommended: Ultra-fast & accurate)</option>
                <option value="gemini-2.5-flash">gemini-2.5-flash</option>
                <option value="gemini-2.5-pro">gemini-2.5-pro</option>
              </select>
              <p className="text-[10px] text-slate-400 mt-1">Uses server environment GEMINI_API_KEY.</p>
            </div>

            {/* Temperature */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Temperature ({temperature})</label>
              <input
                type="range"
                min="0.0"
                max="0.8"
                step="0.05"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full accent-[#2097A2] cursor-pointer mt-2"
              />
              <p className="text-[10px] text-slate-400 mt-1">Lower values (0.1 - 0.2) ensure factual adherence.</p>
            </div>

            {/* Max Output Tokens */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Max Output Tokens</label>
              <input
                type="number"
                value={maxTokens}
                onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                className="w-full p-2 bg-slate-50 border border-slate-300 text-xs focus:bg-white focus:outline-hidden"
              />
              <p className="text-[10px] text-slate-400 mt-1">Maximum length of AI response generation.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Rate Limit */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Session Rate Limit (Messages per 10 Mins)</label>
              <input
                type="number"
                value={rateLimit}
                onChange={(e) => setRateLimit(parseInt(e.target.value))}
                className="w-full p-2 bg-slate-50 border border-slate-300 text-xs focus:bg-white focus:outline-hidden"
              />
              <p className="text-[10px] text-slate-400 mt-1">Mitigates abusive usage and API quota overuse.</p>
            </div>

            {/* Retention Window */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Conversation Retention Window (Days)</label>
              <input
                type="number"
                value={retentionDays}
                onChange={(e) => setRetentionDays(parseInt(e.target.value))}
                className="w-full p-2 bg-slate-50 border border-slate-300 text-xs focus:bg-white focus:outline-hidden"
              />
              <p className="text-[10px] text-slate-400 mt-1">Conversations older than this can be purged for privacy.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* WhatsApp Handoff Number */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">WhatsApp Handoff Target</label>
              <input
                type="text"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-300 text-xs focus:bg-white focus:outline-hidden font-mono"
              />
            </div>

            {/* Direct Telephone Desk */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Front Desk Phone Number</label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-300 text-xs focus:bg-white focus:outline-hidden font-mono"
              />
            </div>
          </div>

          {/* System Prompt */}
          <div className="text-xs">
            <label className="block font-bold text-slate-700 mb-1">Base AI System Instruction (Persona & Boundaries)</label>
            <textarea
              rows={4}
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 text-xs font-mono focus:bg-white focus:outline-hidden"
            />
          </div>

          {/* Emergency Alert Text */}
          <div className="text-xs">
            <label className="block font-bold text-slate-700 mb-1">Fixed Emergency Alert Response (Rescue 1122)</label>
            <textarea
              rows={3}
              value={emergencyAlertText}
              onChange={(e) => setEmergencyAlertText(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 text-xs font-mono focus:bg-white focus:outline-hidden"
            />
          </div>

          {/* Patient Consent Text */}
          <div className="text-xs">
            <label className="block font-bold text-slate-700 mb-1">Patient Consent & Disclaimer Notice</label>
            <textarea
              rows={2}
              value={consentText}
              onChange={(e) => setConsentText(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 text-xs focus:bg-white focus:outline-hidden"
            />
          </div>

          {/* Actions Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={handlePurge}
              className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Purge Logs Older than {retentionDays} Days</span>
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 bg-[#2097A2] hover:bg-[#1B808A] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save AI Configuration</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
