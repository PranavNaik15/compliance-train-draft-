'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function Header() {
  const [searchVal, setSearchVal] = useState('');

  return (
    <header className="admin-header">
      <div className="header-left">
        <div className="header-websites-switch">
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94A3B8', padding: '0 0.35rem' }}>
            MANAGING:
          </span>
          <a 
            href="http://localhost:5173" 
            target="_blank" 
            rel="noreferrer"
            className="website-link-pill" 
            title="Open Original Website in new tab"
          >
            <span className="status-indicator-dot"></span>
            Original Website (:5173) ↗
          </a>
          <a 
            href="http://localhost:5174" 
            target="_blank" 
            rel="noreferrer"
            className="website-link-pill" 
            title="Open Compliance Bridge Website in new tab"
          >
            <span className="status-indicator-dot"></span>
            Compliance Bridge (:5174) ↗
          </a>
        </div>
      </div>

      <div className="header-right">
        <div className="header-search-wrap">
          <svg className="header-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            className="header-search-input"
            placeholder="Search webinars, orders, tickets..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            aria-label="Global quick search"
          />
        </div>

        <Link href="/notifications" className="header-icon-btn" title="View Notifications">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          <span className="header-icon-badge">4</span>
        </Link>

        <Link href="/settings" className="header-icon-btn" title="Admin Settings">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </Link>
      </div>
    </header>
  );
}
