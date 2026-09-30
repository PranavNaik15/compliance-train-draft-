'use client';

import React, { useState, useEffect } from 'react';
import Modal from '../../components/Modal';
import StatusBadge from '../../components/StatusBadge';

export default function MediaPage() {
  const [mediaList, setMediaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [websiteFilter, setWebsiteFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);

  // Add Form
  const [newName, setNewName] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newAltText, setNewAltText] = useState('');
  const [newCategory, setNewCategory] = useState('Webinar Visuals');
  const [newType, setNewType] = useState('IMAGE');
  const [newWebsite, setNewWebsite] = useState('BOTH');
  const [newStatus, setNewStatus] = useState('ACTIVE');

  // Edit Form
  const [editName, setEditName] = useState('');
  const [editUrl, setEditUrl] = useState('');
  const [editAltText, setEditAltText] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editType, setEditType] = useState('IMAGE');
  const [editWebsite, setEditWebsite] = useState('BOTH');
  const [editStatus, setEditStatus] = useState('ACTIVE');

  const fetchMedia = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/media');
      if (!res.ok) {
        throw new Error(`Failed to load media (HTTP ${res.status})`);
      }
      const json = await res.json();
      const list = json.data || json || [];
      setMediaList(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Error fetching media:', err);
      setError('Unable to load media library from backend on port 5001.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const triggerNotice = (msg) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3500);
  };

  const filteredMedia = mediaList.filter((m) => {
    if (categoryFilter !== 'all') {
      if ((m.category || '').toLowerCase() !== categoryFilter.toLowerCase()) return false;
    }
    if (typeFilter !== 'all') {
      if ((m.type || '').toUpperCase() !== typeFilter.toUpperCase()) return false;
    }
    if (websiteFilter !== 'all') {
      const w = websiteFilter.toUpperCase();
      const mw = (m.website || 'BOTH').toUpperCase();
      if (w === 'BOTH' && mw !== 'BOTH') return false;
      if (w === 'ORIGINAL' && mw !== 'ORIGINAL' && mw !== 'BOTH') return false;
      if (w === 'BRIDGE' && mw !== 'BRIDGE' && mw !== 'BOTH') return false;
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchName = m.name?.toLowerCase().includes(q);
      const matchFilename = m.filename?.toLowerCase().includes(q);
      const matchAlt = m.altText?.toLowerCase().includes(q);
      const matchCat = m.category?.toLowerCase().includes(q);
      if (!matchName && !matchFilename && !matchAlt && !matchCat) return false;
    }
    return true;
  });

  const handleAddMedia = async (e) => {
    e.preventDefault();
    if (!newName.trim() || !newUrl.trim()) {
      alert('Asset Name and Media URL are required.');
      return;
    }

    setIsProcessing(true);
    try {
      const res = await fetch('/api/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName.trim(),
          filename: newName.trim(),
          url: newUrl.trim(),
          altText: newAltText.trim() || newName.trim(),
          category: newCategory,
          type: newType,
          website: newWebsite,
          status: newStatus,
        }),
      });

      if (!res.ok) {
        throw new Error(`Failed to add media item (HTTP ${res.status})`);
      }

      await fetchMedia();
      setIsUploadModalOpen(false);
      setNewName('');
      setNewUrl('');
      setNewAltText('');
      triggerNotice('Media asset metadata added to library!');
    } catch (err) {
      console.error('Error adding media:', err);
      alert('Failed to add media asset. Please check backend connection.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOpenEdit = (media) => {
    setSelectedMedia(media);
    setEditName(media.name || media.filename || '');
    setEditUrl(media.url || '');
    setEditAltText(media.altText || '');
    setEditCategory(media.category || 'Webinar Visuals');
    setEditType(media.type || 'IMAGE');
    setEditWebsite(media.website || 'BOTH');
    setEditStatus(media.status || 'ACTIVE');
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!selectedMedia) return;

    setIsProcessing(true);
    try {
      const res = await fetch(`/api/media/${selectedMedia.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName,
          filename: editName,
          url: editUrl,
          altText: editAltText,
          category: editCategory,
          type: editType,
          website: editWebsite,
          status: editStatus,
        }),
      });

      if (!res.ok) {
        throw new Error(`Failed to update media (HTTP ${res.status})`);
      }

      await fetchMedia();
      setIsEditModalOpen(false);
      triggerNotice(`Updated metadata for "${editName}"!`);
    } catch (err) {
      console.error('Error updating media:', err);
      alert('Failed to update media asset.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteMedia = async (mediaId, mediaName) => {
    if (!confirm(`Are you sure you want to remove metadata for "${mediaName}" from the library?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/media/${mediaId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        throw new Error(`Failed to delete media (HTTP ${res.status})`);
      }
      await fetchMedia();
      triggerNotice(`Media asset "${mediaName}" removed from library.`);
    } catch (err) {
      console.error('Error deleting media:', err);
      alert('Failed to delete media asset.');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-title-wrap">
          <h1 className="page-header-title">Media &amp; Asset Library</h1>
          <p className="page-header-subtitle">
            Manage graphic assets, webinar cover photography, speaker portraits, and documents across platforms.
          </p>
        </div>
        <div className="page-header-actions">
          <button
            type="button"
            className="btn-primary"
            onClick={() => setIsUploadModalOpen(true)}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Add Media Asset
          </button>
        </div>
      </div>

      {notice && (
        <div style={{ padding: '0.75rem 1rem', backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', color: '#065F46', borderRadius: '8px', marginBottom: '1.25rem', fontWeight: 600 }}>
          ✓ {notice}
        </div>
      )}

      {error && (
        <div style={{ padding: '0.75rem 1rem', backgroundColor: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B', borderRadius: '8px', marginBottom: '1.25rem', fontWeight: 600 }}>
          ⚠️ {error}
        </div>
      )}

      <div className="admin-card">
        <div className="filter-bar" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
          <div className="filter-left-group" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            <select
              className="filter-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">All Asset Categories</option>
              <option value="Webinar Visuals">Webinar Visuals</option>
              <option value="Speaker Photos">Speaker Photos</option>
              <option value="Badges & Graphics">Badges &amp; Graphics</option>
              <option value="Documents">Documents</option>
            </select>

            <select
              className="filter-select"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">All Media Types</option>
              <option value="IMAGE">Images</option>
              <option value="VIDEO">Videos</option>
              <option value="DOCUMENT">Documents</option>
            </select>

            <select
              className="filter-select"
              value={websiteFilter}
              onChange={(e) => setWebsiteFilter(e.target.value)}
            >
              <option value="all">All Platforms</option>
              <option value="BOTH">Both Websites (BOTH)</option>
              <option value="ORIGINAL">Original Site (:5173)</option>
              <option value="BRIDGE">Compliance Bridge (:5174)</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <input
              type="text"
              className="form-input"
              style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem', width: '200px' }}
              placeholder="Search assets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
              Showing <strong>{filteredMedia.length}</strong> items
            </div>
          </div>
        </div>

        <div className="card-body">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
              Loading media library...
            </div>
          ) : filteredMedia.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🖼️</div>
              <p>No media items found matching the selected filters.</p>
            </div>
          ) : (
            <div className="media-grid">
              {filteredMedia.map((m) => (
                <div key={m.id} className="media-item-card" style={{ position: 'relative' }}>
                  <div className="media-thumbnail-box" style={{ overflow: 'hidden', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F1F5F9', minHeight: '130px' }}>
                    {m.type === 'DOCUMENT' ? (
                      <div style={{ fontSize: '2.5rem' }}>📄</div>
                    ) : m.type === 'VIDEO' ? (
                      <div style={{ fontSize: '2.5rem' }}>🎬</div>
                    ) : m.url && (m.url.startsWith('http') || m.url.startsWith('/') || m.url.startsWith('data:')) ? (
                      <img
                        src={m.url}
                        alt={m.altText || m.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div style={{ fontSize: '2.5rem' }}>🖼️</div>
                    )}
                    <span
                      style={{
                        position: 'absolute',
                        top: '6px',
                        right: '6px',
                        backgroundColor: 'rgba(15, 23, 42, 0.75)',
                        color: '#FFFFFF',
                        fontSize: '0.65rem',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontWeight: 600,
                      }}
                    >
                      {m.website || 'BOTH'}
                    </span>
                  </div>
                  <div className="media-meta-box">
                    <div className="media-filename" title={m.name || m.filename}>
                      {m.name || m.filename}
                    </div>
                    <div className="media-filesize" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem' }}>
                      <span>{m.category} &bull; {m.size || '180 KB'}</span>
                      <StatusBadge status={(m.status || 'active').toLowerCase()} />
                    </div>
                    <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.6rem' }}>
                      <button
                        type="button"
                        className="btn-secondary btn-sm"
                        style={{ flex: 1, padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                        onClick={() => handleOpenEdit(m)}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        type="button"
                        className="btn-secondary btn-sm"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', color: '#DC2626' }}
                        onClick={() => handleDeleteMedia(m.id, m.name || m.filename)}
                        title="Remove metadata"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Media Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Add Media Asset Metadata"
        footer={
          <>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setIsUploadModalOpen(false)}
              disabled={isProcessing}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={handleAddMedia}
              disabled={isProcessing}
            >
              {isProcessing ? 'Saving...' : 'Add to Library'}
            </button>
          </>
        }
      >
        <form onSubmit={handleAddMedia}>
          <div className="form-group">
            <label className="form-label">Asset Name / Title *</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="e.g. hipaa-audits-hero-cover.jpg"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Media Asset URL / Path *</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="e.g. /hero-executive.jpg or https://..."
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Alt Text / Description</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Healthcare executive at hospital desk"
              value={newAltText}
              onChange={(e) => setNewAltText(e.target.value)}
            />
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Media Category *</label>
              <select
                className="form-select"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              >
                <option value="Webinar Visuals">Webinar Visuals</option>
                <option value="Speaker Photos">Speaker Photos</option>
                <option value="Badges & Graphics">Badges &amp; Graphics</option>
                <option value="Documents">Documents</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Media Type</label>
              <select
                className="form-select"
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
              >
                <option value="IMAGE">IMAGE</option>
                <option value="VIDEO">VIDEO</option>
                <option value="DOCUMENT">DOCUMENT</option>
              </select>
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Website Visibility</label>
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

          {newUrl && (
            <div style={{ marginTop: '0.75rem', padding: '0.75rem', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                Preview
              </div>
              <img
                src={newUrl}
                alt="Preview"
                style={{ maxHeight: '120px', maxWidth: '100%', borderRadius: '4px', objectFit: 'contain' }}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}
        </form>
      </Modal>

      {/* Edit Media Modal */}
      {selectedMedia && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={`Edit Media: ${selectedMedia.name || selectedMedia.filename}`}
          footer={
            <>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setIsEditModalOpen(false)}
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={handleSaveEdit}
                disabled={isProcessing}
              >
                {isProcessing ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          }
        >
          <form onSubmit={handleSaveEdit}>
            <div className="form-group">
              <label className="form-label">Asset Name / Title</label>
              <input
                type="text"
                className="form-input"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Media Asset URL / Path</label>
              <input
                type="text"
                className="form-input"
                value={editUrl}
                onChange={(e) => setEditUrl(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Alt Text / Description</label>
              <input
                type="text"
                className="form-input"
                value={editAltText}
                onChange={(e) => setEditAltText(e.target.value)}
              />
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Media Category</label>
                <select
                  className="form-select"
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                >
                  <option value="Webinar Visuals">Webinar Visuals</option>
                  <option value="Speaker Photos">Speaker Photos</option>
                  <option value="Badges & Graphics">Badges &amp; Graphics</option>
                  <option value="Documents">Documents</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Media Type</label>
                <select
                  className="form-select"
                  value={editType}
                  onChange={(e) => setEditType(e.target.value)}
                >
                  <option value="IMAGE">IMAGE</option>
                  <option value="VIDEO">VIDEO</option>
                  <option value="DOCUMENT">DOCUMENT</option>
                </select>
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Website Visibility</label>
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

            {editUrl && (
              <div style={{ marginTop: '0.75rem', padding: '0.75rem', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  Preview
                </div>
                <img
                  src={editUrl}
                  alt="Preview"
                  style={{ maxHeight: '120px', maxWidth: '100%', borderRadius: '4px', objectFit: 'contain' }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
          </form>
        </Modal>
      )}
    </div>
  );
}
