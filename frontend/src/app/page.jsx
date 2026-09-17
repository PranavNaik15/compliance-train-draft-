'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getWebinars } from '../api/webinarApi';
import WebinarCard from '../components/WebinarCard';

export default function HomePage() {
  const [webinars, setWebinars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visibleCount, setVisibleCount] = useState(8);

  useEffect(() => {
    let isMounted = true;

    async function loadWebinars() {
      try {
        setLoading(true);
        setError(null);
        const data = await getWebinars();
        if (isMounted) {
          setWebinars(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to load upcoming HIPAA & SAMHSA webinars.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadWebinars();

    return () => {
      isMounted = false;
    };
  }, []);

  // Helper function to dynamically calculate the NEXT upcoming webinar based on date/time
  const getFeaturedUpcomingWebinar = (webinarsList) => {
    if (!webinarsList || webinarsList.length === 0) return null;

    const now = Date.now();

    const parseWebinarDate = (webinar) => {
      if (!webinar || !webinar.date) return 0;
      const dateStr = webinar.date;
      if (webinar.time) {
        const parts = webinar.time.split('-');
        const endPart = parts[parts.length - 1].trim();
        const combined = new Date(`${dateStr} ${endPart}`);
        if (!isNaN(combined.getTime())) {
          return combined.getTime();
        }
      }
      const endOfDay = new Date(`${dateStr} 23:59:59`);
      if (!isNaN(endOfDay.getTime())) {
        return endOfDay.getTime();
      }
      const fallback = new Date(dateStr);
      return isNaN(fallback.getTime()) ? 0 : fallback.getTime();
    };

    const futureWebinars = webinarsList
      .map((w) => ({ webinar: w, timestamp: parseWebinarDate(w) }))
      .filter((item) => item.timestamp >= now)
      .sort((a, b) => a.timestamp - b.timestamp);

    if (futureWebinars.length > 0) {
      return futureWebinars[0].webinar;
    }

    // Fallback if all dates are in the past
    return webinarsList[0];
  };

  const [showSpeakerModal, setShowSpeakerModal] = useState(false);
  const featuredWebinar = getFeaturedUpcomingWebinar(webinars);

  const formatFeaturedDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const parts = dateStr.replace(',', '').split(' ');
      if (parts.length >= 3) {
        return `${parts[0].substring(0, 3).toUpperCase()} ${parts[1]}, ${parts[2]}`;
      }
    } catch (e) {
      // fallback
    }
    return dateStr.toUpperCase();
  };

  const handleAddToCalendar = (webinar) => {
    if (!webinar) return;
    const title = encodeURIComponent(webinar.title);
    const details = encodeURIComponent(webinar.shortDescription || webinar.title);
    const location = encodeURIComponent('Live Interactive Virtual Healthcare Webinar - ComplianceTrain');
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}`;
    window.open(googleCalendarUrl, '_blank');
  };

  const displayedWebinars = webinars.slice(0, visibleCount);

  return (
    <div className="home-page-clean">
      {/* 1. Hero Section: Left Side = Featured Upcoming Webinar Panel, Right Side = Professional Image (Unchanged) */}
      <section className="hero-clean" aria-labelledby="hero-featured-heading">
        <div className="container">
          <div className="hero-grid">
            {/* Left Side: Featured Upcoming Webinar Panel */}
            <div className="hero-featured-left">
              {loading ? (
                <div className="featured-webinar-panel featured-loading-state">
                  <div className="skeleton-box" style={{ width: '35%', height: '22px', marginBottom: '0.85rem' }}></div>
                  <div className="skeleton-box" style={{ width: '85%', height: '30px', marginBottom: '0.65rem' }}></div>
                  <div className="skeleton-box" style={{ width: '95%', height: '16px', marginBottom: '0.4rem' }}></div>
                  <div className="skeleton-box" style={{ width: '70%', height: '16px', marginBottom: '1.25rem' }}></div>
                  <div className="skeleton-box" style={{ width: '100%', height: '60px', marginBottom: '1.25rem' }}></div>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <div className="skeleton-box" style={{ width: '130px', height: '38px' }}></div>
                    <div className="skeleton-box" style={{ width: '120px', height: '38px' }}></div>
                    <div className="skeleton-box" style={{ width: '130px', height: '38px' }}></div>
                  </div>
                </div>
              ) : featuredWebinar ? (
                <div className="featured-webinar-panel" aria-labelledby="hero-featured-heading">
                  <div className="featured-top-bar">
                    <span className="featured-category-badge">Upcoming Webinar</span>
                    <div className="featured-schedule-pill">
                      <span className="featured-date-badge">
                        {formatFeaturedDate(featuredWebinar.date)}
                      </span>
                      <span className="featured-duration-badge">
                        {(featuredWebinar.duration || '90 MINUTES').toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <h1 id="hero-featured-heading" className="featured-webinar-title">
                    <Link href={`/webinars/${featuredWebinar.id}`}>
                      {featuredWebinar.title}
                    </Link>
                  </h1>

                  <p className="featured-webinar-desc">
                    {featuredWebinar.shortDescription || featuredWebinar.fullDescription}
                  </p>

                  <div className="featured-meta-grid">
                    <div className="featured-meta-col">
                      <span className="featured-meta-label">Time</span>
                      <span className="featured-meta-val" title={featuredWebinar.time}>
                        {featuredWebinar.time || '10:00 AM PDT - 01:00 PM EDT'}
                      </span>
                    </div>

                    <div className="featured-meta-divider" aria-hidden="true"></div>

                    <div className="featured-meta-col">
                      <span className="featured-meta-label">Speaker</span>
                      <span className="featured-meta-val" title={featuredWebinar.speaker?.name}>
                        {featuredWebinar.speaker?.name || 'Brian L. Tuttle'}
                      </span>
                      <span className="featured-meta-sub" title={featuredWebinar.speaker?.role}>
                        {featuredWebinar.speaker?.role || 'Health IT & Compliance Consultant'}
                      </span>
                    </div>

                    <div className="featured-meta-divider" aria-hidden="true"></div>

                    <div className="featured-meta-col">
                      <span className="featured-meta-label">Format</span>
                      <span className="featured-live-pill">
                        <span className="featured-live-dot" aria-hidden="true"></span>
                        Live Session
                      </span>
                    </div>
                  </div>

                  <div className="featured-actions-row">
                    <Link 
                      href={`/webinars/${featuredWebinar.id}`}
                      className="btn-featured-register"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                      </svg>
                      Register Now &rarr;
                    </Link>
                    <button 
                      type="button" 
                      className="btn-featured-secondary"
                      onClick={() => setShowSpeakerModal(true)}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                      </svg>
                      View Speaker
                    </button>
                    <button 
                      type="button" 
                      className="btn-featured-secondary"
                      onClick={() => handleAddToCalendar(featuredWebinar)}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                        <line x1="16" y1="2" x2="16" y2="6"/>
                        <line x1="8" y1="2" x2="8" y2="6"/>
                        <line x1="3" y1="10" x2="21" y2="10"/>
                      </svg>
                      Add to Calendar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="featured-webinar-panel">
                  <span className="featured-category-badge">Upcoming Webinar</span>
                  <h2 className="featured-webinar-title" style={{ marginTop: '0.75rem' }}>
                    Scheduled Compliance Webinars
                  </h2>
                  <p className="featured-webinar-desc">
                    Explore our upcoming expert-led healthcare compliance and regulatory training sessions.
                  </p>
                  <div className="featured-actions-row">
                    <Link href="/live-webinars" className="btn-featured-register">
                      Explore Webinars &rarr;
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <div className="hero-visual-wrapper">
              <div className="hero-image-frame">
                <img 
                  src="/hero-executive.jpg" 
                  alt="Brian L Tuttle and health IT compliance consultants leading live healthcare training" 
                  className="hero-main-img"
                />
                <div className="hero-floating-badge" aria-hidden="true">
                  <p className="floating-badge-bold">Practical. Relevant.</p>
                  <p className="floating-badge-sub">Expert-Led HIPAA &amp; SAMHSA.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Upcoming Webinars Section with ComplianceTrain Grid */}
      <section className="section-webinars-clean" id="upcoming-webinars" aria-labelledby="webinars-title">
        <div className="container">
          <div className="section-top-header" style={{ marginBottom: '1.5rem' }}>
            <h2 id="webinars-title" className="clean-section-heading">
              Upcoming Webinars
            </h2>
          </div>

          {loading && (
            <div className="state-box" role="status" aria-live="polite">
              <div className="loading-spinner" aria-hidden="true"></div>
              <p style={{ marginTop: '1rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
                Loading scheduled HIPAA &amp; SAMHSA webinars from database...
              </p>
            </div>
          )}

          {!loading && error && (
            <div className="state-box" style={{ borderColor: 'var(--color-red-accent)' }} role="alert">
              <h3 style={{ color: 'var(--color-red-accent)', marginBottom: '0.5rem' }}>Unable to load webinars</h3>
              <p style={{ color: 'var(--color-text-muted)' }}>{error}</p>
            </div>
          )}

          {!loading && !error && displayedWebinars.length > 0 && (
            <>
              <div className="webinars-cards-grid">
                {displayedWebinars.map((webinar) => (
                  <WebinarCard key={webinar.id} webinar={webinar} />
                ))}
              </div>

              {visibleCount < webinars.length && (
                <div className="view-more-container">
                  <button 
                    type="button" 
                    className="btn-view-more"
                    onClick={() => setVisibleCount((prev) => prev + 4)}
                  >
                    View More +
                  </button>
                </div>
              )}
            </>
          )}

          {!loading && !error && webinars.length === 0 && (
            <div className="state-box">
              <h3>No scheduled webinars found</h3>
            </div>
          )}
        </div>
      </section>

      {/* 4. "How You Can Learn" 3-Column Section */}
      <section className="section-how-to-learn" aria-labelledby="how-learn-title">
        <div className="container">
          <h2 id="how-learn-title" className="clean-section-heading">
            How You Can Learn
          </h2>

          <div className="how-learn-grid">
            <div className="how-card card-red-tint">
              <div className="how-card-icon red-icon" aria-hidden="true">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="23 7 16 12 23 17 23 7"></polygon>
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                </svg>
              </div>
              <div className="how-card-content">
                <h3 className="how-card-title">Live Webinars</h3>
                <p className="how-card-desc">
                  Attend <strong style={{ color: 'var(--color-red-accent)' }}>expert-led HIPAA &amp; SAMHSA training</strong> in real time with Brian L. Tuttle and get your specific clinic, hospital, or BAA compliance questions answered live.
                </p>
                <Link href="/live-webinars" className="how-card-link red-link">
                  View Live Webinars &rarr;
                </Link>
              </div>
            </div>

            <div className="how-card card-blue-tint">
              <div className="how-card-icon blue-icon" aria-hidden="true">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
              </div>
              <div className="how-card-content">
                <h3 className="how-card-title">Recorded Webinars</h3>
                <p className="how-card-desc">
                  Learn at your convenience with our on-demand video vault covering 42 CFR Part 2, Security Risk Assessments, and annual mandatory workforce compliance modules.
                </p>
                <Link href="/recorded-webinars" className="how-card-link blue-link">
                  Browse Recorded Webinars &rarr;
                </Link>
              </div>
            </div>

            <div className="how-card card-green-tint">
              <div className="how-card-icon green-icon" aria-hidden="true">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
                  <line x1="9" y1="22" x2="9" y2="22.01"></line>
                  <line x1="15" y1="22" x2="15" y2="22.01"></line>
                </svg>
              </div>
              <div className="how-card-content">
                <h3 className="how-card-title">Onsite Healthcare Training</h3>
                <p className="how-card-desc">
                  Customized HIPAA and SAMHSA workshops delivered directly at your hospital, clinic, or private team video conference for all staff members.
                </p>
                <Link href="/onsite-training" className="how-card-link green-link">
                  Learn More &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Healthcare Industries Trust Footer Strip */}
      <section className="section-industries-trust" aria-label="Healthcare Industries Served">
        <div className="container">
          <div className="industries-inner">
            <span className="industries-label">
              Trusted by Healthcare &amp; Covered Entities Nationwide:
            </span>
            <div className="industries-badges-list">
              <span className="industry-chip">Hospital &amp; Health Systems</span>
              <span className="industry-chip">Behavioral Health &amp; SUD Clinics</span>
              <span className="industry-chip">Medical Practice Groups</span>
              <span className="industry-chip">EHR &amp; Health Tech Vendors</span>
              <span className="industry-chip">Business Associates &amp; Billing</span>
              <span className="industry-chip-more">&amp; and more...</span>
            </div>
          </div>
        </div>
      </section>

      {/* Speaker Bio Modal */}
      {showSpeakerModal && featuredWebinar?.speaker && (
        <div 
          className="bio-modal-overlay" 
          onClick={() => setShowSpeakerModal(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-speaker-title"
        >
          <div className="bio-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="bio-modal-header">
              <h3 id="modal-speaker-title">Faculty Bio: {featuredWebinar.speaker.name}</h3>
              <button 
                type="button" 
                className="btn-modal-close"
                onClick={() => setShowSpeakerModal(false)}
                aria-label="Close modal"
              >
                &times;
              </button>
            </div>
            <div className="bio-modal-body">
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.25rem' }}>
                <img 
                  src={featuredWebinar.speaker.avatarUrl || '/speaker-brian.jpg'} 
                  alt={featuredWebinar.speaker.name} 
                  style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #0066CC' }}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
                <div>
                  <h4 style={{ margin: 0, color: '#0A3366', fontSize: '1.05rem', fontWeight: 800 }}>
                    {featuredWebinar.speaker.name}
                  </h4>
                  <p style={{ margin: '0.15rem 0 0 0', color: '#64748B', fontSize: '0.85rem', fontWeight: 600 }}>
                    {featuredWebinar.speaker.role} {featuredWebinar.speaker.company ? `• ${featuredWebinar.speaker.company}` : ''}
                  </p>
                </div>
              </div>
              <p>
                {featuredWebinar.speaker.bio || (
                  <>
                    <strong>{featuredWebinar.speaker.name}</strong> is a nationally recognized Certified HIPAA Consultant, certified Healthcare Privacy and Security expert, and IT Auditor with over 20 years of direct experience in Healthcare IT Compliance and OCR audit defense.
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
