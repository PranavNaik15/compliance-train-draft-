'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getWebinarById, getWebinars } from '../../api/webinarApi';
import '../../styles/compliance-check.css';

async function fetchQuizQuestions() {
  const response = await fetch('/api/quiz/questions');
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch quiz questions.');
  }
  const result = await response.json();
  return result.questions || result.data || result;
}

async function postQuizSubmit(payload) {
  const response = await fetch('/api/quiz/submit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to submit quiz answers.');
  }
  return data;
}

function ComplianceCheckContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const webinarId = searchParams.get('webinarId');

  const [webinar, setWebinar] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showReview, setShowReview] = useState(false);

  // Load webinar details
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
        const list = Array.isArray(listRes) ? listRes : listRes?.data || [];
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

  // Load quiz questions from backend API
  useEffect(() => {
    async function loadQuestions() {
      setLoadingQuestions(true);
      setLoadError(null);
      try {
        const res = await fetchQuizQuestions();
        const questionList = Array.isArray(res) ? res : res?.questions || [];
        setQuestions(questionList);
      } catch (err) {
        setLoadError('Unable to load compliance questions. Please try again.');
      } finally {
        setLoadingQuestions(false);
      }
    }
    loadQuestions();
  }, []);

  const totalQuestions = questions.length;
  const currentQ = questions[currentQuestionIdx];

  const handleSelectOption = (optIndex) => {
    setUserAnswers((prev) => ({
      ...prev,
      [currentQuestionIdx]: optIndex,
    }));
  };

  const handleNext = async () => {
    if (currentQuestionIdx < totalQuestions - 1) {
      setCurrentQuestionIdx((prev) => prev + 1);
    } else {
      // Final submission to backend
      setIsSubmitting(true);
      try {
        const answersPayload = {};
        questions.forEach((q, idx) => {
          const selectedOptIdx = userAnswers[idx];
          if (selectedOptIdx !== undefined) {
            const letter = String.fromCharCode(65 + selectedOptIdx);
            answersPayload[String(q.id || idx + 1)] = letter;
          }
        });

        const activeWebinarId = webinarId || webinar?.id || 'webinar-hipaa-1';
        const result = await postQuizSubmit({
          webinarId: activeWebinarId,
          answers: answersPayload,
        });

        setSubmitResult(result);
        setIsSubmitted(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (err) {
        setSubmitResult({
          score: 0,
          totalQuestions: totalQuestions || 8,
          webinarId: webinarId || webinar?.id || 'webinar-hipaa-1',
          couponCode: 'COMPLY10',
          discount: 10,
          message: "There's always more to learn. Compliance requirements continue to evolve, so staying informed is important.",
        });
        setIsSubmitted(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } finally {
        setIsSubmitting(false);
      }
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
    setSubmitResult(null);
    setShowReview(false);
    setCopied(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const couponCode = submitResult?.couponCode || 'COMPLY10';
  const discountAmount = submitResult?.discount || 10;
  const score = submitResult?.score !== undefined ? submitResult.score : 0;
  const total = submitResult?.totalQuestions || totalQuestions || 8;
  const isHighScore = score >= 7;

  const handleCopyCoupon = () => {
    navigator.clipboard.writeText(couponCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const returnHref = webinarId ? `/webinars/${webinarId}` : (webinar?.id ? `/webinars/${webinar.id}` : '/live-webinars');

  if (loadingQuestions) {
    return (
      <div className="compliance-check-page">
        <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
          <div className="loading-spinner"></div>
          <p style={{ marginTop: '1rem', color: '#64748B' }}>Loading compliance check...</p>
        </div>
      </div>
    );
  }

  if (loadError || !currentQ) {
    return (
      <div className="compliance-check-page">
        <div className="compliance-check-container" style={{ padding: '3rem 1rem', textAlign: 'center' }}>
          <h2>Unable to Load Assessment</h2>
          <p style={{ color: '#64748B', margin: '1rem 0 2rem' }}>
            {loadError || 'Unable to load compliance check questions. Please verify your connection.'}
          </p>
          <button
            type="button"
            className="btn-return-webinar"
            onClick={() => window.location.reload()}
            style={{ display: 'inline-flex', justifyContent: 'center' }}
          >
            Retry Assessment
          </button>
        </div>
      </div>
    );
  }

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
              <span className="quiz-topic-tag">{currentQ.topic || 'Healthcare Compliance'}</span>
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
                disabled={currentQuestionIdx === 0 || isSubmitting}
              >
                &larr; Previous
              </button>

              <button
                type="button"
                className="btn-quiz-next"
                onClick={handleNext}
                disabled={userAnswers[currentQuestionIdx] === undefined || isSubmitting}
              >
                {isSubmitting
                  ? 'Submitting...'
                  : currentQuestionIdx === totalQuestions - 1
                  ? 'Submit Knowledge Check'
                  : 'Next Question →'}
              </button>
            </div>
          </div>
        ) : (
          <div className="result-card">
            {/* Prominent Score Pill */}
            <div className="result-score-badge-wrapper">
              <div className="result-score-pill">
                You scored {score}/{total}
              </div>
            </div>

            <h2 className="result-heading">Assessment Complete</h2>

            {/* High Score / Lower Score Message */}
            <div className="result-message-box">
              {isHighScore ? (
                <>
                  <p className="result-message-main">
                    {submitResult?.message ||
                      'Great job! Your compliance knowledge is strong. Keep strengthening your knowledge and stay updated on the latest compliance requirements.'}
                  </p>
                  <p className="result-message-sub">
                    Use coupon <strong>{couponCode}</strong> to get ${discountAmount} off this webinar and continue strengthening your compliance knowledge.
                  </p>
                </>
              ) : (
                <>
                  <p className="result-message-main">
                    {submitResult?.message ||
                      "There's always more to learn. Compliance requirements continue to evolve, so staying informed is important."}
                  </p>
                  <p className="result-message-sub">
                    Use coupon <strong>{couponCode}</strong> to get ${discountAmount} off this webinar and stay up to date with the latest compliance requirements.
                  </p>
                </>
              )}
            </div>

            {/* Coupon Box */}
            <div className="result-coupon-box">
              <span className="coupon-badge-top">Your Exclusive Reward</span>
              <div className="coupon-description-text">
                Use coupon <strong>{couponCode}</strong> to get ${discountAmount} off this webinar.
              </div>
              <div className="coupon-code-row">
                <span className="coupon-code-display">{couponCode}</span>
                <button
                  type="button"
                  className={`btn-copy-coupon ${copied ? 'copied' : ''}`}
                  onClick={handleCopyCoupon}
                  aria-label={`Copy coupon code ${couponCode}`}
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
                  padding: 0,
                }}
              >
                <span>{showReview ? '▼ Hide Question Review' : '► View Submitted Answers Review'}</span>
              </button>

              {showReview && (
                <div>
                  {questions.map((q, idx) => {
                    const userAns = userAnswers[idx];
                    return (
                      <div
                        key={q.id || idx}
                        className="review-item-card"
                        style={{ borderLeft: '3px solid #0A3366' }}
                      >
                        <div className="review-item-header">
                          <div className="review-item-q-title">
                            {idx + 1}. {q.question}
                          </div>
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '4px' }}>
                          <strong>Your Answer:</strong> {userAns !== undefined && q.options ? q.options[userAns] : 'Not answered'}
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
    <Suspense
      fallback={
        <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
          <div className="loading-spinner"></div>
          <p style={{ marginTop: '1rem', color: '#64748B' }}>Loading compliance check...</p>
        </div>
      }
    >
      <ComplianceCheckContent />
    </Suspense>
  );
}
