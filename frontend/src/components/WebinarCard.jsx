'use client';

import React from 'react';
import Link from 'next/link';

import WebinarCardVisual from './WebinarCardVisual';

export default function WebinarCard({ webinar, isRecorded = false }) {
  const formatDuration = (dur) => {
    if (!dur) return '90 min';
    const lower = dur.toLowerCase();
    const match = lower.match(/\d+/);
    if (match) {
      return `${match[0]} min`;
    }
    return dur;
  };

  const durationText = formatDuration(webinar.duration);
  const tagText = webinar.yearTag || 'NEW FOR 2026';
  const speakerAvatarUrl = webinar.speaker?.avatarUrl || '/speaker-brian.jpg';
  const speakerName = webinar.speaker?.name || 'Brian L. Tuttle';
  const speakerRole = webinar.speaker?.role || 'Health IT & Compliance Consultant';

  return (
    <article className="webinar-card-reference" aria-labelledby={`title-${webinar.id}`}>
      {/* 1. Top Dark Blue Graphic Banner (Dynamic Thematic Template) */}
      <Link href={`/webinars/${webinar.id}`} className="card-top-banner-link">
        {/* Top Header Row: Live Pill (Left) & Duration Pill (Right) */}
        <div className="card-template-top">
          <div className="card-live-pill">
            <span className="card-live-dot" aria-hidden="true"></span>
            <span>{isRecorded ? 'On demand' : 'Live webinar'}</span>
          </div>

          <div className="card-duration-pill">
            <span>{durationText}</span>
          </div>
        </div>

        {/* Banner Content (Left: Label, Title; Right: Topic Themed Graphic) */}
        <div className="card-template-body">
          <div className="card-content-left">
            <span className="card-label-tag">{tagText}</span>
            <h3 className="card-banner-title">
              {webinar.title}
            </h3>
          </div>

          {/* Right Side Topic Themed Visual Artwork */}
          <div className="card-visual-right" aria-hidden="true">
            <WebinarCardVisual webinar={webinar} />
          </div>
        </div>
      </Link>

      {/* 2. Lower White Speaker & Full Title Section (Preserved) */}
      <div className="card-info-area">
        <div className="card-speaker-block">
          <img 
            src={speakerAvatarUrl} 
            alt={speakerName}
            className="card-speaker-img"
            onError={(e) => {
              e.target.style.display = 'none';
              if (e.target.nextSibling) {
                e.target.nextSibling.style.display = 'flex';
              }
            }}
          />
          <div className="card-speaker-fallback" style={{ display: 'none' }}>
            {speakerName.slice(0, 2).toUpperCase()}
          </div>
          <div className="card-speaker-meta">
            <h4 className="card-speaker-name">{speakerName}</h4>
            <p className="card-speaker-role" title={`${speakerRole} at ${webinar.speaker?.company || 'ComplianceTrain'}`}>
              {speakerRole}
            </p>
          </div>
        </div>

        <h3 id={`title-${webinar.id}`} className="card-title-text">
          <Link href={`/webinars/${webinar.id}`}>
            {webinar.title}
          </Link>
        </h3>
      </div>
    </article>
  );
}
