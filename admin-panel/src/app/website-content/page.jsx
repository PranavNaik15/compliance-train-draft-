'use client';

import React, { useState, useEffect } from 'react';
import Modal from '../../components/Modal';
import StatusBadge from '../../components/StatusBadge';

export default function WebsiteContentPage() {
  const [contentList, setContentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savedNotice, setSavedNotice] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Filters
  const [activeSite, setActiveSite] = useState('both'); // 'both' | 'original' | 'compliance_bridge' | 'all'
  const [activeSection, setActiveSection] = useState('homepage'); // 'homepage' | 'about' | 'contact' | 'membership' | 'webinars' | 'footer' | 'all'
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Add item form state
  const [newSection, setNewSection] = useState('HOMEPAGE');
  const [newKey, setNewKey] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newWebsite, setNewWebsite] = useState('BOTH');
  const [newStatus, setNewStatus] = useState('ACTIVE');

  // Edit item form state
  const [editContent, setEditContent] = useState('');
  const [editLabel, setEditLabel] = useState('');
  const [editWebsite, setEditWebsite] = useState('BOTH');
  const [editStatus, setEditStatus] = useState('ACTIVE');

  const fetchContent = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/website-content');
      if (!res.ok) {
        throw new Error(`Failed to load website content (HTTP ${res.status})`);
      }
      const json = await res.json();
      const list = json.data || json || [];
      setContentList(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Error fetching website content:', err);
      setError('Unable to load website content from backend on port 5001.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const triggerNotice = (msg) => {
    setSavedNotice(msg);
    setTimeout(() => setSavedNotice(null), 3500);
  };

  // Filter content items
  const filteredContent = contentList.filter((item) => {
    // Website filter
    if (activeSite !== 'all') {
      const siteReq = activeSite === 'original' ? 'ORIGINAL' : activeSite === 'compliance_bridge' ? 'BRIDGE' : 'BOTH';
      const itemSite = (item.website || 'BOTH').toUpperCase();
      if (siteReq === 'BOTH') {
        if (itemSite !== 'BOTH') return false;
      } else if (siteReq === 'ORIGINAL') {
        if (itemSite !== 'ORIGINAL' && itemSite !== 'BOTH') return false;
      } else if (siteReq === 'BRIDGE') {
        if (itemSite !== 'BRIDGE' && itemSite !== 'BOTH') return false;
      }
    }

    // Section filter
    if (activeSection !== 'all') {
      const secReq = activeSection.toUpperCase();
      if ((item.section || '').toUpperCase() !== secReq) return false;
    }

    // Search term
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchKey = item.key?.toLowerCase().includes(q);
      const matchLabel = item.label?.toLowerCase().includes(q);
      const matchContent = item.content?.toLowerCase().includes(q);
      const matchSection = item.section?.toLowerCase().includes(q);
      if (!matchKey && !matchLabel && !matchContent && !matchSection) return false;
    }

    return true;
  });

  const handleOpenEdit = (item) => {
    setSelectedItem(item);
    setEditContent(item.content || '');
    setEditLabel(item.label || item.key || '');
    setEditWebsite(item.website || 'BOTH');
    setEditStatus(item.status || 'ACTIVE');
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!selectedItem) return;

    setIsSaving(true);
    try {
      const res = await fetch(`/api/website-content/${selectedItem.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: editContent,
          label: editLabel,
          website: editWebsite,
          status: editStatus,
        }),
      });

      if (!res.ok) {
        throw new Error(`Failed to update content item (HTTP ${res.status})`);
      }

      await fetchContent();
      setIsEditModalOpen(false);
      triggerNotice(`Successfully updated "${selectedItem.label || selectedItem.key}" content!`);
    } catch (err) {
      console.error('Error updating content:', err);
      alert('Failed to save content changes. Please verify backend on port 5001.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveNew = async (e) => {
    e.preventDefault();
    if (!newKey.trim() || !newContent.trim()) {
      alert('Key and Content are required.');
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch('/api/website-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: newSection,
          key: newKey.trim(),
          label: newLabel.trim() || newKey.trim(),
          content: newContent.trim(),
          website: newWebsite,
          status: newStatus,
        }),
      });

      if (!res.ok) {
        throw new Error(`Failed to create content item (HTTP ${res.status})`);
      }

      await fetchContent();
      setIsAddModalOpen(false);
      setNewKey('');
      setNewLabel('');
      setNewContent('');
      triggerNotice('New website content item added successfully!');
    } catch (err) {
      console.error('Error creating content item:', err);
      alert('Failed to create content item. Please check backend connection.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleQuickStatusToggle = async (item) => {
    const nextStatus = item.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      const res = await fetch(`/api/website-content/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        await fetchContent();
        triggerNotice(`Status of "${item.key}" changed to ${nextStatus}.`);
      }
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-title-wrap">
          <h1 className="page-header-title">Website Content Management</h1>
          <p className="page-header-subtitle">
            Configure copy, headlines, slogans, contact details, policies, and text across Original Website &amp; Compliance Bridge.
          </p>
        </div>
        <div className="page-header-actions">
          <button type="button" className="btn-primary" onClick={() => setIsAddModalOpen(true)}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Content Entry
          </button>
        </div>
      </div>

      {savedNotice && (
        <div style={{ padding: '0.75rem 1rem', backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', color: '#065F46', borderRadius: '8px', marginBottom: '1.25rem', fontWeight: 600 }}>
          ✓ {savedNotice}
        </div>
      )}

      {error && (
        <div style={{ padding: '0.75rem 1rem', backgroundColor: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B', borderRadius: '8px', marginBottom: '1.25rem', fontWeight: 600 }}>
          ⚠️ {error}
        </div>
      )}

      {/* Target Website Selector Pills */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem', padding: '0.75rem 1rem', backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
            TARGET PLATFORM:
          </span>
          <button
            type="button"
            onClick={() => setActiveSite('both')}
            className={`tab-btn ${activeSite === 'both' ? 'active' : ''}`}
            style={{ padding: '0.35rem 0.85rem', borderRadius: '6px', borderBottom: 'none', backgroundColor: activeSite === 'both' ? 'var(--color-primary-light)' : 'transparent' }}
          >
            🌐 Both Platforms (BOTH)
          </button>
          <button
            type="button"
            onClick={() => setActiveSite('original')}
            className={`tab-btn ${activeSite === 'original' ? 'active' : ''}`}
            style={{ padding: '0.35rem 0.85rem', borderRadius: '6px', borderBottom: 'none', backgroundColor: activeSite === 'original' ? 'var(--color-primary-light)' : 'transparent' }}
          >
            🔷 Original Site (:5173)
          </button>
          <button
            type="button"
            onClick={() => setActiveSite('compliance_bridge')}
            className={`tab-btn ${activeSite === 'compliance_bridge' ? 'active' : ''}`}
            style={{ padding: '0.35rem 0.85rem', borderRadius: '6px', borderBottom: 'none', backgroundColor: activeSite === 'compliance_bridge' ? 'var(--color-primary-light)' : 'transparent' }}
          >
            🔶 Compliance Bridge (:5174)
          </button>
          <button
            type="button"
            onClick={() => setActiveSite('all')}
            className={`tab-btn ${activeSite === 'all' ? 'active' : ''}`}
            style={{ padding: '0.35rem 0.85rem', borderRadius: '6px', borderBottom: 'none', backgroundColor: activeSite === 'all' ? 'var(--color-primary-light)' : 'transparent' }}
          >
            Show All
          </button>
        </div>

        {/* Quick Search */}
        <div style={{ minWidth: '220px' }}>
          <input
            type="text"
            className="form-input"
            style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
            placeholder="Search content keys, text..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Section Subtabs */}
      <div className="admin-card">
        <div className="card-header-row" style={{ borderBottom: 'none', paddingBottom: 0 }}>
          <div className="tabs-nav" style={{ marginBottom: 0, width: '100%', overflowX: 'auto' }}>
            <button
              type="button"
              className={`tab-btn ${activeSection === 'homepage' ? 'active' : ''}`}
              onClick={() => setActiveSection('homepage')}
            >
              Homepage Content
            </button>
            <button
              type="button"
              className={`tab-btn ${activeSection === 'about' ? 'active' : ''}`}
              onClick={() => setActiveSection('about')}
            >
              About &amp; Mission
            </button>
            <button
              type="button"
              className={`tab-btn ${activeSection === 'contact' ? 'active' : ''}`}
              onClick={() => setActiveSection('contact')}
            >
              Contact &amp; Support
            </button>
            <button
              type="button"
              className={`tab-btn ${activeSection === 'membership' ? 'active' : ''}`}
              onClick={() => setActiveSection('membership')}
            >
              Membership Copy
            </button>
            <button
              type="button"
              className={`tab-btn ${activeSection === 'webinars' ? 'active' : ''}`}
              onClick={() => setActiveSection('webinars')}
            >
              Policies &amp; Disclaimers
            </button>
            <button
              type="button"
              className={`tab-btn ${activeSection === 'footer' ? 'active' : ''}`}
              onClick={() => setActiveSection('footer')}
            >
              Footer &amp; Copyright
            </button>
            <button
              type="button"
              className={`tab-btn ${activeSection === 'all' ? 'active' : ''}`}
              onClick={() => setActiveSection('all')}
            >
              All Sections
            </button>
          </div>
        </div>

        <div className="card-body">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
              Loading website content from persistent storage...
            </div>
          ) : filteredContent.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📄</div>
              <p>No content items found matching the selected filters.</p>
              <button
                type="button"
                className="btn-secondary"
                style={{ marginTop: '0.75rem' }}
                onClick={() => {
                  setActiveSite('all');
                  setActiveSection('all');
                  setSearchTerm('');
                }}
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Content Key / Label</th>
                    <th>Section</th>
                    <th>Content Value</th>
                    <th>Target</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredContent.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          {item.label || item.key}
                        </div>
                        <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                          {item.key}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                          {item.section}
                        </span>
                      </td>
                      <td style={{ maxWidth: '340px' }}>
                        <div
                          style={{
                            fontSize: '0.85rem',
                            color: 'var(--text-primary)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                          }}
                          title={item.content}
                        >
                          {item.content}
                        </div>
                      </td>
                      <td>
                        <span className="visibility-pill">{item.website || 'BOTH'}</span>
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={() => handleQuickStatusToggle(item)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                          title="Click to toggle status"
                        >
                          <StatusBadge status={(item.status || 'active').toLowerCase()} />
                        </button>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          className="btn-secondary btn-sm"
                          onClick={() => handleOpenEdit(item)}
                        >
                          ✏️ Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Edit Content Modal */}
      {selectedItem && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={`Edit Content: ${selectedItem.label || selectedItem.key}`}
          footer={
            <>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setIsEditModalOpen(false)}
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={handleSaveEdit}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          }
        >
          <form onSubmit={handleSaveEdit}>
            <div className="form-group">
              <label className="form-label">Display Label</label>
              <input
                type="text"
                className="form-input"
                value={editLabel}
                onChange={(e) => setEditLabel(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Content Text / Value *</label>
              <textarea
                rows={5}
                className="form-textarea"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                required
              />
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Target Website</label>
                <select
                  className="form-select"
                  value={editWebsite}
                  onChange={(e) => setEditWebsite(e.target.value)}
                >
                  <option value="BOTH">Both Platforms (BOTH)</option>
                  <option value="ORIGINAL">Original Website Only (5173)</option>
                  <option value="BRIDGE">Compliance Bridge Only (5174)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* Add Content Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Website Content Entry"
        footer={
          <>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setIsAddModalOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={handleSaveNew}
              disabled={isSaving}
            >
              {isSaving ? 'Creating...' : 'Create Entry'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSaveNew}>
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Section *</label>
              <select
                className="form-select"
                value={newSection}
                onChange={(e) => setNewSection(e.target.value)}
              >
                <option value="HOMEPAGE">HOMEPAGE</option>
                <option value="ABOUT">ABOUT</option>
                <option value="CONTACT">CONTACT</option>
                <option value="MEMBERSHIP">MEMBERSHIP</option>
                <option value="WEBINARS">WEBINARS</option>
                <option value="FOOTER">FOOTER</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Key Identifier * (e.g. hero_title)</label>
              <input
                type="text"
                className="form-input"
                placeholder="hero_banner_text"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Friendly Label</label>
            <input
              type="text"
              className="form-input"
              placeholder="Hero Banner Headline"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Content Value *</label>
            <textarea
              rows={4}
              className="form-textarea"
              placeholder="Enter text, policy, or headline..."
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              required
            />
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Target Website</label>
              <select
                className="form-select"
                value={newWebsite}
                onChange={(e) => setNewWebsite(e.target.value)}
              >
                <option value="BOTH">Both Platforms (BOTH)</option>
                <option value="ORIGINAL">Original Website Only (5173)</option>
                <option value="BRIDGE">Compliance Bridge Only (5174)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
