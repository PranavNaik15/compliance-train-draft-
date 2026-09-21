'use client';

import React from 'react';

/**
 * Determines the visual template theme based on webinar topic, title, category, or ID.
 */
export function getWebinarTheme(webinar) {
  if (!webinar) return 'shield';

  const text = `${webinar.title || ''} ${webinar.category || ''} ${webinar.id || ''}`.toLowerCase();

  if (text.includes('ai') || text.includes('artificial intelligence') || text.includes('generative')) {
    return 'ai';
  }
  if (text.includes('breach') || text.includes('ransomware') || text.includes('notification') || text.includes('incident') || text.includes('magnifying') || text.includes('ocr')) {
    return 'breach';
  }
  if (text.includes('risk assessment') || text.includes('sra') || text.includes('assessment') || text.includes('checklist')) {
    return 'assessment';
  }
  if (text.includes('security rule') || text.includes('clarified') || text.includes('lock') || text.includes('password') || text.includes('mfa')) {
    return 'security';
  }
  if (text.includes('upcoming') || text.includes('2027') || text.includes('future') || text.includes('beyond') || text.includes('calendar')) {
    return 'calendar';
  }
  if (text.includes('samhsa') || text.includes('substance') || text.includes('42 cfr') || text.includes('people') || text.includes('patient consent')) {
    return 'samhsa';
  }
  if (text.includes('training') || text.includes('compliance officer') || text.includes('officer') || text.includes('workshop')) {
    return 'training';
  }
  if (text.includes('cloud') || text.includes('vendor') || text.includes('baa') || text.includes('business associate') || text.includes('third-party')) {
    return 'cloud';
  }

  return 'shield';
}

/**
 * Reusable visual artwork rendered in the top-right dark blue area of webinar cards.
 */
export default function WebinarCardVisual({ webinar, size = 'normal' }) {
  const theme = getWebinarTheme(webinar);

  switch (theme) {
    case 'breach':
      // OCR Breach Notification / Documents + Magnifying Glass Inspection
      return (
        <div className={`card-visual-theme theme-breach ${size}`} aria-hidden="true">
          <svg viewBox="0 0 120 120" className="card-theme-svg" fill="none">
            {/* Background Documents */}
            <g opacity="0.85">
              <rect x="24" y="20" width="46" height="60" rx="4" fill="#0C2D54" stroke="#1D4E89" strokeWidth="1.5" />
              <line x1="32" y1="32" x2="58" y2="32" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
              <line x1="32" y1="42" x2="62" y2="42" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
              <line x1="32" y1="52" x2="52" y2="52" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" opacity="0.5" />

              <rect x="42" y="32" width="48" height="62" rx="4" fill="#133E75" stroke="#2563EB" strokeWidth="1.5" />
              <line x1="50" y1="46" x2="78" y2="46" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
              <line x1="50" y1="56" x2="82" y2="56" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
              <line x1="50" y1="66" x2="70" y2="66" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
            </g>
            {/* Magnifying Glass */}
            <circle cx="82" cy="74" r="18" fill="#0E3360" stroke="#38BDF8" strokeWidth="3" />
            <circle cx="82" cy="74" r="13" fill="#1E40AF" opacity="0.4" />
            <path d="M78 70L86 78M86 70L78 78" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
            <line x1="95" y1="87" x2="110" y2="102" stroke="#38BDF8" strokeWidth="4" strokeLinecap="round" />
          </svg>
        </div>
      );

    case 'ai':
      // Artificial Intelligence Chip with Neural Circuit Connections
      return (
        <div className={`card-visual-theme theme-ai ${size}`} aria-hidden="true">
          <svg viewBox="0 0 120 120" className="card-theme-svg" fill="none">
            {/* Outer Circuit Nodes & Traces */}
            <g stroke="#38BDF8" strokeWidth="2" strokeLinecap="round">
              {/* Top pins */}
              <line x1="50" y1="36" x2="50" y2="20" />
              <circle cx="50" cy="18" r="3" fill="#38BDF8" stroke="none" />
              <line x1="62" y1="36" x2="62" y2="16" />
              <circle cx="62" cy="14" r="3" fill="#38BDF8" stroke="none" />
              <line x1="74" y1="36" x2="74" y2="20" />
              <circle cx="74" cy="18" r="3" fill="#38BDF8" stroke="none" />

              {/* Bottom pins */}
              <line x1="50" y1="84" x2="50" y2="100" />
              <circle cx="50" cy="102" r="3" fill="#38BDF8" stroke="none" />
              <line x1="62" y1="84" x2="62" y2="104" />
              <circle cx="62" cy="106" r="3" fill="#38BDF8" stroke="none" />
              <line x1="74" y1="84" x2="74" y2="100" />
              <circle cx="74" cy="102" r="3" fill="#38BDF8" stroke="none" />

              {/* Left pins */}
              <line x1="36" y1="50" x2="20" y2="50" />
              <circle cx="18" cy="50" r="3" fill="#38BDF8" stroke="none" />
              <line x1="36" y1="62" x2="16" y2="62" />
              <circle cx="14" cy="62" r="3" fill="#38BDF8" stroke="none" />
              <line x1="36" y1="74" x2="20" y2="74" />
              <circle cx="18" cy="74" r="3" fill="#38BDF8" stroke="none" />

              {/* Right pins */}
              <line x1="88" y1="50" x2="104" y2="50" />
              <circle cx="106" cy="50" r="3" fill="#38BDF8" stroke="none" />
              <line x1="88" y1="62" x2="108" y2="62" />
              <circle cx="110" cy="62" r="3" fill="#38BDF8" stroke="none" />
              <line x1="88" y1="74" x2="104" y2="74" />
              <circle cx="106" cy="74" r="3" fill="#38BDF8" stroke="none" />
            </g>

            {/* Central Microchip */}
            <rect x="36" y="36" width="52" height="52" rx="8" fill="#0A3A75" stroke="#38BDF8" strokeWidth="2" />
            <rect x="42" y="42" width="40" height="40" rx="5" fill="#082852" stroke="#1D4ED8" strokeWidth="1.5" />
            <text x="62" y="68" fill="#FFFFFF" fontSize="20" fontWeight="900" fontFamily="sans-serif" textAnchor="middle" letterSpacing="1">
              AI
            </text>
          </svg>
        </div>
      );

    case 'assessment':
      // Security Risk Assessment Checklist Clipboard with Approved Badge
      return (
        <div className={`card-visual-theme theme-assessment ${size}`} aria-hidden="true">
          <svg viewBox="0 0 120 120" className="card-theme-svg" fill="none">
            {/* Clipboard Body */}
            <rect x="28" y="24" width="56" height="74" rx="7" fill="#0E3360" stroke="#38BDF8" strokeWidth="2" />
            {/* Top Clip */}
            <rect x="44" y="16" width="24" height="12" rx="3" fill="#1D5FA8" stroke="#38BDF8" strokeWidth="1.5" />
            <circle cx="56" cy="22" r="2.5" fill="#FFFFFF" />

            {/* Checkmark Items */}
            <g stroke="#38BDF8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M37 44L41 48L49 40" stroke="#60A5FA" />
              <line x1="53" y1="44" x2="74" y2="44" stroke="#93C5FD" opacity="0.8" />

              <path d="M37 58L41 62L49 54" stroke="#60A5FA" />
              <line x1="53" y1="58" x2="74" y2="58" stroke="#93C5FD" opacity="0.8" />

              <path d="M37 72L41 76L49 68" stroke="#60A5FA" />
              <line x1="53" y1="72" x2="68" y2="72" stroke="#93C5FD" opacity="0.8" />
            </g>

            {/* Floating Approved Badge */}
            <circle cx="86" cy="84" r="17" fill="#0066CC" stroke="#38BDF8" strokeWidth="2.5" />
            <path d="M78 84L83 89L94 78" stroke="#FFFFFF" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      );

    case 'security':
      // HIPAA Security Rule / Lock & Cyber Shield
      return (
        <div className={`card-visual-theme theme-security ${size}`} aria-hidden="true">
          <svg viewBox="0 0 120 120" className="card-theme-svg" fill="none">
            {/* Concentric Halo Background */}
            <circle cx="76" cy="62" r="42" fill="#0E3360" opacity="0.5" />
            <circle cx="76" cy="62" r="32" fill="#10427A" opacity="0.6" />

            {/* Padlock */}
            <g>
              {/* Shackle */}
              <path d="M62 52V40C62 32.268 68.268 26 76 26C83.732 26 90 32.268 90 40V52" stroke="#93C5FD" strokeWidth="6" strokeLinecap="round" />
              {/* Lock Body */}
              <rect x="52" y="50" width="48" height="42" rx="9" fill="#0066CC" stroke="#38BDF8" strokeWidth="2.5" />
              {/* Keyhole */}
              <circle cx="76" cy="67" r="4.5" fill="#082852" />
              <path d="M76 71.5V78" stroke="#082852" strokeWidth="3.5" strokeLinecap="round" />
            </g>
          </svg>
        </div>
      );

    case 'calendar':
      // Upcoming 2027 HIPAA Changes / Calendar with Clock
      return (
        <div className={`card-visual-theme theme-calendar ${size}`} aria-hidden="true">
          <svg viewBox="0 0 120 120" className="card-theme-svg" fill="none">
            {/* Calendar Body */}
            <rect x="26" y="26" width="64" height="60" rx="8" fill="#0E3360" stroke="#38BDF8" strokeWidth="2" />
            {/* Top Red/Blue Header Bar */}
            <path d="M26 34C26 29.5817 29.5817 26 34 26H82C86.4183 26 90 29.5817 90 34V40H26V34Z" fill="#1D4ED8" />
            {/* Binder Rings */}
            <rect x="38" y="20" width="6" height="12" rx="3" fill="#FFFFFF" />
            <rect x="72" y="20" width="6" height="12" rx="3" fill="#FFFFFF" />

            {/* Calendar Grid Squares */}
            <g fill="#93C5FD" opacity="0.8">
              <rect x="36" y="48" width="8" height="8" rx="2" />
              <rect x="50" y="48" width="8" height="8" rx="2" />
              <rect x="64" y="48" width="8" height="8" rx="2" fill="#38BDF8" />
              <rect x="36" y="62" width="8" height="8" rx="2" />
              <rect x="50" y="62" width="8" height="8" rx="2" fill="#38BDF8" />
            </g>

            {/* Small Clock on Bottom-Right */}
            <circle cx="86" cy="84" r="16" fill="#0066CC" stroke="#FFFFFF" strokeWidth="2.2" />
            <path d="M86 74V84L92 88" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      );

    case 'samhsa':
      // SAMHSA / People & Healthcare Organization
      return (
        <div className={`card-visual-theme theme-samhsa ${size}`} aria-hidden="true">
          <svg viewBox="0 0 120 120" className="card-theme-svg" fill="none">
            {/* Concentric Glow */}
            <circle cx="70" cy="62" r="38" fill="#0E3360" opacity="0.5" />

            {/* Left Supporting Person */}
            <g opacity="0.75">
              <circle cx="46" cy="52" r="9" fill="#38BDF8" />
              <path d="M30 78C30 68 38 65 46 65C54 65 62 68 62 78" fill="#1D4ED8" stroke="#38BDF8" strokeWidth="1.5" />
            </g>

            {/* Right Supporting Person */}
            <g opacity="0.75">
              <circle cx="94" cy="52" r="9" fill="#38BDF8" />
              <path d="M78 78C78 68 86 65 94 65C102 65 110 68 110 78" fill="#1D4ED8" stroke="#38BDF8" strokeWidth="1.5" />
            </g>

            {/* Center Lead Person */}
            <g>
              <circle cx="70" cy="46" r="12" fill="#FFFFFF" stroke="#38BDF8" strokeWidth="2" />
              <path d="M50 82C50 70 60 67 70 67C80 67 90 70 90 82" fill="#0066CC" stroke="#FFFFFF" strokeWidth="2" />
            </g>
          </svg>
        </div>
      );

    case 'training':
      // Compliance Training Presentation Whiteboard with Growth Chart
      return (
        <div className={`card-visual-theme theme-training ${size}`} aria-hidden="true">
          <svg viewBox="0 0 120 120" className="card-theme-svg" fill="none">
            {/* Tripod Stand */}
            <line x1="62" y1="78" x2="62" y2="102" stroke="#60A5FA" strokeWidth="3" strokeLinecap="round" />
            <line x1="62" y1="92" x2="44" y2="106" stroke="#60A5FA" strokeWidth="3" strokeLinecap="round" />
            <line x1="62" y1="92" x2="80" y2="106" stroke="#60A5FA" strokeWidth="3" strokeLinecap="round" />

            {/* Whiteboard Frame */}
            <rect x="28" y="24" width="68" height="54" rx="5" fill="#0E3360" stroke="#38BDF8" strokeWidth="2.5" />
            <rect x="34" y="30" width="56" height="42" rx="3" fill="#082852" />

            {/* Bar Chart on Board */}
            <rect x="42" y="54" width="8" height="14" rx="1.5" fill="#60A5FA" />
            <rect x="54" y="44" width="8" height="24" rx="1.5" fill="#38BDF8" />
            <rect x="66" y="36" width="8" height="32" rx="1.5" fill="#FFFFFF" />
            <path d="M42 50L54 40L66 32L78 28" stroke="#FCD34D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      );

    case 'cloud':
      // Cloud Security / Vendor BAA Protection
      return (
        <div className={`card-visual-theme theme-cloud ${size}`} aria-hidden="true">
          <svg viewBox="0 0 120 120" className="card-theme-svg" fill="none">
            {/* Concentric Glow */}
            <circle cx="72" cy="62" r="38" fill="#0E3360" opacity="0.5" />

            {/* Cloud Outline */}
            <path
              d="M40 76H86C95.941 76 104 67.941 104 58C104 48.566 96.724 40.832 87.494 40.076C85.586 28.583 75.631 20 63.5 20C50.245 20 39.5 30.745 39.5 44C39.5 44.757 39.547 45.503 39.637 46.236C30.732 47.388 24 54.912 24 64C24 70.627 31.17 76 40 76Z"
              fill="#0E3A70"
              stroke="#38BDF8"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />

            {/* Security Up-Arrow inside Cloud */}
            <g>
              <path d="M64 42L50 56H58V70H70V56H78L64 42Z" fill="#FFFFFF" stroke="#38BDF8" strokeWidth="1.5" strokeLinejoin="round" />
            </g>
          </svg>
        </div>
      );

    case 'shield':
    default:
      // HIPAA Changes & Compliance Security Shield with Keyhole
      return (
        <div className={`card-visual-theme theme-shield ${size}`} aria-hidden="true">
          <div className="card-concentric-outer">
            <div className="card-concentric-inner">
              <svg
                className="card-shield-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <circle cx="12" cy="10" r="2.2" fill="currentColor" />
                <path d="M12 12v3.5" strokeWidth="2.5" />
              </svg>
            </div>
          </div>
        </div>
      );
  }
}
