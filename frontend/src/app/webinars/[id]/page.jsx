'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getWebinarById, getWebinars } from '../../../api/webinarApi';
import WebinarCardVisual from '../../../components/WebinarCardVisual';
import '../../../styles/details.css';

export default function WebinarDetailsPage() {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();
  const [webinar, setWebinar] = useState(null);
  const [allWebinars, setAllWebinars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOption, setSelectedOption] = useState('single');
  const [selectedAttendee, setSelectedAttendee] = useState(1);
  const [showMoreAttendees, setShowMoreAttendees] = useState(false);
  const [showBioModal, setShowBioModal] = useState(false);
  const [showAllOptions, setShowAllOptions] = useState(false);

  const liveAttendeeOptions = [
    { count: 1, price: 179, label: '1 Attendee - $179' },
    { count: 2, price: 259, label: '2 Attendees - $259 (SAVE $99)' },
    { count: 3, price: 299, label: '3 Attendees - $299 (SAVE $238)' },
    { count: 4, price: 339, label: '4 Attendees - $339 (SAVE $377)' },
    { count: 5, price: 379, label: '5 Attendees - $379 (SAVE $516)' },
    { count: 6, price: 419, label: '6 Attendees - $419 (SAVE $655)' },
    { count: 7, price: 459, label: '7 Attendees - $459 (SAVE $794)' },
    { count: 8, price: 499, label: '8 Attendees - $499 (SAVE $933)' },
    { count: 9, price: 539, label: '9 Attendees - $539 (SAVE $1072)' },
    { count: 10, price: 579, label: '10 Attendees - $579 (SAVE $1211)' },
  ];

  const registrationOptions = [
    {
      id: 'single',
      price: 179,
      title: 'Live Session',
      desc: "If you signup & can't make it, do not worry! We have alternate arrangements."
    },
    {
      id: 'recorded',
      price: 199,
      title: 'Access Recorded Version',
      desc: 'Avail 3 months unlimited access for a single user.'
    },
    {
      id: 'transcript',
      price: 219,
      title: 'Transcript',
      desc: 'PDF Transcript of Training & Available in 2 business days, after Live Event'
    },
    {
      id: 'combo',
      price: 299,
      title: 'Combo Offer',
      desc: 'Avail recording + Attend live session for a single participant.'
    },
    {
      id: 'dvd_live',
      price: 349,
      title: 'Get a Training DVD + Attend Single Live',
      desc: 'Training DVD shipped to your address + 1 live attendee access.'
    },
    {
      id: 'flash_live',
      price: 399,
      title: 'Get a Flash Drive + Access Recording + Attend Single Live',
      desc: 'Recorded session valid for 180 days & Flash Drive shipped within 15 days post-webinar completion & get lifetime access for unlimited participants.'
    }
  ];

  useEffect(() => {
    if (!id) return;
    let isMounted = true;

    async function loadDetails() {
      try {
        setLoading(true);
        setError(null);
        let detailData = null;
        let listData = [];

        try {
          listData = await getWebinars().catch(() => []);
        } catch (e) {}

        const listArray = Array.isArray(listData) ? listData : (listData?.data || []);

        try {
          detailData = await getWebinarById(id);
        } catch (err) {
          // If direct fetch fails (e.g. numeric ID like '1'), attempt lookup from list
          if (listArray && listArray.length > 0) {
            const numIndex = parseInt(id, 10);
            if (!isNaN(numIndex) && numIndex >= 1 && numIndex <= listArray.length) {
              detailData = listArray[numIndex - 1];
            } else {
              detailData = listArray.find((w) => String(w.id) === String(id) || String(w.id).endsWith(`-${id}`)) || listArray[0];
            }
          }
          if (!detailData) {
            throw err;
          }
        }

        if (isMounted) {
          setWebinar(detailData);
          setAllWebinars(listArray);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to load webinar details.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadDetails();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleAddToCart = () => {
    let finalPrice = 179;
    let packageType = 'LIVE';

    if (selectedOption === 'single') {
      const attendeeOpt = liveAttendeeOptions.find((opt) => opt.count === selectedAttendee) || liveAttendeeOptions[0];
      finalPrice = attendeeOpt.price;
      packageType = 'LIVE';
    } else {
      const selected = registrationOptions.find((opt) => opt.id === selectedOption) || registrationOptions[0];
      finalPrice = selected.price;
      packageType = selected.id === 'transcript' ? 'TRANSCRIPT' : (selected.title && selected.title.toUpperCase().includes('RECORD') ? 'RECORDED' : 'LIVE');
    }

    try {
      const stored = localStorage.getItem('ct_cart_items');
      let currentCart = stored ? JSON.parse(stored) : [];
      if (!Array.isArray(currentCart)) currentCart = [];
      const existingIndex = currentCart.findIndex((item) => item.id === webinar.id);
      if (existingIndex > -1) {
        currentCart[existingIndex].quantity = (currentCart[existingIndex].quantity || 1) + 1;
        currentCart[existingIndex].price = finalPrice;
        currentCart[existingIndex].type = packageType;
      } else {
        currentCart.push({
          id: webinar.id,
          title: webinar.title,
          price: finalPrice,
          quantity: 1,
          type: packageType,
          image: webinar.speaker?.image || '/speaker-brian.jpg',
        });
      }
      localStorage.setItem('ct_cart_items', JSON.stringify(currentCart));
      window.dispatchEvent(new Event('storage'));
    } catch (e) {}
    router.push('/cart');
  };

  const handleAddToCalendar = () => {
    if (!webinar) return;
    const title = encodeURIComponent(webinar.title);
    const details = encodeURIComponent(webinar.shortDescription || webinar.title);
    const location = encodeURIComponent('Live Interactive Virtual Healthcare Webinar - ComplianceTrain');
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}`;
    window.open(googleCalendarUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '4rem 0' }}>
        <div className="state-box">
          <div className="loading-spinner"></div>
          <p style={{ marginTop: '1rem', color: 'var(--color-text-muted)' }}>Loading webinar details...</p>
        </div>
      </div>
    );
  }

  if (error || !webinar) {
    return (
      <div className="container" style={{ padding: '4rem 0' }}>
        <div className="state-box" style={{ borderColor: 'var(--color-red-accent)' }}>
          <h3 style={{ color: 'var(--color-red-accent)' }}>Webinar Not Found</h3>
          <p>{error || 'The requested webinar could not be loaded.'}</p>
          <Link href="/" className="btn btn-red" style={{ marginTop: '1rem' }}>
            &larr; Back to all webinars
          </Link>
        </div>
      </div>
    );
  }

  const formatDuration = (dur) => {
    if (!dur) return '90 min';
    const lower = dur.toLowerCase();
    const match = lower.match(/\d+/);
    if (match) {
      return `${match[0]} min`;
    }
    return dur;
  };

  const recommendedWebinars = allWebinars
    .filter((w) => String(w.id) !== String(webinar?.id))
    .slice(0, 2);

  const currentAttendeeOpt = liveAttendeeOptions.find((opt) => opt.count === selectedAttendee) || liveAttendeeOptions[0];
  const currentLivePrice = currentAttendeeOpt.price;

  const currentOption = selectedOption === 'single'
    ? { ...registrationOptions[0], price: currentLivePrice }
    : (registrationOptions.find((opt) => opt.id === selectedOption) || registrationOptions[0]);

  return (
    <div className="webinar-details-page-ct">
      {/* 1. Breadcrumbs Strip */}
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
            <span className="breadcrumb-current" title={webinar.title}>{webinar.title}</span>
          </nav>
        </div>
      </div>

      {/* 2. Main Content Grid (Left: Hero + 4 Section Cards, Right: Sidebar) */}
      <div className="container details-content-container">
        <div className="details-two-col-grid">
          {/* Left Column: Dark Hero Card + 4 Separate Section Cards */}
          <div className="details-main-col">
            {/* Combined Large Dark Hero Banner Card */}
            <section className="webinar-details-hero">
              <div className="hero-top-badge-row">
                <div className="hero-live-badge">
                  <span className="badge-dot" aria-hidden="true"></span>
                  <span>Live Webinar</span>
                </div>
              </div>

              <h1 className="hero-webinar-title">{webinar.title}</h1>

              <p className="hero-description-text">
                {webinar.shortDescription ||
                  'Stay compliant and prepare for the latest HIPAA regulatory changes, enforcement trends, and audit updates. Learn key updates, real-world cases, and practical steps to protect your practice or business.'}
              </p>

              {/* Bottom 2x2 Grid: Live On, Speaker, Duration, Add to Calendar */}
              <div className="hero-meta-2x2-grid">
                {/* Block 1: Live On */}
                <div className="hero-meta-box">
                  <div className="hero-meta-icon" aria-hidden="true">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                  </div>
                  <div className="hero-meta-text">
                    <span className="hero-meta-label">Live On</span>
                    <span className="hero-meta-highlight">{webinar.date}</span>
                    <span className="hero-meta-sub">{webinar.time || '10:00 AM PDT - 01:00 PM EDT'}</span>
                  </div>
                </div>

                {/* Block 2: Speaker */}
                <div className="hero-meta-box">
                  <div className="hero-meta-icon" aria-hidden="true">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </div>
                  <div className="hero-meta-text">
                    <span className="hero-meta-label">Speaker</span>
                    <span className="hero-meta-highlight">{webinar.speaker?.name || 'Brian L. Tuttle'}</span>
                    <span className="hero-meta-sub">{webinar.speaker?.role || 'Health IT & Compliance Consultant'}</span>
                  </div>
                </div>

                {/* Block 3: Duration */}
                <div className="hero-meta-box">
                  <div className="hero-meta-icon" aria-hidden="true">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 16 14"/>
                    </svg>
                  </div>
                  <div className="hero-meta-text">
                    <span className="hero-meta-label">Duration</span>
                    <span className="hero-meta-highlight">{webinar.duration || '90 minutes'}</span>
                  </div>
                </div>

                {/* Block 4: Add to Calendar */}
                <button 
                  type="button" 
                  className="hero-meta-box btn-hero-add-calendar"
                  onClick={handleAddToCalendar}
                  title="Add this session to your calendar"
                >
                  <div className="hero-meta-icon" aria-hidden="true">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                      <line x1="12" y1="13" x2="12" y2="17"/>
                      <line x1="10" y1="15" x2="14" y2="15"/>
                    </svg>
                  </div>
                  <div className="hero-meta-text">
                    <span className="hero-meta-calendar-link">Add to Calendar</span>
                  </div>
                </button>
              </div>
            </section>

            {/* Why Should You Attend? (No number badge) */}
            <article className="detail-section-card">
              <div className="section-card-header">
                <h2 className="section-card-title">Why Should You Attend?</h2>
              </div>
              <div className="section-card-body">
                <p className="section-intro-text">
                  This webinar will help you understand what's new with HIPAA from a regulation, enforcement and risk standpoint. You will get clarity on the latest updates and practical guidance to protect your practice or business.
                </p>

                <div className="attend-features-grid">
                  {/* Feature 1 - Blue */}
                  <div className="attend-feature-box blue-box">
                    <div className="feature-icon-circle blue-icon" aria-hidden="true">
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                      </svg>
                    </div>
                    <div className="feature-text-content">
                      <h4 className="feature-title blue-title">2026 HIPAA Changes</h4>
                      <p className="feature-desc">Understand the latest regulatory updates and proposed changes.</p>
                    </div>
                  </div>

                  {/* Feature 2 - Blue */}
                  <div className="attend-feature-box blue-box">
                    <div className="feature-icon-circle blue-icon" aria-hidden="true">
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                      </svg>
                    </div>
                    <div className="feature-text-content">
                      <h4 className="feature-title blue-title">Enforcement & Audits</h4>
                      <p className="feature-desc">Learn about OCR's audit program, current enforcement trends and real-life cases.</p>
                    </div>
                  </div>

                  {/* Feature 3 - Blue */}
                  <div className="attend-feature-box blue-box">
                    <div className="feature-icon-circle blue-icon" aria-hidden="true">
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                      </svg>
                    </div>
                    <div className="feature-text-content">
                      <h4 className="feature-title blue-title">Security & Breach Risks</h4>
                      <p className="feature-desc">Get insights on increasing cyber attacks, state laws and liability for patient remedies.</p>
                    </div>
                  </div>

                  {/* Feature 4 - Blue */}
                  <div className="attend-feature-box blue-box">
                    <div className="feature-icon-circle blue-icon" aria-hidden="true">
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                      </svg>
                    </div>
                    <div className="feature-text-content">
                      <h4 className="feature-title blue-title">Practical Compliance Guidance</h4>
                      <p className="feature-desc">Learn actionable steps to avoid fines, reduce risk and stay compliant.</p>
                    </div>
                  </div>
                </div>
              </div>
            </article>

            {/* Areas Covered (No number badge) */}
            <article className="detail-section-card">
              <div className="section-card-header">
                <h2 className="section-card-title">Areas Covered</h2>
              </div>
              <div className="section-card-body">
                <div className="areas-two-col-grid">
                  <div className="areas-col">
                    <div className="area-check-row">
                      <span className="area-check-badge" aria-hidden="true">✓</span>
                      <span>HIPAA Administrative Simplification Updates (Privacy Rule and Security Rule)</span>
                    </div>
                    <div className="area-check-row">
                      <span className="area-check-badge" aria-hidden="true">✓</span>
                      <span>NPRM's for the HIPAA Security Rule and updates for the HIPAA Privacy Rule</span>
                    </div>
                    <div className="area-check-row">
                      <span className="area-check-badge" aria-hidden="true">✓</span>
                      <span>Rights of Access, Care Coordination and Information Sharing</span>
                    </div>
                    <div className="area-check-row">
                      <span className="area-check-badge" aria-hidden="true">✓</span>
                      <span>Notice of Privacy Practices, 21st Century Cures Act and Telemedicine (Do's and Don'ts)</span>
                    </div>
                  </div>

                  <div className="areas-col">
                    <div className="area-check-row">
                      <span className="area-check-badge" aria-hidden="true">✓</span>
                      <span>Fines, Portable Devices, Texting and Emailing – New Guidelines</span>
                    </div>
                    <div className="area-check-row">
                      <span className="area-check-badge" aria-hidden="true">✓</span>
                      <span>New Definition of Protected Health Information</span>
                    </div>
                    <div className="area-check-row">
                      <span className="area-check-badge" aria-hidden="true">✓</span>
                      <span>Real-Life Audits and Litigated Cases</span>
                    </div>
                    <div className="area-check-row">
                      <span className="area-check-badge" aria-hidden="true">✓</span>
                      <span>Business Associates and the Increased Burden</span>
                    </div>
                    <div className="area-check-row">
                      <span className="area-check-badge" aria-hidden="true">✓</span>
                      <span>Breach Notification and Risk Factors</span>
                    </div>
                  </div>
                </div>
              </div>
            </article>

            {/* Who Will Benefit? (No number badge) */}
            <article className="detail-section-card">
              <div className="section-card-header">
                <h2 className="section-card-title">Who Will Benefit?</h2>
              </div>
              <div className="section-card-body">
                <div className="benefit-two-boxes-grid">
                  {/* Healthcare Professionals Box */}
                  <div className="benefit-card-box blue-box">
                    <div className="benefit-icon-circle blue-icon" aria-hidden="true">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                    </div>
                    <div className="benefit-box-content">
                      <h4 className="benefit-box-title blue-title">Healthcare Professionals</h4>
                      <ul className="benefit-bullet-list">
                        <li>Practice Managers</li>
                        <li>MD's and other Medical Professionals</li>
                        <li>Compliance Officers</li>
                        <li>Business Associates working with medical practices or hospitals</li>
                      </ul>
                    </div>
                  </div>

                  {/* Companies / Organizations Box */}
                  <div className="benefit-card-box blue-box">
                    <div className="benefit-icon-circle blue-icon" aria-hidden="true">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
                        <line x1="9" y1="22" x2="9" y2="22.01"></line>
                        <line x1="15" y1="22" x2="15" y2="22.01"></line>
                        <line x1="9" y1="6" x2="9" y2="6.01"></line>
                        <line x1="15" y1="6" x2="15" y2="6.01"></line>
                        <line x1="9" y1="10" x2="9" y2="10.01"></line>
                        <line x1="15" y1="10" x2="15" y2="10.01"></line>
                        <line x1="9" y1="14" x2="9" y2="14.01"></line>
                        <line x1="15" y1="14" x2="15" y2="14.01"></line>
                        <line x1="9" y1="18" x2="9" y2="18.01"></line>
                        <line x1="15" y1="18" x2="15" y2="18.01"></line>
                      </svg>
                    </div>
                    <div className="benefit-box-content">
                      <h4 className="benefit-box-title blue-title">Companies / Organizations</h4>
                      <div className="orgs-subcolumns">
                        <ul className="benefit-bullet-list">
                          <li>Private Practice</li>
                          <li>Hospitals</li>
                          <li>Billing Companies</li>
                          <li>Transcription Companies</li>
                          <li>Home Health Groups</li>
                        </ul>
                        <ul className="benefit-bullet-list">
                          <li>Health insurance</li>
                          <li>Ambulatory Services</li>
                          <li>IT Companies</li>
                          <li>Attorneys</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          </div>

          {/* Right Column: Registration Options, Tags & Recommended Webinars */}
          <aside className="details-sidebar-ct" aria-label="Registration Options">
            {/* Registration Options Card */}
            <div className="registration-card-ct">
              <h3 className="registration-card-title">Registration Options</h3>

              {/* 1. Live Session Section */}
              <div 
                className={`live-session-wrapper ${selectedOption === 'single' ? 'selected' : ''}`}
                onClick={() => {
                  if (selectedOption !== 'single') setSelectedOption('single');
                }}
              >
                <div className="live-session-radio-col">
                  <span className={`option-radio-indicator ${selectedOption === 'single' ? 'selected' : ''}`} aria-hidden="true"></span>
                </div>

                <div className="live-session-content-box">
                  {/* Live Session Header */}
                  <div className="live-session-header-row">
                    <div className="live-session-header-left">
                      <span className="live-session-price">${selectedOption === 'single' ? currentLivePrice : 179}</span>
                      <span className="live-session-title">Live Session</span>
                    </div>
                  </div>

                  {/* Attendees List */}
                  <div className="attendee-options-list">
                    {selectedOption === 'single' ? (
                      <>
                        {(showMoreAttendees ? liveAttendeeOptions : liveAttendeeOptions.slice(0, 1)).map((att) => {
                          const isSelected = selectedAttendee === att.count;
                          return (
                            <div key={att.count} className="attendee-option-group">
                              <div 
                                className={`attendee-option-row ${isSelected ? 'selected' : ''}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedOption('single');
                                  setSelectedAttendee(att.count);
                                }}
                              >
                                <div className="attendee-row-left">
                                  <span className={`attendee-checkbox ${isSelected ? 'checked' : ''}`} aria-hidden="true">
                                    {isSelected && (
                                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12" />
                                      </svg>
                                    )}
                                  </span>
                                  <span className="attendee-label">{att.label}</span>
                                </div>
                              </div>

                              {/* Dynamic Single Information Box */}
                              {isSelected && (
                                <div className="attendee-details-box">
                                  <ul className="attendee-details-bullets">
                                    <li>Access Credentials to be shared the day before or on the day of the webinar</li>
                                    <li>Access Credentials will be shared via email, and can be accessed from My Account</li>
                                    <li>Add/Edit attendees using My Account</li>
                                    <li>Certificate of Participation will be provided to the attendees</li>
                                  </ul>
                                </div>
                              )}
                            </div>
                          );
                        })}

                        {/* More / Less Attendees Toggle Button */}
                        <button
                          type="button"
                          className="btn-toggle-more-attendees"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowMoreAttendees((prev) => !prev);
                          }}
                        >
                          {showMoreAttendees ? '⌃ Less Attendees' : '⌄ More Attendees'}
                        </button>
                      </>
                    ) : (
                      <div className="attendee-option-group">
                        <div 
                          className="attendee-option-row"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedOption('single');
                            setSelectedAttendee(1);
                          }}
                        >
                          <div className="attendee-row-left">
                            <span className="attendee-checkbox" aria-hidden="true"></span>
                            <span className="attendee-label">1 Attendee - $179</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 2. Other Registration Options (Access Recorded Version, Transcript, Combo, DVD, Flash Drive) */}
              <div className="other-registration-options-list">
                {(showAllOptions ? registrationOptions.slice(1) : registrationOptions.slice(1, 4)).map((opt) => (
                  <div 
                    key={opt.id} 
                    className={`other-option-row ${selectedOption === opt.id ? 'selected' : ''}`}
                    onClick={() => setSelectedOption(opt.id)}
                  >
                    <div className="other-option-radio-col">
                      <span className={`option-radio-indicator ${selectedOption === opt.id ? 'selected' : ''}`} aria-hidden="true"></span>
                    </div>

                    <div className="other-option-content-box">
                      <div className="other-option-header-row">
                        <span className="other-price">${opt.price}</span>
                        <span className="other-title">{opt.title}</span>
                      </div>
                      {opt.desc && (
                        <div className="other-option-body">
                          <p className="other-desc">{opt.desc}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Add to Cart Button */}
              <button 
                type="button" 
                className="btn-sidebar-add-cart"
                onClick={handleAddToCart}
              >
                Add to cart
              </button>

              {/* View More / View Less Toggle */}
              {registrationOptions.length > 4 && (
                <button
                  type="button"
                  className="btn-view-more-packages-outline"
                  onClick={() => setShowAllOptions((prev) => !prev)}
                >
                  {showAllOptions ? 'View Less' : 'View More'}
                </button>
              )}
            </div>

            {/* Recommended Webinars Box */}
            {recommendedWebinars.length > 0 && (
              <div className="recommended-webinars-card">
                <div className="recommended-card-header">
                  <h3 className="recommended-card-title">Recommended Webinars</h3>
                </div>

                <div className="recommended-webinars-list">
                  {recommendedWebinars.map((rec) => (
                    <Link 
                      key={rec.id} 
                      href={`/webinars/${rec.id}`}
                      className="rec-large-card"
                    >
                      {/* Top Dark Navy Section */}
                      <div className="rec-card-top-navy">
                        {/* Top Badges Row */}
                        <div className="rec-top-badges-row">
                          <div className="rec-live-badge">
                            <span className="rec-live-dot" aria-hidden="true"></span>
                            <span>Live webinar</span>
                          </div>
                          <div className="rec-duration-badge">
                            <span>{formatDuration(rec.duration)}</span>
                          </div>
                        </div>

                        {/* Title & Shield Graphic Grid */}
                        <div className="rec-top-content-row">
                          <div className="rec-top-title-block">
                            <span className="rec-year-tag">{rec.yearTag || 'NEW FOR 2026'}</span>
                            <h4 className="rec-large-title" title={rec.title}>
                              {rec.title}
                            </h4>
                          </div>

                          {/* Thematic Topic Graphic */}
                          <div className="rec-shield-graphic" aria-hidden="true">
                            <WebinarCardVisual webinar={rec} size="small" />
                          </div>
                        </div>
                      </div>

                      {/* Bottom White Section */}
                      <div className="rec-card-bottom-white">
                        {/* Speaker Row */}
                        <div className="rec-bottom-speaker-row">
                          <img
                            src={rec.speaker?.avatarUrl || rec.speaker?.image || '/speaker-brian.jpg'}
                            alt={rec.speaker?.name || 'Speaker'}
                            className="rec-speaker-avatar"
                          />
                          <div className="rec-speaker-meta">
                            <span className="rec-speaker-name">{rec.speaker?.name || 'Brian L. Tuttle'}</span>
                            <span className="rec-speaker-role">{rec.speaker?.role || 'Health IT & Compliance Consultant'}</span>
                          </div>
                        </div>

                        {/* Divider */}
                        <div className="rec-bottom-divider" aria-hidden="true"></div>

                        {/* Title & Arrow Row */}
                        <div className="rec-bottom-title-row">
                          <span className="rec-bottom-title" title={rec.title}>
                            {rec.title}
                          </span>
                          <div className="rec-arrow-btn" aria-hidden="true">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="5" y1="12" x2="19" y2="12" />
                              <polyline points="12 5 19 12 12 19" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                <div className="recommended-card-footer">
                  <Link href="/live-webinars" className="btn-view-more-recommended">
                    View More Webinars
                  </Link>
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>

      {/* 4. Full-Width Speaker Details Section */}
      <section className="speaker-details-banner">
        <div className="container">
          <h2 className="speaker-banner-title">Speaker Details</h2>
          <div className="speaker-banner-inner">
            <div className="speaker-profile-frame">
              <img 
                src="/speaker-brian.jpg" 
                alt={webinar.speaker?.name || 'Brian L Tuttle'} 
                className="speaker-banner-avatar"
              />
            </div>
            <div className="speaker-banner-meta">
              <h3 className="speaker-banner-name">{webinar.speaker?.name || 'Brian L Tuttle'}</h3>
              <p className="speaker-banner-role">{webinar.speaker?.role || 'Health IT & Compliance Consultant'}</p>
            </div>
            <button 
              type="button" 
              className="btn-speaker-readmore"
              onClick={() => setShowBioModal(true)}
            >
              READ MORE &rsaquo;
            </button>
          </div>
        </div>
      </section>

      {/* 5. Refund Policy Section */}
      <div className="container" style={{ paddingBottom: '3.5rem' }}>
        <div className="refund-policy-box">
          <h3 className="refund-heading">Refund Policy</h3>
          <p className="refund-text">
            Participants/Registrants for our live events, may cancel up to 72 hours prior to the start of the live session and ComplianceTrain.com will issue a letter of credit to be used towards any of ComplianceTrain.com's future events. The letter of credit will be valid for 12 months.
          </p>
          <p className="refund-text" style={{ marginTop: '0.75rem' }}>
            ComplianceTrain.com will process refund in cases where the event has been cancelled and is not rescheduled within 90 days from the original scheduled date of the webinar. In case if a live webinar is cancelled, participants/registrants may choose between recorded version of the course or a refund. Refunds will not be processed to participants who do not show up for the webinar. A webinar may be cancelled due to unavoidable circumstances, participants will be notified 24 hours before the scheduled start of the event. Contact us via email: <em>contactus@compliancetrain.com</em>
          </p>
        </div>
      </div>

      {/* Speaker Bio Modal */}
      {showBioModal && (
        <div className="bio-modal-overlay" onClick={() => setShowBioModal(false)}>
          <div className="bio-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="bio-modal-header">
              <h3>Faculty Bio: {webinar.speaker?.name || 'Brian L Tuttle'}</h3>
              <button 
                type="button" 
                className="btn-modal-close"
                onClick={() => setShowBioModal(false)}
              >
                &times;
              </button>
            </div>
            <div className="bio-modal-body">
              <p>
                <strong>Brian L. Tuttle, CPHIT, CHP, CBRA, CCVO</strong> is a nationally recognized Certified HIPAA Consultant, certified Healthcare Privacy and Security expert, and IT Auditor with over 22 years of direct experience in Healthcare IT Compliance and OCR audit defense.
              </p>
              <p style={{ marginTop: '0.75rem' }}>
                Mr. Tuttle has overseen thousands of risk analyses and has served as a specialized expert witness in state and federal civil litigation across the United States.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
