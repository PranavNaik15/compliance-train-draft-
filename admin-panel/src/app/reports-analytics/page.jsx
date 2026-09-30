'use client';

import React, { useState, useEffect } from 'react';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';

export default function ReportsAnalyticsPage() {
  const [reportsData, setReportsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/reports/overview');
      if (!res.ok) {
        throw new Error(`Failed to load reports (HTTP ${res.status})`);
      }
      const json = await res.json();
      setReportsData(json.data || null);
    } catch (err) {
      console.error('Error fetching reports overview:', err);
      setError('Unable to load reports from backend on port 5001.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  if (loading) {
    return (
      <div>
        <div className="page-header">
          <div className="page-header-title-wrap">
            <h1 className="page-header-title">Reports &amp; Business Analytics</h1>
            <p className="page-header-subtitle">
              Loading real-time performance analytics from persistent JSON storage...
            </p>
          </div>
        </div>
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</div>
          <p>Calculating statistics across webinars, registrations, orders, and inquiries...</p>
        </div>
      </div>
    );
  }

  if (error || !reportsData) {
    return (
      <div>
        <div className="page-header">
          <div className="page-header-title-wrap">
            <h1 className="page-header-title">Reports &amp; Business Analytics</h1>
            <p className="page-header-subtitle">
              Consolidated revenue, registration volumes, and platform comparisons.
            </p>
          </div>
        </div>
        <div style={{ padding: '1.25rem', backgroundColor: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B', borderRadius: '8px', marginBottom: '1.25rem', fontWeight: 600 }}>
          ⚠️ {error || 'Failed to load report analytics.'}
        </div>
      </div>
    );
  }

  const {
    webinars,
    registrations,
    memberships,
    orders,
    payments,
    inquiries,
    monthlyRevenue,
    crossPlatformComparison,
  } = reportsData;

  const grossRev = payments?.collectedRevenue || orders?.totalValue || 0;
  const maxMonthlyVal = Math.max(...(monthlyRevenue || []).map((m) => Math.max(m.original, m.bridge, 100)), 200);

  return (
    <div>
      <div className="page-header">
        <div className="page-header-title-wrap">
          <h1 className="page-header-title">Reports &amp; Business Analytics</h1>
          <p className="page-header-subtitle">
            Consolidated revenue, registration volumes, conversion rates, and cross-website performance comparisons.
          </p>
        </div>
        <div className="page-header-actions">
          <button type="button" className="btn-secondary" onClick={fetchReports}>
            🔄 Refresh Analytics
          </button>
        </div>
      </div>

      {/* Top 4 Metric Cards */}
      <div className="stats-grid">
        <StatCard
          title="Collected Revenue"
          value={`$${grossRev.toLocaleString()}`}
          icon="💰"
          color="green"
          trend="Successful payments"
          trendLabel="verified"
        />
        <StatCard
          title="Avg Order Value"
          value={`$${orders.avgOrderValue || 0}`}
          icon="📊"
          color="blue"
          trend={`${orders.total} total orders`}
          trendLabel="placed"
        />
        <StatCard
          title="Total Registrations"
          value={registrations.total || 0}
          icon="🎟️"
          color="purple"
          trend={`${registrations.original} Original / ${registrations.bridge} Bridge`}
          trendLabel=""
        />
        <StatCard
          title="Active Memberships"
          value={memberships.active || 0}
          icon="📈"
          color="amber"
          trend={`${memberships.total} lifetime subscriptions`}
          trendLabel=""
        />
      </div>

      {/* Cross-Platform Comparison */}
      <div className="admin-card">
        <div className="card-header-row">
          <div>
            <h2 className="card-heading-title">Cross-Website Performance: Original vs. Compliance Bridge</h2>
            <p className="card-heading-sub">Comparing traffic channels, checkout volumes, and sales metrics</p>
          </div>
        </div>

        <div className="card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            {/* Original Website */}
            <div style={{ padding: '1.25rem', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0A3366' }}>🔷 Original Website (:5173)</h3>
                <span className="visibility-pill">Port 5173</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Registrations</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800 }}>{crossPlatformComparison.original.registrations}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Revenue</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                    ${crossPlatformComparison.original.revenue.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Orders Placed</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800 }}>{crossPlatformComparison.original.orders}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Contact Inquiries</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800 }}>{crossPlatformComparison.original.contactRequests}</div>
                </div>
              </div>
            </div>

            {/* Compliance Bridge */}
            <div style={{ padding: '1.25rem', backgroundColor: '#F0F9FF', borderRadius: '12px', border: '1px solid #BAE6FD' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0369A1' }}>🔶 Compliance Bridge (:5174)</h3>
                <span className="visibility-pill">Port 5174</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Registrations</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800 }}>{crossPlatformComparison.bridge.registrations}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Revenue</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0369A1' }}>
                    ${crossPlatformComparison.bridge.revenue.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Orders Placed</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800 }}>{crossPlatformComparison.bridge.orders}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Contact Inquiries</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800 }}>{crossPlatformComparison.bridge.contactRequests}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Monthly Trend Visual */}
          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '1rem' }}>Monthly Combined Revenue Trends (USD)</h4>
          <div className="chart-bar-container">
            {(monthlyRevenue || []).map((d) => {
              const origHeight = Math.max(8, Math.min(100, (d.original / maxMonthlyVal) * 100));
              const bridgeHeight = Math.max(8, Math.min(100, (d.bridge / maxMonthlyVal) * 100));
              return (
                <div key={d.month} className="chart-bar-col">
                  <div style={{ display: 'flex', gap: '4px', alignItems: 'flex-end', height: '100%' }}>
                    <div
                      className="chart-bar-fill"
                      style={{ height: `${origHeight}%`, backgroundColor: '#3B82F6', width: '16px' }}
                      title={`Original: $${d.original.toLocaleString()}`}
                    />
                    <div
                      className="chart-bar-fill"
                      style={{ height: `${bridgeHeight}%`, backgroundColor: '#0284C7', width: '16px' }}
                      title={`Bridge: $${d.bridge.toLocaleString()}`}
                    />
                  </div>
                  <span className="chart-bar-label">{d.month}</span>
                </div>
              );
            })}
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', marginTop: '1rem', fontSize: '0.78rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: 10, height: 10, backgroundColor: '#3B82F6', display: 'inline-block', borderRadius: 2 }}></span>
              Original Website (:5173)
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: 10, height: 10, backgroundColor: '#0284C7', display: 'inline-block', borderRadius: 2 }}></span>
              Compliance Bridge (:5174)
            </span>
          </div>
        </div>
      </div>

      {/* 2-Column Section: Popular Webinars & Operations Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: '1.25rem' }}>
        {/* Popular Webinars */}
        <div className="admin-card" style={{ marginBottom: 0 }}>
          <div className="card-header-row">
            <div>
              <h2 className="card-heading-title">Top Registered Webinars</h2>
              <p className="card-heading-sub">Webinars with highest verified registration volumes</p>
            </div>
          </div>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Webinar Title</th>
                  <th>Category</th>
                  <th style={{ textAlign: 'right' }}>Registrations</th>
                </tr>
              </thead>
              <tbody>
                {(webinars.mostPopular || []).map((w) => (
                  <tr key={w.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', maxWidth: '240px' }} title={w.title}>
                        {w.title}
                      </div>
                    </td>
                    <td>
                      <span className="visibility-pill">{w.category}</span>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--color-primary)' }}>
                      {w.registrationCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Operational Inquiries & Status Breakdown */}
        <div className="admin-card" style={{ marginBottom: 0 }}>
          <div className="card-header-row">
            <div>
              <h2 className="card-heading-title">Operational Inquiries Summary</h2>
              <p className="card-heading-sub">Current status across contact, support, and onsite training</p>
            </div>
          </div>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Inquiry Channel</th>
                  <th>Original</th>
                  <th>Bridge</th>
                  <th>Pending / New</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Contact Advisory</strong></td>
                  <td>{inquiries.contactRequests.original}</td>
                  <td>{inquiries.contactRequests.bridge}</td>
                  <td><StatusBadge status="new" /> {inquiries.contactRequests.newCount}</td>
                  <td><strong>{inquiries.contactRequests.total}</strong></td>
                </tr>
                <tr>
                  <td><strong>Support Tickets</strong></td>
                  <td>{inquiries.supportRequests.original}</td>
                  <td>{inquiries.supportRequests.bridge}</td>
                  <td><StatusBadge status="open" /> {inquiries.supportRequests.openCount}</td>
                  <td><strong>{inquiries.supportRequests.total}</strong></td>
                </tr>
                <tr>
                  <td><strong>On-site Training</strong></td>
                  <td>{inquiries.onsiteRequests.original}</td>
                  <td>{inquiries.onsiteRequests.bridge}</td>
                  <td><StatusBadge status="pending" /> {inquiries.onsiteRequests.newCount}</td>
                  <td><strong>{inquiries.onsiteRequests.total}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
