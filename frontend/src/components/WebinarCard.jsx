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
  const badgeTitle = webinar.badgeLabel || webinar.title.toUpperCase();

  return (
    <article className="webinar-card-reference" aria-labelledby={`title-${webinar.id}`}>
      <Link href={`/webinars/${webinar.id}`} className="card-top-link-wrap">
        <div className="card-graphic-banner">
          <div className="banner-note-card">
            <div className="note-card-inner">
              <span className="note-card-heading">
                {badgeTitle.length > 40 ? `${badgeTitle.substring(0, 40)}...` : badgeTitle}
              </span>
            </div>
          </div>

          <div className="banner-badge-left">
            <span className="badge-live-pill">
              {isRecorded ? 'ON DEMAND' : 'LIVE SESSION'}
            </span>
          </div>

          <div className="banner-schedule-box">
            <div className="schedule-box-date">{formattedDate}</div>
            <div className="schedule-box-duration-pill">
              {(webinar.duration || '90 MINUTES').toUpperCase()}
            </div>
            <div className="schedule-box-times">
              <div className="time-line">{pdt}</div>
              <div className="time-line">{edt}</div>
            </div>
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
