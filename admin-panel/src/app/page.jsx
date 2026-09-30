'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';

export default function DashboardPage() {
  const [realWebinars, setRealWebinars] = useState([]);
  const [realRegistrations, setRealRegistrations] = useState([]);
  const [realUsers, setRealUsers] = useState([]);
  const [realMemberships, setRealMemberships] = useState([]);
  const [realOrders, setRealOrders] = useState([]);
  const [realContacts, setRealContacts] = useState([]);
  const [realSupport, setRealSupport] = useState([]);
  const [realOnsite, setRealOnsite] = useState([]);
  const [realContent, setRealContent] = useState([]);
  const [realMedia, setRealMedia] = useState([]);
  const [loadingMetrics, setLoadingMetrics] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/webinars?admin=true').then((r) => r.json()).catch(() => ({})),
      fetch('/api/register').then((r) => r.json()).catch(() => ({})),
      fetch('/api/users').then((r) => r.json()).catch(() => ({})),
      fetch('/api/memberships/subscriptions').then((r) => r.json()).catch(() => ({})),
      fetch('/api/orders').then((r) => r.json()).catch(() => ({})),
      fetch('/api/contact').then((r) => r.json()).catch(() => ({})),
      fetch('/api/support').then((r) => r.json()).catch(() => ({})),
      fetch('/api/onsite-training').then((r) => r.json()).catch(() => ({})),
      fetch('/api/website-content').then((r) => r.json()).catch(() => ({})),
      fetch('/api/media').then((r) => r.json()).catch(() => ({})),
    ])
      .then(([webinarsData, regsData, usersData, memsData, ordersData, contactsData, supportData, onsiteData, contentData, mediaData]) => {
        const wList = webinarsData.data || webinarsData || [];
        const rList = regsData.data || regsData || [];
        const uList = usersData.data || usersData || [];
        const mList = memsData.data || memsData || [];
        const oList = ordersData.data || ordersData || [];
        const cList = contactsData.data || contactsData || [];
        const sList = supportData.data || supportData || [];
        const onList = onsiteData.data || onsiteData || [];
        const cntList = contentData.data || contentData || [];
        const medList = mediaData.data || mediaData || [];

        if (Array.isArray(wList)) setRealWebinars(wList);
        if (Array.isArray(rList)) setRealRegistrations(rList);
        if (Array.isArray(uList)) setRealUsers(uList);
        if (Array.isArray(mList)) setRealMemberships(mList);
        if (Array.isArray(oList)) setRealOrders(oList);
        if (Array.isArray(cList)) setRealContacts(cList);
        if (Array.isArray(sList)) setRealSupport(sList);
        if (Array.isArray(onList)) setRealOnsite(onList);
        if (Array.isArray(cntList)) setRealContent(cntList);
        if (Array.isArray(medList)) setRealMedia(medList);
      })
      .catch((err) => console.error('Error fetching dashboard metrics:', err))
      .finally(() => setLoadingMetrics(false));
  }, []);

  const totalWebinarsCount = realWebinars.length;
  const upcomingWebinars = realWebinars.slice(0, 4);
  const recentRegs = realRegistrations.slice(0, 4);
  const recentOrders = realOrders.slice(0, 4);
  const recentContacts = realContacts.slice(0, 4);

  const activeMembershipsCount = realMemberships.filter(
    (m) => (m.status || '').toUpperCase() === 'ACTIVE',
  ).length || realMemberships.length;

  const totalOrdersCount = realOrders.length;
  const grossRevenue = realOrders.reduce((acc, o) => acc + (Number(o.total || o.amount) || 0), 0);

  const pendingInquiriesCount =
    realContacts.filter((c) => (c.status || '').toUpperCase() === 'NEW' || (c.status || '').toUpperCase() === 'IN_PROGRESS').length +
    realSupport.filter((s) => (s.status || '').toUpperCase() === 'OPEN' || (s.status || '').toUpperCase() === 'IN_PROGRESS').length +
    realOnsite.filter((on) => (on.status || '').toUpperCase() === 'NEW' || (on.status || '').toUpperCase() === 'IN_PROGRESS').length;

  return (
    <div>
      {/* Page Title & Actions */}
      <div className="page-header">
        <div className="page-header-title-wrap">
          <h1 className="page-header-title">Executive Dashboard</h1>
          <p className="page-header-subtitle">
            Consolidated overview and real-time operations across Original Website and Compliance Bridge.
          </p>
        </div>
        <div className="page-header-actions">
          <Link href="/webinars" className="btn-primary">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Manage Webinars
          </Link>
          <Link href="/orders" className="btn-secondary">
            View Orders
          </Link>
        </div>
      </div>

      {/* 8 Metric Stat Cards */}
      <div className="stats-grid">
        <StatCard
          title="Total Webinars"
          value={loadingMetrics ? '...' : totalWebinarsCount}
          icon="🎥"
          color="blue"
          trend="Live JSON Store"
          trendLabel="synced"
        />
        <StatCard
          title="Upcoming Live"
          value={loadingMetrics ? '...' : upcomingWebinars.length}
          icon="📅"
          color="purple"
          trend="Next sessions"
          trendLabel=""
        />
        <StatCard
          title="Total Registrations"
          value={loadingMetrics ? '...' : realRegistrations.length}
          icon="📝"
          color="green"
          trend="Active passes"
          trendLabel="synced"
        />
        <StatCard
          title="Registered Users"
          value={loadingMetrics ? '...' : realUsers.length}
          icon="👥"
          color="blue"
          trend="Active accounts"
          trendLabel="synced"
        />
        <StatCard
          title="Active Memberships"
          value={loadingMetrics ? '...' : activeMembershipsCount}
          icon="⭐"
          color="amber"
          trend="Corporate & Ind."
          trendLabel="active"
        />
        <StatCard
          title="Total Orders"
          value={loadingMetrics ? '...' : totalOrdersCount}
          icon="🛍️"
          color="purple"
          trend="Transactions"
          trendLabel="synced"
        />
        <StatCard
          title="Gross Revenue"
          value={loadingMetrics ? '...' : `$${grossRevenue.toLocaleString()}`}
          icon="💳"
          color="green"
          trend="Total volume"
          trendLabel=""
        />
        <StatCard
          title="Pending Inquiries"
          value={loadingMetrics ? '...' : pendingInquiriesCount}
          icon="🔔"
          color="red"
          trend="Contact & Support"
          trendLabel="open"
        />
      </div>

      {/* 2-Column Section: Upcoming Webinars & Recent Registrations */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
        {/* Upcoming Webinars */}
        <div className="admin-card" style={{ marginBottom: 0 }}>
          <div className="card-header-row">
            <div>
              <h2 className="card-heading-title">Upcoming Scheduled Webinars</h2>
              <p className="card-heading-sub">Live sessions scheduled across both websites from persistent storage</p>
            </div>
            <Link href="/webinars" className="btn-secondary btn-sm">
              Manage All &rarr;
            </Link>
          </div>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Webinar Title</th>
                  <th>Date &amp; Time</th>
                  <th>Speaker</th>
                  <th>Visibility</th>
                </tr>
              </thead>
              <tbody>
                {upcomingWebinars.map((web) => {
                  const vis = (web.websiteVisibility || 'BOTH').toUpperCase();
                  const spk = web.speaker?.name || 'Brian L. Tuttle';
                  return (
                    <tr key={web.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', maxWidth: '240px' }}>
                          {web.title}
                        </div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {web.category || 'HIPAA'} &bull; ${web.price !== undefined ? web.price : 179}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{web.date}</div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{web.time}</span>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{spk}</div>
                      </td>
                      <td>
                        <span className="visibility-pill">{vis}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Registrations */}
        <div className="admin-card" style={{ marginBottom: 0 }}>
          <div className="card-header-row">
            <div>
              <h2 className="card-heading-title">Recent Attendee Registrations</h2>
              <p className="card-heading-sub">Latest user registrations and passes</p>
            </div>
            <Link href="/registrations" className="btn-secondary btn-sm">
              View All &rarr;
            </Link>
          </div>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Attendee</th>
                  <th>Webinar</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentRegs.map((reg) => (
                  <tr key={reg.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{reg.name || reg.fullName}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{reg.email || reg.workEmail}</div>
                    </td>
                    <td style={{ maxWidth: '180px' }}>
                      <div style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} title={reg.webinar || reg.webinarTitle}>
                        {reg.webinar || reg.webinarTitle || 'Webinar Attendee'}
                      </div>
                      <span className="visibility-pill">{reg.website || 'ORIGINAL'}</span>
                    </td>
                    <td>{reg.date || (reg.createdAt ? reg.createdAt.slice(0, 10) : '—')}</td>
                    <td>
                      <StatusBadge status={(reg.status || 'confirmed').toLowerCase()} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 2-Column Section: Recent Orders & Recent Inquiries */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: '1.25rem' }}>
        {/* Recent Orders */}
        <div className="admin-card" style={{ marginBottom: 0 }}>
          <div className="card-header-row">
            <div>
              <h2 className="card-heading-title">Recent Orders &amp; Billing</h2>
              <p className="card-heading-sub">Transactions processed across platforms</p>
            </div>
            <Link href="/orders" className="btn-secondary btn-sm">
              All Orders &rarr;
            </Link>
          </div>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((ord) => (
                  <tr key={ord.id}>
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--color-primary)' }}>
                        {ord.id}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{ord.customerName || ord.customer || 'Valued Customer'}</div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{ord.website || 'ORIGINAL'}</span>
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                      ${ord.total !== undefined ? ord.total : ord.amount}
                    </td>
                    <td>
                      <StatusBadge status={(ord.status || 'pending').toLowerCase()} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Contact Inquiries */}
        <div className="admin-card" style={{ marginBottom: 0 }}>
          <div className="card-header-row">
            <div>
              <h2 className="card-heading-title">Recent Contact &amp; Onsite Requests</h2>
              <p className="card-heading-sub">Incoming messages from healthcare entities</p>
            </div>
            <Link href="/contact-requests" className="btn-secondary btn-sm">
              Manage Inquiries &rarr;
            </Link>
          </div>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Sender</th>
                  <th>Subject</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentContacts.map((cnt) => (
                  <tr key={cnt.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{cnt.name}</div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{cnt.phone || cnt.email}</span>
                    </td>
                    <td style={{ maxWidth: '200px' }}>
                      <div style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} title={cnt.subject}>
                        {cnt.subject}
                      </div>
                      <span className="visibility-pill">{cnt.website || 'ORIGINAL'}</span>
                    </td>
                    <td>{cnt.date || (cnt.createdAt ? cnt.createdAt.slice(0, 10) : '—')}</td>
                    <td>
                      <StatusBadge status={(cnt.status || 'new').toLowerCase()} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
