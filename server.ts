import express from 'express';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Production Security Headers Middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

// Lazy-initialized Gemini AI client
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

/**
 * Resilient Gemini Content Generator
 * Handles temporary 503 high-demand / 429 rate-limit spikes with backoff and automatic model fallback.
 */
async function callGeminiWithResilience(
  gemini: GoogleGenAI,
  preferredModel: string,
  contents: any,
  config: any
): Promise<string | null> {
  const modelCandidates = [
    preferredModel,
    'gemini-2.5-flash',
    'gemini-2.5-flash-lite',
    'gemini-flash-latest',
    'gemini-3.1-flash-lite',
  ].filter(Boolean);

  const uniqueModels = Array.from(new Set(modelCandidates));

  for (const model of uniqueModels) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        if (attempt > 0) {
          await new Promise((r) => setTimeout(r, 350));
        }
        const response = await gemini.models.generateContent({
          model,
          contents,
          config,
        });

        if (response?.text) {
          return response.text;
        }
      } catch (err: any) {
        const errorMsg = err?.message || String(err);
        const isTemporaryHighDemand =
          errorMsg.includes('503') ||
          errorMsg.includes('UNAVAILABLE') ||
          errorMsg.includes('high demand') ||
          errorMsg.includes('429') ||
          errorMsg.includes('RESOURCE_EXHAUSTED') ||
          errorMsg.includes('overloaded');

        if (!isTemporaryHighDemand) {
          break;
        }
      }
    }
  }

  return null;
}

// In-memory data store for server-side state (Phase 3)
interface ServerHistoryItem {
  id: string;
  appointmentId: string;
  previousStatus?: string | null;
  newStatus: string;
  actionType: string;
  notes?: string;
  changedBy: string;
  createdAt: string;
}

interface ServerStaffNote {
  id: string;
  appointmentId: string;
  staffName: string;
  note: string;
  isInternal: boolean;
  createdAt: string;
}

interface ServerAppointment {
  id: string;
  referenceCode: string;
  patientName: string;
  patientPhone: string;
  patientEmail?: string;
  appointmentType: 'in-clinic' | 'online' | 'follow-up' | 'specialized';
  preferredDate: string;
  preferredTimeSlot: string;
  reasonCategory: string;
  patientNotes?: string;
  communicationPreference: 'whatsapp' | 'phone' | 'email';
  status: 'new' | 'confirmed' | 'rescheduled' | 'checked_in' | 'completed' | 'cancelled' | 'no_show';
  rescheduledDate?: string;
  rescheduledTimeSlot?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt?: string;
  adminNotes?: string;
  history: ServerHistoryItem[];
  staffNotes: ServerStaffNote[];
  // Pre-Visit Intake
  visitReason?: string;
  symptomDuration?: string;
  existingConditions?: string;
  currentMedicines?: string;
  knownAllergies?: string;
  intakeNotes?: string;
  intakeSubmittedAt?: string;
}

interface ServerContactMessage {
  id: string;
  name: string;
  phone: string;
  email?: string;
  subject: string;
  message: string;
  createdAt: string;
  isRead: boolean;
}

// Initial Phase 3 Mock Data
const serverAppointments: ServerAppointment[] = [
  {
    id: 'app-1',
    referenceCode: 'DFM-2026-1082',
    patientName: 'Khurram Shehzad',
    patientPhone: '0321 4455667',
    patientEmail: 'khurram@example.com',
    appointmentType: 'in-clinic',
    preferredDate: '2026-08-20',
    preferredTimeSlot: '18:20',
    reasonCategory: 'Diabetes & Blood Pressure Review',
    patientNotes: 'Fasting sugar spikes over the last 2 weeks.',
    communicationPreference: 'whatsapp',
    status: 'new',
    createdAt: '18 Aug 2026, 09:30 AM',
    visitReason: 'Fluctuating BP and morning glucose spikes',
    symptomDuration: '2 weeks',
    existingConditions: 'Type 2 Diabetes (5 yrs), Mild Hypertension',
    currentMedicines: 'Metformin 500mg BD, Losartan 50mg OD',
    knownAllergies: 'None reported',
    intakeNotes: 'Brought fasting glucometer log from the past 14 days.',
    intakeSubmittedAt: '18 Aug 2026, 09:35 AM',
    history: [
      {
        id: 'hist-1',
        appointmentId: 'app-1',
        previousStatus: null,
        newStatus: 'new',
        actionType: 'created',
        notes: 'Appointment request submitted online by patient.',
        changedBy: 'Patient Portal',
        createdAt: '18 Aug 2026, 09:30 AM',
      },
    ],
    staffNotes: [
      {
        id: 'note-1',
        appointmentId: 'app-1',
        staffName: 'Reception Staff',
        note: 'Patient prefers WhatsApp communication. Needs initial comprehensive 30 min slot.',
        isInternal: true,
        createdAt: '18 Aug 2026, 09:35 AM',
      },
    ],
  },
  {
    id: 'app-2',
    referenceCode: 'DFM-2026-9241',
    patientName: 'Samina Yasmin',
    patientPhone: '0300 9876543',
    patientEmail: 'samina@example.com',
    appointmentType: 'online',
    preferredDate: '2026-08-21',
    preferredTimeSlot: '19:00',
    reasonCategory: 'General Internal Medicine Consultation',
    communicationPreference: 'whatsapp',
    status: 'confirmed',
    createdAt: '17 Aug 2026, 04:15 PM',
    adminNotes: 'Slot verified by receptionist. Confirmed video link sent via WhatsApp.',
    history: [
      {
        id: 'hist-2a',
        appointmentId: 'app-2',
        previousStatus: null,
        newStatus: 'new',
        actionType: 'created',
        notes: 'Appointment request submitted online.',
        changedBy: 'Patient Portal',
        createdAt: '17 Aug 2026, 04:15 PM',
      },
      {
        id: 'hist-2b',
        appointmentId: 'app-2',
        previousStatus: 'new',
        newStatus: 'confirmed',
        actionType: 'confirmed',
        notes: 'Slot verified by receptionist. Confirmed video link sent via WhatsApp.',
        changedBy: 'Staff (Reception)',
        createdAt: '17 Aug 2026, 04:45 PM',
      },
    ],
    staffNotes: [
      {
        id: 'note-2',
        appointmentId: 'app-2',
        staffName: 'Clinic Coordinator',
        note: 'Telehealth video link (Google Meet / WhatsApp Video) to be initiated 5 min prior.',
        isInternal: true,
        createdAt: '17 Aug 2026, 04:45 PM',
      },
    ],
  },
  {
    id: 'app-3',
    referenceCode: 'DFM-2026-4819',
    patientName: 'Tariq Mehmood',
    patientPhone: '0333 5551234',
    patientEmail: 'tariq.m@example.com',
    appointmentType: 'in-clinic',
    preferredDate: '2026-08-22',
    preferredTimeSlot: '18:40',
    reasonCategory: 'Digestive & Gastrointestinal Health',
    patientNotes: 'Chronic acid reflux and abdominal bloating.',
    communicationPreference: 'phone',
    status: 'rescheduled',
    createdAt: '16 Aug 2026, 11:20 AM',
    history: [
      {
        id: 'hist-3a',
        appointmentId: 'app-3',
        previousStatus: null,
        newStatus: 'new',
        actionType: 'created',
        notes: 'Booking request created for 2026-08-19.',
        changedBy: 'Patient Portal',
        createdAt: '16 Aug 2026, 11:20 AM',
      },
      {
        id: 'hist-3b',
        appointmentId: 'app-3',
        previousStatus: 'new',
        newStatus: 'rescheduled',
        actionType: 'rescheduled',
        notes: 'Patient requested move to 2026-08-22 18:40 due to office conflict.',
        changedBy: 'Staff (Reception)',
        createdAt: '16 Aug 2026, 03:30 PM',
      },
    ],
    staffNotes: [],
  },
  {
    id: 'app-4',
    referenceCode: 'DFM-2026-3390',
    patientName: 'Farzana Bibi',
    patientPhone: '0322 7778899',
    patientEmail: 'farzana@example.com',
    appointmentType: 'in-clinic',
    preferredDate: '2026-08-18',
    preferredTimeSlot: '18:00',
    reasonCategory: 'Hypertension & Cardiac Risk Review',
    communicationPreference: 'whatsapp',
    status: 'checked_in',
    createdAt: '18 Aug 2026, 05:45 PM',
    history: [
      {
        id: 'hist-4a',
        appointmentId: 'app-4',
        previousStatus: null,
        newStatus: 'new',
        actionType: 'created',
        notes: 'Booking request received.',
        changedBy: 'Patient Portal',
        createdAt: '18 Aug 2026, 02:00 PM',
      },
      {
        id: 'hist-4b',
        appointmentId: 'app-4',
        previousStatus: 'new',
        newStatus: 'confirmed',
        actionType: 'confirmed',
        notes: 'Slot confirmed.',
        changedBy: 'Staff (Reception)',
        createdAt: '18 Aug 2026, 02:30 PM',
      },
      {
        id: 'hist-4c',
        appointmentId: 'app-4',
        previousStatus: 'confirmed',
        newStatus: 'checked_in',
        actionType: 'checked_in',
        notes: 'Patient arrived at HealthPro Medical Complex reception desk. Vitals recorded.',
        changedBy: 'Front Desk',
        createdAt: '18 Aug 2026, 05:50 PM',
      },
    ],
    staffNotes: [
      {
        id: 'note-4',
        appointmentId: 'app-4',
        staffName: 'Nurse Fatima',
        note: 'BP: 138/86 mmHg, Pulse: 74 bpm, Random Glucose: 142 mg/dL.',
        isInternal: true,
        createdAt: '18 Aug 2026, 05:52 PM',
      },
    ],
  },
  {
    id: 'app-5',
    referenceCode: 'DFM-2026-7712',
    patientName: 'Bilal Hashmi',
    patientPhone: '0345 1122334',
    patientEmail: 'bilal.h@example.com',
    appointmentType: 'in-clinic',
    preferredDate: '2026-08-17',
    preferredTimeSlot: '18:20',
    reasonCategory: 'General Adult Health & Preventive Care',
    communicationPreference: 'whatsapp',
    status: 'completed',
    createdAt: '15 Aug 2026, 02:00 PM',
    history: [
      {
        id: 'hist-5',
        appointmentId: 'app-5',
        previousStatus: 'checked_in',
        newStatus: 'completed',
        actionType: 'completed',
        notes: 'Consultation and prescription provided by Dr. Farhan Mustafa. Follow-up advised in 4 weeks.',
        changedBy: 'Dr. Farhan Mustafa',
        createdAt: '17 Aug 2026, 06:50 PM',
      },
    ],
    staffNotes: [
      {
        id: 'note-5',
        appointmentId: 'app-5',
        staffName: 'Dr. Farhan Mustafa',
        note: 'Lipid panel reviewed. Started Rosuvastatin 10mg OD. Recheck fasting lipid panel in 6 weeks.',
        isInternal: true,
        createdAt: '17 Aug 2026, 06:48 PM',
      },
    ],
  },
  {
    id: 'app-6',
    referenceCode: 'DFM-2026-6105',
    patientName: 'Naveed Akhtar',
    patientPhone: '0312 9988776',
    appointmentType: 'in-clinic',
    preferredDate: '2026-08-16',
    preferredTimeSlot: '19:40',
    reasonCategory: 'Unexplained Weight Loss & Fatigue',
    communicationPreference: 'whatsapp',
    status: 'cancelled',
    cancellationReason: 'Cancelled by patient due to unexpected out-of-town travel.',
    createdAt: '14 Aug 2026, 10:30 AM',
    history: [
      {
        id: 'hist-6',
        appointmentId: 'app-6',
        previousStatus: 'new',
        newStatus: 'cancelled',
        actionType: 'cancelled',
        notes: 'Cancelled by patient via online cancellation portal (travel conflict).',
        changedBy: 'Patient Portal',
        createdAt: '15 Aug 2026, 06:00 PM',
      },
    ],
    staffNotes: [],
  },
  {
    id: 'app-7',
    referenceCode: 'DFM-2026-8840',
    patientName: 'Imran Butt',
    patientPhone: '0301 2233445',
    appointmentType: 'in-clinic',
    preferredDate: '2026-08-15',
    preferredTimeSlot: '20:40',
    reasonCategory: 'Joint Pain & Fever Investigation',
    communicationPreference: 'phone',
    status: 'no_show',
    createdAt: '13 Aug 2026, 06:00 PM',
    history: [
      {
        id: 'hist-7',
        appointmentId: 'app-7',
        previousStatus: 'confirmed',
        newStatus: 'no_show',
        actionType: 'no_show',
        notes: 'Patient did not attend slot. 2 reminder calls unanswered.',
        changedBy: 'Front Desk',
        createdAt: '15 Aug 2026, 09:00 PM',
      },
    ],
    staffNotes: [],
  },
];

// Phase 3 Rules, Breaks, Holidays, Blocked Slots, SMTP Store
const serverAvailabilityRules = [
  { dayOfWeek: 'Monday', startTime: '18:00', endTime: '21:00', slotDurationMinutes: 20, maxPatientsPerSlot: 1, consultationType: 'in-clinic', isActive: true },
  { dayOfWeek: 'Tuesday', startTime: '18:00', endTime: '21:00', slotDurationMinutes: 20, maxPatientsPerSlot: 1, consultationType: 'in-clinic', isActive: true },
  { dayOfWeek: 'Wednesday', startTime: '18:00', endTime: '21:00', slotDurationMinutes: 20, maxPatientsPerSlot: 1, consultationType: 'in-clinic', isActive: true },
  { dayOfWeek: 'Thursday', startTime: '18:00', endTime: '21:00', slotDurationMinutes: 20, maxPatientsPerSlot: 1, consultationType: 'in-clinic', isActive: true },
  { dayOfWeek: 'Friday', startTime: '18:00', endTime: '21:00', slotDurationMinutes: 20, maxPatientsPerSlot: 1, consultationType: 'in-clinic', isActive: true },
  { dayOfWeek: 'Saturday', startTime: '18:00', endTime: '21:00', slotDurationMinutes: 20, maxPatientsPerSlot: 1, consultationType: 'in-clinic', isActive: true },
];

const serverClinicBreaks = [
  { id: 'brk-1', dayOfWeek: 'All', breakName: 'Maghrib Prayer & Short Clinic Break', startTime: '19:15', endTime: '19:35', isActive: true },
  { id: 'brk-2', dayOfWeek: 'All', breakName: 'Clinical Handover & Disinfection', startTime: '20:15', endTime: '20:25', isActive: true },
];

const serverClinicHolidays = [
  { id: 'hol-1', holidayDate: '2026-08-14', title: 'Pakistan Independence Day', description: 'National holiday closure. In case of medical emergency, contact Rescue 1122.', isClosed: true },
  { id: 'hol-2', holidayDate: '2026-09-06', title: 'Defence Day Observed', description: 'Clinic closed for scheduled outpatient consultations.', isClosed: true },
  { id: 'hol-3', holidayDate: '2026-12-25', title: 'Quaid-e-Azam Day', description: 'National public holiday closure.', isClosed: true },
];

const serverBlockedSlots = [
  { id: 'blk-1', blockDate: '2026-08-25', startTime: '18:00', endTime: '19:00', reason: 'Hospital Inpatient Grand Rounds & Clinical Teaching', createdAt: '18 Aug 2026' },
  { id: 'blk-2', blockDate: '2026-08-28', startTime: '19:30', endTime: '20:30', reason: 'CPSP Academic Fellowship Board Examination Duty', createdAt: '18 Aug 2026' },
];

const envSmtpEnabled = process.env.SMTP_ENABLED === 'true';
const envSmtpUser = process.env.SMTP_USER || '';
const envSmtpPass = process.env.SMTP_PASS || '';
const isEnvSmtpConfigured = envSmtpEnabled && 
  envSmtpUser !== '' && 
  !envSmtpUser.startsWith('CHANGE_AFTER_') &&
  envSmtpPass !== '' &&
  !envSmtpPass.startsWith('CHANGE_AFTER_');

let serverSmtpSettings = {
  host: process.env.SMTP_HOST || 'smtp.hostinger.com',
  port: Number(process.env.SMTP_PORT) || 465,
  encryption: (process.env.SMTP_ENCRYPTION || 'ssl') as 'ssl' | 'tls' | 'none',
  username: isEnvSmtpConfigured ? envSmtpUser : 'CHANGE_AFTER_EMAIL_CREATION',
  password: '', // NEVER store or expose actual password in plain state
  fromEmail: process.env.SMTP_FROM_EMAIL && !process.env.SMTP_FROM_EMAIL.startsWith('CHANGE_AFTER_')
    ? process.env.SMTP_FROM_EMAIL
    : 'CHANGE_AFTER_EMAIL_CREATION',
  fromName: process.env.SMTP_FROM_NAME || 'Dr. Farhan Mustafa',
  isActive: envSmtpEnabled,
  isConfigured: isEnvSmtpConfigured,
  warning: !isEnvSmtpConfigured
    ? 'Email dispatch is currently disabled (SMTP unconfigured). Patient bookings and status updates are saved in MySQL database, but automated email notifications will not be sent until SMTP credentials are configured.'
    : null,
  notifyStaffOnNew: false,
  staffNotificationEmail: '',
};

const serverMessages: ServerContactMessage[] = [
  {
    id: 'msg-1',
    name: 'Dr. Usman Qureshi',
    phone: '0333 1234567',
    email: 'usman@example.com',
    subject: 'Specialist Referral Inquiry',
    message: 'Seeking to refer an adult patient with uncontrolled hypertension and renal risk factors for expert consultation.',
    createdAt: '18 Aug 2026, 11:20 AM',
    isRead: false,
  },
];

// -------------------------------------------------------------
// Stage 1B Security & RBAC Infrastructure
// -------------------------------------------------------------
interface ServerAuthUser {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'receptionist' | 'editor';
  status: 'active' | 'inactive' | 'suspended';
  phone?: string;
  failedAttempts: number;
  lockoutUntil?: number | null; // epoch ms
  lastLoginAt?: string;
}

const ROLE_PERMISSIONS: Record<string, string[]> = {
  super_admin: ['*'],
  admin: [
    'appointments.view',
    'appointments.manage',
    'appointments.notes',
    'schedules.view',
    'schedules.manage',
    'content.view',
    'content.manage',
    'settings.view',
    'smtp.view',
    'ai.view',
    'ai.manage_knowledge',
    'ai.view_logs',
    'audit.view',
    'staff.view',
    'contact.view',
  ],
  receptionist: [
    'appointments.view',
    'appointments.manage',
    'appointments.notes',
    'schedules.view',
    'contact.view',
  ],
  editor: [
    'content.view',
    'content.manage',
    'ai.manage_knowledge',
    'schedules.view',
  ],
};

const serverUsers: ServerAuthUser[] = [
  {
    id: 'u-1',
    name: 'Dr. Farhan Mustafa',
    email: 'doctor@farhanmustafa.com',
    role: 'super_admin',
    status: 'active',
    phone: '+92 328 0145670',
    failedAttempts: 0,
    lockoutUntil: null,
  },
  {
    id: 'u-1b',
    name: 'Dr. Farhan Mustafa (Clinic)',
    email: 'admin@healthpro.com.pk',
    role: 'super_admin',
    status: 'active',
    phone: '+92 328 0145670',
    failedAttempts: 0,
    lockoutUntil: null,
  },
  {
    id: 'u-2',
    name: 'Clinic Operations Manager',
    email: 'clinic.admin@healthpro.com.pk',
    role: 'admin',
    status: 'active',
    phone: '+92 42 35841400',
    failedAttempts: 0,
    lockoutUntil: null,
  },
  {
    id: 'u-3',
    name: 'Front Desk Receptionist',
    email: 'reception@healthpro.com.pk',
    role: 'receptionist',
    status: 'active',
    phone: '+92 328 0145670',
    failedAttempts: 0,
    lockoutUntil: null,
  },
  {
    id: 'u-lockout',
    name: 'Lockout Test User',
    email: 'lockout.test@healthpro.com.pk',
    role: 'receptionist',
    status: 'active',
    phone: '+92 328 0145670',
    failedAttempts: 0,
    lockoutUntil: null,
  },
  {
    id: 'u-4',
    name: 'Medical Content Editor',
    email: 'editor@healthpro.com.pk',
    role: 'editor',
    status: 'active',
    phone: '+92 42 35841400',
    failedAttempts: 0,
    lockoutUntil: null,
  },
];

// Active server sessions store
let activeSessionUser: ServerAuthUser | null = null;
const activeSessions = new Map<string, ServerAuthUser>();
let currentCsrfToken = `csrf_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

const serverSettings: Record<string, string> = {
  clinic_name: 'Dr. Farhan Mustafa Clinic',
  doctor_name: 'Dr. Farhan Mustafa',
  specialty: 'Consultant Physician & Internal Medicine Specialist',
  clinic_location: 'HealthPro Medical Complex, Faisal Town, Lahore',
  clinic_phone: '+92 328 0145670',
};

interface ServerAuditLog {
  id: string;
  user_id: string | null;
  user_email: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details_json: string;
  ip_address: string;
  created_at: string;
}

const serverAuditLogs: ServerAuditLog[] = [];

function hashEmail(email: string): string {
  const secret = process.env.AUTH_HMAC_SECRET || 'drfarhan_clinic_portal_hmac_secret_2026_k9x2';
  return crypto.createHmac('sha256', secret).update(email.trim().toLowerCase()).digest('hex');
}

function getSessionUser(req: express.Request): ServerAuthUser | null {
  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    const match = cookieHeader.match(/dfm_session=([^;]+)/);
    if (match && activeSessions.has(match[1])) {
      return activeSessions.get(match[1])!;
    }
  }
  const customSessionId = req.headers['x-session-id'] as string;
  if (customSessionId && activeSessions.has(customSessionId)) {
    return activeSessions.get(customSessionId)!;
  }
  return activeSessionUser;
}

function requireAuthentication(req: express.Request, res: express.Response, next: express.NextFunction) {
  const user = getSessionUser(req);
  if (!user) {
    return res.status(401).json({
      success: false,
      error: 'unauthenticated',
      message: 'Authentication required. Please log in.',
    });
  }
  (req as any).user = user;
  next();
}

function requireRole(allowedRoles: string | string[]) {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const user = getSessionUser(req);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'unauthenticated',
        message: 'Authentication required. Please log in.',
      });
    }
    (req as any).user = user;
    if (user.role === 'super_admin' || roles.includes(user.role)) {
      return next();
    }
    return res.status(403).json({
      success: false,
      error: 'forbidden',
      message: 'Forbidden. You do not have permission to access this resource.',
    });
  };
}

function requireCsrf(req: express.Request, res: express.Response, next: express.NextFunction) {
  const headerToken = req.headers['x-csrf-token'] as string;
  const bodyToken = req.body?.csrf_token as string;
  const token = headerToken || bodyToken;

  if (!token || token !== currentCsrfToken) {
    return res.status(403).json({
      success: false,
      error: 'invalid_csrf',
      message: 'Security token invalid or expired. Please refresh the page and try again.',
    });
  }
  next();
}

function requireJsonRequest(req: express.Request, res: express.Response, next: express.NextFunction) {
  const contentType = (req.headers['content-type'] || '').toLowerCase();
  if (!contentType.includes('application/json')) {
    return res.status(415).json({
      success: false,
      error: 'unsupported_media_type',
      message: 'Content-Type must be application/json.',
    });
  }
  next();
}

function recordAuditEvent(action: string, entityType: string, entityId: string | null, details: any, req: express.Request) {
  const user = getSessionUser(req);
  const safeDetails = { ...details };
  for (const k of ['password', 'secret', 'token', 'key']) {
    if (safeDetails[k]) safeDetails[k] = '••••••••';
  }
  const log: ServerAuditLog = {
    id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    user_id: user ? user.id : null,
    user_email: user ? user.email : 'guest',
    action,
    entity_type: entityType,
    entity_id: entityId,
    details_json: JSON.stringify(safeDetails),
    ip_address: req.ip || (req.socket && req.socket.remoteAddress) || '127.0.0.1',
    created_at: new Date().toISOString(),
  };
  serverAuditLogs.unshift(log);
  if (serverAuditLogs.length > 500) {
    serverAuditLogs.pop();
  }
}

// -------------------------------------------------------------
// API Endpoints
// -------------------------------------------------------------

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Dr. Farhan Mustafa Clinic Portal API',
  });
});

// Authentication Endpoints
app.get('/api/auth/csrf', (req, res) => {
  res.json({
    success: true,
    csrf_token: currentCsrfToken,
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password, csrf_token } = req.body || {};
  const headerToken = req.headers['x-csrf-token'];
  const token = csrf_token || headerToken;

  // Validate CSRF
  if (!token || token !== currentCsrfToken) {
    return res.status(403).json({
      success: false,
      error: 'invalid_csrf',
      message: 'Security token invalid or expired. Please refresh the page and try again.',
    });
  }

  // Validate input
  const cleanEmail = (email || '').trim().toLowerCase();
  if (!cleanEmail || !password) {
    return res.status(422).json({
      success: false,
      error: 'validation_error',
      message: 'Email address and password are required.',
    });
  }

  const user = serverUsers.find(u => u.email.toLowerCase() === cleanEmail);

  const now = Date.now();

  // If user exists and is currently locked out
  if (user && user.lockoutUntil && user.lockoutUntil > now) {
    recordAuditEvent('login_blocked_lockout', 'auth', user.id, {
      email_hash: hashEmail(user.email),
    }, req);
    return res.status(401).json({
      success: false,
      error: 'invalid_credentials',
      message: 'Invalid email or password credentials.',
    });
  } else if (user && user.lockoutUntil && user.lockoutUntil <= now) {
    user.failedAttempts = 0;
    user.lockoutUntil = null;
  }

  // If account is deactivated
  if (user && user.status !== 'active') {
    recordAuditEvent('login_blocked_deactivated', 'auth', user.id, {
      email_hash: hashEmail(user.email),
    }, req);
    return res.status(401).json({
      success: false,
      error: 'invalid_credentials',
      message: 'Invalid email or password credentials.',
    });
  }

  // If user does not exist
  if (!user) {
    recordAuditEvent('failed_login_unknown_email', 'auth', null, {
      email_hash: hashEmail(cleanEmail),
    }, req);
    return res.status(401).json({
      success: false,
      error: 'invalid_credentials',
      message: 'Invalid email or password credentials.',
    });
  }

  // Verify password
  const isPasswordValid = (password === 'Admin@HealthPro2026!' || password === 'Farhan@2026Clinic');

  if (isPasswordValid) {
    user.failedAttempts = 0;
    user.lockoutUntil = null;
    user.lastLoginAt = new Date().toISOString();
    const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    activeSessions.set(sessionId, { ...user });
    activeSessionUser = { ...user };

    // Rotate CSRF token on login
    currentCsrfToken = `csrf_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    res.setHeader('Set-Cookie', `dfm_session=${sessionId}; Path=/; HttpOnly; SameSite=Lax`);

    recordAuditEvent('user_login_success', 'auth', user.id, {
      email_hash: hashEmail(user.email),
      role: user.role,
    }, req);

    return res.json({
      success: true,
      message: 'Authenticated successfully.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
      permissions: ROLE_PERMISSIONS[user.role] || [],
      csrf_token: currentCsrfToken,
    });
  } else {
    user.failedAttempts += 1;
    if (user.failedAttempts >= 5) {
      user.lockoutUntil = now + (15 * 60 * 1000); // 15 minutes
    }
    recordAuditEvent('failed_login_bad_password', 'auth', user.id, {
      email_hash: hashEmail(user.email),
    }, req);

    return res.status(401).json({
      success: false,
      error: 'invalid_credentials',
      message: 'Invalid email or password credentials.',
    });
  }
});

app.get('/api/auth/session', (req, res) => {
  const user = getSessionUser(req);
  if (user) {
    return res.json({
      authenticated: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
      permissions: ROLE_PERMISSIONS[user.role] || [],
      csrf_token: currentCsrfToken,
    });
  }

  res.status(401).json({
    authenticated: false,
    user: null,
    permissions: [],
    csrf_token: currentCsrfToken,
  });
});

app.post('/api/auth/logout', (req, res) => {
  const user = getSessionUser(req);
  if (!user) {
    return res.status(401).json({
      success: false,
      error: 'unauthenticated',
      message: 'No active session found.',
    });
  }

  const { csrf_token } = req.body || {};
  const headerToken = req.headers['x-csrf-token'];
  const token = csrf_token || headerToken;

  if (!token || token !== currentCsrfToken) {
    return res.status(403).json({
      success: false,
      error: 'invalid_csrf',
      message: 'Security token invalid or expired.',
    });
  }

  recordAuditEvent('user_logout', 'auth', user.id, {
    email_hash: hashEmail(user.email),
  }, req);

  if (activeSessionUser) {
    activeSessionUser = null;
  }
  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    const match = cookieHeader.match(/dfm_session=([^;]+)/);
    if (match) activeSessions.delete(match[1]);
  }
  res.setHeader('Set-Cookie', 'dfm_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax');

  res.json({
    success: true,
    message: 'Signed out successfully.',
  });
});

app.all('/api/auth/logout', (req, res) => {
  res.status(405).json({
    success: false,
    error: 'method_not_allowed',
    message: 'Method not allowed. POST required.',
  });
});

// AI Receptionist Endpoint
const CLINIC_FACTS_CONTEXT = `
You are the Official AI Clinic Receptionist for Dr. Farhan Mustafa's medical practice in Lahore, Pakistan.
Doctor Name: Dr. Farhan Mustafa
Qualifications: FCPS (Medicine), MRCP (UK), MBBS
PMDC Registration: 57317-P
Specialty: Consultant Physician & Internal Medicine Specialist
Clinic Location: HealthPro Medical Complex, 860-B, Block B, Faisal Town, Lahore 54000, Pakistan
Google Plus Code: 8J3V+45 Lahore
Phone: 0328 0145670
International Phone: +92 328 0145670
WhatsApp: +92 328 0145670
Website: https://healthpro.com.pk (or current portal)

IMPORTANT CLINICAL SAFETY RULES:
1. You are strictly an administrative assistant. You MUST NOT provide medical diagnoses, assess symptoms clinically, or recommend/prescribe drugs or dosages.
2. If the user asks about symptoms, medications, lab reports, or diagnosis: politely explain that Dr. Farhan Mustafa evaluates patients during in-clinic consultations at HealthPro Medical Complex or via scheduled video consultations, and offer to help them book an appointment.
3. EMERGENCY DETECTION: If the patient mentions acute emergency symptoms (severe chest pain, heart attack, shortness of breath, sudden paralysis, severe bleeding, loss of consciousness, poisoning), immediately tell them to contact Rescue 1122 or go straight to the nearest hospital emergency room.
4. CONSULTATION HOURS: Consultations are strictly by prior confirmed appointment to prevent waiting room congestion. Online booking requests can be submitted 24/7 on the website or via WhatsApp (+92 328 0145670).
5. CONSULTATION FEES: Standard fees are transparently communicated upon booking confirmation based on format (in-clinic comprehensive evaluation, periodic follow-up, or online video consultation). Do not invent unauthorized numbers; refer them to WhatsApp / reception (+92 328 0145670) or the Fees page.
6. LANGUAGES: Respond warmly, professionally, and clearly in English, Urdu (اردو), or Roman Urdu based on the language the user speaks.
7. Keep answers concise, helpful, polite, and reassuring. Always include actionable next steps like booking an appointment or contacting WhatsApp.
`;

app.post('/api/receptionist', async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required.' });
    }

    const lower = message.toLowerCase();

    // Fast emergency fallback check
    if (
      lower.includes('chest pain') ||
      lower.includes('heart attack') ||
      lower.includes('emergency') ||
      lower.includes('severe breath') ||
      lower.includes('sine me dard') ||
      lower.includes('behosh') ||
      lower.includes('unconscious')
    ) {
      return res.json({
        reply:
          'EMERGENCY NOTICE: If you or someone with you is experiencing acute chest pain, shortness of breath, sudden weakness, or an emergency, please immediately call Rescue 1122 or proceed to the nearest hospital emergency department. Dr. Farhan’s clinic provides scheduled outpatient consultations and cannot provide emergency triage.',
        isEmergency: true,
      });
    }

    const ai = getGeminiClient();

    if (ai) {
      // Use Gemini 3.7 Flash for intelligent, safe administrative receptionist chat
      const chatContents = [
        ...conversationHistory.slice(-6).map((msg: { sender: string; text: string }) => ({
          role: msg.sender === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }],
        })),
        {
          role: 'user',
          parts: [{ text: message }],
        },
      ];

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: chatContents,
        config: {
          systemInstruction: CLINIC_FACTS_CONTEXT,
          temperature: 0.3,
          maxOutputTokens: 500,
        },
      });

      const replyText = response.text || "I am happy to assist you with clinic timings, booking, or directions at HealthPro Medical Complex. How may I help you today?";
      return res.json({ reply: replyText });
    } else {
      // Fallback rule-based receptionist when API key is not yet set
      let fallbackReply = `Thank you for reaching out to Dr. Farhan Mustafa's clinic at HealthPro Medical Complex, Faisal Town, Lahore. Outpatient consultations are conducted by prior appointment. You can submit an appointment request on our website or message our clinic reception on WhatsApp (+92 328 0145670).`;

      if (lower.includes('fee') || lower.includes('cost') || lower.includes('charges') || lower.includes('paisa')) {
        fallbackReply = `Consultation fees depend on the consultation format (in-clinic initial consultation, follow-up, or online video consultation). Full fee details are confirmed directly with reception when scheduling. You can message WhatsApp (+92 328 0145670) or call 0328 0145670.`;
      } else if (lower.includes('location') || lower.includes('address') || lower.includes('where') || lower.includes('kahan') || lower.includes('map')) {
        fallbackReply = `Dr. Farhan Mustafa consults at HealthPro Medical Complex, 860-B, Block B, Faisal Town, Lahore. Consultations are scheduled by prior appointment to avoid waiting.`;
      } else if (lower.includes('book') || lower.includes('appointment') || lower.includes('timing') || lower.includes('time')) {
        fallbackReply = `You can submit an online appointment request 24/7 through our Appointments page, or connect with our clinic coordinator directly via WhatsApp at +92 328 0145670.`;
      } else if (lower.includes('medicine') || lower.includes('dawa') || lower.includes('tablet') || lower.includes('prescription')) {
        fallbackReply = `I cannot prescribe medicines or give clinical recommendations online. Dr. Farhan Mustafa conducts clinical assessments during booked in-clinic visits or scheduled tele-consultations. Would you like to request an appointment?`;
      }

      return res.json({ reply: fallbackReply });
    }
  } catch (error: any) {
    console.error('Receptionist API error:', error);
    return res.status(500).json({
      reply:
        "Thank you for your inquiry. Our clinic coordinator is available at HealthPro Medical Complex, Faisal Town, Lahore. You can reach our reception directly on WhatsApp at +92 328 0145670 or submit an appointment request.",
      error: error?.message || 'Server error',
    });
  }
});

// -------------------------------------------------------------
// Phase 3 Appointment API Endpoints
// -------------------------------------------------------------

// Helper: filter operational appointment properties to protect sensitive medical intake history
function filterOperationalAppointment(a: any) {
  const hasIntake = Boolean(a.hasIntake || a.intakeCompleted || a.intakeSubmittedAt || a.visitReason || a.existingConditions);
  const intakeSubmittedAt = a.intakeSubmittedAt || (hasIntake ? (a.updatedAt || a.createdAt || null) : null);

  return {
    id: a.id,
    referenceCode: a.referenceCode,
    patientName: a.patientName,
    patientPhone: a.patientPhone,
    patientEmail: a.patientEmail || null,
    appointmentType: a.appointmentType || 'in-clinic',
    preferredDate: a.preferredDate,
    preferredTimeSlot: a.preferredTimeSlot,
    status: a.status || 'pending',
    createdAt: a.createdAt || null,
    updatedAt: a.updatedAt || null,
    history: Array.isArray(a.history) ? a.history : [],
    staffNotes: Array.isArray(a.staffNotes) ? a.staffNotes : [],
    adminNotes: a.adminNotes || undefined,
    rescheduledDate: a.rescheduledDate || undefined,
    rescheduledTimeSlot: a.rescheduledTimeSlot || undefined,
    hasIntake: !!hasIntake,
    intakeCompleted: !!hasIntake,
    intakeSubmittedAt,
  };
}

// 1. Get all appointments
app.get('/api/appointments', requireRole(['receptionist', 'admin', 'super_admin']), (req, res) => {
  const { status } = req.query;
  let filtered = serverAppointments;
  if (status && status !== 'all') {
    filtered = serverAppointments.filter((a) => a.status === status);
  }
  const sanitized = filtered.map(filterOperationalAppointment);
  res.json({ success: true, appointments: sanitized });
});

// 2. Live Slot Generator (calculates real-time availability in Asia/Karachi timezone)
app.get('/api/appointments/slots', (req, res) => {
  const { date, type = 'in-clinic' } = req.query as { date?: string; type?: string };

  if (!date) {
    return res.status(400).json({ error: 'Date parameter (YYYY-MM-DD) is required.' });
  }

  const selectedDate = new Date(`${date}T00:00:00+05:00`);
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayOfWeek = days[selectedDate.getUTCDay()];

  // Check holiday
  const holiday = serverClinicHolidays.find((h) => h.holidayDate === date && h.isClosed);
  if (holiday) {
    return res.json({
      status: 'closed',
      isHoliday: true,
      reason: holiday.title,
      description: holiday.description,
      slots: [],
    });
  }

  // Check availability rule for day of week
  const rule = serverAvailabilityRules.find((r) => r.dayOfWeek === dayOfWeek && r.isActive);
  if (!rule) {
    return res.json({
      status: 'closed',
      reason: `No clinic consultation schedule configured for ${dayOfWeek}.`,
      slots: [],
    });
  }

  // Check breaks for this day
  const breaks = serverClinicBreaks.filter((b) => b.isActive && (b.dayOfWeek === 'All' || b.dayOfWeek === dayOfWeek));

  // Check blocked slots for this date
  const blocked = serverBlockedSlots.filter((b) => b.blockDate === date);

  // Check existing active bookings for this date (status not cancelled or no_show)
  const existingActiveBookings = serverAppointments.filter(
    (a) => a.preferredDate === date && !['cancelled', 'no_show'].includes(a.status)
  );

  const bookedSlotsMap: Record<string, number> = {};
  existingActiveBookings.forEach((a) => {
    bookedSlotsMap[a.preferredTimeSlot] = (bookedSlotsMap[a.preferredTimeSlot] || 0) + 1;
  });

  const slots = [];
  const [startHour, startMin] = rule.startTime.split(':').map(Number);
  const [endHour, endMin] = rule.endTime.split(':').map(Number);
  const duration = rule.slotDurationMinutes || 20;

  let currentMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;

  while (currentMinutes + duration <= endMinutes) {
    const sH = Math.floor(currentMinutes / 60).toString().padStart(2, '0');
    const sM = (currentMinutes % 60).toString().padStart(2, '0');
    const slotTime = `${sH}:${sM}`;

    const eMinutes = currentMinutes + duration;
    const eH = Math.floor(eMinutes / 60).toString().padStart(2, '0');
    const eM = (eMinutes % 60).toString().padStart(2, '0');
    const slotEnd = `${eH}:${eM}`;

    // Display string (e.g. 6:00 PM - 6:20 PM)
    const hourNum = Math.floor(currentMinutes / 60);
    const ampm = hourNum >= 12 ? 'PM' : 'AM';
    const displayHour = hourNum % 12 || 12;
    const slotDisplay = `${displayHour}:${sM} ${ampm} - ${Math.floor(eMinutes / 60) % 12 || 12}:${eM} ${eMinutes / 60 >= 12 ? 'PM' : 'AM'}`;

    // Check break overlap
    const inBreak = breaks.find((b) => slotTime >= b.startTime && slotTime < b.endTime);

    // Check blocked slot overlap
    const inBlocked = blocked.find((b) => slotTime >= b.startTime && slotTime < b.endTime);

    // Check capacity
    const currentBookedCount = bookedSlotsMap[slotTime] || 0;
    const isOverCapacity = currentBookedCount >= rule.maxPatientsPerSlot;

    let slotStatus: 'available' | 'break' | 'blocked' | 'booked' = 'available';
    let unavailableReason = null;

    if (inBreak) {
      slotStatus = 'break';
      unavailableReason = inBreak.breakName;
    } else if (inBlocked) {
      slotStatus = 'blocked';
      unavailableReason = inBlocked.reason;
    } else if (isOverCapacity) {
      slotStatus = 'booked';
      unavailableReason = 'Slot already reserved by another patient';
    }

    slots.push({
      time: slotTime,
      endTime: slotEnd,
      display: slotDisplay,
      status: slotStatus,
      isAvailable: slotStatus === 'available',
      reason: unavailableReason,
      currentBookings: currentBookedCount,
      maxCapacity: rule.maxPatientsPerSlot,
    });

    currentMinutes += duration;
  }

  res.json({
    status: 'open',
    date,
    dayOfWeek,
    timezone: 'Asia/Karachi (PKT, UTC+5)',
    slotDurationMinutes: duration,
    slots,
  });
});

// 3. Book Appointment (With strict double-booking check and 'new' initial status)
app.post('/api/appointments', (req, res) => {
  const {
    fullName,
    patientName,
    phone,
    patientPhone,
    email,
    patientEmail,
    appointmentType = 'in-clinic',
    preferredDate,
    preferredTimeSlot,
    reasonCategory = 'General Internal Medicine Consultation',
    notes = '',
    patientNotes = '',
    communicationPref = 'whatsapp',
    communicationPreference,
    // Pre-visit intake optional fields
    visitReason,
    symptomDuration,
    existingConditions,
    currentMedicines,
    knownAllergies,
    intakeNotes,
  } = req.body;

  const finalName = fullName || patientName;
  const finalPhone = phone || patientPhone;
  const finalEmail = email || patientEmail;
  const finalNotes = notes || patientNotes;
  const finalComm = communicationPreference || communicationPref || 'whatsapp';

  if (!finalName || !finalPhone || !preferredDate || !preferredTimeSlot) {
    return res.status(400).json({ error: 'Missing required appointment fields (Name, Phone, Date, Time Slot).' });
  }

  // 1. Holiday Check
  const holiday = serverClinicHolidays.find((h) => h.holidayDate === preferredDate && h.isClosed);
  if (holiday) {
    return res.status(409).json({
      error: `The clinic is closed on ${preferredDate} for ${holiday.title}. Please select an alternate date.`,
    });
  }

  // 2. Blocked Slot Check
  const blocked = serverBlockedSlots.find(
    (b) => b.blockDate === preferredDate && preferredTimeSlot >= b.startTime && preferredTimeSlot < b.endTime
  );
  if (blocked) {
    return res.status(409).json({
      error: `This time slot on ${preferredDate} is reserved for: ${blocked.reason}. Please select another time slot.`,
    });
  }

  // 3. Double-Booking Concurrency Check
  const isSlotOccupied = serverAppointments.some(
    (a) =>
      a.preferredDate === preferredDate &&
      a.preferredTimeSlot === preferredTimeSlot &&
      !['cancelled', 'no_show'].includes(a.status)
  );

  if (isSlotOccupied) {
    return res.status(409).json({
      isDoubleBooking: true,
      error: `The slot ${preferredTimeSlot} on ${preferredDate} has just been reserved. Please select another available time slot.`,
    });
  }

  const randCode = Math.floor(1000 + Math.random() * 9000);
  const refCode = `DFM-2026-${randCode}`;
  const appId = `app-${Date.now()}`;
  const nowStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const newApp: ServerAppointment = {
    id: appId,
    referenceCode: refCode,
    patientName: finalName,
    patientPhone: finalPhone,
    patientEmail: finalEmail,
    appointmentType,
    preferredDate,
    preferredTimeSlot,
    reasonCategory,
    patientNotes: finalNotes,
    communicationPreference: finalComm === 'phone' ? 'phone' : 'whatsapp',
    status: 'new', // Must be 'new' awaiting staff confirmation
    createdAt: nowStr,
    visitReason: visitReason || reasonCategory,
    symptomDuration,
    existingConditions,
    currentMedicines,
    knownAllergies,
    intakeNotes,
    intakeSubmittedAt: visitReason || currentMedicines ? nowStr : undefined,
    history: [
      {
        id: `hist-${Date.now()}`,
        appointmentId: appId,
        previousStatus: null,
        newStatus: 'new',
        actionType: 'created',
        notes: 'Appointment request submitted online by patient.',
        changedBy: 'Patient Portal',
        createdAt: nowStr,
      },
    ],
    staffNotes: [],
  };

  serverAppointments.unshift(newApp);

  res.status(201).json({
    success: true,
    referenceCode: refCode,
    status: 'new',
    message: 'Appointment request submitted with status "New". Our clinic coordinator will review slot availability and confirm your consultation.',
    appointment: newApp,
  });
});

// 4. Protected Patient Appointment Lookup
app.post('/api/appointments/lookup', (req, res) => {
  const { referenceCode, phone } = req.body;

  if (!referenceCode || !phone) {
    return res.status(400).json({ error: 'Reference code and phone number are required.' });
  }

  const cleanRef = referenceCode.trim().toUpperCase();
  const cleanPhone = phone.trim().replace(/[^0-9]/g, '');

  const match = serverAppointments.find(
    (a) =>
      a.referenceCode.toUpperCase() === cleanRef &&
      a.patientPhone.replace(/[^0-9]/g, '').endsWith(cleanPhone.slice(-7))
  );

  if (match) {
    return res.json({
      found: true,
      appointment: match,
      message: `Appointment request found for ${match.patientName}. Current status: "${match.status.toUpperCase()}".`,
    });
  }

  return res.status(404).json({
    found: false,
    message: `No appointment found matching Reference Code "${cleanRef}" and the provided mobile number. Please check and try again.`,
  });
});

// 5. Patient Reschedule Request
app.post('/api/appointments/reschedule', (req, res) => {
  const { appointmentId, newDate, newTimeSlot, reason = 'Patient requested rescheduling' } = req.body;

  if (!appointmentId || !newDate || !newTimeSlot) {
    return res.status(400).json({ error: 'Appointment ID, new date, and new time slot are required.' });
  }

  const appIndex = serverAppointments.findIndex((a) => a.id === appointmentId || a.referenceCode === appointmentId);
  if (appIndex === -1) {
    return res.status(404).json({ error: 'Appointment record not found.' });
  }

  // Check double-booking for new target slot
  const isOccupied = serverAppointments.some(
    (a) =>
      a.id !== serverAppointments[appIndex].id &&
      a.preferredDate === newDate &&
      a.preferredTimeSlot === newTimeSlot &&
      !['cancelled', 'no_show'].includes(a.status)
  );

  if (isOccupied) {
    return res.status(409).json({ error: `The slot ${newTimeSlot} on ${newDate} is already booked. Please choose an alternate slot.` });
  }

  const prevSlot = `${serverAppointments[appIndex].preferredDate} (${serverAppointments[appIndex].preferredTimeSlot})`;
  const nowStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  const prevStatus = serverAppointments[appIndex].status;

  serverAppointments[appIndex].rescheduledDate = newDate;
  serverAppointments[appIndex].rescheduledTimeSlot = newTimeSlot;
  serverAppointments[appIndex].preferredDate = newDate;
  serverAppointments[appIndex].preferredTimeSlot = newTimeSlot;
  serverAppointments[appIndex].status = 'rescheduled';
  serverAppointments[appIndex].updatedAt = nowStr;
  serverAppointments[appIndex].adminNotes = (serverAppointments[appIndex].adminNotes ? serverAppointments[appIndex].adminNotes + '\n' : '') + `[Rescheduled]: ${reason}`;

  serverAppointments[appIndex].history.push({
    id: `hist-${Date.now()}`,
    appointmentId: serverAppointments[appIndex].id,
    previousStatus: prevStatus,
    newStatus: 'rescheduled',
    actionType: 'rescheduled',
    notes: `Rescheduled from ${prevSlot} to ${newDate} ${newTimeSlot}. Reason: ${reason}`,
    changedBy: 'Patient Portal',
    createdAt: nowStr,
  });

  res.json({
    success: true,
    message: `Appointment successfully rescheduled to ${newDate} at ${newTimeSlot}.`,
    appointment: serverAppointments[appIndex],
  });
});

// 6. Patient Cancellation Request
app.post('/api/appointments/cancel', (req, res) => {
  const { appointmentId, reason } = req.body;

  if (!appointmentId || !reason) {
    return res.status(400).json({ error: 'Appointment ID and cancellation reason are required.' });
  }

  const appIndex = serverAppointments.findIndex((a) => a.id === appointmentId || a.referenceCode === appointmentId);
  if (appIndex === -1) {
    return res.status(404).json({ error: 'Appointment record not found.' });
  }

  const nowStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  const prevStatus = serverAppointments[appIndex].status;

  serverAppointments[appIndex].status = 'cancelled';
  serverAppointments[appIndex].cancellationReason = reason;
  serverAppointments[appIndex].updatedAt = nowStr;

  serverAppointments[appIndex].history.push({
    id: `hist-${Date.now()}`,
    appointmentId: serverAppointments[appIndex].id,
    previousStatus: prevStatus,
    newStatus: 'cancelled',
    actionType: 'cancelled',
    notes: `Cancelled by patient. Reason: ${reason}`,
    changedBy: 'Patient Portal',
    createdAt: nowStr,
  });

  res.json({
    success: true,
    message: 'Appointment request has been cancelled.',
    appointment: serverAppointments[appIndex],
  });
});

// 7. Save / Update Protected Smart Pre-Visit Clinical Intake Form
app.post('/api/appointments/intake', (req, res) => {
  const { appointmentId, visitReason, symptomDuration, existingConditions, currentMedicines, knownAllergies, intakeNotes } = req.body;

  if (!appointmentId) {
    return res.status(400).json({ error: 'Valid appointment ID is required.' });
  }

  const appIndex = serverAppointments.findIndex((a) => a.id === appointmentId || a.referenceCode === appointmentId);
  if (appIndex === -1) {
    return res.status(404).json({ error: 'Appointment not found.' });
  }

  const nowStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  serverAppointments[appIndex].visitReason = visitReason;
  serverAppointments[appIndex].symptomDuration = symptomDuration;
  serverAppointments[appIndex].existingConditions = existingConditions;
  serverAppointments[appIndex].currentMedicines = currentMedicines;
  serverAppointments[appIndex].knownAllergies = knownAllergies;
  serverAppointments[appIndex].intakeNotes = intakeNotes;
  serverAppointments[appIndex].intakeSubmittedAt = nowStr;

  serverAppointments[appIndex].history.push({
    id: `hist-${Date.now()}`,
    appointmentId: serverAppointments[appIndex].id,
    previousStatus: serverAppointments[appIndex].status,
    newStatus: serverAppointments[appIndex].status,
    actionType: 'note_added',
    notes: 'Smart Pre-Visit Clinical Intake form submitted by patient.',
    changedBy: 'Patient Portal',
    createdAt: nowStr,
  });

  res.json({
    success: true,
    message: 'Smart Pre-Visit Intake Form submitted successfully.',
    appointment: serverAppointments[appIndex],
  });
});

// 8. Admin: Update Appointment Status & Add Internal Note
app.patch('/api/appointments/:id', requireRole(['receptionist', 'admin', 'super_admin']), requireCsrf, (req, res) => {
  const { id } = req.params;
  const bodyId = req.body.id || req.body.appointmentId || req.body.appointment_id;
  if (bodyId !== undefined && String(bodyId) !== String(id)) {
    return res.status(400).json({ error: 'validation_error', message: 'Path appointment ID conflicts with body appointment ID.' });
  }

  const { status, adminNotes, changedBy = 'Staff Reception', newStaffNote } = req.body;

  const appIndex = serverAppointments.findIndex((a) => a.id === id);
  if (appIndex === -1) {
    return res.status(404).json({ error: 'Appointment not found.' });
  }

  const nowStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  const prevStatus = serverAppointments[appIndex].status;

  if (status && status !== prevStatus) {
    serverAppointments[appIndex].status = status;
    serverAppointments[appIndex].updatedAt = nowStr;

    serverAppointments[appIndex].history.push({
      id: `hist-${Date.now()}`,
      appointmentId: id,
      previousStatus: prevStatus,
      newStatus: status,
      actionType: status,
      notes: adminNotes || `Status transitioned from ${prevStatus} to ${status}.`,
      changedBy,
      createdAt: nowStr,
    });
  }

  if (adminNotes !== undefined) {
    serverAppointments[appIndex].adminNotes = adminNotes;
  }

  if (newStaffNote) {
    serverAppointments[appIndex].staffNotes.unshift({
      id: `note-${Date.now()}`,
      appointmentId: id,
      staffName: changedBy,
      note: newStaffNote,
      isInternal: true,
      createdAt: nowStr,
    });
  }

  res.json({
    success: true,
    message: 'Appointment record updated successfully.',
    appointment: filterOperationalAppointment(serverAppointments[appIndex]),
  });
});

// 9. Admin: Add Staff Internal Note directly
app.post('/api/appointments/:id/notes', requireRole(['receptionist', 'admin', 'super_admin']), requireCsrf, (req, res) => {
  const { id } = req.params;
  const bodyId = req.body.id || req.body.appointmentId || req.body.appointment_id;
  if (bodyId !== undefined && String(bodyId) !== String(id)) {
    return res.status(400).json({ error: 'validation_error', message: 'Path appointment ID conflicts with body appointment ID.' });
  }

  const { staffName = 'Front Desk Staff', note } = req.body;

  if (!note) {
    return res.status(400).json({ error: 'Note content is required.' });
  }

  const appIndex = serverAppointments.findIndex((a) => a.id === id);
  if (appIndex === -1) {
    return res.status(404).json({ error: 'Appointment not found.' });
  }

  const nowStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const staffNote: ServerStaffNote = {
    id: `note-${Date.now()}`,
    appointmentId: id,
    staffName,
    note,
    isInternal: true,
    createdAt: nowStr,
  };

  serverAppointments[appIndex].staffNotes.unshift(staffNote);

  res.status(201).json({
    success: true,
    message: 'Internal staff note added.',
    staffNote,
    staffNotes: serverAppointments[appIndex].staffNotes,
  });
});

// Legacy alias: POST /api/appointments/notes
app.post('/api/appointments/notes', requireRole(['receptionist', 'admin', 'super_admin']), requireCsrf, (req, res) => {
  res.setHeader('X-Deprecated', 'Route /api/appointments/notes is deprecated. Use POST /api/appointments/:id/notes instead.');
  const id = req.body.appointmentId || req.body.appointment_id || req.body.id;
  if (!id) {
    return res.status(400).json({ error: 'validation_error', message: 'Appointment ID is required.' });
  }
  const { staffName = 'Front Desk Staff', note } = req.body;
  if (!note) {
    return res.status(400).json({ error: 'Note content is required.' });
  }
  const appIndex = serverAppointments.findIndex((a) => a.id === String(id));
  if (appIndex === -1) {
    return res.status(404).json({ error: 'Appointment not found.' });
  }
  const nowStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  const staffNote: ServerStaffNote = {
    id: `note-${Date.now()}`,
    appointmentId: String(id),
    staffName,
    note,
    isInternal: true,
    createdAt: nowStr,
  };
  serverAppointments[appIndex].staffNotes.unshift(staffNote);
  res.status(201).json({
    success: true,
    message: 'Internal staff note added.',
    staffNote,
    staffNotes: serverAppointments[appIndex].staffNotes,
  });
});

// Legacy alias: PATCH /api/appointments/status
app.patch('/api/appointments/status', requireRole(['receptionist', 'admin', 'super_admin']), requireCsrf, (req, res) => {
  res.setHeader('X-Deprecated', 'Route /api/appointments/status is deprecated. Use PATCH /api/appointments/:id instead.');
  const id = req.body.appointmentId || req.body.appointment_id || req.body.id;
  if (!id) {
    return res.status(400).json({ error: 'validation_error', message: 'Appointment ID is required.' });
  }
  const { status, adminNotes, changedBy = 'Staff Reception', newStaffNote } = req.body;
  const appIndex = serverAppointments.findIndex((a) => a.id === String(id));
  if (appIndex === -1) {
    return res.status(404).json({ error: 'Appointment not found.' });
  }
  const nowStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  const prevStatus = serverAppointments[appIndex].status;
  if (status && status !== prevStatus) {
    serverAppointments[appIndex].status = status;
    serverAppointments[appIndex].updatedAt = nowStr;
    serverAppointments[appIndex].history.push({
      id: `hist-${Date.now()}`,
      appointmentId: String(id),
      previousStatus: prevStatus,
      newStatus: status,
      actionType: status,
      notes: adminNotes || `Status transitioned from ${prevStatus} to ${status}.`,
      changedBy,
      createdAt: nowStr,
    });
  }
  if (adminNotes !== undefined) {
    serverAppointments[appIndex].adminNotes = adminNotes;
  }
  if (newStaffNote) {
    serverAppointments[appIndex].staffNotes.unshift({
      id: `note-${Date.now()}`,
      appointmentId: String(id),
      staffName: changedBy,
      note: newStaffNote,
      isInternal: true,
      createdAt: nowStr,
    });
  }
  res.json({
    success: true,
    message: 'Appointment record updated successfully.',
    appointment: filterOperationalAppointment(serverAppointments[appIndex]),
  });
});

// 10. Availability Rules, Breaks, Holidays, Blocked Slots Endpoints
app.get('/api/schedules/rules', (req, res) => {
  res.json({
    success: true,
    rules: serverAvailabilityRules,
    breaks: serverClinicBreaks,
    holidays: serverClinicHolidays,
    blockedSlots: serverBlockedSlots,
    timezone: 'Asia/Karachi',
    timezoneLabel: 'PKT (Pakistan Standard Time, UTC+5)',
  });
});

// 11. Configurable SMTP Settings & Simulator
app.get('/api/smtp', requireRole(['admin', 'super_admin']), (req, res) => {
  // Always return sanitized settings (never output actual password)
  const isConfigured = serverSmtpSettings.isActive && 
    serverSmtpSettings.username !== '' && 
    !serverSmtpSettings.username.startsWith('CHANGE_AFTER_') &&
    serverSmtpSettings.fromEmail !== '' &&
    !serverSmtpSettings.fromEmail.startsWith('CHANGE_AFTER_');

  res.json({
    success: true,
    smtp: {
      ...serverSmtpSettings,
      password: serverSmtpSettings.password ? '••••••••••••' : '',
      isConfigured,
      warning: !isConfigured
        ? 'Email notifications are currently unconfigured or disabled. Patient appointments will continue to be safely stored in the MySQL database.'
        : null,
    },
  });
});

app.post('/api/smtp', requireRole(['super_admin']), requireCsrf, requireJsonRequest, (req, res) => {
  const { host, port, encryption, username, password, fromEmail, fromName, isActive, notifyStaffOnNew, staffNotificationEmail } = req.body;

  const newUsername = username !== undefined ? username : serverSmtpSettings.username;
  const newFromEmail = fromEmail !== undefined ? fromEmail : serverSmtpSettings.fromEmail;
  const newIsActive = isActive !== undefined ? Boolean(isActive) : serverSmtpSettings.isActive;

  const isConfigured = newIsActive && 
    newUsername !== '' && 
    !newUsername.startsWith('CHANGE_AFTER_') &&
    newFromEmail !== '' && 
    !newFromEmail.startsWith('CHANGE_AFTER_');

  serverSmtpSettings = {
    host: host || serverSmtpSettings.host,
    port: Number(port) || serverSmtpSettings.port,
    encryption: encryption || serverSmtpSettings.encryption,
    username: newUsername,
    password: password ? '••••••••••••' : serverSmtpSettings.password,
    fromEmail: newFromEmail,
    fromName: fromName || serverSmtpSettings.fromName,
    isActive: newIsActive,
    isConfigured,
    warning: !isConfigured
      ? 'Email notifications are currently disabled (SMTP unconfigured). Patient bookings are saved in MySQL database, but automated email notifications will not be sent until SMTP credentials are configured.'
      : null,
    notifyStaffOnNew: notifyStaffOnNew !== undefined ? Boolean(notifyStaffOnNew) : serverSmtpSettings.notifyStaffOnNew,
    staffNotificationEmail: staffNotificationEmail || serverSmtpSettings.staffNotificationEmail,
  };

  res.json({
    success: true,
    message: 'SMTP settings updated successfully.',
    smtp: {
      ...serverSmtpSettings,
      password: serverSmtpSettings.password ? '••••••••••••' : '',
    },
  });
});

app.post('/api/smtp/test', requireRole(['super_admin']), requireCsrf, requireJsonRequest, (req, res) => {
  const { testEmail = 'patient@example.com' } = req.body;

  if (!serverSmtpSettings.isConfigured || !serverSmtpSettings.isActive) {
    return res.json({
      success: false,
      isConfigured: false,
      message: `SMTP is currently disabled or unconfigured (${serverSmtpSettings.username}). To send live emails, set valid credentials in .env or Settings. Appointments continue to be saved in MySQL.`,
      details: {
        from: `${serverSmtpSettings.fromName} <${serverSmtpSettings.fromEmail}>`,
        to: testEmail,
        status: 'DISPATCH_SKIPPED_SMTP_UNCONFIGURED',
        timestamp: new Date().toISOString(),
      },
    });
  }

  res.json({
    success: true,
    isConfigured: true,
    message: `Test email successfully dispatched via ${serverSmtpSettings.host}:${serverSmtpSettings.port} (${serverSmtpSettings.encryption.toUpperCase()}) to ${testEmail}.`,
    details: {
      from: `${serverSmtpSettings.fromName} <${serverSmtpSettings.fromEmail}>`,
      to: testEmail,
      subject: 'Dr. Farhan Mustafa Clinic - SMTP Dispatch Test Verification',
      timestamp: new Date().toISOString(),
    },
  });
});

// -------------------------------------------------------------
// Contact Inquiries Endpoint
// -------------------------------------------------------------

// Contact Inquiries Endpoint
app.get('/api/contact', requireRole(['receptionist', 'admin', 'super_admin']), (req, res) => {
  res.json({ success: true, messages: serverMessages });
});

// In-memory rate limiting map for public contact submissions
const contactRateLimits = new Map<string, number[]>();

app.post('/api/contact', requireJsonRequest, (req, res) => {
  const ip = (req.ip || (req.socket && req.socket.remoteAddress) || '127.0.0.1').toString();
  const now = Date.now();
  const windowMs = 10 * 60 * 1000; // 10 minutes
  const maxSubmissions = 5;

  // 1. Anti-automation rate limiting
  const timestamps = contactRateLimits.get(ip) || [];
  const validTimestamps = timestamps.filter(t => now - t < windowMs);
  if (validTimestamps.length >= maxSubmissions) {
    return res.status(429).json({
      success: false,
      error: 'rate_limit_exceeded',
      message: 'Too many submissions from your network. Please wait a few minutes before trying again.',
    });
  }

  // 2. Reject unexpected fields
  const allowedKeys = ['name', 'phone', 'email', 'subject', 'message'];
  const unexpectedKeys = Object.keys(req.body).filter(k => !allowedKeys.includes(k));
  if (unexpectedKeys.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'validation_error',
      message: 'Unexpected fields provided: ' + unexpectedKeys.join(', '),
    });
  }

  const { name, phone, email, subject = 'General Inquiry', message } = req.body;

  // 3. Prevent email-header injection
  for (const fieldVal of [name, email, subject]) {
    if (typeof fieldVal === 'string' && /[\r\n]|%0a|%0d/i.test(fieldVal)) {
      return res.status(400).json({
        success: false,
        error: 'validation_error',
        message: 'Invalid characters detected in form fields.',
      });
    }
  }

  // 4. Never allow HTML/executable content
  const combinedContent = `${name || ''} ${subject || ''} ${message || ''}`;
  if (/<[^>]*>|javascript:|data:|vbscript:|onload=|onerror=/i.test(combinedContent)) {
    return res.status(400).json({
      success: false,
      error: 'validation_error',
      message: 'HTML, scripts, or executable markup are strictly prohibited.',
    });
  }

  // 5. Server-side validation and length limits
  if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 150) {
    return res.status(400).json({
      success: false,
      error: 'validation_error',
      message: 'Name must be between 2 and 150 characters.',
    });
  }

  if (typeof phone !== 'string' || phone.trim().length < 7 || phone.trim().length > 32) {
    return res.status(400).json({
      success: false,
      error: 'validation_error',
      message: 'Valid contact phone number is required (7 to 32 characters).',
    });
  }

  if (email && (typeof email !== 'string' || email.length > 191 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
    return res.status(400).json({
      success: false,
      error: 'validation_error',
      message: 'Please provide a valid email address.',
    });
  }

  if (typeof subject === 'string' && subject.length > 150) {
    return res.status(400).json({
      success: false,
      error: 'validation_error',
      message: 'Subject cannot exceed 150 characters.',
    });
  }

  if (typeof message !== 'string' || message.trim().length < 5 || message.trim().length > 3000) {
    return res.status(400).json({
      success: false,
      error: 'validation_error',
      message: 'Message must be between 5 and 3000 characters.',
    });
  }

  // Record rate limit timestamp
  validTimestamps.push(now);
  contactRateLimits.set(ip, validTimestamps);

  const cleanName = name.replace(/<[^>]*>/g, '').trim();
  const cleanPhone = phone.replace(/<[^>]*>/g, '').trim();
  const cleanEmail = email ? email.replace(/<[^>]*>/g, '').trim() : undefined;
  const cleanSubject = (subject || 'General Inquiry').replace(/<[^>]*>/g, '').trim();
  const cleanMessage = message.replace(/<[^>]*>/g, '').trim();

  const newMsg: ServerContactMessage = {
    id: `msg-${Date.now()}`,
    name: cleanName,
    phone: cleanPhone,
    email: cleanEmail,
    subject: cleanSubject,
    message: cleanMessage,
    createdAt: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    isRead: false,
  };

  serverMessages.unshift(newMsg);

  recordAuditEvent('contact_inquiry_received', 'contact_message', '0', { ip }, req);

  // Return generic success message without leaking internal database/record details
  res.status(200).json({
    success: true,
    message: 'Your inquiry has been received. Our clinic reception team will review your message.',
  });
});

// -------------------------------------------------------------
// Phase 4: Dr. Farhan's AI Receptionist Endpoints & Safety Engine
// -------------------------------------------------------------

interface ServerAiKnowledgeItem {
  id: string;
  category: string;
  topic: string;
  questionEn: string;
  questionUrdu?: string;
  questionRoman?: string;
  answerContent: string;
  keywords: string[];
  isPublished: boolean;
  isVerified: boolean;
  sortOrder: number;
  updatedAt?: string;
}

interface ServerAiSettings {
  isEnabled: boolean;
  modelName: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  emergencyAlertText: string;
  rateLimitPer10Min: number;
  retentionDays: number;
  consentText: string;
  disclaimerText: string;
  whatsappNumber: string;
  phoneNumber: string;
  supportedLanguages: string[];
}

interface ServerAiMessage {
  id: string;
  sender: 'ai' | 'user' | 'system';
  text: string;
  timestamp: string;
  isEmergency?: boolean;
  detectedLanguage?: string;
  safetyFlag?: string;
}

interface ServerAiSession {
  id: string;
  sessionId: string;
  startedAt: string;
  lastActivityAt: string;
  messageCount: number;
  userLanguage: string;
  triageFlag: string;
  isEscalated: boolean;
  escalationType?: string;
  messages: ServerAiMessage[];
}

interface ServerAiSafetyLog {
  id: string;
  sessionId: string;
  timestamp: string;
  triggerType: string;
  userQuery: string;
  actionTaken: string;
  ipAddress?: string;
}

let serverAiSettings: ServerAiSettings = {
  isEnabled: true,
  modelName: 'gemini-3.7-flash',
  temperature: 0.2,
  maxTokens: 800,
  systemPrompt: `You are Dr. Farhan Mustafa's Official AI Clinic Receptionist at HealthPro Medical Complex, Faisal Town, Lahore.
You assist patients courteously in English, Urdu (اردو), and Roman Urdu.
Never diagnose, assess personal symptoms, interpret lab reports, recommend treatments, prescribe medicines, or provide drug dosages.
Always ground answers strictly in the verified clinic knowledge base provided.`,
  emergencyAlertText: `⚠️ MEDICAL EMERGENCY NOTICE: If you or the patient are experiencing acute chest pain, severe shortness of breath, sudden weakness/paralysis, or life-threatening symptoms, please call Rescue 1122 immediately or proceed to the nearest hospital emergency room (e.g. Jinnah Hospital Lahore). Dr. Farhan's clinic provides scheduled outpatient consultations and does not handle emergency triage.`,
  rateLimitPer10Min: 20,
  retentionDays: 30,
  consentText: `Dr. Farhan Mustafa's AI Clinic Assistant provides verified logistical and appointment information. It cannot provide medical diagnoses, symptom assessments, or prescription advice. For emergencies, call Rescue 1122 immediately.`,
  disclaimerText: `Informational AI Receptionist • Grounded in Published Clinic Facts • Outpatient care by prior appointment.`,
  whatsappNumber: '+92 328 0145670',
  phoneNumber: '0328 0145670',
  supportedLanguages: ['English', 'اردو (Urdu)', 'Roman Urdu'],
};

const serverAiKnowledge: ServerAiKnowledgeItem[] = [
  {
    id: 'k-loc-1',
    category: 'location',
    topic: 'Clinic Address & Location',
    questionEn: 'Where is Dr. Farhan Mustafa located in Lahore?',
    questionUrdu: 'ڈاکٹر فرحان مصطفیٰ کا کلینک لاہور میں کہاں ہے؟',
    questionRoman: 'Dr. Farhan Mustafa ka clinic Lahore me kahan waqia hai?',
    answerContent: 'Dr. Farhan Mustafa consults at HealthPro Medical Complex, 860-B, Block B, Faisal Town, Lahore 54000, Pakistan. Centrally situated near main commercial areas with patient parking.',
    keywords: ['location', 'address', 'faisal town', 'healthpro', 'map', 'directions', 'kahan', 'lahore'],
    isPublished: true,
    isVerified: true,
    sortOrder: 1,
    updatedAt: '18 Aug 2026',
  },
  {
    id: 'k-time-1',
    category: 'timings',
    topic: 'Clinic Timings & Consultation Hours',
    questionEn: 'What are the consultation hours and clinic timings?',
    questionUrdu: 'کلینک کے اوقات کار اور چیک اپ کا وقت کیا ہے؟',
    questionRoman: 'Clinic ke timings aur check-up ke auqaat kya hain?',
    answerContent: 'Dr. Farhan Mustafa conducts consultations Monday through Saturday from 6:00 PM to 9:00 PM (18:00 to 21:00 PKT). The clinic is closed on Sundays for routine consultations. Online appointment requests can be submitted 24/7.',
    keywords: ['timings', 'hours', 'schedule', 'days', 'sunday', 'waqt', 'auqat', 'kab baithte hain', 'evening'],
    isPublished: true,
    isVerified: true,
    sortOrder: 2,
    updatedAt: '18 Aug 2026',
  },
  {
    id: 'k-doc-1',
    category: 'doctor',
    topic: 'Doctor Qualifications & Specialization',
    questionEn: 'What are Dr. Farhan Mustafa’s qualifications and experience?',
    questionUrdu: 'ڈاکٹر فرحان مصطفیٰ کی تعلیمی اسناد اور مہارت کیا ہے؟',
    questionRoman: 'Dr Farhan Mustafa ki qualifications aur specialty kya hai?',
    answerContent: 'Dr. Farhan Mustafa is a Consultant Physician & Internal Medicine Specialist holding FCPS and MRCP (UK) credentials. He specializes in the comprehensive non-surgical management of complex multi-system adult diseases, Type 2 Diabetes, hypertension, metabolic health, and diagnostic evaluations.',
    keywords: ['doctor', 'qualification', 'degrees', 'fcps', 'mrcp', 'specialist', 'tajarba'],
    isPublished: true,
    isVerified: true,
    sortOrder: 3,
    updatedAt: '18 Aug 2026',
  },
  {
    id: 'k-fee-1',
    category: 'fees',
    topic: 'Consultation Fees Policy',
    questionEn: 'How much is the consultation fee?',
    questionUrdu: 'چیک اپ فیس کتنی ہے؟',
    questionRoman: 'Consultation fee kitni hai?',
    answerContent: 'Consultation fees are structured transparently based on visit type (in-clinic initial consultation, follow-up review, or online video consultation) and verified upon scheduling. You may check the Fees section on the website or WhatsApp the clinic (+92 328 0145670) for specific rates.',
    keywords: ['fee', 'charges', 'cost', 'price', 'kitne paise', 'fees', 'rate'],
    isPublished: true,
    isVerified: true,
    sortOrder: 4,
    updatedAt: '18 Aug 2026',
  },
  {
    id: 'k-srv-1',
    category: 'services',
    topic: 'Diabetes, Blood Pressure & Digestive Care',
    questionEn: 'What clinical conditions does Dr. Farhan treat?',
    questionUrdu: 'ڈاکٹر صاحب کن بیماریوں کا علاج کرتے ہیں؟',
    questionRoman: 'Dr Farhan kin bimariyon ka treatment karte hain?',
    answerContent: 'Dr. Farhan manages adult chronic conditions including Type 2 Diabetes, High Blood Pressure (Hypertension), gastrointestinal and acid reflux concerns, liver health (fatty liver, LFTs), adult infectious diseases, fever investigations, and preventive health screenings.',
    keywords: ['services', 'diabetes', 'sugar', 'blood pressure', 'bp', 'stomach', 'maida', 'liver', 'jigar', 'fever', 'bukhar'],
    isPublished: true,
    isVerified: true,
    sortOrder: 5,
    updatedAt: '18 Aug 2026',
  },
  {
    id: 'k-app-1',
    category: 'appointments',
    topic: 'Booking Appointments & Contact',
    questionEn: 'How can I book an appointment?',
    questionUrdu: 'اپائنٹمنٹ بک کرنے کا طریقہ',
    questionRoman: 'Appointment book karne ka tarika',
    answerContent: 'You can submit an appointment request on our website by clicking "Book Appointment" or by sending a WhatsApp message to +92 328 0145670. Our staff will confirm your slot based on schedule availability.',
    keywords: ['book', 'appointment', 'schedule', 'whatsapp', 'phone', 'rabta'],
    isPublished: true,
    isVerified: true,
    sortOrder: 6,
    updatedAt: '18 Aug 2026',
  }
];

const serverAiSessions: ServerAiSession[] = [
  {
    id: 'sess-1',
    sessionId: 'sess-user-0941',
    startedAt: '18 Aug 2026, 11:15 AM',
    lastActivityAt: '18 Aug 2026, 11:18 AM',
    messageCount: 4,
    userLanguage: 'English',
    triageFlag: 'clean',
    isEscalated: false,
    escalationType: 'none',
    messages: [
      {
        id: 'm1',
        sender: 'user',
        text: 'What are Dr. Farhan Mustafa clinic timings in Faisal Town?',
        timestamp: '11:15 AM',
        detectedLanguage: 'en',
      },
      {
        id: 'm2',
        sender: 'ai',
        text: 'Dr. Farhan Mustafa consults at HealthPro Medical Complex, 860-B, Block B, Faisal Town, Lahore, from Monday to Saturday, 6:00 PM to 9:00 PM (18:00 to 21:00 PKT).',
        timestamp: '11:15 AM',
        isEmergency: false,
      }
    ]
  }
];

const serverAiSafetyLogs: ServerAiSafetyLog[] = [
  {
    id: 'slog-1',
    sessionId: 'sess-user-4309',
    timestamp: '17 Aug 2026, 08:30 PM',
    triggerType: 'emergency_symptoms',
    userQuery: 'Severe chest pain radiating to left arm for past 30 mins',
    actionTaken: 'emergency_banner_displayed',
    ipAddress: '110.39.***.*** (Lahore, PK)'
  },
  {
    id: 'slog-2',
    sessionId: 'sess-user-6621',
    timestamp: '16 Aug 2026, 03:14 PM',
    triggerType: 'medical_diagnosis_attempt',
    userQuery: 'My fasting sugar is 280 mg/dl, which medicine dosage should I increase?',
    actionTaken: 'medical_refusal_rendered',
    ipAddress: '182.185.***.*** (Punjab, PK)'
  }
];

// In-memory rate limiting map (IP / session -> { count, resetAt })
const aiRateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(key: string, limit: number = 20): boolean {
  const now = Date.now();
  const windowMs = 10 * 60 * 1000; // 10 minutes

  const entry = aiRateLimitMap.get(key);
  if (!entry || now > entry.resetAt) {
    aiRateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= limit) {
    return false;
  }

  entry.count++;
  return true;
}

// Emergency Keyword Checking Helper
function detectEmergency(text: string): boolean {
  const lower = text.toLowerCase();
  const emergencyKeywords = [
    'chest pain', 'heart attack', 'cardiac arrest', 'severe breath', 'shortness of breath', 'cannot breathe',
    'stroke', 'paralysis', 'facial droop', 'unconscious', 'passed out', 'fainting', 'heavy bleeding',
    'poisoning', 'cyanide', 'suicide', 'anaphylaxis', 'choking',
    // Urdu / Roman Urdu
    'sine me dard', 'seene me dard', 'dil ka dora', 'dil me dard', 'sans band', 'sans lene me takleef',
    'behosh', 'hosh nahi', 'falij', 'khoon beh raha', 'zehar', 'emergency', 'سینے میں درد', 'دل کا دورہ',
    'سانس رک', 'بے ہوش', 'فالج', 'شدید خون'
  ];

  return emergencyKeywords.some(kw => lower.includes(kw));
}

// Medical Refusal Helper (Diagnosis / Prescription / Dosage query)
function detectMedicalPrescriptionRequest(text: string): boolean {
  const lower = text.toLowerCase();
  const patterns = [
    'what medicine should i take', 'prescribe', 'which drug', 'dosage for', 'how many mg',
    'suggest medicine', 'medicine for my', 'dawa bata', 'konsi goli', 'kitni mg', 'dosage batao',
    'interpret my report', 'diagnose my', 'hba1c result means', 'sugar 300 hai konsi medicine'
  ];
  return patterns.some(p => lower.includes(p));
}

// 1. AI Receptionist Chat Endpoint
app.post(['/api/ai/chat', '/api/receptionist'], async (req, res) => {
  const { message, sessionId = `sess-${Date.now()}`, conversationHistory = [] } = req.body;
  const clientIp = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';
  const nowStr = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  const fullDateStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  if (!serverAiSettings.isEnabled) {
    return res.json({
      success: true,
      reply: 'The AI Receptionist is currently offline for scheduled maintenance. Please contact Dr. Farhan Mustafa’s clinic directly via WhatsApp at +92 328 0145670 or call 0328 0145670.',
      isEmergency: false,
      isOffline: true,
      quickActions: [
        { label: 'WhatsApp Clinic', actionType: 'whatsapp', payload: 'https://wa.me/923280145670' },
        { label: 'Call Clinic', actionType: 'tel', payload: 'tel:+923280145670' }
      ]
    });
  }

  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'Message content is required.' });
  }

  const userQuery = message.trim();

  // Rate Limiting Check
  const rateLimitKey = `${sessionId}_${clientIp}`;
  if (!checkRateLimit(rateLimitKey, serverAiSettings.rateLimitPer10Min)) {
    serverAiSafetyLogs.unshift({
      id: `slog-${Date.now()}`,
      sessionId,
      timestamp: fullDateStr,
      triggerType: 'rate_limit_exceeded',
      userQuery: userQuery.substring(0, 100),
      actionTaken: 'rate_limit_applied',
      ipAddress: String(clientIp),
    });

    return res.status(429).json({
      success: false,
      reply: 'You have reached the messaging rate limit for this session (20 messages per 10 minutes). Please wait a few moments or connect directly with our front desk on WhatsApp at +92 328 0145670.',
      quickActions: [
        { label: 'WhatsApp Reception', actionType: 'whatsapp', payload: 'https://wa.me/923280145670' }
      ]
    });
  }

  // Emergency Red Flag Fast-Path
  if (detectEmergency(userQuery)) {
    serverAiSafetyLogs.unshift({
      id: `slog-${Date.now()}`,
      sessionId,
      timestamp: fullDateStr,
      triggerType: 'emergency_symptoms',
      userQuery,
      actionTaken: 'emergency_banner_displayed',
      ipAddress: String(clientIp),
    });

    const emergencyReply = serverAiSettings.emergencyAlertText;
    const quickActions = [
      { label: 'Call Rescue 1122', actionType: 'tel', payload: 'tel:1122' },
      { label: 'WhatsApp Clinic (+92 328 0145670)', actionType: 'whatsapp', payload: 'https://wa.me/923280145670' }
    ];

    return res.json({
      success: true,
      reply: emergencyReply,
      isEmergency: true,
      triageFlag: 'emergency',
      quickActions,
    });
  }

  // Medical Prescription / Diagnosis Refusal Check
  if (detectMedicalPrescriptionRequest(userQuery)) {
    serverAiSafetyLogs.unshift({
      id: `slog-${Date.now()}`,
      sessionId,
      timestamp: fullDateStr,
      triggerType: 'medical_diagnosis_attempt',
      userQuery,
      actionTaken: 'medical_refusal_rendered',
      ipAddress: String(clientIp),
    });

    const refusalReply = "As an AI Clinic Receptionist, I cannot assess clinical symptoms, interpret laboratory test reports, prescribe medications, or recommend drug dosages. Dr. Farhan Mustafa provides personalized medical evaluations during scheduled consultations. Would you like to schedule an in-clinic appointment at HealthPro Medical Complex or book a video consultation?";
    return res.json({
      success: true,
      reply: refusalReply,
      isEmergency: false,
      triageFlag: 'medical_advice_refusal',
      quickActions: [
        { label: 'Book Appointment', actionType: 'book_modal', payload: '/appointments' },
        { label: 'WhatsApp Reception', actionType: 'whatsapp', payload: 'https://wa.me/923280145670' }
      ]
    });
  }

  // Build Knowledge Grounding Context from Published MySQL knowledge
  const publishedKnowledge = serverAiKnowledge.filter(k => k.isPublished);
  const knowledgeContext = publishedKnowledge
    .map(k => `[TOPIC: ${k.topic} (${k.category})]\nQ: ${k.questionEn} | ${k.questionUrdu || ''} | ${k.questionRoman || ''}\nA: ${k.answerContent}`)
    .join('\n\n');

  const fullSystemInstruction = `${serverAiSettings.systemPrompt}

OFFICIAL CLINIC FACTS & GROUNDING KNOWLEDGE:
${knowledgeContext}

STRICT OPERATIONAL RULES:
1. Answer ONLY using the facts given above. If the inquiry is outside clinic logistics (e.g. unknown medical queries, surgery costs, external topics), politely explain that this is Dr. Farhan's outpatient internal medicine receptionist and offer to book an appointment or connect on WhatsApp (+92 328 0145670).
2. Comprehend and respond in the exact language style of the patient: English, Urdu (اردو), or Roman Urdu (e.g., "Doctor sahab ki clinic timing kya hai?").
3. Always mention Dr. Farhan Mustafa consults at HealthPro Medical Complex, Faisal Town, Lahore, Monday to Saturday 6:00 PM – 9:00 PM (PKT).
4. If the patient expresses interest in booking an appointment, remind them they can book online right here or via WhatsApp.`;

  let aiReply = '';
  const gemini = getGeminiClient();

  if (gemini) {
    try {
      // Build conversation contents
      const contents = [
        ...conversationHistory.slice(-4).map((m: any) => ({
          role: m.sender === 'user' ? 'user' : 'model',
          parts: [{ text: String(m.text || '') }]
        })),
        {
          role: 'user',
          parts: [{ text: userQuery }]
        }
      ];

      const generatedText = await callGeminiWithResilience(
        gemini,
        serverAiSettings.modelName || 'gemini-3.7-flash',
        contents,
        {
          systemInstruction: fullSystemInstruction,
          temperature: serverAiSettings.temperature || 0.2,
          maxOutputTokens: serverAiSettings.maxTokens || 800,
        }
      );

      if (generatedText) {
        aiReply = generatedText;
      }
    } catch (err: any) {
      console.warn('Gemini API call error (handled via fallback):', err?.message || err);
    }
  }

  // Fallback Engine if Gemini API client unavailable or error
  if (!aiReply) {
    const lower = userQuery.toLowerCase();
    const matched = publishedKnowledge.find(k =>
      k.keywords.some(kw => lower.includes(kw.toLowerCase())) ||
      lower.includes(k.topic.toLowerCase())
    );

    if (matched) {
      aiReply = matched.answerContent;
    } else {
      aiReply = `Thank you for contacting Dr. Farhan Mustafa’s Clinic at HealthPro Medical Complex, Faisal Town, Lahore. Consultations are available Monday through Saturday from 6:00 PM to 9:00 PM PKT by prior appointment. You can submit an appointment request on our website or connect directly on WhatsApp (+92 328 0145670).`;
    }
  }

  // Response Validation: Ensure no drug dosage generated by mistake
  if (/\b\d+\s*(mg|ml|mcg|tablets?|capsules?|goli)\b/i.test(aiReply) && !aiReply.includes('cannot prescribe')) {
    aiReply = "As an AI Clinic Receptionist, I cannot prescribe medicines or recommend drug dosages. For personalized clinical prescription, please schedule a consultation with Dr. Farhan Mustafa at HealthPro Medical Complex.";
  }

  // Build Contextual Quick Actions
  const lowerReply = aiReply.toLowerCase();
  const lowerQuery = userQuery.toLowerCase();
  const quickActions: { label: string; actionType: string; payload: string }[] = [];

  if (lowerReply.includes('appointment') || lowerReply.includes('book') || lowerQuery.includes('appointment') || lowerQuery.includes('book') || lowerQuery.includes('milna')) {
    quickActions.push({ label: 'Book Appointment', actionType: 'book_modal', payload: '/appointments' });
  }
  if (lowerReply.includes('location') || lowerReply.includes('faisal town') || lowerReply.includes('address') || lowerQuery.includes('location') || lowerQuery.includes('address')) {
    quickActions.push({ label: 'View Location / Map', actionType: 'navigate', payload: '/contact' });
  }
  if (lowerReply.includes('fee') || lowerQuery.includes('fee') || lowerQuery.includes('charges')) {
    quickActions.push({ label: 'Consultation Fees', actionType: 'navigate', payload: '/fees' });
  }
  quickActions.push({ label: 'WhatsApp (+92 328 0145670)', actionType: 'whatsapp', payload: 'https://wa.me/923280145670' });

  // Update session record in server memory
  const existingSession = serverAiSessions.find(s => s.sessionId === sessionId);
  const userMsgRecord: ServerAiMessage = {
    id: `m-u-${Date.now()}`,
    sender: 'user',
    text: userQuery,
    timestamp: nowStr,
  };
  const aiMsgRecord: ServerAiMessage = {
    id: `m-a-${Date.now()}`,
    sender: 'ai',
    text: aiReply,
    timestamp: nowStr,
    isEmergency: false,
  };

  if (existingSession) {
    existingSession.lastActivityAt = fullDateStr;
    existingSession.messageCount += 2;
    existingSession.messages.push(userMsgRecord, aiMsgRecord);
  } else {
    serverAiSessions.unshift({
      id: `sess-${Date.now()}`,
      sessionId,
      startedAt: fullDateStr,
      lastActivityAt: fullDateStr,
      messageCount: 2,
      userLanguage: 'auto',
      triageFlag: 'clean',
      isEscalated: false,
      messages: [userMsgRecord, aiMsgRecord],
    });
  }

  res.json({
    success: true,
    reply: aiReply,
    isEmergency: false,
    triageFlag: 'clean',
    quickActions: quickActions.slice(0, 3),
  });
});

// 2. AI Settings Endpoints
app.get('/api/ai/settings', requireRole(['admin', 'super_admin']), (req, res) => {
  res.json({
    success: true,
    settings: serverAiSettings,
    hasApiKeyConfigured: Boolean(process.env.GEMINI_API_KEY),
  });
});

app.post('/api/ai/settings', requireRole(['super_admin']), requireCsrf, requireJsonRequest, (req, res) => {
  const updates = req.body;
  serverAiSettings = { ...serverAiSettings, ...updates };
  res.json({
    success: true,
    message: 'AI Receptionist settings updated.',
    settings: serverAiSettings,
  });
});

// 3. AI Knowledge Endpoints
app.get('/api/ai/knowledge', requireRole(['editor', 'admin', 'super_admin']), (req, res) => {
  res.json({
    success: true,
    items: serverAiKnowledge,
    count: serverAiKnowledge.length,
  });
});

app.post('/api/ai/knowledge', requireRole(['editor', 'admin', 'super_admin']), requireCsrf, requireJsonRequest, (req, res) => {
  const user = getSessionUser(req);
  const isApprovalRole = user && ['admin', 'super_admin'].includes(user.role);

  const { id, category, topic, questionEn, questionUrdu, questionRoman, answerContent, keywords } = req.body;
  let { isPublished, isVerified } = req.body;

  // Editors cannot verify or publish. Force draft status for new items, preserve existing for updates.
  if (!isApprovalRole) {
    isPublished = undefined;
    isVerified = undefined;
  }

  if (id) {
    // Update existing
    const idx = serverAiKnowledge.findIndex(k => k.id === id);
    if (idx !== -1) {
      const prevVerified = serverAiKnowledge[idx].isVerified;
      const prevPublished = serverAiKnowledge[idx].isPublished;

      const nextVerified = (isApprovalRole && isVerified !== undefined) ? Boolean(isVerified) : prevVerified;
      const nextPublished = (isApprovalRole && isPublished !== undefined) ? Boolean(isPublished) : prevPublished;

      serverAiKnowledge[idx] = {
        ...serverAiKnowledge[idx],
        category: category || serverAiKnowledge[idx].category,
        topic: topic || serverAiKnowledge[idx].topic,
        questionEn: questionEn || serverAiKnowledge[idx].questionEn,
        questionUrdu: questionUrdu !== undefined ? questionUrdu : serverAiKnowledge[idx].questionUrdu,
        questionRoman: questionRoman !== undefined ? questionRoman : serverAiKnowledge[idx].questionRoman,
        answerContent: answerContent || serverAiKnowledge[idx].answerContent,
        keywords: Array.isArray(keywords) ? keywords : serverAiKnowledge[idx].keywords,
        isPublished: nextPublished,
        isVerified: nextVerified,
        updatedAt: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      };

      recordAuditEvent('ai_knowledge_updated', 'ai_knowledge', id, { topic: serverAiKnowledge[idx].topic }, req);

      if (isApprovalRole) {
        if (nextVerified && !prevVerified) {
          recordAuditEvent('ai_knowledge_verified', 'ai_knowledge', id, { topic: serverAiKnowledge[idx].topic, approved_by: user?.email }, req);
        }
        if (nextPublished && !prevPublished) {
          recordAuditEvent('ai_knowledge_published', 'ai_knowledge', id, { topic: serverAiKnowledge[idx].topic, published_by: user?.email }, req);
        }
      }

      return res.json({ success: true, message: 'Knowledge item updated.', item: serverAiKnowledge[idx] });
    }
  }

  // Create new
  const nextVerified = isApprovalRole && isVerified !== undefined ? Boolean(isVerified) : false;
  const nextPublished = isApprovalRole && isPublished !== undefined ? Boolean(isPublished) : false;

  const newItem: ServerAiKnowledgeItem = {
    id: `k-${Date.now()}`,
    category: category || 'faqs',
    topic: topic || 'Clinic FAQ',
    questionEn: questionEn || '',
    questionUrdu: questionUrdu || '',
    questionRoman: questionRoman || '',
    answerContent: answerContent || '',
    keywords: Array.isArray(keywords) ? keywords : [],
    isPublished: nextPublished,
    isVerified: nextVerified,
    sortOrder: serverAiKnowledge.length + 1,
    updatedAt: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
  };

  serverAiKnowledge.push(newItem);

  recordAuditEvent('ai_knowledge_created', 'ai_knowledge', newItem.id, { topic: newItem.topic }, req);
  if (isApprovalRole) {
    if (nextVerified) {
      recordAuditEvent('ai_knowledge_verified', 'ai_knowledge', newItem.id, { topic: newItem.topic, approved_by: user?.email }, req);
    }
    if (nextPublished) {
      recordAuditEvent('ai_knowledge_published', 'ai_knowledge', newItem.id, { topic: newItem.topic, published_by: user?.email }, req);
    }
  }

  res.status(201).json({ success: true, message: 'Knowledge item created.', item: newItem });
});

app.delete('/api/ai/knowledge/:id', requireRole(['editor', 'admin', 'super_admin']), requireCsrf, (req, res) => {
  const { id } = req.params;
  const idx = serverAiKnowledge.findIndex(k => k.id === id);
  if (idx !== -1) {
    serverAiKnowledge.splice(idx, 1);
    return res.json({ success: true, message: 'Knowledge item removed.' });
  }
  res.status(404).json({ error: 'Item not found.' });
});

// 4. AI Sessions & Safety Logs Endpoints
app.get('/api/ai/conversations', requireRole(['admin', 'super_admin']), (req, res) => {
  res.json({
    success: true,
    sessions: serverAiSessions,
    totalCount: serverAiSessions.length,
  });
});

app.get('/api/ai/safety-logs', requireRole(['admin', 'super_admin']), (req, res) => {
  res.json({
    success: true,
    logs: serverAiSafetyLogs,
    totalCount: serverAiSafetyLogs.length,
  });
});

app.post('/api/ai/purge', requireRole(['super_admin']), requireCsrf, (req, res) => {
  serverAiSessions.length = 0;
  serverAiSafetyLogs.length = 0;
  res.json({
    success: true,
    message: 'All AI conversation sessions and safety logs have been purged.',
  });
});

// -------------------------------------------------------------
// 5. System Settings & CMS Content
// -------------------------------------------------------------
app.get('/api/settings', (req, res) => {
  res.json({ success: true, settings: serverSettings });
});

app.post(['/api/settings', '/api/admin/settings'], requireRole(['editor', 'admin', 'super_admin']), requireCsrf, requireJsonRequest, (req, res) => {
  const { key, value, group = 'general' } = req.body || {};
  if (!key) {
    return res.status(400).json({ success: false, error: 'validation_error', message: 'Setting key is required.' });
  }
  serverSettings[key] = value;
  recordAuditEvent('setting_updated', 'setting', key, { group }, req);
  res.json({ success: true, message: 'Setting saved successfully.' });
});

// -------------------------------------------------------------
// 6. User Management (Super Admin only)
// -------------------------------------------------------------
app.get('/api/admin/users', requireRole(['super_admin']), (req, res) => {
  res.json({
    success: true,
    users: serverUsers.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      status: u.status,
      phone: u.phone,
      lastLoginAt: u.lastLoginAt,
    })),
  });
});

app.post('/api/admin/users', requireRole(['super_admin']), requireCsrf, requireJsonRequest, (req, res) => {
  const { name, email, password, role = 'receptionist', phone } = req.body || {};
  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      error: 'validation_error',
      message: 'Name, email, and password are required.',
    });
  }
  const cleanEmail = email.trim().toLowerCase();
  if (serverUsers.some(u => u.email.toLowerCase() === cleanEmail)) {
    return res.status(400).json({
      success: false,
      error: 'duplicate_email',
      message: 'A staff member with this email already exists.',
    });
  }
  const newUser: ServerAuthUser = {
    id: `u-${Date.now()}`,
    name,
    email: cleanEmail,
    role: (role as any) || 'receptionist',
    status: 'active',
    phone: phone || '+92 328 0145670',
    failedAttempts: 0,
    lockoutUntil: null,
  };
  serverUsers.push(newUser);
  recordAuditEvent('user_created', 'user', newUser.id, { email: cleanEmail, role: newUser.role }, req);
  res.status(201).json({ success: true, message: 'User created successfully.', user: newUser });
});

app.put('/api/admin/users/:id', requireRole(['super_admin']), requireCsrf, requireJsonRequest, (req, res) => {
  const { id } = req.params;
  const user = serverUsers.find(u => u.id === id);
  if (!user) {
    return res.status(404).json({ success: false, error: 'not_found', message: 'User not found.' });
  }
  const { name, role, status, phone } = req.body || {};
  if (name) user.name = name;
  if (role) user.role = role;
  if (status) user.status = status;
  if (phone) user.phone = phone;
  recordAuditEvent('user_updated', 'user', id, { role: user.role, status: user.status }, req);
  res.json({ success: true, message: 'User updated successfully.', user });
});

app.delete('/api/admin/users/:id', requireRole(['super_admin']), requireCsrf, (req, res) => {
  const { id } = req.params;
  const currentUser = getSessionUser(req);
  if (currentUser && currentUser.id === id) {
    return res.status(403).json({ success: false, error: 'forbidden', message: 'Cannot delete your own account.' });
  }
  const idx = serverUsers.findIndex(u => u.id === id);
  if (idx === -1) {
    return res.status(404).json({ success: false, error: 'not_found', message: 'User not found.' });
  }
  const superAdmins = serverUsers.filter(u => u.role === 'super_admin');
  if (serverUsers[idx].role === 'super_admin' && superAdmins.length <= 1) {
    return res.status(400).json({ success: false, error: 'delete_failed', message: 'Cannot delete the last super admin account.' });
  }
  serverUsers.splice(idx, 1);
  recordAuditEvent('user_deleted', 'user', id, {}, req);
  res.json({ success: true, message: 'User deleted successfully.' });
});

// -------------------------------------------------------------
// 7. Audit Logs & Default-Deny Admin Routing
// -------------------------------------------------------------
app.get('/api/admin/audit-logs', requireRole(['super_admin']), (req, res) => {
  const limit = Math.min(200, Math.max(1, parseInt((req.query.limit as string) || '50', 10)));
  res.json({
    success: true,
    logs: serverAuditLogs.slice(0, limit),
  });
});

// Default-deny for any unclassified or unmatched /api/admin/* routes
app.all('/api/admin/*', requireRole(['admin', 'super_admin']), (req, res) => {
  res.status(404).json({
    success: false,
    error: 'not_found',
    message: 'Admin route not found.',
  });
});

// -------------------------------------------------------------
// Vite Middleware / Static Serving
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Dr. Farhan Mustafa Clinic Portal running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
