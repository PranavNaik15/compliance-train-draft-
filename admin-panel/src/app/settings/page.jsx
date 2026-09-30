'use client';

import React, { useState, useEffect } from 'react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedNotice, setSavedNotice] = useState(null);
  const [error, setError] = useState(null);

  // Form State
  const [settings, setSettings] = useState({
    general: {
      siteName: 'ComplianceTrain Healthcare Learning Network',
      adminFullName: 'System Administrator',
      adminEmail: 'admin@compliancetrain.internal',
      supportEmail: 'contactus@compliancetrain.com',
      supportPhone: '+1-888-222-5917',
      defaultCurrency: 'USD',
      timezone: 'EDT',
      dateFormat: 'YYYY-MM-DD',
    },
    website: {
      originalEnabled: true,
      bridgeEnabled: true,
      originalUrl: 'http://localhost:5173',
      bridgeUrl: 'http://localhost:5174',
      backendApiUrl: 'http://localhost:5001/api',
    },
    notifications: {
      emailNotificationsEnabled: true,
      adminNotificationsEnabled: true,
      notifyNewRegistration: true,
      notifyNewSupportTicket: true,
      notifyNewOnsiteTraining: true,
      notifyNewOrder: true,
    },
    system: {
      maintenanceMode: false,
      defaultPaginationSize: 10,
      sessionTimeoutMinutes: 60,
    },
  });

  const fetchSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/settings');
      if (!res.ok) {
        throw new Error(`Failed to load settings (HTTP ${res.status})`);
      }
      const json = await res.json();
      if (json.data) {
        setSettings(json.data);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError('Unable to load settings from backend on port 5001.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to save settings.');
      }

      const json = await res.json();
      if (json.data) {
        setSettings(json.data);
      }

      setSavedNotice('Platform settings successfully saved and persisted to persistent storage!');
      setTimeout(() => setSavedNotice(null), 3500);
    } catch (err) {
      console.error('Error saving settings:', err);
      setError(err.message || 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleGeneralChange = (field, value) => {
    setSettings((prev) => ({
      ...prev,
      general: { ...prev.general, [field]: value },
    }));
  };

  const handleWebsiteChange = (field, value) => {
    setSettings((prev) => ({
      ...prev,
      website: { ...prev.website, [field]: value },
    }));
  };

  const handleNotificationChange = (field, value) => {
    setSettings((prev) => ({
      ...prev,
      notifications: { ...prev.notifications, [field]: value },
    }));
  };

  const handleSystemChange = (field, value) => {
    setSettings((prev) => ({
      ...prev,
      system: { ...prev.system, [field]: value },
    }));
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-title-wrap">
          <h1 className="page-header-title">Admin &amp; Platform Settings</h1>
          <p className="page-header-subtitle">
            Manage administrative parameters, website endpoints, notification policies, and system preferences.
          </p>
        </div>
        <div className="page-header-actions">
          <button
            type="button"
            className="btn-primary"
            onClick={handleSave}
            disabled={saving || loading}
          >
            {saving ? 'Saving...' : 'Save Preferences'}
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

      <div className="admin-card">
        <div className="card-header-row" style={{ borderBottom: 'none', paddingBottom: 0 }}>
          <div className="tabs-nav" style={{ marginBottom: 0, width: '100%', overflowX: 'auto' }}>
            <button
              type="button"
              className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              Admin Profile
            </button>
            <button
              type="button"
              className={`tab-btn ${activeTab === 'websites' ? 'active' : ''}`}
              onClick={() => setActiveTab('websites')}
            >
              Website Endpoints
            </button>
            <button
              type="button"
              className={`tab-btn ${activeTab === 'general' ? 'active' : ''}`}
              onClick={() => setActiveTab('general')}
            >
              General &amp; Regional
            </button>
            <button
              type="button"
              className={`tab-btn ${activeTab === 'notifications' ? 'active' : ''}`}
              onClick={() => setActiveTab('notifications')}
            >
              Notification Rules
            </button>
            <button
              type="button"
              className={`tab-btn ${activeTab === 'system' ? 'active' : ''}`}
              onClick={() => setActiveTab('system')}
            >
              System &amp; Maintenance
            </button>
          </div>
        </div>

        <div className="card-body">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
              Loading platform settings...
            </div>
          ) : (
            <>
              {activeTab === 'profile' && (
                <form onSubmit={handleSave}>
                  <div className="form-grid-2">
                    <div className="form-group">
                      <label className="form-label">Super Admin Full Name</label>
                      <input
                        type="text"
                        className="form-input"
                        value={settings.general.adminFullName || ''}
                        onChange={(e) => handleGeneralChange('adminFullName', e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Admin Notification Email</label>
                      <input
                        type="email"
                        className="form-input"
                        value={settings.general.adminEmail || ''}
                        onChange={(e) => handleGeneralChange('adminEmail', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-grid-2">
                    <div className="form-group">
                      <label className="form-label">Support Helpdesk Email</label>
                      <input
                        type="email"
                        className="form-input"
                        value={settings.general.supportEmail || ''}
                        onChange={(e) => handleGeneralChange('supportEmail', e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Official Advisory Phone</label>
                      <input
                        type="text"
                        className="form-input"
                        value={settings.general.supportPhone || ''}
                        onChange={(e) => handleGeneralChange('supportPhone', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Administrative Role</label>
                    <input
                      type="text"
                      disabled
                      className="form-input"
                      style={{ backgroundColor: '#F1F5F9', color: '#64748B' }}
                      value="Super Administrator (Full Multi-Site Access)"
                    />
                  </div>
                </form>
              )}

              {activeTab === 'websites' && (
                <form onSubmit={handleSave}>
                  <div className="form-group">
                    <label className="form-label">Original Website URL &amp; Port</label>
                    <input
                      type="text"
                      className="form-input"
                      value={settings.website.originalUrl || ''}
                      onChange={(e) => handleWebsiteChange('originalUrl', e.target.value)}
                    />
                    <div className="form-hint">Public port for original ComplianceTrain deployment.</div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Compliance Bridge URL &amp; Port</label>
                    <input
                      type="text"
                      className="form-input"
                      value={settings.website.bridgeUrl || ''}
                      onChange={(e) => handleWebsiteChange('bridgeUrl', e.target.value)}
                    />
                    <div className="form-hint">Public port for Compliance Bridge deployment.</div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Shared Backend API Gateway</label>
                    <input
                      type="text"
                      className="form-input"
                      value={settings.website.backendApiUrl || ''}
                      onChange={(e) => handleWebsiteChange('backendApiUrl', e.target.value)}
                    />
                    <div className="form-hint">NestJS REST backend endpoint on port 5001.</div>
                  </div>

                  <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={settings.website.originalEnabled}
                        onChange={(e) => handleWebsiteChange('originalEnabled', e.target.checked)}
                      />
                      <span style={{ fontWeight: 600 }}>Original Website Active (:5173)</span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={settings.website.bridgeEnabled}
                        onChange={(e) => handleWebsiteChange('bridgeEnabled', e.target.checked)}
                      />
                      <span style={{ fontWeight: 600 }}>Compliance Bridge Active (:5174)</span>
                    </label>
                  </div>
                </form>
              )}

              {activeTab === 'general' && (
                <form onSubmit={handleSave}>
                  <div className="form-group">
                    <label className="form-label">Platform Branding Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={settings.general.siteName || ''}
                      onChange={(e) => handleGeneralChange('siteName', e.target.value)}
                    />
                  </div>

                  <div className="form-grid-3">
                    <div className="form-group">
                      <label className="form-label">Base Currency</label>
                      <select
                        className="form-select"
                        value={settings.general.defaultCurrency || 'USD'}
                        onChange={(e) => handleGeneralChange('defaultCurrency', e.target.value)}
                      >
                        <option value="USD">USD ($ - United States Dollar)</option>
                        <option value="EUR">EUR (€ - Euro)</option>
                        <option value="GBP">GBP (£ - British Pound)</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Default Timezone</label>
                      <select
                        className="form-select"
                        value={settings.general.timezone || 'EDT'}
                        onChange={(e) => handleGeneralChange('timezone', e.target.value)}
                      >
                        <option value="EDT">America/New_York (EDT/EST)</option>
                        <option value="CDT">America/Chicago (CDT/CST)</option>
                        <option value="PDT">America/Los_Angeles (PDT/PST)</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Date Format</label>
                      <select
                        className="form-select"
                        value={settings.general.dateFormat || 'YYYY-MM-DD'}
                        onChange={(e) => handleGeneralChange('dateFormat', e.target.value)}
                      >
                        <option value="YYYY-MM-DD">YYYY-MM-DD (ISO)</option>
                        <option value="MM/DD/YYYY">MM/DD/YYYY (US Standard)</option>
                      </select>
                    </div>
                  </div>
                </form>
              )}

              {activeTab === 'notifications' && (
                <form onSubmit={handleSave}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={settings.notifications.notifyNewRegistration}
                        onChange={(e) => handleNotificationChange('notifyNewRegistration', e.target.checked)}
                      />
                      <span style={{ fontWeight: 600 }}>Send alert notification for every new live webinar registration</span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={settings.notifications.notifyNewSupportTicket}
                        onChange={(e) => handleNotificationChange('notifyNewSupportTicket', e.target.checked)}
                      />
                      <span style={{ fontWeight: 600 }}>Alert immediate dispatch when support ticket is received</span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={settings.notifications.notifyNewOnsiteTraining}
                        onChange={(e) => handleNotificationChange('notifyNewOnsiteTraining', e.target.checked)}
                      />
                      <span style={{ fontWeight: 600 }}>Notify on new on-site facility training inquiry</span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={settings.notifications.notifyNewOrder}
                        onChange={(e) => handleNotificationChange('notifyNewOrder', e.target.checked)}
                      />
                      <span style={{ fontWeight: 600 }}>Create notification event on successful checkout order</span>
                    </label>
                  </div>
                </form>
              )}

              {activeTab === 'system' && (
                <form onSubmit={handleSave}>
                  <div className="form-grid-2">
                    <div className="form-group">
                      <label className="form-label">Default Table Pagination Size</label>
                      <select
                        className="form-select"
                        value={settings.system.defaultPaginationSize || 10}
                        onChange={(e) => handleSystemChange('defaultPaginationSize', Number(e.target.value))}
                      >
                        <option value="10">10 records per page</option>
                        <option value="25">25 records per page</option>
                        <option value="50">50 records per page</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Session Idle Timeout</label>
                      <select
                        className="form-select"
                        value={settings.system.sessionTimeoutMinutes || 60}
                        onChange={(e) => handleSystemChange('sessionTimeoutMinutes', Number(e.target.value))}
                      >
                        <option value="30">30 minutes</option>
                        <option value="60">60 minutes</option>
                        <option value="120">2 hours</option>
                        <option value="480">8 hours</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={settings.system.maintenanceMode}
                        onChange={(e) => handleSystemChange('maintenanceMode', e.target.checked)}
                      />
                      <div>
                        <span style={{ fontWeight: 700, color: '#991B1B' }}>Platform Maintenance Mode</span>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          When enabled, displays scheduled maintenance notice across public portals.
                        </div>
                      </div>
                    </label>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
