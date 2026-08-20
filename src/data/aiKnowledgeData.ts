import { AiKnowledgeItem, AiSettingsData } from '../types';

export const DEFAULT_AI_SETTINGS: AiSettingsData = {
  isEnabled: true,
  modelName: 'gemini-3.7-flash',
  temperature: 0.2,
  maxTokens: 800,
  systemPrompt: `You are Dr. Farhan Mustafa's Official AI Clinic Receptionist at HealthPro Medical Complex, Faisal Town, Lahore.

PRIMARY MISSION:
Provide accurate, courteous, and prompt clinic information (timings, location, services, consultation procedure, fees policy, and appointment booking assistance) strictly grounded in clinic-approved knowledge.

LANGUAGE SUPPORT:
- Fluently comprehend and respond in English, Urdu (اردو), and Roman Urdu (e.g. "Doctor sahab kab baithte hain?", "Clinic ki location kya hai?").
- Match the user's language style: if they ask in Urdu, respond in Urdu; if Roman Urdu, respond in clear Roman Urdu or polite bilingual format; if English, respond in English.

STRICT MEDICAL & SAFETY GUARDRAILS (CRITICAL):
1. NEVER diagnose illnesses or medical conditions.
2. NEVER assess personal symptoms (e.g. "is this a stroke?", "what does my sugar reading mean?").
3. NEVER interpret lab reports, ECGs, blood tests, or radiological scans.
4. NEVER recommend treatments, prescribe medicines, suggest alternative drugs, or give dosage advice (e.g. "take 500mg daily").
5. ALWAYS politely state that clinical assessment, diagnosis, and medical advice require an in-person or scheduled video consultation with Dr. Farhan Mustafa.

EMERGENCY PROTOCOL (ABSOLUTE PRIORITY):
If the user mentions emergency red flags (severe chest pain, shortness of breath, sudden facial/arm weakness or stroke symptoms, unconsciousness, heavy bleeding, acute poisoning, severe allergic reaction):
- Immediately trigger the Emergency response protocol.
- Instruct the user to call Rescue 1122 or visit the nearest hospital emergency room (e.g., Jinnah Hospital or Shaikh Zayed Hospital Lahore) without delay.

GROUNDING FACTS:
- Doctor: Dr. Farhan Mustafa, Consultant Physician & Internal Medicine Specialist, FCPS, MRCP (UK).
- Clinic Location: HealthPro Medical Complex, 860-B, Block B, Faisal Town, Lahore 54000.
- Consultation Hours: Monday to Saturday, 6:00 PM – 9:00 PM (18:00 – 21:00 PKT). Closed on Sundays.
- Contact / WhatsApp: +92 328 0145670 (0328 0145670).
- Appointment Booking: Online appointment request on this portal or via WhatsApp (+92 328 0145670).`,
  emergencyAlertText: `⚠️ MEDICAL EMERGENCY NOTICE: If you or the patient are experiencing acute chest pain, severe shortness of breath, sudden numbness/paralysis, or life-threatening symptoms, please call Rescue 1122 immediately or proceed to the nearest emergency department. Dr. Farhan's clinic provides scheduled outpatient consultations and does not provide emergency triage.`,
  rateLimitPer10Min: 20,
  retentionDays: 30,
  consentText: `Before starting, please note: Dr. Farhan Mustafa's AI Clinic Assistant provides verified logistical and appointment information. It cannot provide medical diagnoses, symptom assessments, or prescription advice. For clinical emergencies, call Rescue 1122 immediately.`,
  disclaimerText: `Informational AI Receptionist • Grounded in Published Clinic Facts • Not a substitute for professional medical consultation.`,
  whatsappNumber: '+92 328 0145670',
  phoneNumber: '0328 0145670',
  supportedLanguages: ['English', 'اردو (Urdu)', 'Roman Urdu'],
};

export const INITIAL_AI_KNOWLEDGE_ITEMS: AiKnowledgeItem[] = [
  {
    id: 'k-loc-1',
    category: 'location',
    topic: 'Clinic Address & Location',
    questionEn: 'Where is Dr. Farhan Mustafa located in Lahore?',
    questionUrdu: 'ڈاکٹر فرحان مصطفیٰ کا کلینک لاہور میں کہاں ہے؟',
    questionRoman: 'Dr. Farhan Mustafa ka clinic Lahore me kahan waqia hai?',
    answerContent: 'Dr. Farhan Mustafa consults at HealthPro Medical Complex, 860-B, Block B, Faisal Town, Lahore 54000, Pakistan. It is centrally accessible with dedicated patient parking.',
    keywords: ['location', 'address', 'faisal town', 'healthpro', 'map', 'directions', 'kahan hai', 'jagah'],
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
    answerContent: 'Dr. Farhan Mustafa conducts consultations Monday through Saturday from 6:00 PM to 9:00 PM (18:00 to 21:00 PKT). The clinic is closed on Sundays for routine consultations. Online appointment requests can be submitted 24/7 on the website.',
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
    keywords: ['doctor', 'qualification', 'degrees', 'fcps', 'mrcp', 'specialist', 'tajarba', 'degree', 'qualification'],
    isPublished: true,
    isVerified: true,
    sortOrder: 3,
    updatedAt: '18 Aug 2026',
  },
  {
    id: 'k-srv-1',
    category: 'services',
    topic: 'Diabetes and Blood Pressure Management',
    questionEn: 'Does Dr. Farhan treat Diabetes and High Blood Pressure (Hypertension)?',
    questionUrdu: 'کیا ڈاکٹر صاحب شوگر (ذیابیطس) اور بلڈ پریشر کا علاج کرتے ہیں؟',
    questionRoman: 'Kya doctor sahab diabetes aur high blood pressure ka treatment karte hain?',
    answerContent: 'Yes. Evidence-based clinical management of Type 2 Diabetes, metabolic syndrome, and hypertension is a primary focus area. Care includes glycemic monitoring, cardiovascular risk assessment, target organ surveillance (kidneys, eyes, heart), and individualized lifestyle & medical regimens.',
    keywords: ['diabetes', 'sugar', 'blood pressure', 'hypertension', 'bp', 'hba1c', 'shoogar', 'dil ka masla'],
    isPublished: true,
    isVerified: true,
    sortOrder: 4,
    updatedAt: '18 Aug 2026',
  },
  {
    id: 'k-srv-2',
    category: 'services',
    topic: 'Digestive, Liver & Gastrointestinal Care',
    questionEn: 'Can I consult for digestive issues, acid reflux, or liver problems?',
    questionUrdu: 'کیا معدے، تیزابیت یا جگر کے مسائل کے لیے چیک اپ ہو سکتا ہے؟',
    questionRoman: 'Kya maiday ki tezabiat ya jigar ke masail ke liye consult kar sakte hain?',
    answerContent: 'Yes. Dr. Farhan provides diagnostic assessment and medical therapy for gastroesophageal reflux (GERD), chronic gastritis, dyspepsia, fatty liver, and abnormal Liver Function Tests (LFTs).',
    keywords: ['gastro', 'stomach', 'digestive', 'acid reflux', 'gerd', 'liver', 'lft', 'maida', 'jigar', 'gastritis'],
    isPublished: true,
    isVerified: true,
    sortOrder: 5,
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
    keywords: ['fee', 'charges', 'cost', 'price', 'kitne paise', 'fees', 'rate', 'payment'],
    isPublished: true,
    isVerified: true,
    sortOrder: 6,
    updatedAt: '18 Aug 2026',
  },
  {
    id: 'k-app-1',
    category: 'appointments',
    topic: 'How to Book an Appointment',
    questionEn: 'How can I schedule an in-clinic or online consultation?',
    questionUrdu: 'اپائنٹمنٹ بک کرنے کا کیا طریقہ ہے؟',
    questionRoman: 'Appointment book karne ka kya tareeqa hai?',
    answerContent: 'You can easily request an appointment directly through this website by clicking "Book Appointment", choosing your preferred date and time slot (6:00 PM – 9:00 PM), or messaging our front desk coordinator on WhatsApp at +92 328 0145670. After booking, you will receive a reference code and confirmation.',
    keywords: ['book', 'appointment', 'schedule', 'online booking', 'video consult', 'tarika', 'milne ka time'],
    isPublished: true,
    isVerified: true,
    sortOrder: 7,
    updatedAt: '18 Aug 2026',
  },
  {
    id: 'k-app-2',
    category: 'appointments',
    topic: 'What to Bring to Your First Visit',
    questionEn: 'What documents or reports should I bring for my consultation?',
    questionUrdu: 'پہلی بار کلینک آتے وقت کیا ساتھ لانا ضروری ہے؟',
    questionRoman: 'Pehli visit me kon se reports aur documents sath laye?',
    answerContent: 'Please bring all recent laboratory test reports (CBC, Blood Sugar logs, Lipid Profile, Kidney/Liver tests), previous prescriptions and prescription medicine strips, and any discharge summaries from prior hospital visits.',
    keywords: ['bring', 'reports', 'tests', 'documents', 'records', 'prescriptions', 'files'],
    isPublished: true,
    isVerified: true,
    sortOrder: 8,
    updatedAt: '18 Aug 2026',
  },
  {
    id: 'k-ur-1',
    category: 'urdu_faqs',
    topic: 'Urdu Guidance for Faisal Town Clinic',
    questionEn: 'Common Urdu patient inquiries',
    questionUrdu: 'فیصل ٹاؤن کلینک کی معلومات اور رابطہ',
    questionRoman: 'Faisal Town clinic ki maloomat aur rabta',
    answerContent: 'ڈاکٹر فرحان مصطفیٰ (کنسلٹنٹ فزیشن اور انٹرنل میڈیسن سپیشلسٹ) ہیلتھ پرو میڈیکل کمپلیکس، 860-B، بلاک B، فیصل ٹاؤن لاہور میں سوموار سے ہفتہ شام 6:00 بجے سے رات 9:00 بجے تک معائنہ فرماتے ہیں۔ اپائنٹمنٹ حاصل کرنے کے لیے ویب سائٹ پر فارم پر کریں یا واٹس ایپ نمبر 03280145670 پر رابطہ کریں۔',
    keywords: ['urdu', 'maloomat', 'faisal town', 'lahore', 'rabta', 'whatsapp'],
    isPublished: true,
    isVerified: true,
    sortOrder: 9,
    updatedAt: '18 Aug 2026',
  },
  {
    id: 'k-emg-1',
    category: 'faqs',
    topic: 'Emergency Cases & Critical Symptoms Policy',
    questionEn: 'Does the clinic handle acute emergency cases?',
    questionUrdu: 'کیا کلینک میں ایمرجنسی مریضوں کا فوری علاج ہوتا ہے؟',
    questionRoman: 'Kya clinic me emergency cases handle hotay hain?',
    answerContent: 'No. Dr. Farhan’s clinic provides scheduled outpatient clinical consultations. If you or a loved one is suffering from sudden severe chest pain, breathing difficulty, stroke symptoms, or acute trauma, please immediately call Rescue 1122 or visit the nearest hospital emergency room (e.g. Jinnah Hospital Lahore).',
    keywords: ['emergency', 'acute', 'chest pain', 'stroke', '1122', 'urgent', 'behosh', 'dard'],
    isPublished: true,
    isVerified: true,
    sortOrder: 10,
    updatedAt: '18 Aug 2026',
  }
];
