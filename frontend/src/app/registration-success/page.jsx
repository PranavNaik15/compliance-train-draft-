'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import '../../styles/success.css';

export default function RegistrationSuccessPage() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('ct_latest_registration');
      if (stored) {
        try {
          setData(JSON.parse(stored));
        } catch (e) {
          console.error('Failed to parse registration data', e);
        }
      }
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="container success-page">
        <div className="state-box">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  const registration = data?.registration;

  if (!registration) {
    return (
      <div className="container success-page">
        <div className="state-box">
          <h2>No Registration Found</h2>
          <p style={{ marginTop: '0.5rem', marginBottom: '1.5rem' }}>
            Please select a webinar and complete the registration form.
          </p>
          <Link href="/" className="btn btn-primary">
            Browse All Webinars
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container success-page">
      <div className="success-card">
        <div className="success-icon-wrap" aria-hidden="true">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>

        <h1 className="success-title">Registration Confirmed!</h1>
        <p className="success-subtitle">
          A confirmation receipt and calendar invitation have been sent to <strong>{registration.workEmail}</strong>.
        </p>

        {/* Receipt Details Box */}
        <div className="receipt-box" aria-label="Registration Receipt">
          <div className="receipt-header">
            <span className="receipt-id">Registration ID: {registration.id}</span>
            <span className="receipt-status">CONFIRMED</span>
          </div>

          <div className="receipt-content">
            <h2 className="receipt-webinar-title">{registration.webinarTitle}</h2>

            <div className="receipt-grid">
              <div className="receipt-item">
                <span className="receipt-label">Date</span>
                <span className="receipt-value">{registration.webinarDate}</span>
              </div>
              <div className="receipt-item">
                <span className="receipt-label">Time</span>
                <span className="receipt-value">{registration.webinarTime}</span>
              </div>
              <div className="receipt-item">
                <span className="receipt-label">Attendee Name</span>
                <span className="receipt-value">{registration.fullName}</span>
              </div>
              <div className="receipt-item">
                <span className="receipt-label">Organization</span>
                <span className="receipt-value">{registration.companyName}</span>
              </div>
              <div className="receipt-item">
                <span className="receipt-label">Role</span>
                <span className="receipt-value">{registration.jobRole}</span>
              </div>
              <div className="receipt-item">
                <span className="receipt-label">Access Pass</span>
                <span className="receipt-value">Complimentary</span>
              </div>
            </div>
          </div>
        </div>

        <div className="success-actions">
          <Link href="/" className="btn btn-primary">
            Browse More Webinars
          </Link>
          <button 
            type="button" 
            className="btn btn-outline"
            onClick={() => window.print()}
          >
            Print Confirmation
          </button>
        </div>
      </div>
    </div>
  );
}
