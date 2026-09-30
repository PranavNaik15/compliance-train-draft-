'use client';

import React from 'react';

export default function StatCard({ title, value, icon, color = 'blue', trend, trendLabel }) {
  return (
    <div className="stat-card">
      <div className="stat-card-top">
        <span className="stat-card-title">{title}</span>
        <div className={`stat-card-icon ${color}`}>
          {icon}
        </div>
      </div>

      <div className="stat-card-value">
        {value}
      </div>

      {(trend || trendLabel) && (
        <div className="stat-card-bottom">
          {trend && (
            <span className={`stat-badge-trend ${trend.startsWith('+') ? 'up' : 'down'}`}>
              {trend}
            </span>
          )}
          {trendLabel && (
            <span className="stat-trend-label">{trendLabel}</span>
          )}
        </div>
      )}
    </div>
  );
}
