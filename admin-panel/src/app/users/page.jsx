'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Modal from '../../components/Modal';
import StatusBadge from '../../components/StatusBadge';
import SearchFilter from '../../components/SearchFilter';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserDetail, setSelectedUserDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [newStatusValue, setNewStatusValue] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/users');
      if (!res.ok) {
        throw new Error(`Failed to load users (HTTP ${res.status})`);
      }
      const json = await res.json();
      const list = json.data || json || [];
      setUsers(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Unable to load user accounts from backend on port 5001. Please verify backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const triggerSuccessMsg = (msg) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(null), 3500);
  };

  const handleOpenUser = async (u) => {
    setSelectedUser(u);
    setSelectedUserDetail(null);
    setNewStatusValue(u.status || 'active');
    setLoadingDetail(true);

    try {
      const res = await fetch(`/api/users/${u.id}`);
      if (res.ok) {
        const json = await res.json();
        setSelectedUserDetail(json.data || json);
      } else {
        setSelectedUserDetail(u);
      }
    } catch {
      setSelectedUserDetail(u);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedUser || !newStatusValue) return;

    setUpdatingStatus(true);
    setError(null);

    try {
      const res = await fetch(`/api/users/${selectedUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatusValue }),
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.message || 'Failed to update user account status.');
      }

      setUsers((prev) =>
        prev.map((u) => (u.id === selectedUser.id ? { ...u, status: newStatusValue } : u))
      );
      setSelectedUser((prev) => (prev ? { ...prev, status: newStatusValue } : null));
      setSelectedUserDetail((prev) => (prev ? { ...prev, status: newStatusValue } : null));
      triggerSuccessMsg(`User "${selectedUser.name}" status updated to "${newStatusValue.toUpperCase()}".`);
    } catch (err) {
      console.error('Update user status error:', err);
      setError(err.message || 'Failed to update user account status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase();
    const matchSearch =
      (u.id || '').toLowerCase().includes(q) ||
      (u.name || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.organization || '').toLowerCase().includes(q);

    const matchStatus = statusFilter === 'all' || (u.status || 'active').toLowerCase() === statusFilter.toLowerCase();

    return matchSearch && matchStatus;
  });

  return (
    <div>
      <div className="page-header">
        <div className="page-header-title-wrap">
          <h1 className="page-header-title">User Accounts</h1>
          <p className="page-header-subtitle">
            Manage registered healthcare professionals, compliance officers, and institutional accounts via persistent JSON storage.
          </p>
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
          searchPlaceholder="Search by user ID, name, email, or organization..."
          filters={[
            {
              key: 'status',
              label: 'Account Status',
              value: statusFilter,
              options: [
                { label: 'All Accounts', value: 'all' },
                { label: 'Active', value: 'active' },
                { label: 'Suspended', value: 'suspended' },
                { label: 'Inactive', value: 'inactive' },
              ],
            },
          ]}
          onFilterChange={(key, val) => {
            if (key === 'status') setStatusFilter(val);
          }}
          actions={
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Showing <strong>{filteredUsers.length}</strong> of {users.length} registered users
            </div>
          }
        />

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
            <div className="spinner" style={{ margin: '0 auto 1rem', width: '28px', height: '28px', border: '3px solid #E2E8F0', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <p style={{ margin: 0, fontWeight: 500 }}>Loading user accounts from backend storage...</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>Full Name</th>
                  <th>Work Email</th>
                  <th>Organization / Practice</th>
                  <th>Joined Date</th>
                  <th>Membership Tier</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                      No user accounts found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id}>
                      <td>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--color-primary)' }}>
                          {u.id}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600 }}>{u.name}</td>
                      <td>{u.email}</td>
                      <td>{u.organization || 'Independent Professional'}</td>
                      <td>{u.registeredDate || u.createdAt?.slice(0, 10)}</td>
                      <td>
                        <span className="visibility-pill">{u.membership || 'None (Pay-per-webinar)'}</span>
                      </td>
                      <td>
                        <StatusBadge status={u.status || 'active'} />
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          className="btn-secondary btn-sm"
                          onClick={() => handleOpenUser(u)}
                        >
                          View Profile
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View User Profile Modal */}
      <Modal
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        title={`User Account: ${selectedUser?.name}`}
        size="large"
        footer={
          <button type="button" className="btn-secondary" onClick={() => setSelectedUser(null)}>
            Close
          </button>
        }
      >
        {selectedUser && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-grid-2">
              <div>
                <label className="form-label">User ID</label>
                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-primary)' }}>
                  {selectedUser.id}
                </div>
              </div>
              <div>
                <label className="form-label">Account Status</label>
                <StatusBadge status={selectedUser.status || 'active'} />
              </div>
            </div>

            <div className="form-grid-2">
              <div>
                <label className="form-label">Full Name</label>
                <div style={{ fontWeight: 700, fontSize: '1rem' }}>{selectedUser.name}</div>
                {selectedUser.jobRole && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{selectedUser.jobRole}</div>
                )}
              </div>
              <div>
                <label className="form-label">Email Address</label>
                <div style={{ fontWeight: 600 }}>{selectedUser.email}</div>
              </div>
            </div>

            <div className="form-grid-2">
              <div>
                <label className="form-label">Organization / Practice</label>
                <div>{selectedUser.organization || 'Independent Professional'}</div>
              </div>
              <div>
                <label className="form-label">Membership Tier</label>
                <span className="visibility-pill">{selectedUser.membership || 'None (Pay-per-webinar)'}</span>
              </div>
            </div>

            <div className="form-grid-2">
              <div>
                <label className="form-label">Date Joined</label>
                <div>{selectedUser.registeredDate || selectedUser.createdAt?.slice(0, 10)}</div>
              </div>
              <div>
                <label className="form-label">Enrolled Webinar Sessions</label>
                <div style={{ fontWeight: 600 }}>
                  {selectedUserDetail?.registrations?.length ?? selectedUser.ordersCount ?? 0} Enrolled Sessions
                </div>
              </div>
            </div>

            {/* Status Update Control */}
            <div style={{ backgroundColor: '#F8FAFC', padding: '1rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <label className="form-label" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                Update Account Status
              </label>
              <form onSubmit={handleUpdateStatus} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <select
                  className="form-select"
                  value={newStatusValue}
                  onChange={(e) => setNewStatusValue(e.target.value)}
                  style={{ maxWidth: '200px' }}
                >
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="inactive">Inactive</option>
                </select>
                <button
                  type="submit"
                  className="btn-primary btn-sm"
                  disabled={updatingStatus || newStatusValue === selectedUser.status}
                >
                  {updatingStatus ? 'Updating...' : 'Save Status'}
                </button>
              </form>
            </div>

            {/* Enrolled Webinar Registrations List */}
            <div>
              <label className="form-label" style={{ fontWeight: 700, marginBottom: '0.5rem', display: 'block' }}>
                Webinar Registrations ({selectedUserDetail?.registrations?.length || 0})
              </label>
              {loadingDetail ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading user registration history...</p>
              ) : !selectedUserDetail?.registrations || selectedUserDetail.registrations.length === 0 ? (
                <div style={{ padding: '1rem', backgroundColor: '#F8FAFC', borderRadius: '6px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  No webinars registered for this user yet.
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="data-table" style={{ fontSize: '0.8rem' }}>
                    <thead>
                      <tr>
                        <th>Reg ID</th>
                        <th>Webinar</th>
                        <th>Date</th>
                        <th>Pass Tier</th>
                        <th>Platform</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedUserDetail.registrations.map((r) => (
                        <tr key={r.id}>
                          <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{r.id}</td>
                          <td style={{ fontWeight: 600 }}>{r.webinar}</td>
                          <td>{r.date}</td>
                          <td>{r.tier || 'Standard'}</td>
                          <td>
                            <span className={`visibility-pill ${(r.website || '').toUpperCase().includes('BRIDGE') ? 'compliance_bridge' : 'original'}`}>
                              {(r.website || '').toUpperCase().includes('BRIDGE') ? 'Bridge (:5174)' : 'Original (:5173)'}
                            </span>
                          </td>
                          <td>
                            <StatusBadge status={r.status || 'confirmed'} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
