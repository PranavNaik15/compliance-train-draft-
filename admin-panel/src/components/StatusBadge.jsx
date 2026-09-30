'use client';

import React from 'react';

export default function StatusBadge({ status, label }) {
  if (!status) return null;
  const normalized = String(status).toLowerCase().replace(/[\s-]/g, '_');
  const displayLabel = label || status.replace(/_/g, ' ');

  return (
    <span className={`status-badge ${normalized}`}>
      <span className="badge-dot" style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'currentColor', display: 'inline-block' }}></span>
      {displayLabel}
    </span>
  );
}
