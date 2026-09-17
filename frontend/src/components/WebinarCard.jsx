'use client';

import React from 'react';
import Link from 'next/link';

export default function WebinarCard({ webinar, isRecorded = false }) {
  const formatDateHeader = (dateStr) => {
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

  const formattedDate = formatDateHeader(webinar.date);

  const getTimeDisplay = () => {
    if (webinar.time && webinar.time.includes('PDT') && webinar.time.includes('EDT')) {
      const times = webinar.time.split(' - ');
      return {
        pdt: times[0] || '10:00 AM PDT',
        edt: times[1] || '01:00 PM EDT'
      };
    }
    return {
      pdt: '10:00 AM PDT',
      edt: '01:00 PM EDT'
    };
  };

  const { pdt, edt } = getTimeDisplay();
  const speakerAvatarUrl = webinar.speaker?.avatarUrl || '/speaker-brian.jpg';

  const parseBadgeLabel = (label, title) => {
    const raw = (label || title || '').toUpperCase();
    if (raw.includes(':')) {
      const parts = raw.split(':');
      return {
        category: parts[0].trim(),
        main: parts.slice(1).join(':').trim()
      };
    }
    return {
      category: 'NEW HIPAA TRAINING',
      main: raw.length > 36 ? `${raw.substring(0, 36)}...` : raw
    };
  };

  const { category: badgeCategory, main: badgeMain } = parseBadgeLabel(webinar.badgeLabel, webinar.title);

  return (
    <article className="webinar-card-reference" aria-labelledby={`title-${webinar.id}`}>
      <Link href={`/webinars/${webinar.id}`} className="card-top-link-wrap">
        <div className="card-graphic-banner">
          {/* Top Left Badge */}
          <div className="banner-badge-left">
            <span className={`badge-live-pill ${isRecorded ? 'badge-ondemand-pill' : ''}`}>
              {isRecorded ? 'ON DEMAND' : 'LIVE SESSION'}
            </span>
          </div>

          {/* Centered / Left Notepad Graphic */}
          <div className="card-notepad-graphic">
            <div className="notepad-clip-bar"></div>
            <div className="notepad-category-text">{badgeCategory}</div>
            <div className="notepad-main-text">{badgeMain}</div>
          </div>

          {/* Right Schedule / Access Box */}
          <div className="banner-schedule-box">
            {isRecorded ? (
              <>
                <div className="schedule-box-recorded-label">ACCESS RECORDED</div>
                <div className="schedule-box-dvd-badge">CD-DVD VERSION</div>
              </>
            ) : (
              <>
                <div className="schedule-box-date">{formattedDate}</div>
                <div className="schedule-box-duration-pill">
                  {(webinar.duration || '90 MINUTES').toUpperCase()}
                </div>
                <div className="schedule-box-times">
                  <div className="time-line">{pdt}</div>
                  <div className="time-line">{edt}</div>
                </div>
              </>
            )}
          </div>
        </div>
      </Link>

      <div className="card-info-area">
        <div className="card-speaker-block">
          <img 
            src={speakerAvatarUrl} 
            alt={webinar.speaker.name}
            className="card-speaker-img"
            onError={(e) => {
              e.target.style.display = 'none';
              if (e.target.nextSibling) {
                e.target.nextSibling.style.display = 'flex';
              }
            }}
          />
          <div className="card-speaker-fallback" style={{ display: 'none' }}>
            {webinar.speaker.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="card-speaker-meta">
            <h4 className="card-speaker-name">{webinar.speaker.name}</h4>
            <p className="card-speaker-role" title={`${webinar.speaker.role} at ${webinar.speaker.company}`}>
              {webinar.speaker.role}
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
