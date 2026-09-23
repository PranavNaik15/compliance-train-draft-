'use client';

import React from 'react';
import { getWebinarInfographicData } from '../data/webinarInfographics';

/**
 * High-precision SVG icon set matching the reference infographic.
 */
function InfographicIcon({ name, color = '#FFFFFF', size = 18, strokeWidth = 2.2 }) {
  const baseProps = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: color,
    strokeWidth,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    className: 'infographic-icon-svg'
  };

  switch (name) {
    case 'shield-cross':
      return (
        <svg {...baseProps}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <line x1="12" y1="8" x2="12" y2="14" strokeWidth="2.5" />
          <line x1="9" y1="11" x2="15" y2="11" strokeWidth="2.5" />
        </svg>
      );
    case 'shield':
    case 'shield-check':
      return (
        <svg {...baseProps}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <polyline points="9 12 11 14 15 10" strokeWidth="2.5" />
        </svg>
      );
    case 'gavel':
      return (
        <svg {...baseProps}>
          <path d="m14 13-7.5 7.5c-.8.8-2.2.8-3 0s-.8-2.2 0-3L11 10" />
          <path d="m16 16 6-6" />
          <path d="m8 8 6-6" />
          <path d="m9 7 8 8" />
          <path d="m21 11-8-8" />
        </svg>
      );
    case 'lightbulb':
      return (
        <svg {...baseProps}>
          <line x1="9" y1="18" x2="15" y2="18" />
          <line x1="10" y1="22" x2="14" y2="22" />
          <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
        </svg>
      );
    case 'document':
    case 'file-text':
      return (
        <svg {...baseProps}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      );
    case 'lock':
      return (
        <svg {...baseProps}>
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      );
    case 'search':
      return (
        <svg {...baseProps}>
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      );
    case 'share-nodes':
    case 'share-2':
    case 'network':
      return (
        <svg {...baseProps}>
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
      );
    case 'alert-triangle':
    case 'alert-circle':
      return (
        <svg {...baseProps}>
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" strokeWidth="2.5" />
        </svg>
      );
    case 'smartphone':
    case 'phone':
      return (
        <svg {...baseProps}>
          <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
          <line x1="12" y1="18" x2="12.01" y2="18" strokeWidth="2.5" />
        </svg>
      );
    case 'database':
    case 'server':
      return (
        <svg {...baseProps}>
          <ellipse cx="12" cy="5" rx="9" ry="3" />
          <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
          <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
        </svg>
      );
    case 'monitor-medical':
    case 'laptop-medical':
    case 'laptop':
      return (
        <svg {...baseProps}>
          <rect x="3" y="4" width="18" height="12" rx="2" />
          <line x1="2" y1="20" x2="22" y2="20" />
          <line x1="12" y1="7" x2="12" y2="11" strokeWidth="2" />
          <line x1="10" y1="9" x2="14" y2="9" strokeWidth="2" />
        </svg>
      );
    case 'doctor':
    case 'clinician':
    case 'stethoscope':
      return (
        <svg {...baseProps}>
          <circle cx="12" cy="7" r="3.5" />
          <path d="M6 21v-2a6 6 0 0 1 12 0v2" />
          <path d="M9 13.5v2a3 3 0 0 0 6 0v-2" strokeWidth="1.8" />
          <circle cx="12" cy="17.5" r="0.9" fill="currentColor" />
        </svg>
      );
    case 'users':
      return (
        <svg {...baseProps}>
          <circle cx="9" cy="7" r="4" />
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        </svg>
      );
    case 'building':
    case 'organization':
    case 'hospital':
      return (
        <svg {...baseProps}>
          <rect x="4" y="3" width="16" height="18" rx="2" />
          <line x1="8" y1="7" x2="8.01" y2="7" strokeWidth="2.5" />
          <line x1="12" y1="7" x2="12.01" y2="7" strokeWidth="2.5" />
          <line x1="16" y1="7" x2="16.01" y2="7" strokeWidth="2.5" />
          <line x1="8" y1="11" x2="8.01" y2="11" strokeWidth="2.5" />
          <line x1="12" y1="12" x2="12.01" y2="12" strokeWidth="2.5" />
          <line x1="16" y1="11" x2="16.01" y2="11" strokeWidth="2.5" />
          <line x1="8" y1="15" x2="8.01" y2="15" strokeWidth="2.5" />
          <line x1="16" y1="15" x2="16.01" y2="15" strokeWidth="2.5" />
          <path d="M11 21v-4h2v4" />
        </svg>
      );
    case 'clock':
    case 'time':
    case 'history':
      return (
        <svg {...baseProps}>
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      );
    default:
      return (
        <svg {...baseProps}>
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      );
  }
}

/**
 * Reusable WebinarInfographic Component.
 * Pixel-by-pixel 100% compact copy matching the reference image.
 */
export default function WebinarInfographic({ webinar }) {
  const data = getWebinarInfographicData(webinar);

  // 4 Feature Cards around center circular hub
  const cardTopLeft = data.keyPoints[0] || {
    icon: 'document',
    title: '2026 HIPAA Changes',
    desc: 'Understand the latest regulatory updates and proposed changes.'
  };

  const cardBottomLeft = data.keyPoints[2] || {
    icon: 'lock',
    title: 'Security & Breach Risks',
    desc: 'Get insights on increasing cyber threats, state laws and liability for patient remedies.'
  };

  const cardTopRight = data.keyPoints[1] || {
    icon: 'gavel',
    title: 'Enforcement & Audits',
    desc: "Learn about OCR's audit program, current enforcement trends and real-life case examples."
  };

  const cardBottomRight = data.keyPoints[3] || {
    icon: 'lightbulb',
    title: 'Practical Compliance Guidance',
    desc: 'Learn actionable steps to avoid fines, reduce risk and ensure compliant operations.'
  };

  return (
    <div className="infographic-root-layout" role="region" aria-label="Webinar Infographic Overview">
      
      {/* ================================================================= */}
      {/* MODULE 1: WHY SHOULD YOU ATTEND? & CIRCULAR HUB STAGE             */}
      {/* ================================================================= */}
      <section className="infographic-module-card module-top" aria-label="Why Should You Attend">
        
        {/* Header Block with Two-Tone Title */}
        <div className="module-header-group">
          <div className="module-title-with-bar">
            <h2 className="module-heading-text">
              <span className="heading-navy">Why Should You </span>
              <span className="heading-blue">Attend?</span>
            </h2>
            <div className="module-heading-accent-bar" aria-hidden="true"></div>
          </div>
          <p className="module-intro-paragraph">{data.intro}</p>
        </div>

        {/* Central Circular Stage (4 Compact Cards + Stepped Connectors + Central Animated Circle) */}
        <div className="infographic-hub-stage">
          
          {/* Left Cards Column */}
          <div className="hub-cards-col col-left">
            {/* Top-Left Card */}
            <div className="hub-feature-card card-tl">
              <div className="feature-card-outer-circle" aria-hidden="true">
                <div className="feature-card-inner-circle">
                  <InfographicIcon name={cardTopLeft.icon} size={16} strokeWidth={2.2} />
                </div>
              </div>
              <div className="feature-card-text-block">
                <h3 className="feature-card-title">{cardTopLeft.title}</h3>
                <p className="feature-card-desc">{cardTopLeft.desc}</p>
              </div>
            </div>

            {/* Bottom-Left Card */}
            <div className="hub-feature-card card-bl">
              <div className="feature-card-outer-circle" aria-hidden="true">
                <div className="feature-card-inner-circle">
                  <InfographicIcon name={cardBottomLeft.icon} size={16} strokeWidth={2.2} />
                </div>
              </div>
              <div className="feature-card-text-block">
                <h3 className="feature-card-title">{cardBottomLeft.title}</h3>
                <p className="feature-card-desc">{cardBottomLeft.desc}</p>
              </div>
            </div>
          </div>

          {/* Central Circular Hub & Stepped Circuit Connectors */}
          <div className="hub-center-stage" aria-hidden="true">
            
            {/* Stepped Circuit Connector SVG Overlay */}
            <svg className="hub-circuit-svg" viewBox="0 0 200 170" preserveAspectRatio="none">
              {/* Top-Left Stepped Line & Nodes */}
              <polyline points="0,40 45,40 45,62 65,62" stroke="#0066CC" strokeWidth="2" fill="none" />
              <circle cx="45" cy="40" r="3.2" fill="#0066CC" stroke="#FFFFFF" strokeWidth="1.2" />
              <circle cx="65" cy="62" r="3.2" fill="#0A2540" stroke="#38BDF8" strokeWidth="1.5" />

              {/* Bottom-Left Stepped Line & Nodes */}
              <polyline points="0,130 45,130 45,108 65,108" stroke="#0066CC" strokeWidth="2" fill="none" />
              <circle cx="45" cy="130" r="3.2" fill="#0066CC" stroke="#FFFFFF" strokeWidth="1.2" />
              <circle cx="65" cy="108" r="3.2" fill="#0A2540" stroke="#38BDF8" strokeWidth="1.5" />

              {/* Top-Right Stepped Line & Nodes */}
              <polyline points="200,40 155,40 155,62 135,62" stroke="#0066CC" strokeWidth="2" fill="none" />
              <circle cx="155" cy="40" r="3.2" fill="#0066CC" stroke="#FFFFFF" strokeWidth="1.2" />
              <circle cx="135" cy="62" r="3.2" fill="#0A2540" stroke="#38BDF8" strokeWidth="1.5" />

              {/* Bottom-Right Stepped Line & Nodes */}
              <polyline points="200,130 155,130 155,108 135,108" stroke="#0066CC" strokeWidth="2" fill="none" />
              <circle cx="155" cy="130" r="3.2" fill="#0066CC" stroke="#FFFFFF" strokeWidth="1.2" />
              <circle cx="135" cy="108" r="3.2" fill="#0A2540" stroke="#38BDF8" strokeWidth="1.5" />
            </svg>

            {/* Central Layered Circular Element */}
            <div className="hub-circular-node">
              {/* Outer Segmented Rotating Cyan Arcs */}
              <div className="hub-segmented-arcs"></div>

              {/* Deep Navy Inner Core */}
              <div className="hub-navy-core">
                {/* White Shield Emblem with Blue Cross */}
                <div className="hub-shield-emblem">
                  <InfographicIcon name={data.centralIcon || 'shield-cross'} size={18} color="#0066CC" strokeWidth={2.5} />
                </div>

                {/* Bold Center Titles */}
                <div className="hub-text-stack">
                  <span className="hub-text-line-1">{data.centralTitle}</span>
                  <span className="hub-text-line-2">{data.centralSubtitle}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Cards Column */}
          <div className="hub-cards-col col-right">
            {/* Top-Right Card */}
            <div className="hub-feature-card card-tr">
              <div className="feature-card-outer-circle" aria-hidden="true">
                <div className="feature-card-inner-circle">
                  <InfographicIcon name={cardTopRight.icon} size={16} strokeWidth={2.2} />
                </div>
              </div>
              <div className="feature-card-text-block">
                <h3 className="feature-card-title">{cardTopRight.title}</h3>
                <p className="feature-card-desc">{cardTopRight.desc}</p>
              </div>
            </div>

            {/* Bottom-Right Card */}
            <div className="hub-feature-card card-br">
              <div className="feature-card-outer-circle" aria-hidden="true">
                <div className="feature-card-inner-circle">
                  <InfographicIcon name={cardBottomRight.icon} size={16} strokeWidth={2.2} />
                </div>
              </div>
              <div className="feature-card-text-block">
                <h3 className="feature-card-title">{cardBottomRight.title}</h3>
                <p className="feature-card-desc">{cardBottomRight.desc}</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ================================================================= */}
      {/* MODULE 2: AREAS COVERED 4-COLUMN GRID                             */}
      {/* ================================================================= */}
      <section className="infographic-module-card module-areas" aria-label="Areas Covered">
        
        {/* Header Block with Two-Tone Title */}
        <div className="module-header-group">
          <div className="module-title-with-bar">
            <h2 className="module-heading-text">
              <span className="heading-navy">Areas </span>
              <span className="heading-blue">Covered</span>
            </h2>
            <div className="module-heading-accent-bar" aria-hidden="true"></div>
          </div>
        </div>

        {/* 4-Column Grid Container */}
        <div className="areas-grid-4col">
          {data.areasCovered && data.areasCovered.map((topic, idx) => (
            <div className="area-card-item" key={idx}>
              <div className="area-card-icon-wrap" aria-hidden="true">
                <div className="area-card-icon-inner">
                  <InfographicIcon name={topic.icon} size={15} color="#FFFFFF" strokeWidth={2.2} />
                </div>
              </div>
              <div className="area-card-text-block">
                <h4 className="area-card-title">
                  {topic.title.split('\n').map((line, i) => (
                    <React.Fragment key={i}>
                      {line}
                      {i < topic.title.split('\n').length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </h4>
                {topic.sub && (
                  <p className="area-card-sub">
                    {topic.sub.split('\n').map((line, i) => (
                      <React.Fragment key={i}>
                        {line}
                        {i < topic.sub.split('\n').length - 1 && <br />}
                      </React.Fragment>
                    ))}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================================================================= */}
      {/* MODULE 3: WHO WILL BENEFIT? DUAL AUDIENCE CARDS                   */}
      {/* ================================================================= */}
      <section className="infographic-module-card module-audience" aria-label="Who Will Benefit">
        
        {/* Header Block with Two-Tone Title */}
        <div className="module-header-group">
          <div className="module-title-with-bar">
            <h2 className="module-heading-text">
              <span className="heading-navy">Who Will </span>
              <span className="heading-blue">Benefit?</span>
            </h2>
            <div className="module-heading-accent-bar" aria-hidden="true"></div>
          </div>
        </div>

        <div className="audience-pill-grid">
          
          {/* Left Card: Relevant Professionals */}
          <div className="audience-banner-card card-professionals">
            {/* Top Gradient Header Banner */}
            <div className="audience-card-header-bar">
              <div className="audience-header-avatar" aria-hidden="true">
                <InfographicIcon name="doctor" size={18} color="#FFFFFF" strokeWidth={2.2} />
              </div>
              <span className="audience-header-title">{data.professionals?.title || 'Healthcare Professionals'}</span>
            </div>

            {/* Card Body with Checklist and Watermark */}
            <div className="audience-banner-card-body">
              <ul className="audience-pill-bullet-list">
                {data.professionals?.items && data.professionals.items.map((item, idx) => (
                  <li key={idx} className="audience-pill-bullet-row">
                    <span className="audience-blue-circle-check" aria-hidden="true">✓</span>
                    <span className="audience-pill-bullet-text">{item}</span>
                  </li>
                ))}
              </ul>

              {/* Faint Medical Cross Watermark */}
              <div className="audience-card-watermark watermark-cross" aria-hidden="true">
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#0066CC" strokeWidth="2.5">
                  <path d="M12 4v16M4 12h16" strokeLinecap="round" />
                </svg>
              </div>
            </div>
          </div>

          {/* Right Card: Relevant Companies / Organizations */}
          <div className="audience-banner-card card-organizations">
            {/* Top Gradient Header Banner */}
            <div className="audience-card-header-bar">
              <div className="audience-header-avatar" aria-hidden="true">
                <InfographicIcon name="building" size={18} color="#FFFFFF" strokeWidth={2.2} />
              </div>
              <span className="audience-header-title">{data.organizations?.title || 'Companies / Organizations'}</span>
            </div>

            {/* Card Body with 2-Column Checklist and Watermark */}
            <div className="audience-banner-card-body">
              <div className="audience-col-split-2">
                <ul className="audience-pill-bullet-list">
                  {data.organizations?.col1 && data.organizations.col1.map((item, idx) => (
                    <li key={idx} className="audience-pill-bullet-row">
                      <span className="audience-blue-circle-check" aria-hidden="true">✓</span>
                      <span className="audience-pill-bullet-text">{item}</span>
                    </li>
                  ))}
                </ul>

                <ul className="audience-pill-bullet-list">
                  {data.organizations?.col2 && data.organizations.col2.map((item, idx) => (
                    <li key={idx} className="audience-pill-bullet-row">
                      <span className="audience-blue-circle-check" aria-hidden="true">✓</span>
                      <span className="audience-pill-bullet-text">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Faint Corporate City Skyline Watermark */}
              <div className="audience-card-watermark watermark-skyline" aria-hidden="true">
                <svg width="68" height="62" viewBox="0 0 24 24" fill="none" stroke="#0066CC" strokeWidth="1.8">
                  <rect x="3" y="4" width="7" height="18" rx="1" />
                  <rect x="13" y="8" width="8" height="14" rx="1" />
                  <line x1="6" y1="8" x2="6.01" y2="8" strokeWidth="2" />
                  <line x1="6" y1="12" x2="6.01" y2="12" strokeWidth="2" />
                  <line x1="6" y1="16" x2="6.01" y2="16" strokeWidth="2" />
                  <line x1="17" y1="12" x2="17.01" y2="12" strokeWidth="2" />
                  <line x1="17" y1="16" x2="17.01" y2="16" strokeWidth="2" />
                </svg>
              </div>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}

