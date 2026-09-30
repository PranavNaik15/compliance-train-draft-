'use client';

import React, { useState, useEffect } from 'react';
import Modal from '../../components/Modal';
import StatusBadge from '../../components/StatusBadge';
import SearchFilter from '../../components/SearchFilter';

export default function ContactRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [websiteFilter, setWebsiteFilter] = useState('all');
  const [selectedReq, setSelectedReq] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchContactRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/contact');
      if (!res.ok) {
        throw new Error(`Failed to load contact requests (HTTP ${res.status})`);
      }
      const json = await res.json();
      const list = json.data || json || [];
      setRequests(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Error fetching contact requests:', err);
      setError('Unable to load contact requests from backend on port 5001. Please verify backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContactRequests();
  }, []);

  const triggerSuccessMsg = (msg) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(null), 3500);
  };

  const handleUpdateStatus = async (id, newStatus) => {
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/contact/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus.toUpperCase() }),
      });
      const json = await res.json();
      if (!res.ok || json.success === false) {
        throw new Error(json.message || 'Failed to update status.');
      }

      triggerSuccessMsg(`Inquiry status updated to ${newStatus.replace('_', ' ').toUpperCase()}!`);
      if (selectedReq && selectedReq.id === id) {
        setSelectedReq({ ...selectedReq, status: newStatus.toUpperCase() });
      }
      fetchContactRequests();
    } catch (err) {
      alert(`Update failed: ${err.message}`);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const filteredRequests = requests.filter((r) => {
    const q = search.trim().toLowerCase();
    const matchSearch =
      !q ||
      (r.id && r.id.toLowerCase().includes(q)) ||
      (r.name && r.name.toLowerCase().includes(q)) ||
      (r.email && r.email.toLowerCase().includes(q)) ||
      (r.subject && r.subject.toLowerCase().includes(q)) ||
      (r.message && r.message.toLowerCase().includes(q)) ||
      (r.phone && r.phone.toLowerCase().includes(q));

    const matchStatus =
      statusFilter === 'all' ||
      (r.status && r.status.toLowerCase() === statusFilter.toLowerCase());

    const matchWebsite =
      websiteFilter === 'all' ||
      (r.website && r.website.toLowerCase() === websiteFilter.toLowerCase()) ||
      (r.website && r.website.toUpperCase() === 'BOTH');

    return matchSearch && matchStatus && matchWebsite;
  });

  return (
    <div>
      <div className="page-header">
        <div className="page-header-title-wrap">
          <h1 className="page-header-title">Contact &amp; Advisory Inquiries</h1>
          <p className="page-header-subtitle">
            Messages submitted via the public contact forms on Original Website and Compliance Bridge.
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
          <button type="button" className="btn-secondary btn-sm" onClick={fetchContactRequests}>
            Retry
          </button>
        </div>
      )}

      <div className="admin-card">
        <SearchFilter
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search messages by name, email, subject, or content..."
          filters={[
            {
              key: 'status',
              label: 'Inquiry Status',
              value: statusFilter,
              options: [
                { label: 'All Statuses', value: 'all' },
                { label: 'New', value: 'new' },
                { label: 'In Progress', value: 'in_progress' },
                { label: 'Resolved', value: 'resolved' },
                { label: 'Closed', value: 'closed' },
              ],
            },
            {
              key: 'website',
              label: 'Origin Platform',
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
            if (key === 'website') setWebsiteFilter(val);
          }}
          actions={
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Showing <strong>{filteredRequests.length}</strong> of <strong>{requests.length}</strong> inquiries
            </div>
          }
        />

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div className="loading-spinner" style={{ margin: '0 auto 1rem' }}></div>
            <p>Loading real-time contact submissions from backend...</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Sender</th>
                  <th>Subject</th>
                  <th>Received Date</th>
                  <th>Platform</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                      No contact inquiries found matching your filters.
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((r) => {
                    const webLabel = (r.website || 'ORIGINAL').toUpperCase() === 'BRIDGE' ? 'Compliance Bridge' : 'Original Website';
                    const dateStr = r.date || (r.createdAt ? r.createdAt.slice(0, 10) : '—');

                    return (
                      <tr key={r.id}>
                        <td>
                          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--color-primary)' }}>
                            {r.id}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{r.name}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{r.email}</div>
                        </td>
                        <td style={{ maxWidth: '280px' }}>
                          <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {r.subject}
                          </div>
                        </td>
                        <td>{dateStr}</td>
                        <td>
                          <span className="visibility-pill">{webLabel}</span>
                        </td>
                        <td>
                          <StatusBadge status={(r.status || 'new').toLowerCase()} />
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            type="button"
                            className="btn-secondary btn-sm"
                            onClick={() => setSelectedReq(r)}
                          >
                            Read Message
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

      {/* Details / Message Modal */}
      <Modal
        isOpen={!!selectedReq}
        onClose={() => setSelectedReq(null)}
        title={`Inquiry from ${selectedReq?.name}`}
        size="large"
        footer={
          <div style={{ display: 'flex', gap: '0.5rem', width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Update Status:</span>
              <button
                type="button"
                className="btn-secondary btn-sm"
                onClick={() => handleUpdateStatus(selectedReq.id, 'in_progress')}
                disabled={updatingStatus}
              >
                Mark In Progress
              </button>
              <button
                type="button"
                className="btn-primary btn-sm"
                onClick={() => handleUpdateStatus(selectedReq.id, 'resolved')}
                disabled={updatingStatus}
              >
                Mark Resolved
              </button>
              <button
                type="button"
                className="btn-secondary btn-sm"
                onClick={() => handleUpdateStatus(selectedReq.id, 'closed')}
                disabled={updatingStatus}
              >
                Mark Closed
              </button>
            </div>
            <button type="button" className="btn-secondary" onClick={() => setSelectedReq(null)}>
              Close
            </button>
          </div>
        }
      >
        {selectedReq && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-grid-2">
              <div>
                <label className="form-label">Sender Information</label>
                <div style={{ fontWeight: 700 }}>{selectedReq.name}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  {selectedReq.email} {selectedReq.phone ? `• ${selectedReq.phone}` : ''}
                </div>
              </div>
              <div>
                <label className="form-label">Submission Date &amp; Origin</label>
                <div style={{ fontSize: '0.875rem' }}>
                  {selectedReq.date || selectedReq.createdAt?.slice(0, 10)} &bull;{' '}
                  <span className="visibility-pill">
                    {(selectedReq.website || 'ORIGINAL').toUpperCase() === 'BRIDGE' ? 'Compliance Bridge' : 'Original Website'}
                  </span>
                </div>
                <div style={{ marginTop: '6px' }}>
                  <StatusBadge status={(selectedReq.status || 'new').toLowerCase()} />
                </div>
              </div>
            </div>

            <div>
              <label className="form-label">Subject</label>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1rem' }}>
                {selectedReq.subject}
              </div>
            </div>

            <div>
              <label className="form-label">Inquiry Message</label>
              <div style={{ padding: '1rem', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {selectedReq.message}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
