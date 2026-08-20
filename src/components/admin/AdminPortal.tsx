import React, { useState } from 'react';
import { useCMS } from '../../context/CMSContext';
import { FactsVerificationModule } from './FactsVerificationModule';
import { ServicesModule } from './ServicesModule';
import { DoctorProfileModule } from './DoctorProfileModule';
import { FeesModule } from './FeesModule';
import { AppointmentsModule } from './AppointmentsModule';
import { ContentModules } from './ContentModules';
import { PagesModule } from './PagesModule';
import { UsersModule } from './UsersModule';
import { DatabaseSyncModule } from './DatabaseSyncModule';
import { AiKnowledgeModule } from './AiKnowledgeModule';
import { AiConversationsModule } from './AiConversationsModule';
import {
  ShieldAlert,
  CalendarCheck,
  Stethoscope,
  UserCheck,
  DollarSign,
  FileText,
  Globe,
  Users,
  Database,
  Brain,
  MessageSquare,
  LogOut,
  ExternalLink,
  Bell,
  CheckCircle,
  Menu,
  X,
  AlertTriangle
} from 'lucide-react';

interface AdminPortalProps {
  onBackToPublicSite: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ onBackToPublicSite }) => {
  const { currentUser, currentRole, logout, switchRole, factsQueue, appointments, notification, clearNotification } = useCMS();
  const [activeTab, setActiveTab] = useState<string>('facts');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const pendingFactsCount = factsQueue.filter(f => f.status === 'pending_verification' || f.status === 'needs_doctor_approval').length;
  const pendingAppointmentsCount = appointments.filter(a => a.status === 'pending').length;

  // Role permissions check
  const isAuthorized = (tabId: string): boolean => {
    if (!currentRole) return false;
    if (currentRole === 'super_admin' || currentRole === 'admin') return true;

    if (currentRole === 'receptionist') {
      return ['appointments', 'fees', 'content', 'facts', 'ai_conversations', 'ai_knowledge'].includes(tabId);
    }

    if (currentRole === 'editor') {
      return ['services', 'doctor', 'content', 'pages', 'facts', 'ai_knowledge'].includes(tabId);
    }

    return false;
  };

  const navItems = [
    { id: 'facts', label: 'Facts Verification', icon: ShieldAlert, badge: pendingFactsCount > 0 ? pendingFactsCount : undefined, badgeColor: 'bg-amber-500 text-white' },
    { id: 'appointments', label: 'Appointments & Intake', icon: CalendarCheck, badge: pendingAppointmentsCount > 0 ? pendingAppointmentsCount : undefined, badgeColor: 'bg-[#2097A2] text-white' },
    { id: 'ai_knowledge', label: 'AI Receptionist Knowledge', icon: Brain },
    { id: 'ai_conversations', label: 'AI Chats & Safety Logs', icon: MessageSquare },
    { id: 'services', label: 'Clinical Services', icon: Stethoscope },
    { id: 'doctor', label: 'Doctor Profile & Credentials', icon: UserCheck },
    { id: 'fees', label: 'Fees & Schedules', icon: DollarSign },
    { id: 'content', label: 'Content (FAQs, Blog, Reviews)', icon: FileText },
    { id: 'pages', label: 'Pages & SEO Meta', icon: Globe },
    { id: 'users', label: 'Staff & Roles (RBAC)', icon: Users },
    { id: 'database', label: 'MySQL Database Sync', icon: Database },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-['Montserrat',sans-serif]">
      {/* Toast Notification Banner */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg border flex items-center gap-2 text-sm font-medium transition-all ${
            notification.type === 'success'
              ? 'bg-emerald-600 text-white border-emerald-500'
              : notification.type === 'error'
              ? 'bg-rose-600 text-white border-rose-500'
              : 'bg-slate-900 text-white border-slate-800'
          }`}
        >
          <CheckCircle className="w-4 h-4" />
          <span>{notification.message}</span>
          <button onClick={clearNotification} className="ml-2 opacity-70 hover:opacity-100">✕</button>
        </div>
      )}

      {/* Top Admin Navbar */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="md:hidden text-slate-300 hover:text-white p-1"
          >
            {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#2097A2] flex items-center justify-center font-bold text-white text-sm">
              DF
            </div>
            <div>
              <div className="text-sm font-bold tracking-tight">Dr. Farhan Mustafa — Admin CMS</div>
              <div className="text-[10px] text-slate-400">Internal Medicine Practice Portal • Faisal Town, Lahore</div>
            </div>
          </div>
        </div>

        {/* User Status, Role Selector & Action Buttons */}
        <div className="flex items-center gap-3">
          {/* Active Role Indicator */}
          <div className="hidden sm:flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-slate-400">Role:</span>
            <span className="font-bold text-slate-100 uppercase">
              {currentRole?.replace('_', ' ') || 'Guest'}
            </span>
          </div>

          <button
            onClick={onBackToPublicSite}
            className="px-3 py-1.5 bg-[#2097A2]/20 hover:bg-[#2097A2] text-[#A4E0E5] hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition border border-[#2097A2]/40"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Public Website</span>
          </button>
        </div>
      </header>

      {/* Main CMS Layout with Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation */}
        <aside
          className={`fixed md:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 ease-in-out md:translate-x-0 flex flex-col justify-between ${
            isSidebarOpen ? 'translate-x-0 top-14' : '-translate-x-full md:translate-x-0'
          }`}
        >
          <div className="p-4 space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-2">
              CMS Modules
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const allowed = isAuthorized(item.id);
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  disabled={!allowed}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? 'bg-[#2097A2] text-white shadow-sm'
                      : allowed
                      ? 'text-slate-700 hover:bg-slate-100'
                      : 'text-slate-300 cursor-not-allowed opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* User profile & Quick role switcher */}
          <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-3">
            <div className="text-xs">
              <div className="font-bold text-slate-900 truncate">{currentUser?.name || 'Staff User'}</div>
              <div className="text-[11px] text-slate-500 font-mono truncate">{currentUser?.email}</div>
            </div>

            <div className="space-y-1">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Switch Role Simulator:</div>
              <div className="grid grid-cols-2 gap-1">
                {(['super_admin', 'admin', 'receptionist', 'editor'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => switchRole(r)}
                    className={`text-[10px] py-1 px-1.5 rounded font-bold transition capitalize truncate border ${
                      currentRole === r
                        ? 'bg-[#2097A2] text-white border-[#2097A2]'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {r === 'super_admin' ? 'Super' : r === 'admin' ? 'Admin' : r === 'receptionist' ? 'Recept' : 'Editor'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto max-w-7xl">
          {activeTab === 'facts' && <FactsVerificationModule />}
          {activeTab === 'appointments' && <AppointmentsModule />}
          {activeTab === 'ai_knowledge' && <AiKnowledgeModule />}
          {activeTab === 'ai_conversations' && <AiConversationsModule />}
          {activeTab === 'services' && <ServicesModule />}
          {activeTab === 'doctor' && <DoctorProfileModule />}
          {activeTab === 'fees' && <FeesModule />}
          {activeTab === 'content' && <ContentModules />}
          {activeTab === 'pages' && <PagesModule />}
          {activeTab === 'users' && <UsersModule />}
          {activeTab === 'database' && <DatabaseSyncModule />}
        </main>
      </div>
    </div>
  );
};
