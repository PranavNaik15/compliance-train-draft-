'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getWebinarById, registerForWebinar } from '../../../../api/webinarApi';
import '../../../../styles/register.css';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function RegisterForm() {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedTier = searchParams.get('option') || 'single';
  const selectedPrice = searchParams.get('price') || '179';

  const [webinar, setWebinar] = useState(null);
  const [loadingWebinar, setLoadingWebinar] = useState(true);
  const [webinarError, setWebinarError] = useState(null);

  const [formData, setFormData] = useState({
    fullName: '',
    companyName: '',
    workEmail: '',
    jobRole: '',
  });

  const [formErrors, setFormErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    let isMounted = true;

    async function loadWebinar() {
      try {
        setLoadingWebinar(true);
        setWebinarError(null);
        const data = await getWebinarById(id);
        if (isMounted) {
          setWebinar(data);
        }
      } catch (err) {
        if (isMounted) {
          setWebinarError(err.message || 'Failed to load webinar details.');
        }
      } finally {
        if (isMounted) {
          setLoadingWebinar(false);
        }
      }
    }

    loadWebinar();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.fullName.trim()) errors.fullName = 'Full Name is required.';
    if (!formData.companyName.trim()) errors.companyName = 'Company Name is required.';
    if (!formData.workEmail.trim()) {
      errors.workEmail = 'Work Email is required.';
    } else if (!EMAIL_REGEX.test(formData.workEmail.trim())) {
      errors.workEmail = 'Please enter a valid work email address.';
    }
    if (!formData.jobRole.trim()) errors.jobRole = 'Job Role is required.';
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError(null);

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        webinarId: webinar.id,
        fullName: formData.fullName.trim(),
        companyName: formData.companyName.trim(),
        workEmail: formData.workEmail.trim(),
        jobRole: formData.jobRole.trim(),
      };

      const response = await registerForWebinar(payload);

      if (typeof window !== 'undefined') {
        sessionStorage.setItem('ct_latest_registration', JSON.stringify({
          registration: response.data,
          webinar: webinar,
          selectedPrice: selectedPrice,
          selectedTier: selectedTier
        }));
      }

      router.push('/registration-success');
    } catch (err) {
      setServerError(err.message || 'An error occurred during registration. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingWebinar) {
    return (
      <div className="container register-page">
        <div className="state-box">
          <div className="loading-spinner"></div>
          <p style={{ marginTop: '1rem', color: 'var(--color-text-muted)' }}>Loading session...</p>
        </div>
      </div>
    );
  }

  if (webinarError || !webinar) {
    return (
      <div className="container register-page">
        <Link href="/" className="back-link">&larr; Back to all webinars</Link>
        <div className="state-box" style={{ borderColor: 'var(--color-red-accent)' }}>
          <h3 style={{ color: 'var(--color-red-accent)' }}>Webinar Not Found</h3>
          <p>{webinarError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container register-page">
      <Link href={`/webinars/${webinar.id}`} className="back-link">
        &larr; Back to {webinar.title}
      </Link>

      <div className="register-card">
        <div className="register-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span className="badge-live">
              REGISTRATION CHECKOUT
            </span>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#8B1E1E' }}>
              ${selectedPrice}
            </span>
          </div>
          <h1 className="register-title">Register for Session</h1>
          <div className="register-summary-box">
            <h2 className="summary-title">{webinar.title}</h2>
            <div className="summary-meta">
              <span>📅 {webinar.date}</span>
              <span>🕒 {webinar.time}</span>
              <span>⏳ {webinar.duration}</span>
              <span>👤 {webinar.speaker.name}</span>
            </div>
          </div>
        </div>

        {serverError && (
          <div className="state-box" style={{ borderColor: 'var(--color-red-accent)', backgroundColor: '#FEF2F2', padding: '1rem', margin: '0 0 1.5rem 0' }}>
            <p style={{ color: 'var(--color-red-accent)', fontWeight: 600 }}>{serverError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="fullName">Full Name *</label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              className={`form-input ${formErrors.fullName ? 'has-error' : ''}`}
              placeholder="e.g. Dr. Sarah Jenkins"
              value={formData.fullName}
              onChange={handleChange}
              disabled={submitting}
            />
            {formErrors.fullName && <p className="form-error">{formErrors.fullName}</p>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="companyName">Organization / Healthcare Facility *</label>
            <input
              id="companyName"
              name="companyName"
              type="text"
              className={`form-input ${formErrors.companyName ? 'has-error' : ''}`}
              placeholder="e.g. Memorial Hospital Health System"
              value={formData.companyName}
              onChange={handleChange}
              disabled={submitting}
            />
            {formErrors.companyName && <p className="form-error">{formErrors.companyName}</p>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="workEmail">Work Email Address *</label>
            <input
              id="workEmail"
              name="workEmail"
              type="email"
              className={`form-input ${formErrors.workEmail ? 'has-error' : ''}`}
              placeholder="s.jenkins@memorialhealth.org"
              value={formData.workEmail}
              onChange={handleChange}
              disabled={submitting}
            />
            {formErrors.workEmail && <p className="form-error">{formErrors.workEmail}</p>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="jobRole">Job Role / Clinical Title *</label>
            <input
              id="jobRole"
              name="jobRole"
              type="text"
              className={`form-input ${formErrors.jobRole ? 'has-error' : ''}`}
              placeholder="e.g. Privacy Officer / Clinic Administrator"
              value={formData.jobRole}
              onChange={handleChange}
              disabled={submitting}
            />
            {formErrors.jobRole && <p className="form-error">{formErrors.jobRole}</p>}
          </div>

          <button
            type="submit"
            className="btn btn-red btn-full btn-submit"
            disabled={submitting}
          >
            {submitting ? 'Confirming Registration...' : 'Complete Free Registration &rarr;'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="container register-page">
        <div className="state-box">
          <div className="loading-spinner"></div>
          <p style={{ marginTop: '1rem', color: 'var(--color-text-muted)' }}>Loading checkout...</p>
        </div>
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}
