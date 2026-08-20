import { ServiceItem, FAQItem, ResourceItem, BlogPost } from '../types';

export const CLINIC_INFO = {
  doctorName: "Dr. Farhan Mustafa",
  qualifications: "FCPS, MRCP (UK)",
  title: "Consultant Physician & Internal Medicine Specialist",
  category: "Doctor / Internal Medicine",
  clinicName: "HealthPro Medical Complex",
  address: "HealthPro Medical Complex, 860-B, Block B, Faisal Town, Lahore 54000",
  fullAddress: "860-B, Block B, Faisal Town, Lahore 54000, Pakistan",
  phone: "+92 328 0145670",
  phoneDisplay: "0328 0145670",
  phoneIntl: "+923280145670",
  whatsapp: "+92 328 0145670",
  whatsappUrl: "https://wa.me/923280145670",
  googleMapsUrl: "https://maps.app.goo.gl/rAKkEXXdU1rMG2nB6",
  googlePlaceId: "ChIJm9uyDy4DGTkRjjmMdfr9aJo",
  coordinates: {
    lat: 31.4807249,
    lng: 74.3006417
  },
  plusCode: "F8J2+77 Lahore, Pakistan",
  googleRating: 5.0,
  googleReviewCount: 263,
  ratingVerifiedDate: "18 August 2026",
  profileHoursNotice: "Open 24 hours for contact & online appointment requests. In-person and video consultations are conducted by confirmed appointment.",
  consultationNotice: "Appointments are scheduled strictly by prior confirmation. Online appointment requests may be submitted anytime.",
  emergencyNotice: "If you are experiencing a life-threatening medical emergency (such as severe chest pain, sudden breathlessness, or acute trauma), please call 1122 (Rescue Pakistan) immediately or visit the nearest hospital emergency department."
};

export const ANNOUNCEMENTS = [
  {
    id: "ann-1",
    text: "Online appointment requests can be submitted 24/7. Clinic staff will contact you to confirm your slot.",
    active: true
  },
  {
    id: "ann-2",
    text: "Consulting at HealthPro Medical Complex, Faisal Town, Lahore. For inquiries, WhatsApp +92 328 0145670.",
    active: true
  }
];

export const VERIFIED_SERVICES: ServiceItem[] = [
  {
    id: "internal-medicine",
    slug: "internal-medicine-consultation",
    title: "Internal Medicine Consultation",
    category: "General Medicine",
    shortDescription: "Comprehensive diagnostic assessment and management of complex, multi-system adult medical conditions.",
    fullDescription: "Internal medicine focuses on the prevention, diagnosis, and non-surgical treatment of adult diseases. Consultations include thorough medical history evaluation, systematic physical examination, review of prior laboratory or imaging reports, and formulation of evidence-based management plans.",
    symptomsOrReasons: [
      "Unexplained fatigue, persistent weakness, or weight changes",
      "Recurrent fevers or multi-system symptoms requiring differential diagnosis",
      "Comprehensive evaluation of concurrent chronic medical conditions",
      "Preventive adult health assessments and routine medical surveillance",
      "Second opinions on diagnosis and ongoing medical treatment plans"
    ],
    whatToBring: [
      "All prior medical reports, laboratory test results, and imaging scans",
      "Complete list of current prescription medicines, supplements, and dosages",
      "Previous hospital discharge summaries or doctor notes, if available",
      "Blood pressure or blood glucose monitoring logs, if applicable"
    ],
    faqs: [
      {
        question: "What should I expect during my initial consultation?",
        answer: "A detailed clinical discussion regarding your current symptoms, medical history, physical examination, review of previous tests, and structured diagnostic or treatment recommendations."
      },
      {
        question: "How do I confirm my appointment?",
        answer: "After submitting an appointment request on this website or via WhatsApp (+92 328 0145670), clinic staff will confirm your slot based on schedule availability."
      }
    ],
    isVerified: true
  },
  {
    id: "diabetes-hypertension",
    slug: "diabetes-blood-pressure-care",
    title: "Diabetes & Blood Pressure Care",
    category: "Chronic Disease Management",
    shortDescription: "Evidence-based clinical management of Type 2 Diabetes, hypertension, and cardiovascular risk factors.",
    fullDescription: "Long-term metabolic and blood pressure control requires structured monitoring, individualized therapeutic targets, and proactive risk reduction to protect organ health including heart, kidneys, and nervous system.",
    symptomsOrReasons: [
      "Elevated or fluctuating blood pressure readings (Hypertension)",
      "High fasting blood sugar, elevated HbA1c, or newly diagnosed Type 2 Diabetes",
      "Difficulty achieving glycemic or blood pressure control on current regimen",
      "Routine screening for microvascular and cardiovascular complications",
      "Guidance on evidence-based lifestyle modifications alongside medical therapy"
    ],
    whatToBring: [
      "Recent HbA1c, lipid profile, and kidney function (Serum Creatinine/eGFR) reports",
      "Home blood pressure and glucometer logs from the past 2–4 weeks",
      "All ongoing medications including anti-diabetic and anti-hypertensive drugs"
    ],
    faqs: [
      {
        question: "How frequently should blood pressure and sugar levels be reviewed?",
        answer: "Frequency depends on current control stability. Typically, follow-ups are scheduled every 1 to 3 months until targets are stabilized, and every 3 to 6 months thereafter."
      }
    ],
    isVerified: true
  },
  {
    id: "digestive-health",
    slug: "digestive-health-consultation",
    title: "Digestive & Gastrointestinal Health",
    category: "Internal Medicine",
    shortDescription: "Diagnostic evaluation and medical management of gastrointestinal disorders, acid reflux, and liver concerns.",
    fullDescription: "Systematic medical assessment for common and complex digestive symptoms such as persistent dyspepsia, gastroesophageal reflux (GERD), abdominal discomfort, bowel irregularities, and liver function abnormalities.",
    symptomsOrReasons: [
      "Persistent acidity, heartburn, or GERD symptoms",
      "Chronic abdominal discomfort, bloating, or altered bowel habits",
      "Elevated liver enzymes (LFTs) or fatty liver assessment",
      "Post-infectious gastrointestinal symptoms and chronic gastritis management"
    ],
    whatToBring: [
      "Recent Ultrasound Abdomen reports, if performed",
      "Liver Function Tests (LFTs), CBC, or relevant endoscopy reports",
      "History of antacids, PPIs, or other gastrointestinal medications"
    ],
    faqs: [
      {
        question: "Are endoscopy procedures performed during the clinic consultation?",
        answer: "Clinic visits are for clinical assessment, diagnosis, and non-procedural medical management. If diagnostic endoscopy or specialized testing is required, appropriate referral and scheduling guidance is provided."
      }
    ],
    isVerified: true
  },
  {
    id: "general-adult-health",
    slug: "general-adult-health",
    title: "General Adult Health & Preventive Care",
    category: "Preventive Care",
    shortDescription: "Comprehensive health evaluations, routine risk screening, and proactive medical guidance for adults.",
    fullDescription: "Preventive internal medicine consultations focus on identifying early cardiovascular, metabolic, and systemic health risks before clinical complications develop.",
    symptomsOrReasons: [
      "Routine annual or periodic adult health check-ups",
      "Family history of early cardiovascular disease, diabetes, or metabolic disorders",
      "Screening for hyperlipidemia, metabolic syndrome, or nutritional deficiencies",
      "General wellness and adult vaccination guidance"
    ],
    whatToBring: [
      "Family medical history details",
      "Any previous routine baseline blood tests or cardiac evaluations (ECG, Echocardiogram)"
    ],
    faqs: [
      {
        question: "Who should schedule a preventive health consultation?",
        answer: "Any adult seeking a thorough baseline assessment, particularly individuals with family history of diabetes, hypertension, or cardiovascular conditions."
      }
    ],
    isVerified: true
  }
];

export const CLINIC_FAQS: FAQItem[] = [
  {
    id: "faq-1",
    category: "appointments",
    question: "Where is Dr. Farhan Mustafa's clinic located in Lahore?",
    answer: "Dr. Farhan Mustafa consults at HealthPro Medical Complex, 860-B, Block B, Faisal Town, Lahore 54000, Pakistan."
  },
  {
    id: "faq-2",
    category: "appointments",
    question: "How do I schedule an in-person or online consultation?",
    answer: "You can submit an appointment request through our online booking page, call +92 328 0145670, or message us directly on WhatsApp at +92 328 0145670. All appointment requests are confirmed by clinic staff."
  },
  {
    id: "faq-3",
    category: "fees",
    question: "What is the consultation fee?",
    answer: "Consultation fees depend on the appointment category (in-clinic or online video consultation) and must be confirmed directly with the clinic staff upon scheduling. We maintain full fee transparency with no hidden charges."
  },
  {
    id: "faq-4",
    category: "general",
    question: "What qualifications does Dr. Farhan Mustafa hold?",
    answer: "Dr. Farhan Mustafa is a qualified Consultant Physician and Internal Medicine Specialist holding FCPS (Fellow of the College of Physicians and Surgeons Pakistan) and MRCP (Member of the Royal College of Physicians, UK)."
  },
  {
    id: "faq-5",
    category: "appointments",
    question: "What are the clinic consultation hours?",
    answer: "Online appointment requests can be placed 24/7. Clinic consultation timings are scheduled strictly by confirmation to ensure minimal waiting times and dedicated consultation attention."
  },
  {
    id: "faq-6",
    category: "general",
    question: "Does the clinic handle acute emergency cases?",
    answer: "Our clinic provides outpatient internal medicine consultations. For acute, life-threatening medical emergencies, patients should immediately contact Rescue 1122 or visit the nearest tertiary hospital emergency department."
  }
];

export const BLOG_POSTS: BlogPost[] = [
  {
    id: "post-1",
    slug: "managing-hypertension-in-pakistan",
    title: "Understanding Hypertension: Practical Blood Pressure Management for Adults",
    publishedDate: "August 2026",
    category: "Cardiovascular Health",
    author: "Dr. Farhan Mustafa (FCPS, MRCP UK)",
    summary: "High blood pressure is often referred to as a silent condition because it develops gradually without early symptoms. Here is what adults should know about routine monitoring and lifestyle protection.",
    content: `High blood pressure (hypertension) remains one of the most widespread yet under-diagnosed chronic health conditions among adults in Pakistan. Because it frequently produces no noticeable warning signs in its early stages, regular blood pressure screening is essential for early detection.\n\n### Why Accurate Measurement Matters\nBlood pressure can fluctuate based on stress, caffeine intake, physical exertion, or anxiety during a medical visit ('white coat effect'). Establishing an accurate baseline often requires repeated measurements under relaxed, seated conditions over several days.\n\n### Core Pillars of Blood Pressure Control\n1. **Dietary Sodium Awareness:** Reducing dietary sodium intake, especially from processed foods and heavy spices.\n2. **Consistent Physical Activity:** 30 minutes of moderate aerobic activity, such as brisk walking, on most days of the week.\n3. **Medication Adherence:** If anti-hypertensive medication is prescribed, taking it consistently at the recommended times without abruptly stopping.\n4. **Routine Clinical Follow-ups:** Periodic reviews to evaluate kidney function, electrolytes, and cardiovascular wellness.`
  },
  {
    id: "post-2",
    slug: "diabetes-prevention-and-glycemic-control",
    title: "Type 2 Diabetes: Navigating Blood Sugar Control and Long-Term Wellness",
    publishedDate: "July 2026",
    category: "Metabolic Health",
    author: "Dr. Farhan Mustafa (FCPS, MRCP UK)",
    summary: "Achieving stable blood glucose levels requires a balanced partnership between individualized medical therapy, nutritional discipline, and consistent clinical surveillance.",
    content: `Type 2 Diabetes mellitus is a multi-system metabolic condition where the body becomes resistant to insulin or produces insufficient insulin. Over time, persistently elevated blood glucose can impact blood vessels throughout the body.\n\n### Understanding the HbA1c Metric\nWhile daily finger-stick blood glucose provides real-time snapshots, the HbA1c blood test measures average blood glucose control over the preceding 2 to 3 months. Individual target levels are tailored based on age, duration of diabetes, and overall health status.\n\n### Protecting Organ Health\nComprehensive diabetes care extends beyond blood sugar numbers to include blood pressure control, cholesterol management, annual kidney function screenings (Urine Microalbumin and Serum Creatinine), and regular eye examinations.`
  },
  {
    id: "post-3",
    slug: "when-to-consult-an-internal-medicine-specialist",
    title: "When Should You Consult an Internal Medicine Specialist?",
    publishedDate: "June 2026",
    category: "Internal Medicine",
    author: "Dr. Farhan Mustafa (FCPS, MRCP UK)",
    summary: "An internal medicine physician specializes in complex diagnostic evaluations, adult disease management, and the coordinated care of multiple chronic conditions.",
    content: `Internal medicine specialists (internists) are medical doctors trained to manage the full spectrum of health conditions affecting adults. From acute diagnostic challenges to long-term chronic disease coordination, internists take a comprehensive view of overall health.\n\n### Key Reasons to Seek an Internist's Evaluation\n- **Multiple Concurrent Conditions:** Managing diabetes, hypertension, and cholesterol simultaneously requires coordinated drug therapy to prevent harmful interactions.\n- **Unexplained Symptoms:** Prolonged fatigue, unexplained weight loss, or recurring fevers that require structured diagnostic investigation.\n- **Comprehensive Preventive Care:** Personalized risk assessments and health screenings based on family health history and lifestyle factors.`
  }
];

export const RESOURCES_LIST: ResourceItem[] = [
  {
    id: "res-1",
    title: "Patient Guide: Preparing for Your First Internal Medicine Consultation",
    category: "Consultation Preparation",
    readTime: "3 min read",
    publishedDate: "August 2026",
    author: "Clinical Staff Review",
    summary: "A practical checklist of previous medical reports, current medication lists, and questions to bring to your consultation.",
    content: "To make the most of your consultation with Dr. Farhan Mustafa, please gather all prior laboratory results from the past 12 months, imaging reports (ultrasound, X-rays, CT), and a written list of all current prescription medicines and over-the-counter supplements."
  },
  {
    id: "res-2",
    title: "Home Blood Pressure Monitoring Log & Protocol",
    category: "Monitoring Protocol",
    readTime: "4 min read",
    publishedDate: "August 2026",
    author: "Clinical Staff Review",
    summary: "Guidelines on how to properly measure and record your blood pressure at home before your follow-up appointment.",
    content: "Sit quietly for 5 minutes before taking a reading. Keep your feet flat on the floor and support your arm at heart level. Record readings taken in the morning before breakfast and in the evening before bed for 7 consecutive days."
  },
  {
    id: "res-3",
    title: "Understanding Routine Preventive Blood Tests for Adults",
    category: "Preventive Care",
    readTime: "5 min read",
    publishedDate: "August 2026",
    author: "Clinical Staff Review",
    summary: "An overview of common screening tests including Complete Blood Count (CBC), Lipid Profile, Fasting Blood Glucose, and Renal Function Tests.",
    content: "Routine blood tests provide valuable baseline insights into metabolic, hepatic, and renal health. Consultations help contextualize these numerical values within your overall clinical profile rather than relying solely on reference lab ranges."
  }
];
