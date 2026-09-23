export interface QuizQuestionItem {
  id: number;
  topic: string;
  question: string;
  options: string[];
  correctAnswer: number; // 0-based index: 0=A, 1=B, 2=C, 3=D
  correctLetter: 'A' | 'B' | 'C' | 'D';
  explanation: string;
}

export const QUIZ_QUESTIONS: QuizQuestionItem[] = [
  {
    id: 1,
    topic: 'HIPAA Privacy Rule',
    question: 'Under the HIPAA Privacy Rule, what does the "Minimum Necessary" standard require covered entities and business associates to do?',
    options: [
      'Share all available medical records with any requesting healthcare provider without redaction',
      'Limit the use, disclosure, and requests of Protected Health Information (PHI) to only what is necessary to accomplish the intended purpose',
      'Withhold patient records from patients until they sign a formal liability waiver',
      'Retain patient records for a minimum of 20 years before archiving',
    ],
    correctAnswer: 1,
    correctLetter: 'B',
    explanation: 'The Minimum Necessary standard requires covered entities to evaluate their practices and enhance safeguards to limit unnecessary or inappropriate access to and disclosure of PHI.',
  },
  {
    id: 2,
    topic: 'Security Rule Safeguards',
    question: 'Which of the following is considered an Administrative Safeguard under the HIPAA Security Rule?',
    options: [
      'Facility security plans and physical door access controls',
      'Automatic workstation logoff and end-to-end data encryption',
      'Conducting regular security risk assessments and mandatory workforce compliance training',
      'Installing physical fire suppression systems in on-premise server rooms',
    ],
    correctAnswer: 2,
    correctLetter: 'C',
    explanation: 'Administrative Safeguards govern administrative actions, policies, and procedures such as conducting risk analysis, sanction policies, and workforce security training.',
  },
  {
    id: 3,
    topic: 'Breach Notification Rule',
    question: 'Under the HIPAA Breach Notification Rule, within how many calendar days must a covered entity notify affected individuals following the discovery of a breach of unsecured PHI affecting 500 or more individuals?',
    options: [
      'Within 15 calendar days',
      'Within 30 calendar days',
      'Within 60 calendar days without unreasonable delay',
      'At the end of the annual calendar year',
    ],
    correctAnswer: 2,
    correctLetter: 'C',
    explanation: 'Covered entities must notify affected individuals without unreasonable delay and in no case later than 60 calendar days after discovering a breach of unsecured PHI.',
  },
  {
    id: 4,
    topic: 'Business Associate Agreements (BAA)',
    question: 'When is a healthcare organization legally required to execute a Business Associate Agreement (BAA)?',
    options: [
      'Only when contracting with non-clinical physical maintenance and janitorial services',
      'Before disclosing PHI to a third-party vendor or software provider that creates, receives, maintains, or transmits PHI on its behalf',
      'Whenever consulting directly with another licensed physician for treatment purposes',
      'Only after a security incident or data breach has occurred with a vendor',
    ],
    correctAnswer: 1,
    correctLetter: 'B',
    explanation: 'A BAA is legally required before allowing any third-party vendor access to PHI when performing services or functions on behalf of a covered entity.',
  },
  {
    id: 5,
    topic: 'OCR Enforcement & Audits',
    question: 'What is the primary role of the HHS Office for Civil Rights (OCR) regarding healthcare compliance?',
    options: [
      'Setting pharmaceutical prices and establishing private health insurance reimbursement rates',
      'Enforcing the HIPAA Privacy, Security, and Breach Notification Rules through investigations, audits, and monetary penalties',
      'Issuing state medical licenses and managing physician clinical evaluations',
      'Managing federal hospital construction and infrastructure grants',
    ],
    correctAnswer: 1,
    correctLetter: 'B',
    explanation: 'The HHS Office for Civil Rights (OCR) enforces HIPAA compliance through audits, complaint investigations, corrective action plans, and civil monetary penalties.',
  },
  {
    id: 6,
    topic: 'Patient Rights & Access to Records',
    question: 'Under HIPAA regulations, what is the maximum standard timeframe for a covered entity to fulfill an individual’s formal request for copies of their medical records?',
    options: [
      '30 calendar days (with a single permitted 30-day extension if justified in writing)',
      '90 business days from the date the request is processed',
      '14 calendar days with no allowable extensions under any circumstances',
      'Indefinitely until an administrative processing fee is paid in full',
    ],
    correctAnswer: 0,
    correctLetter: 'A',
    explanation: 'HIPAA requires covered entities to provide access within 30 calendar days of the request, with a single 30-day extension allowed when reasons for delay are provided in writing.',
  },
  {
    id: 7,
    topic: 'AI & PHI Risk Management',
    question: 'When integrating Artificial Intelligence (AI) tools or Large Language Models into healthcare operations, what is essential for maintaining HIPAA compliance?',
    options: [
      'AI tools are automatically exempt from HIPAA regulations as modern technology solutions',
      'PHI must only be entered into AI platforms with an executed BAA and verified technical safeguards preventing unauthorized secondary data training or exposure',
      'Free public AI chatbots can be used for clinical summaries if patient last names are omitted',
      'HIPAA does not apply to electronic data processed by automated algorithms',
    ],
    correctAnswer: 1,
    correctLetter: 'B',
    explanation: 'Using AI with PHI requires rigorous risk assessment, technical safeguards, and an executed BAA with the AI vendor prohibiting unauthorized secondary use or data retention.',
  },
  {
    id: 8,
    topic: 'Compliance Leadership & Reporting',
    question: 'According to OIG compliance guidance, which of the following is a fundamental element of an effective healthcare compliance program?',
    options: [
      'Updating compliance policies once every ten years',
      'Designating a compliance officer, establishing ongoing training, and maintaining confidential, non-retaliatory reporting channels',
      'Limiting compliance knowledge and audit findings exclusively to senior executive management',
      'Conducting internal reviews only when formally requested by federal authorities',
    ],
    correctAnswer: 1,
    correctLetter: 'B',
    explanation: 'The OIG outlines 7 core elements including designated compliance leadership, ongoing monitoring, written standards, and clear anonymous reporting channels without fear of retaliation.',
  },
];
