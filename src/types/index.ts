export type PublicationStatus = 'draft' | 'published' | 'needs_verification';

export type UserRole = 'super_admin' | 'admin' | 'receptionist' | 'editor';

export interface CMSUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'active' | 'inactive';
  phone?: string;
  lastLogin?: string;
}

export interface ServiceItem {
  id: string;
  slug: string;
  title: string;
  category: string;
  shortDescription: string;
  fullDescription: string;
  symptomsOrReasons: string[];
  whatToBring: string[];
  faqs: { question: string; answer: string }[];
  isVerified: boolean;
  status?: PublicationStatus;
  sortOrder?: number;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'general' | 'appointments' | 'fees' | 'services';
  status?: PublicationStatus;
}

export interface ResourceItem {
  id: string;
  title: string;
  category: string;
  readTime: string;
  publishedDate: string;
  author: string;
  summary: string;
  content: string;
  downloadUrl?: string;
  status?: PublicationStatus;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  publishedDate: string;
  category: string;
  summary: string;
  content: string;
  author: string;
  status?: PublicationStatus;
  featuredImage?: string;
}

export interface FactVerificationItem {
  id: string;
  factKey: string;
  category: string;
  title: string;
  description: string;
  currentValue: string;
  suggestedValue: string;
  sourceReference: string;
  status: 'pending_verification' | 'verified' | 'needs_doctor_approval' | 'rejected';
  verifiedBy?: string;
  verifiedAt?: string;
  adminNotes?: string;
}

export interface FeeItem {
  id: string;
  serviceName: string;
  consultationType: 'in-clinic' | 'online' | 'follow-up' | 'emergency';
  amountPkr: string;
  isCustomQuote: boolean;
  notes: string;
  validityDays: number;
  status: PublicationStatus;
}

export interface ScheduleItem {
  id: string;
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  consultationType: 'in-clinic' | 'online';
  startTime: string;
  endTime: string;
  isActive: boolean;
  notes: string;
  status: PublicationStatus;
}

export interface ReviewItem {
  id: string;
  patientName: string;
  rating: number;
  reviewText: string;
  source: 'google' | 'direct' | 'portal';
  reviewDate: string;
  isVerified: boolean;
  isFeatured: boolean;
  status: PublicationStatus;
}

export type AppointmentStatus =
  | 'new'
  | 'confirmed'
  | 'rescheduled'
  | 'checked_in'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export interface AppointmentHistoryItem {
  id: string;
  appointmentId: string;
  previousStatus?: string | null;
  newStatus: AppointmentStatus | string;
  actionType: 'created' | 'confirmed' | 'rescheduled' | 'checked_in' | 'completed' | 'cancelled' | 'no_show' | 'note_added' | 'status_update' | 'intake_saved' | string;
  notes?: string;
  changedBy: string;
  createdAt: string;
}

export interface StaffNoteItem {
  id: string;
  appointmentId: string;
  staffId?: string;
  staffName: string;
  note: string;
  isInternal: boolean;
  createdAt: string;
}

export interface AppointmentTypeItem {
  id: string;
  slug: string;
  name: string;
  category: 'in-clinic' | 'online' | 'follow-up' | 'specialized';
  durationMinutes: number;
  feeAmountPkr: string;
  description: string;
  isActive: boolean;
  sortOrder?: number;
}

export interface AvailabilityRuleItem {
  id: string;
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
  maxPatientsPerSlot: number;
  consultationType: 'in-clinic' | 'online' | 'both';
  isActive: boolean;
}

export interface ClinicBreakItem {
  id: string;
  dayOfWeek: string;
  breakName: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export interface ClinicHolidayItem {
  id: string;
  holidayDate: string;
  title: string;
  description?: string;
  isClosed: boolean;
}

export interface BlockedSlotItem {
  id: string;
  blockDate: string;
  startTime: string;
  endTime: string;
  reason: string;
  createdBy?: string;
  createdAt?: string;
}

export interface SmtpSettingsData {
  id?: string;
  host: string;
  port: number;
  encryption: 'tls' | 'ssl' | 'none';
  username: string;
  password?: string;
  fromEmail: string;
  fromName: string;
  isActive: boolean;
  isConfigured?: boolean;
  warning?: string | null;
  notifyStaffOnNew: boolean;
  staffNotificationEmail: string;
}

export interface AppointmentRecord {
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
  status: AppointmentStatus;
  rescheduledDate?: string;
  rescheduledTimeSlot?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt?: string;
  adminNotes?: string;
  history?: AppointmentHistoryItem[];
  staffNotes?: StaffNoteItem[];
  // Pre-Visit Intake fields
  visitReason?: string;
  symptomDuration?: string;
  existingConditions?: string;
  currentMedicines?: string;
  knownAllergies?: string;
  intakeNotes?: string;
  intakeSubmittedAt?: string;
}

export interface ContactMessageRecord {
  id: string;
  name: string;
  phone: string;
  email?: string;
  subject: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  adminReply?: string;
}

export interface DoctorProfileData {
  name: string;
  title: string;
  qualifications: string;
  pmdcNumber: string;
  specialty: string;
  experienceSummary: string;
  clinicalPhilosophy: string;
  bioFull: string;
  photoUrl?: string;
  status: PublicationStatus;
}

export interface CredentialItem {
  id: string;
  title: string;
  credentialType: 'degree' | 'fellowship' | 'membership' | 'registration' | 'award';
  institution: string;
  year: string;
  verificationCode?: string;
  status: PublicationStatus;
}

export interface AnnouncementItem {
  id: string;
  text: string;
  linkUrl?: string;
  linkLabel?: string;
  badgeText?: string;
  active: boolean;
  status?: PublicationStatus;
}

export interface PageContentItem {
  id: string;
  slug: string;
  title: string;
  headerTitle: string;
  headerSubtitle: string;
  contentHtml: string;
  metaTitle: string;
  metaDescription: string;
  status: PublicationStatus;
}

export interface HomepageSectionItem {
  id: string;
  sectionKey: string;
  sectionName: string;
  heading: string;
  subheading: string;
  bodyContent: string;
  ctaLabel?: string;
  ctaLink?: string;
  isVisible: boolean;
  status: PublicationStatus;
}

export type PageId =
  | 'home'
  | 'about'
  | 'services'
  | 'service-detail'
  | 'appointments'
  | 'fees'
  | 'patient-forms'
  | 'resources'
  | 'reviews'
  | 'blog'
  | 'contact'
  | 'privacy'
  | 'terms'
  | 'disclaimer'
  | 'admin';

// -------------------------------------------------------------
// Phase 4: AI Receptionist Types & Safety Audit Definitions
// -------------------------------------------------------------

export type AiLanguage = 'en' | 'ur' | 'roman_ur' | 'auto';

export type AiKnowledgeCategory =
  | 'location'
  | 'timings'
  | 'fees'
  | 'services'
  | 'doctor'
  | 'appointments'
  | 'faqs'
  | 'urdu_faqs';

export interface AiKnowledgeItem {
  id: string;
  category: AiKnowledgeCategory;
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

export interface AiSettingsData {
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

export interface AiQuickAction {
  label: string;
  actionType: 'navigate' | 'external_url' | 'tel' | 'whatsapp' | 'book_modal';
  payload: string;
}

export interface AiMessageRecord {
  id: string;
  sender: 'ai' | 'user' | 'system';
  text: string;
  timestamp: string;
  isEmergency?: boolean;
  detectedLanguage?: AiLanguage | string;
  safetyFlag?: 'clean' | 'emergency' | 'medical_advice_refusal' | 'dosage_query' | 'injection_attempt';
  quickActions?: AiQuickAction[];
}

export interface AiConversationSession {
  id: string;
  sessionId: string;
  startedAt: string;
  lastActivityAt: string;
  messageCount: number;
  userLanguage: string;
  triageFlag: 'clean' | 'emergency' | 'medical_advice_refusal' | 'booking_intent' | 'rate_limited';
  isEscalated: boolean;
  escalationType?: 'none' | 'whatsapp' | 'call' | 'rescue_1122' | 'appointment_modal';
  messages: AiMessageRecord[];
}

export interface AiSafetyLogRecord {
  id: string;
  sessionId: string;
  timestamp: string;
  triggerType: 'emergency_symptoms' | 'medical_diagnosis_attempt' | 'dosage_inquiry' | 'prompt_injection' | 'rate_limit_exceeded';
  userQuery: string;
  actionTaken: 'emergency_banner_displayed' | 'medical_refusal_rendered' | 'rate_limit_applied' | 'blocked';
  ipAddress?: string;
}

