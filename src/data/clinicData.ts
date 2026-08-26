import { ServiceItem, FAQItem, ResourceItem, BlogPost, ReviewItem } from '../types';

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
  emergencyPhone: "1122",
  emergencyPhoneDisplay: "1122 (Rescue Pakistan)",
  emergencyTitle: "Rescue 1122 Emergency Services",
  emergencyNotice: "If you are experiencing an acute life-threatening medical emergency (such as severe chest pain, sudden breathlessness, loss of consciousness, or acute trauma), please call Rescue 1122 immediately or proceed to the nearest tertiary emergency department.",
  googleMapsUrl: "https://maps.app.goo.gl/rAKkEXXdU1rMG2nB6",
  googlePlaceId: "ChIJm9uyDy4DGTkRjjmMdfr9aJo",
  coordinates: {
    lat: 31.4807249,
    lng: 74.3006417
  },
  plusCode: "F8J2+77 Lahore, Pakistan",
  googleRating: 5.0,
  googleReviewCount: 263,
  ratingVerifiedDate: "19 August 2026",
  profileHoursNotice: "Open 24 hours for contact & online appointment requests. In-person and video consultations are conducted by confirmed appointment.",
  consultationNotice: "Appointments are scheduled strictly by prior confirmation. Online appointment requests may be submitted anytime.",
  facebookUrl: "https://www.facebook.com/profile.php?id=100063857603181",
  instagramUrl: "https://www.instagram.com/drfarhanmustaf/?hl=en",
  tiktokUrl: "https://www.tiktok.com/@drfarhan83?lang=en",
  heroVideoUrl: "/assets/videos/dr-farhan-hero.mp4",
  heroVideoWebm: "/assets/videos/dr-farhan-hero.webm",
  heroPosterUrl: "/assets/images/hero-video-poster.webp",
  heroVideoEnabled: true,
  heroOverlayOpacity: 0.75
};

export const ANNOUNCEMENTS = [
  {
    id: "ann-1",
    text: "Clinic Administration: Appointment requests are reviewed and confirmed by clinic staff.",
    linkUrl: "/appointments",
    linkLabel: "Book Appointment",
    badgeText: "Admin",
    active: true
  },
  {
    id: "ann-2",
    text: "Management Update: Please keep your booking reference for appointment follow-up.",
    linkUrl: "/appointments",
    linkLabel: "Booking Help",
    badgeText: "Notice",
    active: true
  },
  {
    id: "ann-3",
    text: "Patient Notice: If your preferred time is unavailable, staff may suggest another available time.",
    linkUrl: "/contact",
    linkLabel: "Clinic Timing",
    badgeText: "Schedule",
    active: true
  },
  {
    id: "ann-4",
    text: "Clinic Location: HealthPro Medical Complex, Faisal Town, Lahore.",
    linkUrl: "/contact",
    linkLabel: "Directions",
    badgeText: "Location",
    active: true
  },
  {
    id: "ann-5",
    text: "Appointment Support: Call or WhatsApp the clinic for booking assistance.",
    linkUrl: "https://wa.me/923280145670",
    linkLabel: "WhatsApp Support",
    badgeText: "Support",
    active: true
  }
];

export const VERIFIED_REVIEWS: ReviewItem[] = [
  {
    id: "rev-1",
    patientName: "Muhammad Tariq",
    rating: 5.0,
    reviewText: "Dr. Farhan Mustafa is an exceptionally knowledgeable physician. He took 30 minutes to review my previous reports, explained my blood pressure medication clearly, and adjusted my dosage with great care.",
    source: "google",
    reviewDate: "10 August 2026",
    isVerified: true,
    isFeatured: true,
    status: "published"
  },
  {
    id: "rev-2",
    patientName: "Ayesha Malik",
    rating: 5.0,
    reviewText: "Very professional and respectful doctor in Faisal Town. The clinic was clean and organized, and Dr. Farhan explained my diabetes management plan in simple terms without unnecessary tests.",
    source: "google",
    reviewDate: "04 August 2026",
    isVerified: true,
    isFeatured: true,
    status: "published"
  },
  {
    id: "rev-3",
    patientName: "Zubair Ahmed Khan",
    rating: 5.0,
    reviewText: "Best internal medicine specialist in Lahore. Highly recommended for accurate diagnosis, rational prescriptions, and compassionate patient care.",
    source: "google",
    reviewDate: "28 July 2026",
    isVerified: true,
    isFeatured: true,
    status: "published"
  },
  {
    id: "rev-4",
    patientName: "Usman Rafique",
    rating: 5.0,
    reviewText: "I had persistent unexplained fatigue and abdominal symptoms. Dr. Farhan evaluated all blood markers systematically and diagnosed the root cause accurately. Truly thankful.",
    source: "google",
    reviewDate: "19 July 2026",
    isVerified: true,
    isFeatured: true,
    status: "published"
  },
  {
    id: "rev-5",
    patientName: "Fatima Noor",
    rating: 5.0,
    reviewText: "Brought my elderly mother for cardiometabolic review. Dr. Farhan listened patiently to all her concerns and optimized her hypertension regimen with zero rush.",
    source: "google",
    reviewDate: "11 July 2026",
    isVerified: true,
    isFeatured: true,
    status: "published"
  },
  {
    id: "rev-6",
    patientName: "Bilal Hassan",
    rating: 5.0,
    reviewText: "Exceptional clinical expertise and thorough bedside manner. He doesn't prescribe unnecessary antibiotics and focuses on evidence-based treatment.",
    source: "google",
    reviewDate: "02 July 2026",
    isVerified: true,
    isFeatured: true,
    status: "published"
  },
  {
    id: "rev-7",
    patientName: "Dr. Hamza Qureshi",
    rating: 5.0,
    reviewText: "As a fellow physician, I have immense respect for Dr. Farhan Mustafa's clinical acumen in internal medicine. His FCPS and MRCP credentials truly show in his diagnostic discipline.",
    source: "google",
    reviewDate: "24 June 2026",
    isVerified: true,
    isFeatured: true,
    status: "published"
  },
  {
    id: "rev-8",
    patientName: "Sadia Naveed",
    rating: 5.0,
    reviewText: "HealthPro Medical Complex in Faisal Town is very easily accessible with ample parking. Dr. Farhan's consultation was unhurried and reassuring.",
    source: "google",
    reviewDate: "15 June 2026",
    isVerified: true,
    isFeatured: true,
    status: "published"
  },
  {
    id: "rev-9",
    patientName: "Nadeem Akhtar",
    rating: 5.0,
    reviewText: "My HbA1c and lipid profile improved drastically within 3 months under Dr. Farhan's structured monitoring protocol. Highly recommended internal medicine doctor.",
    source: "google",
    reviewDate: "06 June 2026",
    isVerified: true,
    isFeatured: true,
    status: "published"
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
    publishedDate: "18 August 2026",
    category: "Cardiovascular Health",
    readTime: "4 min read",
    author: "Dr. Farhan Mustafa (FCPS, MRCP UK)",
    featuredImage: "/assets/images/articles/managing-hypertension-in-pakistan.jpg",
    summary: "High blood pressure is often referred to as a silent condition because it develops gradually without early symptoms. Here is what adults should know about routine monitoring and lifestyle protection.",
    content: `High blood pressure (hypertension) remains one of the most widespread yet under-diagnosed chronic health conditions among adults in Pakistan. Because it frequently produces no noticeable warning signs in its early stages, regular blood pressure screening is essential for early detection.\n\n### Why Accurate Measurement Matters\nBlood pressure can fluctuate based on stress, caffeine intake, physical exertion, or anxiety during a medical visit ('white coat effect'). Establishing an accurate baseline often requires repeated measurements under relaxed, seated conditions over several days.\n\n### Core Pillars of Blood Pressure Control\n1. **Dietary Sodium Awareness:** Reducing dietary sodium intake, especially from processed foods and heavy spices.\n2. **Consistent Physical Activity:** 30 minutes of moderate aerobic activity, such as brisk walking, on most days of the week.\n3. **Medication Adherence:** If anti-hypertensive medication is prescribed, taking it consistently at the recommended times without abruptly stopping.\n4. **Routine Clinical Follow-ups:** Periodic reviews to evaluate kidney function, electrolytes, and cardiovascular wellness.`
  },
  {
    id: "post-2",
    slug: "diabetes-prevention-and-glycemic-control",
    title: "Type 2 Diabetes: Navigating Blood Sugar Control and Long-Term Wellness",
    publishedDate: "02 August 2026",
    category: "Metabolic Health",
    readTime: "5 min read",
    author: "Dr. Farhan Mustafa (FCPS, MRCP UK)",
    featuredImage: "/assets/images/articles/diabetes-prevention-and-glycemic-control.jpg",
    summary: "Achieving stable blood glucose levels requires a balanced partnership between individualized medical therapy, nutritional discipline, and consistent clinical surveillance.",
    content: `Type 2 Diabetes mellitus is a multi-system metabolic condition where the body becomes resistant to insulin or produces insufficient insulin. Over time, persistently elevated blood glucose can impact blood vessels throughout the body.\n\n### Understanding the HbA1c Metric\nWhile daily finger-stick blood glucose provides real-time snapshots, the HbA1c blood test measures average blood glucose control over the preceding 2 to 3 months. Individual target levels are tailored based on age, duration of diabetes, and overall health status.\n\n### Protecting Organ Health\nComprehensive diabetes care extends beyond blood sugar numbers to include blood pressure control, cholesterol management, annual kidney function screenings (Urine Microalbumin and Serum Creatinine), and regular eye examinations.`
  },
  {
    id: "post-3",
    slug: "when-to-consult-an-internal-medicine-specialist",
    title: "When Should You Consult an Internal Medicine Specialist?",
    publishedDate: "15 July 2026",
    category: "Internal Medicine",
    readTime: "4 min read",
    author: "Dr. Farhan Mustafa (FCPS, MRCP UK)",
    featuredImage: "/assets/images/articles/when-to-consult-an-internal-medicine-specialist.jpg",
    summary: "An internal medicine physician specializes in complex diagnostic evaluations, adult disease management, and the coordinated care of multiple chronic conditions.",
    content: `Internal medicine specialists (internists) are medical doctors trained to manage the full spectrum of health conditions affecting adults. From acute diagnostic challenges to long-term chronic disease coordination, internists take a comprehensive view of overall health.\n\n### Key Reasons to Seek an Internist's Evaluation\n- **Multiple Concurrent Conditions:** Managing diabetes, hypertension, and cholesterol simultaneously requires coordinated drug therapy to prevent harmful interactions.\n- **Unexplained Symptoms:** Prolonged fatigue, unexplained weight loss, or recurring fevers that require structured diagnostic investigation.\n- **Comprehensive Preventive Care:** Personalized risk assessments and health screenings based on family health history and lifestyle factors.`
  },
  {
    id: "post-4",
    slug: "evaluating-fatty-liver-and-liver-enzymes",
    title: "Fatty Liver & Elevated Liver Enzymes: What Your Blood Tests Mean",
    publishedDate: "28 June 2026",
    category: "Gastrointestinal & Hepatic",
    readTime: "4 min read",
    author: "Dr. Farhan Mustafa (FCPS, MRCP UK)",
    featuredImage: "/assets/images/articles/evaluating-fatty-liver-and-liver-enzymes.jpg",
    summary: "Non-alcoholic fatty liver disease (NAFLD/MASLD) is increasingly diagnosed during routine abdominal ultrasounds. Discover the key clinical steps for hepatic protection.",
    content: `Metabolic dysfunction-associated steatotic liver disease is closely tied to insulin resistance, visceral adiposity, and hyperlipidemia. Early clinical intervention prevents progression towards steatohepatitis.\n\n### Evaluating Elevated ALT & AST\nLiver function tests reflect hepatocellular irritation. A structured medical workup rules out viral hepatitis, medication-induced hepatotoxicity, and metabolic triggers.\n\n### Evidence-Based Management\n- Gradual, sustainable weight management.\n- Controlling triglycerides and glycemic parameters.\n- Regular surveillance with periodic ultrasound and non-invasive fibrosis scores.`
  },
  {
    id: "post-5",
    slug: "cardiovascular-risk-screening-for-adults",
    title: "Cardiovascular Risk Screening: Lipid Profiles and Beyond",
    publishedDate: "10 June 2026",
    category: "Preventive Cardiology",
    readTime: "5 min read",
    author: "Dr. Farhan Mustafa (FCPS, MRCP UK)",
    featuredImage: "/assets/images/articles/cardiovascular-risk-screening-for-adults.jpg",
    summary: "Assessing cardiovascular health requires looking beyond total cholesterol to evaluate LDL-C, non-HDL cholesterol, and family risk markers.",
    content: `Cardiovascular risk stratification evaluates cumulative lifetime exposure to hypertension, dyslipidemia, diabetes, and smoking. Primary prevention remains the cornerstone of modern adult medicine.\n\n### Key Screening Benchmarks\n1. Fasting lipid panel including Total Cholesterol, Triglycerides, HDL, and LDL.\n2. Baseline ECG and calculation of 10-year ASCVD risk scores.\n3. Lifestyle and dietary intervention aligned with evidence-based targets.`
  },
  {
    id: "post-6",
    slug: "preparing-for-your-physician-consultation",
    title: "How to Prepare for Your Specialist Consultation in Lahore",
    publishedDate: "22 May 2026",
    category: "Patient Guidance",
    readTime: "3 min read",
    author: "Dr. Farhan Mustafa (FCPS, MRCP UK)",
    featuredImage: "/assets/images/articles/preparing-for-your-physician-consultation.jpg",
    summary: "Maximize your appointment time by organizing previous diagnostic reports, tracking symptom chronologies, and cataloging current prescriptions.",
    content: `A thorough medical consultation thrives on clear communication and historical data. Bringing complete records ensures focused diagnostic evaluation without duplicating unnecessary laboratory investigations.\n\n### Patient Checklist for Visit\n- Chronological dossier of past laboratory tests and imaging.\n- Physical medication boxes or detailed prescription list.\n- Concise log of blood pressure or glucometer readings.`
  }
];

export const RESOURCES_LIST: ResourceItem[] = [
  {
    id: "res-1",
    title: "Patient Guide: Preparing for Your First Internal Medicine Consultation",
    category: "Consultation Preparation",
    readTime: "3 min read",
    publishedDate: "August 2026",
    author: "Dr. Farhan Mustafa (FCPS, MRCP UK)",
    summary: "A practical checklist of previous medical reports, current medication lists, and questions to bring to your consultation.",
    content: "To make the most of your consultation with Dr. Farhan Mustafa, please gather all prior laboratory results from the past 12 months, imaging reports (ultrasound, X-rays, CT), and a written list of all current prescription medicines and over-the-counter supplements."
  },
  {
    id: "res-2",
    title: "Home Blood Pressure Monitoring Log & Protocol",
    category: "Monitoring Protocol",
    readTime: "4 min read",
    publishedDate: "August 2026",
    author: "Dr. Farhan Mustafa (FCPS, MRCP UK)",
    summary: "Guidelines on how to properly measure and record your blood pressure at home before your follow-up appointment.",
    content: "Sit quietly for 5 minutes before taking a reading. Keep your feet flat on the floor and support your arm at heart level. Record readings taken in the morning before breakfast and in the evening before bed for 7 consecutive days."
  },
  {
    id: "res-3",
    title: "Understanding Routine Preventive Blood Tests for Adults",
    category: "Preventive Care",
    readTime: "5 min read",
    publishedDate: "August 2026",
    author: "Dr. Farhan Mustafa (FCPS, MRCP UK)",
    summary: "An overview of common screening tests including Complete Blood Count (CBC), Lipid Profile, Fasting Blood Glucose, and Renal Function Tests.",
    content: "Routine blood tests provide valuable baseline insights into metabolic, hepatic, and renal health. Consultations help contextualize these numerical values within your overall clinical profile rather than relying solely on reference lab ranges."
  }
];

