'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getWebinarById, getWebinars } from '../../api/webinarApi';
import '../../styles/compliance-check.css';

const COMPLIANCE_QUESTIONS = [
  {
    id: 1,
    topic: 'HIPAA Privacy Rule',
    question: 'Under the HIPAA Privacy Rule, what does the "Minimum Necessary" standard require covered entities and business associates to do?',
    options: [
      'Share all available medical records with any requesting healthcare provider without redaction',
      'Limit the use, disclosure, and requests of Protected Health Information (PHI) to only what is necessary to accomplish the intended purpose',
      'Withhold patient records from patients until they sign a formal liability waiver',
      'Retain patient records for a minimum of 20 years before archiving'
    ],
    correctAnswer: 1,
    explanation: 'The Minimum Necessary standard requires covered entities to evaluate their practices and enhance safeguards to limit unnecessary or inappropriate access to and disclosure of PHI.'
  },
  {
    id: 2,
    topic: 'Security Rule Safeguards',
    question: 'Which of the following is considered an Administrative Safeguard under the HIPAA Security Rule?',
    options: [
      'Facility security plans and physical door access controls',
      'Automatic workstation logoff and end-to-end data encryption',
      'Conducting regular security risk assessments and mandatory workforce compliance training',
      'Installing physical fire suppression systems in on-premise server rooms'
    ],
    correctAnswer: 2,
    explanation: 'Administrative Safeguards govern administrative actions, policies, and procedures such as conducting risk analysis, sanction policies, and workforce security training.'
  },
  {
    id: 3,
    topic: 'Breach Notification Rule',
    question: 'Under the HIPAA Breach Notification Rule, within how many calendar days must a covered entity notify affected individuals following the discovery of a breach of unsecured PHI affecting 500 or more individuals?',
    options: [
      'Within 15 calendar days',
      'Within 30 calendar days',
      'Within 60 calendar days without unreasonable delay',
      'At the end of the annual calendar year'
    ],
    correctAnswer: 2,
    explanation: 'Covered entities must notify affected individuals without unreasonable delay and in no case later than 60 calendar days after discovering a breach of unsecured PHI.'
  },
  {
    id: 4,
    topic: 'Business Associate Agreements (BAA)',
    question: 'When is a healthcare organization legally required to execute a Business Associate Agreement (BAA)?',
    options: [
      'Only when contracting with non-clinical physical maintenance and janitorial services',
      'Before disclosing PHI to a third-party vendor or software provider that creates, receives, maintains, or transmits PHI on its behalf',
      'Whenever consulting directly with another licensed physician for treatment purposes',
      'Only after a security incident or data breach has occurred with a vendor'
    ],
    correctAnswer: 1,
    explanation: 'A BAA is legally required before allowing any third-party vendor access to PHI when performing services or functions on behalf of a covered entity.'
  },
  {
    id: 5,
    topic: 'OCR Enforcement & Audits',
    question: 'What is the primary role of the HHS Office for Civil Rights (OCR) regarding healthcare compliance?',
    options: [
      'Setting pharmaceutical prices and establishing private health insurance reimbursement rates',
      'Enforcing the HIPAA Privacy, Security, and Breach Notification Rules through investigations, audits, and monetary penalties',
      'Issuing state medical licenses and managing physician clinical evaluations',
      'Managing federal hospital construction and infrastructure grants'
    ],
    correctAnswer: 1,
    explanation: 'The HHS Office for Civil Rights (OCR) enforces HIPAA compliance through audits, complaint investigations, corrective action plans, and civil monetary penalties.'
  },
  {
    id: 6,
    topic: 'Patient Rights & Access to Records',
    question: 'Under HIPAA regulations, what is the maximum standard timeframe for a covered entity to fulfill an individual’s formal request for copies of their medical records?',
    options: [
      '30 calendar days (with a single permitted 30-day extension if justified in writing)',
      '90 business days from the date the request is processed',
      '14 calendar days with no allowable extensions under any circumstances',
      'Indefinitely until an administrative processing fee is paid in full'
    ],
    correctAnswer: 0,
    explanation: 'HIPAA requires covered entities to provide access within 30 calendar days of the request, with a single 30-day extension allowed when reasons for delay are provided in writing.'
  },
  {
    id: 7,
    topic: 'AI & PHI Risk Management',
    question: 'When integrating Artificial Intelligence (AI) tools or Large Language Models into healthcare operations, what is essential for maintaining HIPAA compliance?',
    options: [
      'AI tools are automatically exempt from HIPAA regulations as modern technology solutions',
      'PHI must only be entered into AI platforms with an executed BAA and verified technical safeguards preventing unauthorized secondary data training or exposure',
      'Free public AI chatbots can be used for clinical summaries if patient last names are omitted',
      'HIPAA does not apply to electronic data processed by automated algorithms'
    ],
    correctAnswer: 1,
    explanation: 'Using AI with PHI requires rigorous risk assessment, technical safeguards, and an executed BAA with the AI vendor prohibiting unauthorized secondary use or data retention.'
  },
  {
    id: 8,
    topic: 'Compliance Leadership & Reporting',
    question: 'According to OIG compliance guidance, which of the following is a fundamental element of an effective healthcare compliance program?',
    options: [
      'Updating compliance policies once every ten years',
      'Designating a compliance officer, establishing ongoing training, and maintaining confidential, non-retaliatory reporting channels',
      'Limiting compliance knowledge and audit findings exclusively to senior executive management',
      'Conducting internal reviews only when formally requested by federal authorities'
    ],
    correctAnswer: 1,
    explanation: 'The OIG outlines 7 core elements including designated compliance leadership, ongoing monitoring, written standards, and clear anonymous reporting channels without fear of retaliation.'
  }
];

function ComplianceCheckContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const webinarId = searchParams.get('webinarId');

  const [webinar, setWebinar] = useState(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showReview, setShowReview] = useState(false);

  useEffect(() => {
    async function loadWebinar() {
      if (webinarId) {
        try {
          const res = await getWebinarById(webinarId);
          if (res?.data) {
            setWebinar(res.data);
            return;
          }
        } catch (e) {
          // fallback to list search
        }
      }
      try {
        const listRes = await getWebinars();
        const list = listRes?.data || [];
        if (webinarId) {
          const matched = list.find((w) => String(w.id) === String(webinarId) || String(w._id) === String(webinarId));
          if (matched) {
            setWebinar(matched);
            return;
          }
        }
        if (list.length > 0) {
          setWebinar(list[0]);
        }
      } catch (err) {}
    }
    loadWebinar();
  }, [webinarId]);

  const currentQ = COMPLIANCE_QUESTIONS[currentQuestionIdx];
  const totalQuestions = COMPLIANCE_QUESTIONS.length;

  const handleSelectOption = (optIndex) => {
    setUserAnswers((prev) => ({
      ...prev,
      [currentQuestionIdx]: optIndex
    }));
  };

  const handleNext = () => {
    if (currentQuestionIdx < totalQuestions - 1) {
      setCurrentQuestionIdx((prev) => prev + 1);
    } else {
      setIsSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    if (currentQuestionIdx > 0) {
      setCurrentQuestionIdx((prev) => prev - 1);
    }
  };

  const handleRetake = () => {
    setUserAnswers({});
    setCurrentQuestionIdx(0);
    setIsSubmitted(false);
    setShowReview(false);
    setCopied(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCopyCoupon = () => {
    navigator.clipboard.writeText('COMPLY10');
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Calculate score
  const score = Object.entries(userAnswers).reduce((acc, [qIdx, ansIdx]) => {
    const q = COMPLIANCE_QUESTIONS[parseInt(qIdx, 10)];
    return q && ansIdx === q.correctAnswer ? acc + 1 : acc;
  }, 0);

  const isHighScore = score >= 7;
  const returnHref = webinarId ? `/webinars/${webinarId}` : (webinar?.id ? `/webinars/${webinar.id}` : '/live-webinars');

  return (
    <div className="compliance-check-page">
      {/* 1. Breadcrumbs Bar */}
      <div className="breadcrumbs-bar">
        <div className="container">
          <nav className="breadcrumbs-nav" aria-label="Breadcrumbs">
            <Link href="/" className="breadcrumb-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ verticalAlign: '-1px', marginRight: '4px' }}>
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
              </svg>
              Home
            </Link>
            <span className="breadcrumb-separator">/</span>
            <Link href="/live-webinars" className="breadcrumb-item">Webinars</Link>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">Compliance Knowledge Check</span>
          </nav>
        </div>
      </div>

      <div className="compliance-check-container">
        {/* Header Hero Banner */}
        <div className="compliance-check-header">
          <div className="compliance-header-badge">
            <span aria-hidden="true">💡</span>
            <span>Compliance Assessment</span>
          </div>
          <h1>Compliance Knowledge Check</h1>
          <p className="compliance-check-subtitle">
            Answer 8 quick questions to evaluate your healthcare compliance readiness and claim your exclusive webinar reward.
          </p>

          {webinar && (
            <div className="compliance-linked-webinar-bar">
              <div className="linked-webinar-text">
                Webinar: <span className="linked-webinar-title">{webinar.title}</span>
              </div>
              <Link href={returnHref} className="linked-webinar-link">
                View Webinar Details &rarr;
              </Link>
            </div>
          )}
        </div>

        {/* Assessment Screen or Result Screen */}
        {!isSubmitted ? (
          <div className="quiz-card">
            {/* Progress Header */}
            <div className="quiz-progress-header">
              <span className="quiz-step-count">
                Question {currentQuestionIdx + 1} of {totalQuestions}
              </span>
              <span className="quiz-topic-tag">{currentQ.topic}</span>
            </div>

            {/* Progress Bar */}
            <div className="quiz-progress-bar-bg" aria-hidden="true">
              <div
                className="quiz-progress-bar-fill"
                style={{ width: `${((currentQuestionIdx + 1) / totalQuestions) * 100}%` }}
              ></div>
            </div>

            {/* Question Title */}
            <h2 className="quiz-question-title">{currentQ.question}</h2>

            {/* Options List */}
            <div className="quiz-options-list" role="radiogroup" aria-label={`Question ${currentQuestionIdx + 1} options`}>
              {currentQ.options.map((opt, idx) => {
                const isSelected = userAnswers[currentQuestionIdx] === idx;
                const letter = String.fromCharCode(65 + idx);
                return (
                  <button
                    key={idx}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    className={`quiz-option-btn ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleSelectOption(idx)}
                  >
                    <span className="quiz-option-letter">{letter}</span>
                    <span className="quiz-option-text">{opt}</span>
                  </button>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="quiz-actions-row">
              <button
                type="button"
                className="btn-quiz-prev"
                onClick={handlePrev}
                disabled={currentQuestionIdx === 0}
              >
                &larr; Previous
              </button>

              <button
                type="button"
                className="btn-quiz-next"
                onClick={handleNext}
                disabled={userAnswers[currentQuestionIdx] === undefined}
              >
                {currentQuestionIdx === totalQuestions - 1 ? 'Submit Knowledge Check' : 'Next Question →'}
              </button>
            </div>
          </div>
        ) : (
          <div className="result-card">
            {/* Prominent Score Pill */}
            <div className="result-score-badge-wrapper">
              <div className="result-score-pill">
                You scored {score}/{totalQuestions}
              </div>
            </div>

            <h2 className="result-heading">Assessment Complete</h2>

            {/* High Score / Lower Score Message */}
            <div className="result-message-box">
              {isHighScore ? (
                <>
                  <p className="result-message-main">
                    Great job! Your compliance knowledge is strong. Keep building on your knowledge and stay ahead of the latest compliance requirements.
                  </p>
                  <p className="result-message-sub">
                    Use coupon <strong>COMPLY10</strong> to get $10 off this webinar and continue strengthening your compliance knowledge.
                  </p>
                </>
              ) : (
                <>
                  <p className="result-message-main">
                    There’s always more to learn. Compliance requirements continue to evolve, so staying informed is important.
                  </p>
                  <p className="result-message-sub">
                    Use coupon <strong>COMPLY10</strong> to get $10 off this webinar and stay up to date with the latest compliance requirements.
                  </p>
                </>
              )}
            </div>

            {/* Coupon Box */}
            <div className="result-coupon-box">
              <span className="coupon-badge-top">Your Exclusive Reward</span>
              <div className="coupon-description-text">
                Use coupon <strong>COMPLY10</strong> to get $10 off this webinar.
              </div>
              <div className="coupon-code-row">
                <span className="coupon-code-display">COMPLY10</span>
                <button
                  type="button"
                  className={`btn-copy-coupon ${copied ? 'copied' : ''}`}
                  onClick={handleCopyCoupon}
                  aria-label="Copy coupon code COMPLY10"
                >
                  {copied ? (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                      </svg>
                      Copy Coupon
                    </>
                  )}
                </button>
              </div>
              {webinar && (
                <p className="coupon-target-webinar-note">
                  Applicable for: <strong>{webinar.title}</strong>
                </p>
              )}
            </div>

            {/* CTAs */}
            <div className="result-actions-row">
              <Link href={returnHref} className="btn-return-webinar">
                <span>Apply Coupon &amp; Return to Webinar</span>
                <span aria-hidden="true">&rarr;</span>
              </Link>
              <button
                type="button"
                className="btn-retake-quiz"
                onClick={handleRetake}
              >
                <span>Retake Knowledge Check</span>
                <span aria-hidden="true" style={{ marginLeft: '4px' }}>↺</span>
              </button>
            </div>

            {/* Answer Review Section */}
            <div className="quiz-review-section">
              <button
                type="button"
                onClick={() => setShowReview((prev) => !prev)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#0A3366',
                  fontWeight: '700',
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginBottom: '1rem',
                  padding: 0
                }}
              >
                <span>{showReview ? '▼ Hide Detailed Question Review' : '► View Detailed Question Review & Explanations'}</span>
              </button>

              {showReview && (
                <div>
                  {COMPLIANCE_QUESTIONS.map((q, idx) => {
                    const userAns = userAnswers[idx];
                    const isCorrect = userAns === q.correctAnswer;
                    return (
                      <div
                        key={q.id}
                        className={`review-item-card ${isCorrect ? 'correct' : 'incorrect'}`}
                      >
                        <div className="review-item-header">
                          <div className="review-item-q-title">
                            {idx + 1}. {q.question}
                          </div>
                          <span className={`review-status-tag ${isCorrect ? 'correct' : 'incorrect'}`}>
                            {isCorrect ? 'Correct ✓' : 'Incorrect ✗'}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '4px' }}>
                          <strong>Your Answer:</strong> {userAns !== undefined ? q.options[userAns] : 'Not answered'}
                        </div>
                        {!isCorrect && (
                          <div style={{ fontSize: '0.85rem', color: '#15803D', marginTop: '2px', fontWeight: 600 }}>
                            <strong>Correct Answer:</strong> {q.options[q.correctAnswer]}
                          </div>
                        )}
                        <div className="review-item-explanation">
                          <strong>Compliance Context:</strong> {q.explanation}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ComplianceCheckPage() {
  return (
    <Suspense fallback={
      <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
        <div className="loading-spinner"></div>
        <p style={{ marginTop: '1rem', color: '#64748B' }}>Loading compliance check...</p>
      </div>
    }>
      <ComplianceCheckContent />
    </Suspense>
  );
}
