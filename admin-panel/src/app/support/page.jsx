'use client';

import React, { useState, useEffect } from 'react';
import Modal from '../../components/Modal';
import StatusBadge from '../../components/StatusBadge';
import SearchFilter from '../../components/SearchFilter';

export default function SupportPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [websiteFilter, setWebsiteFilter] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchSupportTickets = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/support');
      if (!res.ok) {
        throw new Error(`Failed to load support tickets (HTTP ${res.status})`);
      }
      const json = await res.json();
      const list = json.data || json || [];
      setTickets(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Error fetching support tickets:', err);
      setError('Unable to load support tickets from backend on port 5001. Please verify backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSupportTickets();
  }, []);

  const triggerSuccessMsg = (msg) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(null), 3500);
  };

  const handleUpdateStatus = async (id, newStatus) => {
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/support/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus.toUpperCase() }),
      });
      const json = await res.json();
      if (!res.ok || json.success === false) {
        throw new Error(json.message || 'Failed to update ticket status.');
      }

      triggerSuccessMsg(`Support ticket status updated to ${newStatus.replace('_', ' ').toUpperCase()}!`);
      if (selectedTicket && selectedTicket.id === id) {
        setSelectedTicket({ ...selectedTicket, status: newStatus.toUpperCase() });
      }
      fetchSupportTickets();
    } catch (err) {
      alert(`Update failed: ${err.message}`);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleUpdatePriority = async (id, newPriority) => {
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/support/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priority: newPriority.toUpperCase() }),
      });
      const json = await res.json();
      if (!res.ok || json.success === false) {
        throw new Error(json.message || 'Failed to update ticket priority.');
      }

      triggerSuccessMsg(`Support ticket priority updated to ${newPriority.toUpperCase()}!`);
      if (selectedTicket && selectedTicket.id === id) {
        setSelectedTicket({ ...selectedTicket, priority: newPriority.toUpperCase() });
      }
      fetchSupportTickets();
    } catch (err) {
      alert(`Update failed: ${err.message}`);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const filteredTickets = tickets.filter((t) => {
    const q = search.trim().toLowerCase();
    const matchSearch =
      !q ||
      (t.id && t.id.toLowerCase().includes(q)) ||
      (t.user && t.user.toLowerCase().includes(q)) ||
      (t.name && t.name.toLowerCase().includes(q)) ||
      (t.email && t.email.toLowerCase().includes(q)) ||
      (t.subject && t.subject.toLowerCase().includes(q)) ||
      (t.message && t.message.toLowerCase().includes(q)) ||
      (t.category && t.category.toLowerCase().includes(q));

    const matchStatus =
      statusFilter === 'all' ||
      (t.status && t.status.toLowerCase() === statusFilter.toLowerCase());

    const matchPriority =
      priorityFilter === 'all' ||
      (t.priority && t.priority.toLowerCase() === priorityFilter.toLowerCase());

    const matchWebsite =
      websiteFilter === 'all' ||
      (t.website && t.website.toLowerCase() === websiteFilter.toLowerCase()) ||
      (t.website && t.website.toUpperCase() === 'BOTH');

    return matchSearch && matchStatus && matchPriority && matchWebsite;
  });

  return (
    <div>
      <div className="page-header">
        <div className="page-header-title-wrap">
          <h1 className="page-header-title">Live Support &amp; Help Desk</h1>
          <p className="page-header-subtitle">
            Customer inquiries, certificate issues, Zoom joining link dispatches, and ticket triage.
          </p>
        </div>
      </div>

      {actionSuccess && (
        <div style={{
          padding: '0.85rem 1.25rem',
          backgroundColor: '#ECFDF5',
          border: '1px solid #A7F3D0',
          borderRadius: '8px',
          color: '#065F46',
          marginBottom: '1.25rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}>
          <span>✓</span>
          <span>{actionSuccess}</span>
        </div>
      )}

      {error && (
        <div style={{
          padding: '1rem',
          backgroundColor: '#FEF2F2',
          border: '1px solid #FCA5A5',
          borderRadius: '8px',
          color: '#991B1B',
          marginBottom: '1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div>{error}</div>
          <button type="button" className="btn-secondary btn-sm" onClick={fetchSupportTickets}>
            Retry
          </button>
        </div>
      )}

      <div className="admin-card">
        <SearchFilter
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search tickets by user, ID, subject, or message content..."
          filters={[
            {
              key: 'status',
              label: 'Ticket Status',
              value: statusFilter,
              options: [
                { label: 'All Statuses', value: 'all' },
                { label: 'Open', value: 'open' },
                { label: 'In Progress', value: 'in_progress' },
                { label: 'Resolved', value: 'resolved' },
                { label: 'Closed', value: 'closed' },
              ],
            },
            {
              key: 'priority',
              label: 'Priority',
              value: priorityFilter,
              options: [
                { label: 'All Priorities', value: 'all' },
                { label: 'High', value: 'high' },
                { label: 'Medium', value: 'medium' },
                { label: 'Low', value: 'low' },
                { label: 'Urgent', value: 'urgent' },
              ],
            },
            {
              key: 'website',
              label: 'Platform',
              value: websiteFilter,
              options: [
                { label: 'All Platforms', value: 'all' },
                { label: 'Compliance Train (Original)', value: 'original' },
                { label: 'Compliance Bridge (Clone)', value: 'bridge' },
              ],
            },
          ]}
          onFilterChange={(key, val) => {
            if (key === 'status') setStatusFilter(val);
            if (key === 'priority') setPriorityFilter(val);
            if (key === 'website') setWebsiteFilter(val);
          }}
          actions={
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Showing <strong>{filteredTickets.length}</strong> of <strong>{tickets.length}</strong> tickets
            </div>
          }
        />

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div className="loading-spinner" style={{ margin: '0 auto 1rem' }}></div>
            <p>Loading real-time help desk tickets from backend...</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Ticket ID</th>
                  <th>Priority</th>
                  <th>Customer</th>
                  <th>Subject</th>
                  <th>Timestamp</th>
                  <th>Platform</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                      No support tickets found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredTickets.map((t) => {
                    const webLabel = (t.website || 'ORIGINAL').toUpperCase() === 'BRIDGE' ? 'Compliance Bridge' : 'Original Website';
                    const timeStr = t.date || (t.createdAt ? t.createdAt.replace('T', ' ').slice(0, 16) : '—');
                    const userName = t.user || t.name || 'Valued Member';

                    return (
                      <tr key={t.id}>
                        <td>
                          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--color-primary)' }}>
                            {t.id}
                          </span>
                        </td>
                        <td>
                          <StatusBadge status={(t.priority || 'medium').toLowerCase()} />
                        </td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{userName}</div>
                          {t.email && (
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{t.email}</div>
                          )}
                        </td>
                        <td style={{ maxWidth: '260px' }}>
                          <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {t.subject}
                          </div>
                          {t.category && (
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{t.category}</div>
                          )}
                        </td>
                        <td>{timeStr}</td>
                        <td>
                          <span className="visibility-pill">{webLabel}</span>
                        </td>
                        <td>
                          <StatusBadge status={(t.status || 'open').toLowerCase()} />
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            type="button"
                            className="btn-secondary btn-sm"
                            onClick={() => setSelectedTicket(t)}
                          >
                            Open Ticket
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Ticket Details Modal */}
      <Modal
        isOpen={!!selectedTicket}
        onClose={() => setSelectedTicket(null)}
        title={`Support Ticket: ${selectedTicket?.id}`}
        size="large"
        footer={
          <div style={{ display: 'flex', gap: '0.5rem', width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Update Status:</span>
              <button
                type="button"
                className="btn-secondary btn-sm"
                onClick={() => handleUpdateStatus(selectedTicket.id, 'in_progress')}
                disabled={updatingStatus}
              >
                In Progress
              </button>
              <button
                type="button"
                className="btn-primary btn-sm"
                onClick={() => handleUpdateStatus(selectedTicket.id, 'resolved')}
                disabled={updatingStatus}
              >
                Resolve Ticket
              </button>
              <button
                type="button"
                className="btn-secondary btn-sm"
                onClick={() => handleUpdateStatus(selectedTicket.id, 'closed')}
                disabled={updatingStatus}
              >
                Close Ticket
              </button>
            </div>
            <button type="button" className="btn-secondary" onClick={() => setSelectedTicket(null)}>
              Close
            </button>
          </div>
        }
      >
        {selectedTicket && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-grid-3">
              <div>
                <label className="form-label">Customer</label>
                <div style={{ fontWeight: 700 }}>{selectedTicket.user || selectedTicket.name || 'Guest User'}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{selectedTicket.email || '—'}</div>
              </div>
              <div>
                <label className="form-label">Priority Level</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <StatusBadge status={(selectedTicket.priority || 'medium').toLowerCase()} />
                  <select
                    className="form-select"
                    style={{ padding: '2px 6px', fontSize: '0.75rem', width: 'auto' }}
                    value={(selectedTicket.priority || 'MEDIUM').toUpperCase()}
                    onChange={(e) => handleUpdatePriority(selectedTicket.id, e.target.value)}
                    disabled={updatingStatus}
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="URGENT">URGENT</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="form-label">Current Status &amp; Origin</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <StatusBadge status={(selectedTicket.status || 'open').toLowerCase()} />
                  <span className="visibility-pill">
                    {(selectedTicket.website || 'ORIGINAL').toUpperCase() === 'BRIDGE' ? 'Compliance Bridge' : 'Original Website'}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label className="form-label">Issue Subject</label>
              <div style={{ fontWeight: 700, color: 'var(--color-primary)', fontSize: '1rem' }}>
                {selectedTicket.subject}
              </div>
              {selectedTicket.category && (
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Category: {selectedTicket.category}
                </div>
              )}
            </div>

            <div>
              <label className="form-label">Ticket Transcript / Details</label>
              <div style={{ padding: '1rem', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {selectedTicket.message}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
