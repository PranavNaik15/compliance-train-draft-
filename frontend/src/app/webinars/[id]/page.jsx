'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getWebinarById, getWebinars } from '../../../api/webinarApi';
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
  const [showBioModal, setShowBioModal] = useState(false);
  const [showAllOptions, setShowAllOptions] = useState(false);

  const registrationOptions = [
    {
      id: 'single',
      price: 179,
      title: 'Live Session for One Participant',
      desc: "If you signup & can't make it, do not worry! We have alternate arrangements."
    },
    {
      id: 'group5',
      price: 499,
      title: 'Group 5 Live Session',
      desc: 'Max 5 participants from a single location with 1 Dial-In.'
    },
    {
      id: 'group10',
      price: 699,
      title: 'Group 10 Live Session',
      desc: 'Max 10 participants from a single location with 2 Dial-in.'
    },
    {
      id: 'recorded',
      price: 239,
      title: 'Access Recorded Version',
      desc: 'Avail 12 months unlimited access for a single user.'
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
    },
    {
      id: 'combo',
      price: 299,
      title: 'Combo Offer',
      desc: 'Avail recording + Attend live session for a single participant.'
    },
    {
      id: 'corporate',
      price: 999,
      title: 'Corporate Live Session',
      desc: 'Unlimited participants for max 5 locations.'
    }
  ];

  useEffect(() => {
    if (!id) return;
    let isMounted = true;

    async function loadDetails() {
      try {
        setLoading(true);
        setError(null);
        const [detailData, listData] = await Promise.all([
          getWebinarById(id),
          getWebinars().catch(() => [])
        ]);
        if (isMounted) {
          setWebinar(detailData);
          setAllWebinars(Array.isArray(listData) ? listData : (listData?.data || []));
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
    const selected = registrationOptions.find((opt) => opt.id === selectedOption) || registrationOptions[0];
    router.push(`/webinars/${webinar.id}/register?option=${selected.id}&price=${selected.price}`);
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
        <Link href="/" className="breadcrumb-link">&larr; Back to all webinars</Link>
        <div className="state-box" style={{ borderColor: 'var(--color-red-accent)', marginTop: '1rem' }}>
          <h3 style={{ color: 'var(--color-red-accent)' }}>Webinar Not Found</h3>
          <p>{error || 'The requested webinar could not be located.'}</p>
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
    .slice(0, 4);

  const currentOption = registrationOptions.find((opt) => opt.id === selectedOption) || registrationOptions[0];

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

      {/* 2. Main Content Grid (Left: Hero + Course Content, Right: Registration Sidebar) */}
      <div className="container details-content-container">
        <div className="details-two-col-grid">
          {/* Left Column: Dark Hero Card + Full Course Curriculum */}
          <div className="details-main-col">
            {/* Dark Hero Card */}
            <section className="webinar-details-hero">
              <div className="hero-layout-wrapper">
                {/* Left / Main Area: Title + Limited Seats Message Centered */}
                <div className="hero-main-left">
                  <h1 className="hero-webinar-title">{webinar.title}</h1>
                  <p className="hero-urgency-badge">Limited Seats. Hurry!! Reserve yours NOW!</p>
                </div>

                {/* Right Area: Vertically Stacked 4 Information Boxes */}
                <div className="hero-meta-stack">
                  {/* Box 1: Faculty & Industry */}
                  <div className="hero-meta-box">
                    <div className="meta-box-icon" aria-hidden="true">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="16" rx="2"/>
                        <circle cx="9" cy="10" r="2"/>
                        <line x1="15" y1="8" x2="17" y2="8"/>
                        <line x1="15" y1="12" x2="17" y2="12"/>
                        <line x1="7" y1="16" x2="17" y2="16"/>
                      </svg>
                    </div>
                    <div className="meta-box-text">
                      <div>Faculty : <span className="highlight-yellow">{webinar.speaker?.name || 'Brian L Tuttle'}</span></div>
                      <div>Industry : <span className="highlight-yellow">{webinar.category || 'Health Care & Hospital'}</span></div>
                    </div>
                  </div>

                  {/* Box 2: Live On & Time */}
                  <div className="hero-meta-box">
                    <div className="meta-box-icon" aria-hidden="true">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                        <line x1="16" y1="2" x2="16" y2="6"/>
                        <line x1="8" y1="2" x2="8" y2="6"/>
                        <line x1="3" y1="10" x2="21" y2="10"/>
                      </svg>
                    </div>
                    <div className="meta-box-text">
                      <div>Live On : <span className="highlight-yellow">{webinar.date}</span></div>
                      <div className="highlight-yellow">{webinar.time || '10.00 AM PDT | 01.00 PM EDT'}</div>
                    </div>
                  </div>

                  {/* Box 3: Duration */}
                  <div className="hero-meta-box">
                    <div className="meta-box-icon" aria-hidden="true">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                      </svg>
                    </div>
                    <div className="meta-box-text">
                      <div>Duration : <span className="highlight-yellow">{webinar.duration || '90 Mins'}</span></div>
                    </div>
                  </div>

                  {/* Box 4: Add To Calendar */}
                  <button 
                    type="button" 
                    className="hero-meta-box calendar-action-box"
                    onClick={handleAddToCalendar}
                    title="Add this session to your calendar"
                  >
                    <div className="meta-box-icon" aria-hidden="true">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                        <line x1="16" y1="2" x2="16" y2="6"/>
                        <line x1="8" y1="2" x2="8" y2="6"/>
                        <line x1="3" y1="10" x2="21" y2="10"/>
                        <line x1="12" y1="13" x2="12" y2="17"/>
                        <line x1="10" y1="15" x2="14" y2="15"/>
                      </svg>
                    </div>
                    <div className="meta-box-text">
                      <span className="add-calendar-text">ADD TO CALENDAR</span>
                    </div>
                  </button>
                </div>
              </div>
            </section>

            {/* Full Course Curriculum */}
            <main className="details-course-card">
            {/* Section 1: Course Description */}
            <div className="course-section-block">
              <div className="underlined-heading-wrap">
                <h2 className="underlined-section-heading">Course Description:</h2>
              </div>
              <div className="course-section-content">
                <p>
                  This 90-minute webinar on <strong>"{webinar.title}"</strong> will be addressing how practice/business managers (or compliance officers) need to get their HIPAA house in order as HIPAA HITECH is now fully enforced with bipartisan support. It will also address new congressional mandates, and the major changes and updates for 2026 and beyond – both for the HIPAA Privacy Rule and the HIPAA Security Rule. This will also include "proposed" changes to be on the look out for.
                </p>
                <p>
                  We will be discussing current breaches, most common breaches, telemedicine, texting, emailing, and the OCR audit process.
                </p>
                <p>
                  There's an enormous number of issues and risks for covered entities and business associates these days – we will speak to the most common violations and fines – and how to best avoid fines and headaches.
                </p>
              </div>
            </div>

            {/* Section 2: Why should you Attend? */}
            <div className="course-section-block">
              <div className="underlined-heading-wrap">
                <h2 className="underlined-section-heading">Why should you Attend?</h2>
              </div>
              <div className="course-section-content">
                <p>
                  Join Mr. Brian Tuttle in this 90-minute webinar on <strong>"{webinar.title}"</strong>. Are you prepared for the major overhaul with the HIPAA Security and Privacy Rule for 2026? The Office for Civil Rights is "finally" implementing some badly needed updates for the HIPAA Administrative Simplification (mainly the Security and Privacy Rules).
                </p>
                <p>
                  More breaches of protected health information have occurred from 2022-2024 than the entire history of this regulation combined, hence, the government is taking major actions to strengthen these regulations (especially relating to security of electronic protected health information).
                </p>
                <p>
                  What other changes (if any) can we expect under congressional mandates? Join me in this 90-minute webinar to explore what's new with HIPAA both from a regulation standpoint (new requirements), enforcement standpoint, and highest risks for breach.
                </p>
                <p>
                  This once rarely enforced law has changed and you need to know what's going on! Protect your practice or business! What changes are being implemented from the OCR's Notice of Proposed Rulemaking (NPRM):
                </p>

                <ul className="ct-checklist">
                  <li>
                    <span className="check-blue">✔</span>
                    <span>What about the major increase in cyber attacks and OCR's audit program?</span>
                  </li>
                  <li>
                    <span className="check-blue">✔</span>
                    <span>State laws are now in place increasing liability for patient remedies!</span>
                  </li>
                  <li>
                    <span className="check-blue">✔</span>
                    <span>What factors might spurn a lawsuit or a HIPAA audit? ...are you doing these things?</span>
                  </li>
                </ul>

                <p style={{ marginTop: '0.4rem' }}>
                  Brian will be discussing 2026 changes taking place in Washington with the Health and Human Services regarding the bipartisan backed enforcement of the HIPAA laws already on the books (as well as some detailed discussions on the audit process) and some current events regarding HIPAA cases (both in courtrooms and from live audits).
                </p>
              </div>
            </div>

            {/* Section 3: Areas Covered */}
            <div className="course-section-block">
              <div className="underlined-heading-wrap">
                <h2 className="underlined-section-heading">Areas Covered:</h2>
              </div>
              <div className="course-section-content">
                <ul className="ct-checklist">
                  <li><span className="check-blue">✔</span><span>HIPAA Administrative Simplification Updates (Privacy Rule and Security Rule)</span></li>
                  <li><span className="check-blue">✔</span><span>NPRM's for the HIPAA Security Rule &bull; Updates for the HIPAA Privacy Rule</span></li>
                  <li><span className="check-blue">✔</span><span>Rights of Access &bull; Care Coordination &bull; Information Sharing</span></li>
                  <li><span className="check-blue">✔</span><span>Notice of Privacy Practices &bull; 21st Century Cures Act &bull; Telemedicine (Do's and Don'ts)</span></li>
                  <li><span className="check-blue">✔</span><span>Fines &bull; Portable devices &bull; Texting and Emailing – new guidelines</span></li>
                  <li><span className="check-blue">✔</span><span>New Definition of protected health information &bull; Real life audits and litigated cases</span></li>
                  <li><span className="check-blue">✔</span><span>Business associates and the increased burden &bull; Breach notification &bull; Risk factors</span></li>
                </ul>
              </div>
            </div>

            {/* Section 4: Who will benefit? */}
            <div className="course-section-block">
              <div className="underlined-heading-wrap">
                <h2 className="underlined-section-heading">Who will benefit?</h2>
              </div>
              <div className="course-section-content">
                <p>This webcast will be of a valuable assistance to the below audience.</p>

                <ul className="ct-checklist" style={{ marginTop: '0.4rem' }}>
                  <li>
                    <span className="check-blue">✔</span>
                    <span><strong>Practice Managers &bull; MD's and other Medical Professionals &bull; Any business associates</strong> who work with medical practices or hospitals (i.e. billing companies, transcription companies, IT companies, answering services, home health, coders, attorneys, etc)</span>
                  </li>
                </ul>

                <h4 style={{ color: '#0A3366', fontWeight: 700, margin: '0.65rem 0 0.25rem 0', fontSize: '0.95rem' }}>Companies/Organizations</h4>
                <div className="benefited-orgs-grid">
                  <div className="org-check-item"><span className="check-blue">✔</span><span>Private practice</span></div>
                  <div className="org-check-item"><span className="check-blue">✔</span><span>Hospitals</span></div>
                  <div className="org-check-item"><span className="check-blue">✔</span><span>Billing companies</span></div>
                  <div className="org-check-item"><span className="check-blue">✔</span><span>Transcriptions companies</span></div>
                  <div className="org-check-item"><span className="check-blue">✔</span><span>Home health groups</span></div>
                  <div className="org-check-item"><span className="check-blue">✔</span><span>Health insurance</span></div>
                  <div className="org-check-item"><span className="check-blue">✔</span><span>Ambulatory</span></div>
                  <div className="org-check-item"><span className="check-blue">✔</span><span>IT companies</span></div>
                  <div className="org-check-item"><span className="check-blue">✔</span><span>Attorneys</span></div>
                </div>
              </div>
            </div>
          </main>
          </div>

          {/* Right Column: Sticky Registration Options & Tags */}
          <aside className="details-sidebar-ct" aria-label="Registration Options">
            {/* Registration Options Card */}
            <div className="registration-card-ct">
              <h3 className="registration-card-title">Registration Options</h3>

              {/* Selected Featured Option Banner */}
              <div className="featured-price-block">
                <div className="price-tag-row">
                  <div className="radio-check-indicator active">✓</div>
                  <div className="featured-price-amount">${currentOption.price}</div>
                </div>
                <div className="featured-option-name">{currentOption.title}</div>
                <div className="featured-option-note">{currentOption.desc}</div>

                <button 
                  type="button" 
                  className="btn-add-to-cart"
                  onClick={handleAddToCart}
                >
                  Add to cart
                </button>
              </div>

              {/* Radio List of Available Packages (Top 3 initial, Expandable) */}
              <div className="packages-radio-list">
                {(showAllOptions ? registrationOptions : registrationOptions.slice(0, 3)).map((opt) => (
                  <label 
                    key={opt.id} 
                    className={`package-radio-row ${selectedOption === opt.id ? 'active-row' : ''}`}
                  >
                    <input 
                      type="radio" 
                      name="registrationPackage" 
                      value={opt.id}
                      checked={selectedOption === opt.id}
                      onChange={() => setSelectedOption(opt.id)}
                      className="package-native-radio"
                    />
                    <div className="package-info-col">
                      <div className="package-header-line">
                        <span className="package-price-bold">${opt.price}</span>
                        <span className="package-title-text">{opt.title}</span>
                      </div>
                      {opt.desc && (
                        <p className="package-sub-desc">{opt.desc}</p>
                      )}
                    </div>
                  </label>
                ))}

                {registrationOptions.length > 3 && (
                  <div className="view-more-packages-wrap">
                    <button
                      type="button"
                      className="btn-toggle-packages"
                      onClick={() => setShowAllOptions((prev) => !prev)}
                    >
                      {showAllOptions ? 'View Less' : 'View More'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Tags Box */}
            <div className="tags-card-ct">
              <h3 className="tags-title">Tags</h3>
              <div className="tags-cloud-box">
                <p className="tags-content-text">
                  HIPAA 2026 Changes, HIPAA 2026 updates, HIPAA Changes, HIPAA Security, HIPAA Audit, Omnibus Rule, HIPAA 2026 Law, HIPAA cases, Health Insurance Portability and Accountability Act, Health and Human Services, Health Care, New HIPAA Rules, HIPAA Business Associate, HIPAA Violations and Fines, HIPAA Best Practices
                </p>
              </div>
            </div>

            {/* NEW Recommended Webinars Box */}
            {recommendedWebinars.length > 0 && (
              <div className="recommended-webinars-card">
                <div className="recommended-card-header">
                  <h3 className="recommended-card-title">Recommended Webinars</h3>
                  <Link href="/live-webinars" className="recommended-view-all">
                    View All &rarr;
                  </Link>
                </div>

                <div className="recommended-webinars-list">
                  {recommendedWebinars.map((rec) => (
                    <Link 
                      key={rec.id} 
                      href={`/webinars/${rec.id}`}
                      className="recommended-webinar-item"
                    >
                      {/* Left Thumbnail with Pills */}
                      <div className="rec-thumb-wrap">
                        <div className="rec-live-pill">
                          <span className="rec-live-dot" aria-hidden="true"></span>
                          <span>Live webinar</span>
                        </div>
                        <div className="rec-duration-pill">
                          <span>{formatDuration(rec.duration)}</span>
                        </div>
                        <div className="rec-thumb-graphic" aria-hidden="true">
                          <div className="rec-thumb-circle">
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                              <circle cx="12" cy="11" r="2" fill="#38BDF8" />
                              <path d="M12 13v2.5" strokeWidth="2.5" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Right Details */}
                      <div className="rec-details-col">
                        <span className="rec-tag-text">{rec.yearTag || 'NEW FOR 2026'}</span>
                        <h4 className="rec-title-text" title={rec.title}>{rec.title}</h4>
                        <div className="rec-meta-row">
                          <span className="rec-meta-item">
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                              <line x1="16" y1="2" x2="16" y2="6"></line>
                              <line x1="8" y1="2" x2="8" y2="6"></line>
                              <line x1="3" y1="10" x2="21" y2="10"></line>
                            </svg>
                            {rec.date}
                          </span>
                        </div>
                        <div className="rec-meta-row">
                          <span className="rec-meta-item">
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                              <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                            {rec.speaker?.name || 'Brian L. Tuttle'}
                          </span>
                        </div>
                      </div>

                      {/* Right Subtle Chevron Indicator */}
                      <div className="rec-arrow-circle" aria-hidden="true">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
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
