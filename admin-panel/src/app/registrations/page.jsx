'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Modal from '../../components/Modal';
import StatusBadge from '../../components/StatusBadge';
import SearchFilter from '../../components/SearchFilter';

export default function RegistrationsPage() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [websiteFilter, setWebsiteFilter] = useState('all');

  const [selectedReg, setSelectedReg] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [newStatusValue, setNewStatusValue] = useState('');

  const fetchRegistrations = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/register');
      if (!res.ok) {
        throw new Error(`Failed to load registrations (HTTP ${res.status})`);
      }
      const json = await res.json();
      const list = json.data || json || [];
      setRegistrations(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Error fetching registrations:', err);
      setError('Unable to load attendee registrations from backend on port 5001. Please verify backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const triggerSuccessMsg = (msg) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(null), 3500);
  };

  const handleOpenDetails = (reg) => {
    setSelectedReg(reg);
    setNewStatusValue(reg.status || 'confirmed');
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedReg || !newStatusValue) return;

    setUpdatingStatus(true);
    setError(null);

    try {
      const res = await fetch(`/api/register/${selectedReg.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatusValue }),
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.message || 'Failed to update registration status.');
      }

      setRegistrations((prev) =>
        prev.map((r) => (r.id === selectedReg.id ? { ...r, status: newStatusValue } : r))
      );
      setSelectedReg((prev) => (prev ? { ...prev, status: newStatusValue } : null));
      triggerSuccessMsg(`Registration ${selectedReg.id} status updated to "${newStatusValue.toUpperCase()}".`);
    } catch (err) {
      console.error('Update registration error:', err);
      setError(err.message || 'Failed to update registration status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const filteredRegs = registrations.filter((r) => {
    const q = search.toLowerCase();
    const matchSearch =
      (r.id || '').toLowerCase().includes(q) ||
      (r.name || r.fullName || '').toLowerCase().includes(q) ||
      (r.email || r.workEmail || '').toLowerCase().includes(q) ||
      (r.webinar || r.webinarTitle || '').toLowerCase().includes(q) ||
      (r.companyName || '').toLowerCase().includes(q);

    const rStatus = (r.status || 'confirmed').toLowerCase();
    const matchStatus = statusFilter === 'all' || rStatus === statusFilter.toLowerCase();

    const rWeb = (r.website || 'ORIGINAL').toUpperCase();
    const matchWeb =
      websiteFilter === 'all' ||
      (websiteFilter === 'original' && (rWeb === 'ORIGINAL' || rWeb.includes('ORIGINAL'))) ||
      (websiteFilter === 'compliance_bridge' && (rWeb === 'BRIDGE' || rWeb.includes('BRIDGE')));

    return matchSearch && matchStatus && matchWeb;
  });

  return (
    <div>
      <div className="page-header">
        <div className="page-header-title-wrap">
          <h1 className="page-header-title">Attendee Registrations</h1>
          <p className="page-header-subtitle">
            Track user passes, live attendance credentials, webinar tickets, and certificates via persistent JSON storage.
          </p>
        </div>
        <div className="page-header-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => triggerSuccessMsg('Registrations roster synchronized from backend/data/registrations.json')}
          >
            Sync Roster
          </button>
        </div>
      </div>

      {/* Action Success Alert */}
      {actionSuccess && (
        <div style={{ padding: '0.75rem 1rem', backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', color: '#065F46', borderRadius: '8px', marginBottom: '1.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>✓</span>
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div style={{ padding: '0.75rem 1rem', backgroundColor: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B', borderRadius: '8px', marginBottom: '1.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>⚠️ {error}</span>
          <button type="button" onClick={() => setError(null)} style={{ background: 'none', border: 'none', color: '#991B1B', cursor: 'pointer', fontWeight: 700 }}>
            ✕
          </button>
        </div>
      )}

      <div className="admin-card">
        <SearchFilter
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search by ID, attendee name, email, or webinar..."
          filters={[
            {
              key: 'status',
              label: 'Registration Status',
              value: statusFilter,
              options: [
                { label: 'All Statuses', value: 'all' },
                { label: 'Confirmed', value: 'confirmed' },
                { label: 'Pending', value: 'pending' },
                { label: 'Cancelled', value: 'cancelled' },
                { label: 'Completed', value: 'completed' },
              ],
            },
            {
              key: 'website',
              label: 'Origin Website',
              value: websiteFilter,
              options: [
                { label: 'All Websites', value: 'all' },
                { label: 'Original Website (:5173)', value: 'original' },
                { label: 'Compliance Bridge (:5174)', value: 'compliance_bridge' },
              ],
            },
          ]}
          onFilterChange={(key, val) => {
            if (key === 'status') setStatusFilter(val);
            if (key === 'website') setWebsiteFilter(val);
          }}
          actions={
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Showing <strong>{filteredRegs.length}</strong> of {registrations.length} registrations
            </div>
          }
        />

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
            <div className="spinner" style={{ margin: '0 auto 1rem', width: '28px', height: '28px', border: '3px solid #E2E8F0', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <p style={{ margin: 0, fontWeight: 500 }}>Loading registration records from backend storage...</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Registration ID</th>
                  <th>Attendee Name</th>
                  <th>Email Address</th>
                  <th>Enrolled Webinar</th>
                  <th>Registration Date</th>
                  <th>Website Source</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRegs.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                      No attendee registrations found matching your search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredRegs.map((r) => {
                    const isBridge = (r.website || '').toUpperCase().includes('BRIDGE');
                    return (
                      <tr key={r.id}>
                        <td>
                          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--color-primary)' }}>
                            {r.id}
                          </span>
                        </td>
                        <td style={{ fontWeight: 600 }}>{r.name || r.fullName}</td>
                        <td style={{ color: 'var(--text-secondary)' }}>{r.email || r.workEmail}</td>
                        <td style={{ maxWidth: '240px' }}>
                          <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={r.webinar || r.webinarTitle}>
                            {r.webinar || r.webinarTitle}
                          </div>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{r.tier || 'Standard Attendee'}</span>
                        </td>
                        <td>{r.date || r.registeredAt?.slice(0, 10)}</td>
                        <td>
                          <span className={`visibility-pill ${isBridge ? 'compliance_bridge' : 'original'}`}>
                            {isBridge ? 'Bridge (:5174)' : 'Original (:5173)'}
                          </span>
                        </td>
                        <td>
                          <StatusBadge status={r.status || 'confirmed'} />
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            type="button"
                            className="btn-secondary btn-sm"
                            onClick={() => handleOpenDetails(r)}
                          >
                            View Details
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

      {/* View & Edit Registration Modal */}
      <Modal
        isOpen={!!selectedReg}
        onClose={() => setSelectedReg(null)}
        title={`Registration Details: ${selectedReg?.id}`}
        size="large"
        footer={
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
            {selectedReg?.userId ? (
              <Link
                href={`/users?search=${encodeURIComponent(selectedReg.userId)}`}
                className="btn-secondary"
                style={{ fontSize: '0.85rem' }}
              >
                👤 View User Account ({selectedReg.userId})
              </Link>
            ) : (
              <div />
            )}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="button" className="btn-secondary" onClick={() => setSelectedReg(null)}>
                Close
              </button>
            </div>
          </div>
        }
      >
        {selectedReg && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-grid-2">
              <div>
                <label className="form-label">Attendee Name</label>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
                  {selectedReg.name || selectedReg.fullName}
                </div>
                {selectedReg.jobRole && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{selectedReg.jobRole}</div>
                )}
              </div>
              <div>
                <label className="form-label">Work Email Address</label>
                <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                  {selectedReg.email || selectedReg.workEmail}
                </div>
                {selectedReg.companyName && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{selectedReg.companyName}</div>
                )}
              </div>
            </div>

            <div>
              <label className="form-label">Enrolled Webinar Course</label>
              <div style={{ fontWeight: 700, color: 'var(--color-primary)', fontSize: '0.95rem' }}>
                {selectedReg.webinar || selectedReg.webinarTitle}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                Tier / Pass: <strong>{selectedReg.tier || 'Standard Webinar Pass'}</strong>
                {selectedReg.webinarDate ? ` • Scheduled: ${selectedReg.webinarDate} (${selectedReg.webinarTime || '10:00 AM PDT'})` : ''}
              </div>
            </div>

            <div className="form-grid-3">
              <div>
                <label className="form-label">Registration Date</label>
                <div style={{ fontWeight: 600 }}>{selectedReg.date || selectedReg.registeredAt?.slice(0, 10)}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {selectedReg.registeredAt ? new Date(selectedReg.registeredAt).toLocaleTimeString() : ''}
                </div>
              </div>
              <div>
                <label className="form-label">Website Platform</label>
                <span className={`visibility-pill ${(selectedReg.website || '').toUpperCase().includes('BRIDGE') ? 'compliance_bridge' : 'original'}`}>
                  {(selectedReg.website || '').toUpperCase().includes('BRIDGE') ? 'Compliance Bridge (:5174)' : 'Original Website (:5173)'}
                </span>
              </div>
              <div>
                <label className="form-label">Current Status</label>
                <StatusBadge status={selectedReg.status || 'confirmed'} />
              </div>
            </div>

            {/* Status Update Form */}
            <div style={{ backgroundColor: '#F8FAFC', padding: '1rem', borderRadius: '8px', border: '1px solid #E2E8F0', marginTop: '0.5rem' }}>
              <label className="form-label" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                Update Attendance Status
              </label>
              <form onSubmit={handleUpdateStatus} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <select
                  className="form-select"
                  value={newStatusValue}
                  onChange={(e) => setNewStatusValue(e.target.value)}
                  style={{ maxWidth: '240px' }}
                >
                  <option value="confirmed">Confirmed</option>
                  <option value="pending">Pending</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="completed">Completed</option>
                </select>
                <button
                  type="submit"
                  className="btn-primary btn-sm"
                  disabled={updatingStatus || newStatusValue === selectedReg.status}
                >
                  {updatingStatus ? 'Updating...' : 'Save Status'}
                </button>
              </form>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
