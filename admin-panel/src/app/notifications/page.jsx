'use client';

import React, { useState, useEffect } from 'react';
import Modal from '../../components/Modal';
import StatusBadge from '../../components/StatusBadge';
import SearchFilter from '../../components/SearchFilter';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionNotice, setActionNotice] = useState(null);

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const [newNotice, setNewNotice] = useState({
    title: '',
    type: 'ALERT',
    priority: 'MEDIUM',
    target: 'ALL',
    message: '',
  });

  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/notifications');
      if (!res.ok) {
        throw new Error(`Failed to load notifications (HTTP ${res.status})`);
      }
      const json = await res.json();
      const list = json.data || json || [];
      setNotifications(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Unable to load notifications from backend on port 5001.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const triggerNotice = (msg) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3500);
  };

  const handleCompose = async (e) => {
    e.preventDefault();
    if (!newNotice.message.trim()) return;

    setIsProcessing(true);
    try {
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newNotice.title.trim() || 'System Announcement',
          type: newNotice.type,
          priority: newNotice.priority,
          target: newNotice.target,
          message: newNotice.message.trim(),
        }),
      });

      if (!res.ok) {
        throw new Error(`Failed to create notification (HTTP ${res.status})`);
      }

      await fetchNotifications();
      setIsComposeOpen(false);
      setNewNotice({
        title: '',
        type: 'ALERT',
        priority: 'MEDIUM',
        target: 'ALL',
        message: '',
      });
      triggerNotice('System broadcast alert created successfully!');
    } catch (err) {
      console.error('Error creating notification:', err);
      alert('Failed to send notification. Please verify backend connection.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleReadStatus = async (item, e) => {
    if (e) e.stopPropagation();
    const nextStatus = item.status === 'READ' ? 'UNREAD' : 'READ';
    try {
      const res = await fetch(`/api/notifications/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        await fetchNotifications();
        triggerNotice(`Notification marked as ${nextStatus.toLowerCase()}.`);
      }
    } catch (err) {
      console.error('Error toggling read status:', err);
    }
  };

  const handleDeleteNotification = async (id, e) => {
    if (e) e.stopPropagation();
    if (!confirm('Are you sure you want to delete this notification?')) return;

    try {
      const res = await fetch(`/api/notifications/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        await fetchNotifications();
        if (selectedNotice && selectedNotice.id === id) {
          setIsDetailOpen(false);
        }
        triggerNotice('Notification removed successfully.');
      }
    } catch (err) {
      console.error('Error deleting notification:', err);
      alert('Failed to delete notification.');
    }
  };

  const handleOpenDetail = (n) => {
    setSelectedNotice(n);
    setIsDetailOpen(true);
    if (n.status === 'UNREAD') {
      fetch(`/api/notifications/${n.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'READ' }),
      }).then(() => fetchNotifications()).catch(() => {});
    }
  };

  const filteredNotices = notifications.filter((n) => {
    const q = search.toLowerCase();
    const matchSearch =
      !search.trim() ||
      (n.type && n.type.toLowerCase().includes(q)) ||
      (n.title && n.title.toLowerCase().includes(q)) ||
      (n.target && n.target.toLowerCase().includes(q)) ||
      (n.message && n.message.toLowerCase().includes(q));

    const matchType = typeFilter === 'all' || (n.type || '').toUpperCase() === typeFilter.toUpperCase();
    const matchStatus = statusFilter === 'all' || (n.status || '').toUpperCase() === statusFilter.toUpperCase();
    const matchPriority = priorityFilter === 'all' || (n.priority || '').toUpperCase() === priorityFilter.toUpperCase();

    return matchSearch && matchType && matchStatus && matchPriority;
  });

  const unreadCount = notifications.filter((n) => (n.status || '').toUpperCase() === 'UNREAD').length;

  return (
    <div>
      <div className="page-header">
        <div className="page-header-title-wrap">
          <h1 className="page-header-title">System &amp; Event Notifications</h1>
          <p className="page-header-subtitle">
            Automated alerts, registration pings, invoice confirmations, and admin broadcasts.
          </p>
        </div>
        <div className="page-header-actions">
          <button type="button" className="btn-primary" onClick={() => setIsComposeOpen(true)}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Send Broadcast Alert
          </button>
        </div>
      </div>

      {actionNotice && (
        <div style={{ padding: '0.75rem 1rem', backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', color: '#065F46', borderRadius: '8px', marginBottom: '1.25rem', fontWeight: 600 }}>
          ✓ {actionNotice}
        </div>
      )}

      {error && (
        <div style={{ padding: '0.75rem 1rem', backgroundColor: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B', borderRadius: '8px', marginBottom: '1.25rem', fontWeight: 600 }}>
          ⚠️ {error}
        </div>
      )}

      <div className="admin-card">
        <SearchFilter
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search notifications by keyword, title, recipient..."
          filters={[
            {
              key: 'type',
              label: 'Alert Type',
              value: typeFilter,
              options: [
                { label: 'All Alert Types', value: 'all' },
                { label: 'Registration', value: 'REGISTRATION' },
                { label: 'Payment', value: 'PAYMENT' },
                { label: 'Alert / Warning', value: 'ALERT' },
                { label: 'Success', value: 'SUCCESS' },
                { label: 'Info', value: 'INFO' },
              ],
            },
            {
              key: 'status',
              label: 'Read Status',
              value: statusFilter,
              options: [
                { label: 'All Statuses', value: 'all' },
                { label: `Unread (${unreadCount})`, value: 'UNREAD' },
                { label: 'Read', value: 'READ' },
              ],
            },
            {
              key: 'priority',
              label: 'Priority',
              value: priorityFilter,
              options: [
                { label: 'All Priorities', value: 'all' },
                { label: 'High Priority', value: 'HIGH' },
                { label: 'Medium Priority', value: 'MEDIUM' },
                { label: 'Low Priority', value: 'LOW' },
              ],
            },
          ]}
          onFilterChange={(key, val) => {
            if (key === 'type') setTypeFilter(val);
            if (key === 'status') setStatusFilter(val);
            if (key === 'priority') setPriorityFilter(val);
          }}
          actions={
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Showing <strong>{filteredNotices.length}</strong> alerts ({unreadCount} unread)
            </div>
          }
        />

        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
              Loading notifications...
            </div>
          ) : filteredNotices.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔔</div>
              <p>No notifications found matching your filters.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Alert Type</th>
                    <th>Notification Title / Content</th>
                    <th>Target / Channel</th>
                    <th>Priority</th>
                    <th>Timestamp</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredNotices.map((n) => {
                    const isUnread = (n.status || '').toUpperCase() === 'UNREAD';
                    return (
                      <tr
                        key={n.id}
                        onClick={() => handleOpenDetail(n)}
                        style={{
                          cursor: 'pointer',
                          backgroundColor: isUnread ? '#F8FAFC' : 'transparent',
                        }}
                      >
                        <td>
                          <span className="visibility-pill">{n.type || 'INFO'}</span>
                        </td>
                        <td style={{ maxWidth: '340px' }}>
                          <div style={{ fontWeight: isUnread ? 700 : 500, color: 'var(--text-primary)' }}>
                            {n.title || 'System Notification'}
                          </div>
                          <div
                            style={{
                              fontSize: '0.8rem',
                              color: 'var(--text-secondary)',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {n.message}
                          </div>
                        </td>
                        <td>
                          <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                            {n.target || 'ALL'}
                          </span>
                        </td>
                        <td>
                          <span
                            style={{
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: '4px',
                              backgroundColor:
                                n.priority === 'HIGH' ? '#FEE2E2' : n.priority === 'MEDIUM' ? '#FEF3C7' : '#F1F5F9',
                              color:
                                n.priority === 'HIGH' ? '#991B1B' : n.priority === 'MEDIUM' ? '#92400E' : '#475569',
                            }}
                          >
                            {n.priority || 'MEDIUM'}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {n.createdAt ? new Date(n.createdAt).toLocaleDateString() : 'Recent'}
                        </td>
                        <td>
                          <StatusBadge status={(n.status || 'unread').toLowerCase()} />
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
                            <button
                              type="button"
                              className="btn-secondary btn-sm"
                              style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}
                              onClick={(e) => handleToggleReadStatus(n, e)}
                              title={isUnread ? 'Mark as Read' : 'Mark as Unread'}
                            >
                              {isUnread ? '✓ Read' : '✉️ Unread'}
                            </button>
                            <button
                              type="button"
                              className="btn-secondary btn-sm"
                              style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem', color: '#DC2626' }}
                              onClick={(e) => handleDeleteNotification(n.id, e)}
                              title="Delete notification"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedNotice && (
        <Modal
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          title={`Notification: ${selectedNotice.title || selectedNotice.type}`}
          footer={
            <>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setIsDetailOpen(false)}
              >
                Close
              </button>
              <button
                type="button"
                className="btn-secondary"
                style={{ color: '#DC2626' }}
                onClick={(e) => handleDeleteNotification(selectedNotice.id, e)}
              >
                Delete Alert
              </button>
            </>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="visibility-pill">{selectedNotice.type}</span>
              <StatusBadge status={(selectedNotice.status || 'unread').toLowerCase()} />
            </div>

            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                {selectedNotice.title}
              </h3>
              <p style={{ fontSize: '0.92rem', lineHeight: 1.5, color: 'var(--text-primary)', backgroundColor: '#F8FAFC', padding: '1rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                {selectedNotice.message}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <div><strong>Target Audience:</strong> {selectedNotice.target || 'ALL'}</div>
              <div><strong>Priority:</strong> {selectedNotice.priority || 'MEDIUM'}</div>
              <div><strong>Created:</strong> {selectedNotice.createdAt ? new Date(selectedNotice.createdAt).toLocaleString() : 'N/A'}</div>
              <div><strong>Read At:</strong> {selectedNotice.readAt ? new Date(selectedNotice.readAt).toLocaleString() : 'Unread'}</div>
            </div>
          </div>
        </Modal>
      )}

      {/* Compose Notification Modal */}
      <Modal
        isOpen={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
        title="Broadcast System Notification"
        footer={
          <>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setIsComposeOpen(false)}
              disabled={isProcessing}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={handleCompose}
              disabled={isProcessing}
            >
              {isProcessing ? 'Sending...' : 'Send Notification'}
            </button>
          </>
        }
      >
        <form onSubmit={handleCompose}>
          <div className="form-group">
            <label className="form-label">Alert Title *</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="e.g. Scheduled System Maintenance / Webinar Reminder"
              value={newNotice.title}
              onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
            />
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Notification Type *</label>
              <select
                className="form-select"
                value={newNotice.type}
                onChange={(e) => setNewNotice({ ...newNotice, type: e.target.value })}
              >
                <option value="ALERT">ALERT (Broadcast / Notice)</option>
                <option value="REGISTRATION">REGISTRATION</option>
                <option value="PAYMENT">PAYMENT</option>
                <option value="SUCCESS">SUCCESS</option>
                <option value="WARNING">WARNING</option>
                <option value="INFO">INFO</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Priority Level *</label>
              <select
                className="form-select"
                value={newNotice.priority}
                onChange={(e) => setNewNotice({ ...newNotice, priority: e.target.value })}
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH (Urgent)</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Target Audience / Channel *</label>
            <select
              className="form-select"
              value={newNotice.target}
              onChange={(e) => setNewNotice({ ...newNotice, target: e.target.value })}
            >
              <option value="ALL">All Platforms (Both Websites)</option>
              <option value="ORIGINAL">Original Website Only (:5173)</option>
              <option value="BRIDGE">Compliance Bridge Only (:5174)</option>
              <option value="ADMIN">Administrative Staff Only</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Broadcast Message *</label>
            <textarea
              rows={4}
              required
              className="form-textarea"
              placeholder="Type notification announcement..."
              value={newNotice.message}
              onChange={(e) => setNewNotice({ ...newNotice, message: e.target.value })}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
