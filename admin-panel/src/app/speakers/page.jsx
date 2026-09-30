'use client';

import React, { useState, useEffect } from 'react';
import Modal from '../../components/Modal';
import StatusBadge from '../../components/StatusBadge';
import SearchFilter from '../../components/SearchFilter';

export default function SpeakersPage() {
  const [speakers, setSpeakers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedSpeaker, setSelectedSpeaker] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    designation: '',
    organization: '',
    bio: '',
    photo: '/speaker-brian.jpg',
    profileLink: '',
    status: 'active',
  });

  const fetchSpeakers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/speakers');
      if (!res.ok) {
        throw new Error(`Failed to load speakers (HTTP ${res.status})`);
      }
      const json = await res.json();
      const list = json.data || json || [];
      setSpeakers(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Error fetching speakers:', err);
      setError('Unable to load speakers from backend on port 5001. Please ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpeakers();
  }, []);

  const triggerSuccessMsg = (msg) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(null), 3500);
  };

  const handleOpenAdd = () => {
    setSelectedSpeaker(null);
    setFormData({
      name: '',
      designation: '',
      organization: '',
      bio: '',
      photo: '/speaker-brian.jpg',
      profileLink: '',
      status: 'active',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (speaker) => {
    setSelectedSpeaker(speaker);
    setFormData({
      name: speaker.name || '',
      designation: speaker.designation || '',
      organization: speaker.organization || '',
      bio: speaker.bio || '',
      photo: speaker.photo || '/speaker-brian.jpg',
      profileLink: speaker.profileLink || '',
      status: speaker.status || 'active',
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.designation.trim() || !formData.organization.trim()) {
      setError('Please fill in all required fields (Name, Designation, Organization).');
      return;
    }

    setSubmitting(true);
    setError(null);

    const payload = {
      name: formData.name.trim(),
      designation: formData.designation.trim(),
      organization: formData.organization.trim(),
      bio: formData.bio.trim(),
      photo: formData.photo.trim() || '/speaker-brian.jpg',
      profileLink: formData.profileLink.trim(),
      status: formData.status,
    };

    try {
      if (selectedSpeaker) {
        // Edit speaker
        const res = await fetch(`/api/speakers/${selectedSpeaker.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const result = await res.json();
        if (!res.ok || !result.success) {
          throw new Error(result.message || 'Failed to update speaker.');
        }

        setSpeakers((prev) =>
          prev.map((s) => (s.id === selectedSpeaker.id ? { ...s, ...result.data } : s))
        );
        setIsModalOpen(false);
        triggerSuccessMsg(`Speaker "${formData.name}" successfully updated.`);
      } else {
        // Add new speaker
        const res = await fetch('/api/speakers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const result = await res.json();
        if (!res.ok || !result.success) {
          throw new Error(result.message || 'Failed to create speaker.');
        }

        setSpeakers((prev) => [result.data, ...prev]);
        setIsModalOpen(false);
        triggerSuccessMsg(`Speaker "${formData.name}" successfully added to roster.`);
      }
    } catch (err) {
      console.error('Save speaker error:', err);
      setError(err.message || 'Failed to save speaker.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenDelete = (speaker) => {
    setSelectedSpeaker(speaker);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedSpeaker) return;

    // Check if speaker has assigned webinars
    if (selectedSpeaker.webinarCount > 0) {
      setError(
        `Cannot delete speaker "${selectedSpeaker.name}": This speaker is currently assigned to ${selectedSpeaker.webinarCount} webinar(s). Please reassign those webinars before deleting this speaker.`
      );
      setIsDeleteModalOpen(false);
      return;
    }

    setDeleteSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/speakers/${selectedSpeaker.id}`, {
        method: 'DELETE',
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.message || 'Failed to delete speaker.');
      }

      setSpeakers((prev) => prev.filter((s) => s.id !== selectedSpeaker.id));
      setIsDeleteModalOpen(false);
      triggerSuccessMsg(`Speaker "${selectedSpeaker.name}" was permanently removed.`);
      setSelectedSpeaker(null);
    } catch (err) {
      console.error('Delete speaker error:', err);
      setError(err.message || 'Failed to delete speaker.');
    } finally {
      setDeleteSubmitting(false);
    }
  };

  const filteredSpeakers = speakers.filter((s) => {
    const q = search.toLowerCase();
    const matchSearch =
      (s.name || '').toLowerCase().includes(q) ||
      (s.designation || '').toLowerCase().includes(q) ||
      (s.organization || '').toLowerCase().includes(q) ||
      (s.bio || '').toLowerCase().includes(q);

    const matchStatus = statusFilter === 'all' || s.status === statusFilter;

    return matchSearch && matchStatus;
  });

  return (
    <div>
      <div className="page-header">
        <div className="page-header-title-wrap">
          <h1 className="page-header-title">Speaker &amp; Faculty Management</h1>
          <p className="page-header-subtitle">
            Manage subject matter experts, HIPAA consultants, regulatory auditors, and legal faculty using persistent JSON storage.
          </p>
        </div>
        <div className="page-header-actions">
          <button type="button" className="btn-primary" onClick={handleOpenAdd}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add Speaker
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
          searchPlaceholder="Search faculty by name, designation, or organization..."
          filters={[
            {
              key: 'status',
              label: 'Faculty Status',
              value: statusFilter,
              options: [
                { label: 'All Statuses', value: 'all' },
                { label: 'Active Faculty', value: 'active' },
                { label: 'Inactive / Archived', value: 'inactive' },
              ],
            },
          ]}
          actions={
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Showing <strong>{filteredSpeakers.length}</strong> faculty members
            </div>
          }
        />

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
            <div className="spinner" style={{ margin: '0 auto 1rem', width: '28px', height: '28px', border: '3px solid #E2E8F0', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <p style={{ margin: 0, fontWeight: 500 }}>Loading faculty records from backend storage...</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '28%' }}>Speaker Name</th>
                  <th>Designation &amp; Credentials</th>
                  <th>Organization</th>
                  <th>Assigned Webinars</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSpeakers.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                      No speakers found matching your search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredSpeakers.map((s) => (
                    <tr key={s.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div
                            style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '50%',
                              backgroundColor: '#E2E8F0',
                              backgroundImage: `url(${s.photo || '/speaker-brian.jpg'})`,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                              flexShrink: 0,
                            }}
                          />
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{s.name}</div>
                            {s.profileLink && (
                              <a
                                href={s.profileLink}
                                target="_blank"
                                rel="noreferrer"
                                style={{ fontSize: '0.72rem', color: 'var(--color-primary)' }}
                              >
                                LinkedIn / Profile ↗
                              </a>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ maxWidth: '300px', fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                          {s.designation}
                        </div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600 }}>{s.organization}</span>
                      </td>
                      <td>
                        <span className="visibility-pill" style={{ backgroundColor: s.webinarCount > 0 ? '#EFF6FF' : '#F1F5F9', color: s.webinarCount > 0 ? '#1D4ED8' : '#64748B' }}>
                          {s.webinarCount || 0} Sessions
                        </span>
                      </td>
                      <td>
                        <StatusBadge status={s.status} />
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="table-action-btns" style={{ justifyContent: 'flex-end' }}>
                          <button
                            type="button"
                            className="btn-icon-action"
                            onClick={() => handleOpenEdit(s)}
                            title="Edit Speaker"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                          </button>
                          <button
                            type="button"
                            className="btn-icon-action delete"
                            onClick={() => handleOpenDelete(s)}
                            title="Delete Speaker"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3 6 5 6 21 6"/>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Speaker Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => !submitting && setIsModalOpen(false)}
        title={selectedSpeaker ? 'Edit Speaker Profile' : 'Add New Speaker'}
        size="large"
        footer={
          <>
            <button
              type="button"
              className="btn-secondary"
              disabled={submitting}
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn-primary"
              disabled={submitting}
              onClick={handleSave}
            >
              {submitting ? 'Saving to storage...' : selectedSpeaker ? 'Save Changes' : 'Create Speaker'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSave}>
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Speaker Name *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. Brian L. Tuttle"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Organization / Practice *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. Tuttle Healthcare IT Compliance"
                value={formData.organization}
                onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Designation &amp; Certifications *</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="e.g. Certified HIPAA Consultant, CPHIT, CHP, CBRA, CCVO"
              value={formData.designation}
              onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
            />
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Photo Asset Path</label>
              <input
                type="text"
                className="form-input"
                placeholder="/speaker-brian.jpg"
                value={formData.photo}
                onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">LinkedIn / Profile URL</label>
              <input
                type="text"
                className="form-input"
                placeholder="https://linkedin.com/in/..."
                value={formData.profileLink}
                onChange={(e) => setFormData({ ...formData, profileLink: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Professional Biography &amp; Background</label>
            <textarea
              rows={4}
              className="form-textarea"
              placeholder="Detail credentials, OCR audit defense record, and specialized healthcare compliance experience..."
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Status</label>
            <select
              className="form-select"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="active">Active Faculty</option>
              <option value="inactive">Inactive / Archived</option>
            </select>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => !deleteSubmitting && setIsDeleteModalOpen(false)}
        title="Confirm Faculty Removal"
        footer={
          <>
            <button
              type="button"
              className="btn-secondary"
              disabled={deleteSubmitting}
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn-danger"
              disabled={deleteSubmitting}
              onClick={handleDelete}
            >
              {deleteSubmitting ? 'Removing...' : 'Confirm Delete'}
            </button>
          </>
        }
      >
        {selectedSpeaker?.webinarCount > 0 ? (
          <div style={{ padding: '1rem', backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', color: '#991B1B', fontSize: '0.875rem' }}>
            <strong style={{ display: 'block', marginBottom: '0.5rem' }}>⚠️ Delete Protected</strong>
            Speaker <strong>&ldquo;{selectedSpeaker?.name}&rdquo;</strong> is currently assigned to{' '}
            <strong>{selectedSpeaker?.webinarCount} webinar(s)</strong>. Please reassign those webinars before deleting this faculty member.
          </div>
        ) : (
          <p style={{ color: 'var(--text-secondary)' }}>
            Are you sure you want to remove speaker <strong>&ldquo;{selectedSpeaker?.name}&rdquo;</strong> from persistent storage?
          </p>
        )}
      </Modal>
    </div>
  );
}
