'use client';

import React, { useState, useEffect } from 'react';
import Modal from '../../components/Modal';
import StatusBadge from '../../components/StatusBadge';
import SearchFilter from '../../components/SearchFilter';

export default function WebinarsPage() {
  const [webinars, setWebinars] = useState([]);
  const [speakersList, setSpeakersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [visibilityFilter, setVisibilityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [featuredFilter, setFeaturedFilter] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedWebinar, setSelectedWebinar] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    type: 'Live Webinar',
    category: 'HIPAA Privacy & Security',
    date: '',
    time: '10:00 AM PDT - 01:00 PM EDT',
    duration: '90 minutes',
    price: 179,
    speakerId: 'spk-1',
    speakerName: 'Brian L. Tuttle',
    speakerRole: 'Health IT & Compliance Consultant',
    speakerCompany: 'InGauge Healthcare Solutions',
    speakerBio: 'Brian is a nationally renowned compliance consultant.',
    speakerPhoto: '/speaker-brian.jpg',
    websiteVisibility: 'BOTH',
    status: 'published',
    isFeatured: false,
    image: '/hero-executive.jpg',
    description: '',
    shortDescription: '',
    fullDescription: '',
  });

  // Fetch real webinars and real speakers from backend
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [webinarsRes, speakersRes] = await Promise.all([
        fetch('/api/webinars?admin=true'),
        fetch('/api/speakers'),
      ]);

      if (!webinarsRes.ok) {
        throw new Error(`Failed to load webinars (HTTP ${webinarsRes.status})`);
      }
      const webinarsJson = await webinarsRes.json();
      const wList = webinarsJson.data || webinarsJson || [];
      setWebinars(Array.isArray(wList) ? wList : []);

      if (speakersRes.ok) {
        const speakersJson = await speakersRes.json();
        const sList = speakersJson.data || speakersJson || [];
        setSpeakersList(Array.isArray(sList) ? sList : []);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Unable to load webinars or speakers from the backend server. Please verify backend on port 5001 is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const triggerSuccessMsg = (msg) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(null), 3500);
  };

  const handleOpenAdd = () => {
    setSelectedWebinar(null);
    const defSpk = speakersList[0] || {
      id: 'spk-1',
      name: 'Brian L. Tuttle',
      designation: 'Health IT & Compliance Consultant',
      organization: 'InGauge Healthcare Solutions',
      bio: 'Brian is a nationally renowned compliance consultant with 20+ years specializing in HIPAA and SAMHSA.',
      photo: '/speaker-brian.jpg',
    };

    setFormData({
      title: '',
      type: 'Live Webinar',
      category: 'HIPAA Privacy & Security',
      date: '',
      time: '10:00 AM PDT - 01:00 PM EDT',
      duration: '90 minutes',
      price: 179,
      speakerId: defSpk.id,
      speakerName: defSpk.name,
      speakerRole: defSpk.designation || 'Health IT & Compliance Consultant',
      speakerCompany: defSpk.organization || 'InGauge Healthcare Solutions',
      speakerBio: defSpk.bio || '',
      speakerPhoto: defSpk.photo || '/speaker-brian.jpg',
      websiteVisibility: 'BOTH',
      status: 'published',
      isFeatured: false,
      image: '/hero-executive.jpg',
      description: '',
      shortDescription: '',
      fullDescription: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (webinar) => {
    setSelectedWebinar(webinar);
    const spk = webinar.speaker || {};
    const matchedSpeaker =
      speakersList.find((s) => s.id === webinar.speakerId || s.id === spk.id || s.name === spk.name) ||
      speakersList[0];

    const currentSpeakerId = webinar.speakerId || matchedSpeaker?.id || 'spk-1';

    setFormData({
      title: webinar.title || '',
      type: webinar.type || 'Live Webinar',
      category: webinar.category || 'HIPAA Privacy & Security',
      date: webinar.date || '',
      time: webinar.time || '10:00 AM PDT - 01:00 PM EDT',
      duration: webinar.duration || '90 minutes',
      price: webinar.price !== undefined ? webinar.price : 179,
      speakerId: currentSpeakerId,
      speakerName: spk.name || matchedSpeaker?.name || 'Brian L. Tuttle',
      speakerRole: spk.role || matchedSpeaker?.designation || 'Health IT & Compliance Consultant',
      speakerCompany: spk.company || matchedSpeaker?.organization || 'InGauge Healthcare Solutions',
      speakerBio: spk.bio || matchedSpeaker?.bio || '',
      speakerPhoto: spk.avatarUrl || matchedSpeaker?.photo || '/speaker-brian.jpg',
      websiteVisibility: (webinar.websiteVisibility || 'BOTH').toUpperCase(),
      status: webinar.status || 'published',
      isFeatured: Boolean(webinar.isFeatured ?? webinar.featured),
      image: webinar.image || '/hero-executive.jpg',
      description: webinar.fullDescription || webinar.shortDescription || '',
      shortDescription: webinar.shortDescription || '',
      fullDescription: webinar.fullDescription || '',
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setSubmitting(true);
    setError(null);

    const selectedSpk = speakersList.find((s) => s.id === formData.speakerId) || {
      id: formData.speakerId || 'spk-1',
      name: formData.speakerName || 'Brian L. Tuttle',
      designation: formData.speakerRole || 'Health IT & Compliance Consultant',
      organization: formData.speakerCompany || 'InGauge Healthcare Solutions',
      bio: formData.speakerBio || 'Brian is a nationally renowned compliance consultant.',
      photo: formData.speakerPhoto || '/speaker-brian.jpg',
    };

    const speakerObj = {
      id: selectedSpk.id,
      name: selectedSpk.name,
      role: selectedSpk.designation || selectedSpk.role || formData.speakerRole || 'Health IT & Compliance Consultant',
      company: selectedSpk.organization || selectedSpk.company || formData.speakerCompany || 'InGauge Healthcare Solutions',
      bio: selectedSpk.bio || formData.speakerBio || 'Nationally recognized regulatory compliance faculty.',
      avatarUrl: selectedSpk.photo || selectedSpk.avatarUrl || formData.speakerPhoto || '/speaker-brian.jpg',
    };

    const payload = {
      title: formData.title.trim(),
      type: formData.type,
      category: formData.category,
      date: formData.date,
      time: formData.time,
      duration: formData.duration,
      price: Number(formData.price),
      speakerId: selectedSpk.id,
      speaker: speakerObj,
      websiteVisibility: formData.websiteVisibility,
      status: formData.status,
      isFeatured: Boolean(formData.isFeatured),
      featured: Boolean(formData.isFeatured),
      image: formData.image || '/hero-executive.jpg',
      shortDescription: formData.description || formData.shortDescription || `${formData.title} - Expert compliance training.`,
      fullDescription: formData.description || formData.fullDescription || `${formData.title} - Complete regulatory compliance breakdown.`,
    };

    try {
      if (selectedWebinar) {
        // Edit existing webinar
        const res = await fetch(`/api/webinars/${selectedWebinar.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const result = await res.json();
        if (!res.ok || !result.success) {
          throw new Error(result.message || 'Failed to update webinar.');
        }

        setWebinars((prev) =>
          prev.map((w) => (w.id === selectedWebinar.id ? { ...w, ...result.data } : w))
        );
        setIsModalOpen(false);
        triggerSuccessMsg(`Webinar "${formData.title}" updated successfully.`);
      } else {
        // Add new webinar
        const res = await fetch('/api/webinars', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const result = await res.json();
        if (!res.ok || !result.success) {
          throw new Error(result.message || 'Failed to create webinar.');
        }

        setWebinars((prev) => [result.data, ...prev]);
        setIsModalOpen(false);
        triggerSuccessMsg(`Webinar "${formData.title}" created successfully.`);
      }
    } catch (err) {
      console.error('Save webinar error:', err);
      setError(err.message || 'Failed to save webinar to persistent storage.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedWebinar) return;

    setDeleteSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/webinars/${selectedWebinar.id}`, {
        method: 'DELETE',
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.message || 'Failed to delete webinar.');
      }

      setWebinars((prev) => prev.filter((w) => w.id !== selectedWebinar.id));
      setIsDeleteModalOpen(false);
      triggerSuccessMsg(`Webinar "${selectedWebinar.title}" deleted from storage.`);
      setSelectedWebinar(null);
    } catch (err) {
      console.error('Delete webinar error:', err);
      setError(err.message || 'Failed to delete webinar.');
    } finally {
      setDeleteSubmitting(false);
    }
  };

  const togglePublishStatus = async (webinar) => {
    const currentStatus = webinar.status || 'published';
    const newStatus = currentStatus === 'published' ? 'unpublished' : 'published';
    try {
      const res = await fetch(`/api/webinars/${webinar.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.message || 'Failed to update publish status.');
      }
      setWebinars((prev) =>
        prev.map((w) => (w.id === webinar.id ? { ...w, status: newStatus } : w))
      );
      triggerSuccessMsg(`Webinar status set to "${newStatus.toUpperCase()}".`);
    } catch (err) {
      console.error('Toggle status error:', err);
      setError(err.message || 'Failed to toggle publish status.');
    }
  };

  const toggleFeatured = async (webinar) => {
    const isCurrentlyFeatured = Boolean(webinar.isFeatured ?? webinar.featured);
    const newFeatured = !isCurrentlyFeatured;
    try {
      const res = await fetch(`/api/webinars/${webinar.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFeatured: newFeatured, featured: newFeatured }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.message || 'Failed to update featured flag.');
      }
      setWebinars((prev) =>
        prev.map((w) =>
          w.id === webinar.id ? { ...w, isFeatured: newFeatured, featured: newFeatured } : w
        )
      );
      triggerSuccessMsg(`Webinar featured flag set to ${newFeatured ? 'Featured' : 'Standard'}.`);
    } catch (err) {
      console.error('Toggle featured error:', err);
      setError(err.message || 'Failed to toggle featured status.');
    }
  };

  // Real data filtering
  const filteredWebinars = webinars.filter((w) => {
    const title = w.title || '';
    const cat = w.category || '';
    const spkName = w.speaker?.name || '';
    const matchSearch =
      title.toLowerCase().includes(search.toLowerCase()) ||
      cat.toLowerCase().includes(search.toLowerCase()) ||
      spkName.toLowerCase().includes(search.toLowerCase());

    const matchType = typeFilter === 'all' || w.type === typeFilter;
    const vis = (w.websiteVisibility || 'BOTH').toUpperCase();
    let matchVis = true;
    if (visibilityFilter === 'ORIGINAL') {
      matchVis = vis === 'ORIGINAL' || vis === 'BOTH';
    } else if (visibilityFilter === 'BRIDGE') {
      matchVis = vis === 'BRIDGE' || vis === 'BOTH';
    } else if (visibilityFilter === 'BOTH') {
      matchVis = vis === 'BOTH';
    } else if (visibilityFilter !== 'all') {
      matchVis = vis === visibilityFilter.toUpperCase();
    }
    const matchStatus = statusFilter === 'all' || (w.status || 'published') === statusFilter;
    const isFeat = Boolean(w.isFeatured ?? w.featured);
    const matchFeatured =
      featuredFilter === 'all' ||
      (featuredFilter === 'featured' && isFeat) ||
      (featuredFilter === 'standard' && !isFeat);

    return matchSearch && matchType && matchVis && matchStatus && matchFeatured;
  });

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-title-wrap">
          <h1 className="page-header-title">Webinar Management</h1>
          <p className="page-header-subtitle">
            Create, edit, publish and target webinars across Original Website and Compliance Bridge using persistent storage.
          </p>
        </div>
        <div className="page-header-actions">
          <button type="button" className="btn-primary" onClick={handleOpenAdd}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add Webinar
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

      {/* Main Table Card */}
      <div className="admin-card">
        {/* Search & Filter Bar */}
        <SearchFilter
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search real webinars by title, speaker, or category..."
          filters={[
            {
              key: 'type',
              label: 'Webinar Type',
              value: typeFilter,
              options: [
                { label: 'All Types', value: 'all' },
                { label: 'Live Webinar', value: 'Live Webinar' },
                { label: 'Recorded Webinar', value: 'Recorded Webinar' },
                { label: 'On-site Training', value: 'On-site Training' },
              ],
            },
            {
              key: 'visibility',
              label: 'Website Visibility',
              value: visibilityFilter,
              options: [
                { label: 'All Visibility', value: 'all' },
                { label: 'Both Websites (BOTH)', value: 'BOTH' },
                { label: 'Original Only (ORIGINAL)', value: 'ORIGINAL' },
                { label: 'Bridge Only (BRIDGE)', value: 'BRIDGE' },
              ],
            },
            {
              key: 'status',
              label: 'Publish Status',
              value: statusFilter,
              options: [
                { label: 'All Statuses', value: 'all' },
                { label: 'Published', value: 'published' },
                { label: 'Unpublished / Draft', value: 'unpublished' },
              ],
            },
            {
              key: 'featured',
              label: 'Featured Filter',
              value: featuredFilter,
              options: [
                { label: 'All Featured', value: 'all' },
                { label: 'Featured Only', value: 'featured' },
                { label: 'Standard Only', value: 'standard' },
              ],
            },
          ]}
          actions={
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Showing <strong>{filteredWebinars.length}</strong> of {webinars.length} live webinars
            </div>
          }
        />

        {/* Loading State */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
            <div className="spinner" style={{ margin: '0 auto 1rem', width: '28px', height: '28px', border: '3px solid #E2E8F0', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <p style={{ margin: 0, fontWeight: 500 }}>Loading webinar records from backend storage...</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>★</th>
                  <th style={{ width: '30%' }}>Webinar Title</th>
                  <th>Type</th>
                  <th>Date &amp; Time</th>
                  <th>Speaker</th>
                  <th>Price</th>
                  <th>Target Website</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredWebinars.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                      No webinars found matching your search or filters.
                    </td>
                  </tr>
                ) : (
                  filteredWebinars.map((w) => {
                    const isFeat = Boolean(w.isFeatured ?? w.featured);
                    const vis = (w.websiteVisibility || 'BOTH').toUpperCase();
                    const isPub = (w.status || 'published') === 'published';

                    return (
                      <tr key={w.id}>
                        {/* Featured Quick Star Toggle */}
                        <td>
                          <button
                            type="button"
                            onClick={() => toggleFeatured(w)}
                            title={isFeat ? 'Click to unmark featured' : 'Click to mark as featured'}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              fontSize: '1.2rem',
                              color: isFeat ? '#F59E0B' : '#CBD5E1',
                              padding: '2px',
                              lineHeight: 1,
                            }}
                          >
                            ★
                          </button>
                        </td>

                        {/* Title & Category */}
                        <td>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '3px', fontSize: '0.9rem', lineHeight: '1.3' }}>
                            {w.title}
                          </div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {w.category || 'General Compliance'}
                          </span>
                        </td>

                        {/* Type */}
                        <td>
                          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                            {w.type || 'Live Webinar'}
                          </span>
                        </td>

                        {/* Date & Time */}
                        <td>
                          <div style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                            {w.date || 'TBD'}
                          </div>
                          <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                            {w.time || '10:00 AM PDT'}
                          </div>
                        </td>

                        {/* Speaker */}
                        <td>
                          <div style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                            {w.speaker?.name || 'Brian L. Tuttle'}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            {w.speaker?.company || w.speaker?.role || 'Compliance Faculty'}
                          </div>
                        </td>

                        {/* Price */}
                        <td>
                          <span style={{ fontWeight: 700, color: 'var(--color-primary)', fontSize: '0.9rem' }}>
                            ${w.price !== undefined ? w.price : 179}
                          </span>
                        </td>

                        {/* Website Visibility Pill */}
                        <td>
                          {vis === 'ORIGINAL' && (
                            <span className="visibility-pill original" title="Visible on port 5173 only">
                              Original (:5173)
                            </span>
                          )}
                          {vis === 'BRIDGE' && (
                            <span className="visibility-pill compliance_bridge" title="Visible on port 5174 only">
                              Bridge (:5174)
                            </span>
                          )}
                          {vis === 'BOTH' && (
                            <span className="visibility-pill both" title="Visible on both :5173 and :5174">
                              🌐 Both Websites
                            </span>
                          )}
                        </td>

                        {/* Publish Status Toggle */}
                        <td>
                          <button
                            type="button"
                            onClick={() => togglePublishStatus(w)}
                            title={`Click to ${isPub ? 'Unpublish' : 'Publish'}`}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              padding: 0,
                            }}
                          >
                            <StatusBadge status={isPub ? 'published' : 'unpublished'} />
                          </button>
                        </td>

                        {/* Actions */}
                        <td style={{ textAlign: 'right' }}>
                          <div className="table-action-btns" style={{ justifyContent: 'flex-end' }}>
                            <button
                              type="button"
                              className="btn-icon-action"
                              onClick={() => handleOpenEdit(w)}
                              title="Edit Webinar"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                              </svg>
                            </button>
                            <button
                              type="button"
                              className="btn-icon-action delete"
                              onClick={() => {
                                setSelectedWebinar(w);
                                setIsDeleteModalOpen(true);
                              }}
                              title="Delete Webinar"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                              </svg>
                            </button>
                          </div>
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

      {/* Add / Edit Webinar Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => !submitting && setIsModalOpen(false)}
        title={selectedWebinar ? 'Edit Webinar Details' : 'Add New Webinar'}
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
              {submitting ? 'Writing to storage...' : selectedWebinar ? 'Save Changes' : 'Create Webinar'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label">Webinar Title *</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="e.g. HIPAA Audits: What OCR is Looking for in 2026"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="form-grid-3">
            <div className="form-group">
              <label className="form-label">Format / Type *</label>
              <select
                className="form-select"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="Live Webinar">Live Webinar</option>
                <option value="Recorded Webinar">Recorded Webinar</option>
                <option value="On-site Training">On-site Training</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Category *</label>
              <select
                className="form-select"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="HIPAA Privacy & Security">HIPAA Privacy &amp; Security</option>
                <option value="SAMHSA 42 CFR Part 2">SAMHSA 42 CFR Part 2</option>
                <option value="AI in Healthcare">AI in Healthcare</option>
                <option value="Risk Assessment (SRA)">Risk Assessment (SRA)</option>
                <option value="Compliance Officer Training">Compliance Officer Training</option>
                <option value="Enforcement & Audits">Enforcement &amp; Audits</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Assigned Faculty / Speaker *</label>
              <select
                className="form-select"
                value={formData.speakerId}
                onChange={(e) => {
                  const spkId = e.target.value;
                  const spk = speakersList.find((s) => s.id === spkId);
                  if (spk) {
                    setFormData({
                      ...formData,
                      speakerId: spk.id,
                      speakerName: spk.name,
                      speakerRole: spk.designation || 'Health IT & Compliance Consultant',
                      speakerCompany: spk.organization || 'Healthcare Compliance Faculty',
                      speakerBio: spk.bio || '',
                      speakerPhoto: spk.photo || '/speaker-brian.jpg',
                    });
                  }
                }}
              >
                {speakersList.length === 0 ? (
                  <option value="spk-1">Brian L. Tuttle (InGauge Healthcare)</option>
                ) : (
                  speakersList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.organization || s.designation})
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          <div className="form-grid-3">
            <div className="form-group">
              <label className="form-label">Date *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. Oct 15, 2026"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Time &amp; Timezone *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="10:00 AM PDT - 01:00 PM EDT"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Duration *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="90 minutes"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              />
            </div>
          </div>

          <div className="form-grid-3">
            <div className="form-group">
              <label className="form-label">Price ($ USD) *</label>
              <input
                type="number"
                required
                min={0}
                className="form-input"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
              />
            </div>

            {/* CRITICAL WEBSITE VISIBILITY CONTROL */}
            <div className="form-group">
              <label className="form-label" style={{ color: 'var(--color-primary)', fontWeight: 700 }}>
                Website Visibility *
              </label>
              <select
                className="form-select"
                value={formData.websiteVisibility}
                onChange={(e) => setFormData({ ...formData, websiteVisibility: e.target.value })}
                style={{ borderColor: 'var(--color-primary)', backgroundColor: 'var(--color-primary-light)' }}
              >
                <option value="BOTH">🌐 Both Websites</option>
                <option value="ORIGINAL">🔷 Original Website (:5173 Only)</option>
                <option value="BRIDGE">🔶 Compliance Bridge (:5174 Only)</option>
              </select>
              <div className="form-hint">Controls which public website displays this webinar.</div>
            </div>

            <div className="form-group">
              <label className="form-label">Publish Status *</label>
              <select
                className="form-select"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="published">Published</option>
                <option value="unpublished">Unpublished (Draft)</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Webinar Summary / Description</label>
            <textarea
              rows={3}
              className="form-textarea"
              placeholder="Crucial regulatory updates and OCR enforcement priorities for healthcare providers..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
              />
              <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>Mark as Featured Webinar on Homepage Hero</span>
            </label>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => !deleteSubmitting && setIsDeleteModalOpen(false)}
        title="Confirm Webinar Deletion"
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
              {deleteSubmitting ? 'Deleting...' : 'Confirm Delete'}
            </button>
          </>
        }
      >
        <p style={{ color: 'var(--text-secondary)' }}>
          Are you sure you want to delete webinar <strong>&ldquo;{selectedWebinar?.title}&rdquo;</strong> from persistent storage? This will permanently remove it from backend and website rosters.
        </p>
      </Modal>
    </div>
  );
}
