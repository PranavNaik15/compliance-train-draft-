'use client';

import React, { useState, useEffect } from 'react';
import Modal from '../../components/Modal';
import StatusBadge from '../../components/StatusBadge';
import SearchFilter from '../../components/SearchFilter';

export default function MembershipsPage() {
  const [activeTab, setActiveTab] = useState('plans'); // 'plans' | 'subscriptions'

  // Data states
  const [plans, setPlans] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  // Filter & Search states for Plans
  const [planSearch, setPlanSearch] = useState('');
  const [planTypeFilter, setPlanTypeFilter] = useState('all');
  const [planStatusFilter, setPlanStatusFilter] = useState('all');

  // Filter & Search states for Subscriptions
  const [subSearch, setSubSearch] = useState('');
  const [subTypeFilter, setSubTypeFilter] = useState('all');
  const [subStatusFilter, setSubStatusFilter] = useState('all');

  // Plan Modal state
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isPlanDeleteModalOpen, setIsPlanDeleteModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [planSubmitting, setPlanSubmitting] = useState(false);
  const [planFormData, setPlanFormData] = useState({
    name: '',
    type: 'INDIVIDUAL',
    price: 199,
    duration: '1 Month',
    durationUnit: 'month',
    description: '',
    status: 'ACTIVE',
    isBestValue: false,
    seats: '',
  });

  // Subscription Modal state
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [selectedSub, setSelectedSub] = useState(null);
  const [subSubmitting, setSubSubmitting] = useState(false);
  const [subFormData, setSubFormData] = useState({
    planId: '',
    expiryDate: '',
    status: 'ACTIVE',
  });

  // Fetch data
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [plansRes, subsRes] = await Promise.all([
        fetch('/api/membership-plans'),
        fetch('/api/memberships?admin=true'),
      ]);

      if (!plansRes.ok) {
        throw new Error(`Failed to load plans (HTTP ${plansRes.status})`);
      }
      const plansJson = await plansRes.json();
      setPlans(plansJson.data || []);

      if (subsRes.ok) {
        const subsJson = await subsRes.json();
        setSubscriptions(subsJson.data || []);
      }
    } catch (err) {
      console.error('Error fetching membership data:', err);
      setError('Unable to load membership data from backend server on port 5001.');
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

  // ==========================================
  // PLAN HANDLERS
  // ==========================================

  const handleOpenAddPlan = () => {
    setSelectedPlan(null);
    setPlanFormData({
      name: '',
      type: 'INDIVIDUAL',
      price: 199,
      duration: '1 Month',
      durationUnit: 'month',
      description: '',
      status: 'ACTIVE',
      isBestValue: false,
      seats: '',
    });
    setIsPlanModalOpen(true);
  };

  const handleOpenEditPlan = (plan) => {
    setSelectedPlan(plan);
    setPlanFormData({
      name: plan.name || '',
      type: plan.type || 'INDIVIDUAL',
      price: plan.price !== undefined ? plan.price : 199,
      duration: plan.duration || '1 Month',
      durationUnit: plan.durationUnit || 'month',
      description: plan.description || '',
      status: plan.status || 'ACTIVE',
      isBestValue: Boolean(plan.isBestValue),
      seats: plan.seats || '',
    });
    setIsPlanModalOpen(true);
  };

  const handleSavePlan = async (e) => {
    e.preventDefault();
    if (!planFormData.name.trim()) return;

    setPlanSubmitting(true);
    setError(null);

    const payload = {
      name: planFormData.name.trim(),
      type: planFormData.type,
      price: Number(planFormData.price),
      duration: planFormData.duration.trim(),
      durationUnit: planFormData.durationUnit,
      description: planFormData.description.trim(),
      status: planFormData.status,
      isBestValue: Boolean(planFormData.isBestValue),
      seats: planFormData.seats ? planFormData.seats.trim() : undefined,
    };

    try {
      if (selectedPlan) {
        // Edit existing plan
        const res = await fetch(`/api/membership-plans/${selectedPlan.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const result = await res.json();
        if (!res.ok || !result.success) {
          throw new Error(result.message || 'Failed to update membership plan.');
        }

        setPlans((prev) =>
          prev.map((p) => (p.id === selectedPlan.id ? { ...p, ...result.data } : p))
        );
        setIsPlanModalOpen(false);
        triggerSuccessMsg(`Membership Plan "${payload.name}" updated successfully.`);
      } else {
        // Create new plan
        const res = await fetch('/api/membership-plans', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const result = await res.json();
        if (!res.ok || !result.success) {
          throw new Error(result.message || 'Failed to create membership plan.');
        }

        setPlans((prev) => [...prev, result.data]);
        setIsPlanModalOpen(false);
        triggerSuccessMsg(`Membership Plan "${payload.name}" created successfully.`);
      }
    } catch (err) {
      console.error('Save plan error:', err);
      setError(err.message || 'Failed to save membership plan.');
    } finally {
      setPlanSubmitting(false);
    }
  };

  const togglePlanStatus = async (plan) => {
    const newStatus = plan.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      const res = await fetch(`/api/membership-plans/${plan.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.message || 'Failed to toggle plan status.');
      }
      setPlans((prev) =>
        prev.map((p) => (p.id === plan.id ? { ...p, status: newStatus } : p))
      );
      triggerSuccessMsg(`Plan "${plan.name}" set to ${newStatus}.`);
    } catch (err) {
      console.error('Toggle plan status error:', err);
      setError(err.message || 'Failed to update plan status.');
    }
  };

  const handleDeletePlan = async () => {
    if (!selectedPlan) return;
    setPlanSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/membership-plans/${selectedPlan.id}`, {
        method: 'DELETE',
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.message || 'Failed to delete membership plan.');
      }

      setPlans((prev) => prev.filter((p) => p.id !== selectedPlan.id));
      setIsPlanDeleteModalOpen(false);
      triggerSuccessMsg(`Membership Plan "${selectedPlan.name}" removed.`);
      setSelectedPlan(null);
    } catch (err) {
      console.error('Delete plan error:', err);
      setError(err.message || 'Failed to delete plan.');
      setIsPlanDeleteModalOpen(false);
    } finally {
      setPlanSubmitting(false);
    }
  };

  // ==========================================
  // SUBSCRIPTION HANDLERS
  // ==========================================

  const handleOpenManageSub = (sub) => {
    setSelectedSub(sub);
    setSubFormData({
      planId: sub.planId || (plans[0]?.id ?? 'ind-1m'),
      expiryDate: sub.expiryDate || '',
      status: sub.status || 'ACTIVE',
    });
    setIsSubModalOpen(true);
  };

  const handleSaveSub = async (e) => {
    e.preventDefault();
    if (!selectedSub) return;

    setSubSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/memberships/${selectedSub.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subFormData),
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.message || 'Failed to update membership subscription.');
      }

      setSubscriptions((prev) =>
        prev.map((s) => (s.id === selectedSub.id ? { ...s, ...result.data } : s))
      );
      setIsSubModalOpen(false);
      triggerSuccessMsg(`Subscription ${selectedSub.id} updated successfully.`);
    } catch (err) {
      console.error('Update subscription error:', err);
      setError(err.message || 'Failed to update subscription.');
    } finally {
      setSubSubmitting(false);
    }
  };

  const addMonthsToExpiry = (months) => {
    const baseDate = subFormData.expiryDate ? new Date(subFormData.expiryDate) : new Date();
    baseDate.setMonth(baseDate.getMonth() + months);
    setSubFormData({ ...subFormData, expiryDate: baseDate.toISOString().slice(0, 10) });
  };

  // ==========================================
  // FILTERING LOGIC
  // ==========================================

  const filteredPlans = plans.filter((p) => {
    const q = planSearch.toLowerCase();
    const matchSearch =
      p.name.toLowerCase().includes(q) ||
      (p.description || '').toLowerCase().includes(q) ||
      p.type.toLowerCase().includes(q);

    const matchType = planTypeFilter === 'all' || p.type.toUpperCase() === planTypeFilter.toUpperCase();
    const matchStatus = planStatusFilter === 'all' || p.status.toUpperCase() === planStatusFilter.toUpperCase();

    return matchSearch && matchType && matchStatus;
  });

  const filteredSubs = subscriptions.filter((s) => {
    const q = subSearch.toLowerCase();
    const matchSearch =
      (s.id || '').toLowerCase().includes(q) ||
      (s.userName || '').toLowerCase().includes(q) ||
      (s.email || '').toLowerCase().includes(q) ||
      (s.planName || '').toLowerCase().includes(q);

    const matchType = subTypeFilter === 'all' || (s.membershipType || '').toUpperCase() === subTypeFilter.toUpperCase();
    const matchStatus = subStatusFilter === 'all' || (s.status || '').toUpperCase() === subStatusFilter.toUpperCase();

    return matchSearch && matchType && matchStatus;
  });

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-title-wrap">
          <h1 className="page-header-title">Memberships &amp; Plans Management</h1>
          <p className="page-header-subtitle">
            Configure authoritative healthcare compliance membership plans and manage active subscriber licenses.
          </p>
        </div>
        <div className="page-header-actions">
          {activeTab === 'plans' ? (
            <button type="button" className="btn-primary" onClick={handleOpenAddPlan}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Add Membership Plan
            </button>
          ) : (
            <button type="button" className="btn-secondary" onClick={fetchData}>
              Sync Subscriptions
            </button>
          )}
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

      {/* Primary Section Switcher Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
        <button
          type="button"
          onClick={() => setActiveTab('plans')}
          style={{
            padding: '0.6rem 1.25rem',
            borderRadius: '6px',
            border: 'none',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            backgroundColor: activeTab === 'plans' ? 'var(--color-primary)' : 'transparent',
            color: activeTab === 'plans' ? '#FFFFFF' : 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>📦</span>
          <span>Membership Plans ({plans.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('subscriptions')}
          style={{
            padding: '0.6rem 1.25rem',
            borderRadius: '6px',
            border: 'none',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            backgroundColor: activeTab === 'subscriptions' ? 'var(--color-primary)' : 'transparent',
            color: activeTab === 'subscriptions' ? '#FFFFFF' : 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>👥</span>
          <span>Member Subscriptions ({subscriptions.length})</span>
        </button>
      </div>

      {/* TAB 1: MEMBERSHIP PLANS */}
      {activeTab === 'plans' && (
        <div className="admin-card">
          <SearchFilter
            searchValue={planSearch}
            onSearchChange={setPlanSearch}
            searchPlaceholder="Search plans by name or description..."
            filters={[
              {
                key: 'type',
                label: 'Plan Type',
                value: planTypeFilter,
                options: [
                  { label: 'All Plan Types', value: 'all' },
                  { label: 'Individual (INDIVIDUAL)', value: 'INDIVIDUAL' },
                  { label: 'Corporate (CORPORATE)', value: 'CORPORATE' },
                ],
              },
              {
                key: 'status',
                label: 'Status',
                value: planStatusFilter,
                options: [
                  { label: 'All Statuses', value: 'all' },
                  { label: 'Active Plans', value: 'ACTIVE' },
                  { label: 'Inactive Plans', value: 'INACTIVE' },
                ],
              },
            ]}
            onFilterChange={(key, val) => {
              if (key === 'type') setPlanTypeFilter(val);
              if (key === 'status') setPlanStatusFilter(val);
            }}
            actions={
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Showing <strong>{filteredPlans.length}</strong> of {plans.length} configured plans
              </div>
            }
          />

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
              <div className="spinner" style={{ margin: '0 auto 1rem', width: '28px', height: '28px', border: '3px solid #E2E8F0', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              <p style={{ margin: 0, fontWeight: 500 }}>Loading membership plans from storage...</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Plan Name</th>
                    <th>Type</th>
                    <th>Price ($ USD)</th>
                    <th>Duration</th>
                    <th>Active Subscribers</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPlans.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                        No membership plans match your search or filter.
                      </td>
                    </tr>
                  ) : (
                    filteredPlans.map((p) => {
                      const isCorp = p.type === 'CORPORATE';
                      const isActive = p.status === 'ACTIVE';

                      return (
                        <tr key={p.id}>
                          <td>
                            <div style={{ fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span>{p.name}</span>
                              {p.isBestValue && (
                                <span style={{ fontSize: '0.65rem', backgroundColor: '#FEF3C7', color: '#92400E', padding: '1px 6px', borderRadius: '4px', fontWeight: 800 }}>
                                  BEST VALUE
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {p.description}
                            </div>
                          </td>
                          <td>
                            <span className={`visibility-pill ${isCorp ? 'compliance_bridge' : 'original'}`}>
                              {p.type}
                            </span>
                            {p.seats && (
                              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>{p.seats}</div>
                            )}
                          </td>
                          <td>
                            <span style={{ fontWeight: 800, color: 'var(--color-primary)', fontSize: '0.95rem' }}>
                              ${p.price.toLocaleString()}
                            </span>
                          </td>
                          <td>
                            <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{p.duration}</span>
                          </td>
                          <td>
                            <span className="visibility-pill" style={{ backgroundColor: p.activeSubscribersCount > 0 ? '#EFF6FF' : '#F1F5F9', color: p.activeSubscribersCount > 0 ? '#1D4ED8' : '#64748B' }}>
                              {p.activeSubscribersCount || 0} Members
                            </span>
                          </td>
                          <td>
                            <button
                              type="button"
                              onClick={() => togglePlanStatus(p)}
                              title={`Click to ${isActive ? 'Deactivate' : 'Activate'}`}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                            >
                              <StatusBadge status={isActive ? 'active' : 'inactive'} />
                            </button>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div className="table-action-btns" style={{ justifyContent: 'flex-end' }}>
                              <button
                                type="button"
                                className="btn-icon-action"
                                onClick={() => handleOpenEditPlan(p)}
                                title="Edit Membership Plan"
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
                                  setSelectedPlan(p);
                                  setIsPlanDeleteModalOpen(true);
                                }}
                                title="Delete Membership Plan"
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
      )}

      {/* TAB 2: MEMBER SUBSCRIPTIONS */}
      {activeTab === 'subscriptions' && (
        <div className="admin-card">
          <SearchFilter
            searchValue={subSearch}
            onSearchChange={setSubSearch}
            searchPlaceholder="Search by ID, member name, email, or plan..."
            filters={[
              {
                key: 'type',
                label: 'Membership Type',
                value: subTypeFilter,
                options: [
                  { label: 'All Plan Types', value: 'all' },
                  { label: 'Individual (INDIVIDUAL)', value: 'INDIVIDUAL' },
                  { label: 'Corporate (CORPORATE)', value: 'CORPORATE' },
                ],
              },
              {
                key: 'status',
                label: 'Status',
                value: subStatusFilter,
                options: [
                  { label: 'All Statuses', value: 'all' },
                  { label: 'Active Subscriptions', value: 'ACTIVE' },
                  { label: 'Expired', value: 'EXPIRED' },
                  { label: 'Suspended', value: 'SUSPENDED' },
                  { label: 'Cancelled', value: 'CANCELLED' },
                ],
              },
            ]}
            onFilterChange={(key, val) => {
              if (key === 'type') setSubTypeFilter(val);
              if (key === 'status') setSubStatusFilter(val);
            }}
            actions={
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Showing <strong>{filteredSubs.length}</strong> of {subscriptions.length} active subscriptions
              </div>
            }
          />

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
              <div className="spinner" style={{ margin: '0 auto 1rem', width: '28px', height: '28px', border: '3px solid #E2E8F0', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              <p style={{ margin: 0, fontWeight: 500 }}>Loading subscriptions from storage...</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Membership ID</th>
                    <th>Member Name</th>
                    <th>Email Address</th>
                    <th>Type</th>
                    <th>Plan Name</th>
                    <th>Valid Period</th>
                    <th>Rate</th>
                    <th>Platform</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubs.length === 0 ? (
                    <tr>
                      <td colSpan={10} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                        No subscriptions found matching your search or filters.
                      </td>
                    </tr>
                  ) : (
                    filteredSubs.map((s) => {
                      const isCorp = s.membershipType === 'CORPORATE';
                      const isBridge = (s.website || '').toUpperCase().includes('BRIDGE');

                      return (
                        <tr key={s.id}>
                          <td>
                            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--color-primary)' }}>
                              {s.id}
                            </span>
                          </td>
                          <td style={{ fontWeight: 600 }}>{s.userName}</td>
                          <td style={{ color: 'var(--text-secondary)' }}>{s.email}</td>
                          <td>
                            <span className={`visibility-pill ${isCorp ? 'compliance_bridge' : 'original'}`}>
                              {s.membershipType}
                            </span>
                          </td>
                          <td>
                            <div style={{ fontWeight: 600 }}>{s.planName}</div>
                          </td>
                          <td>
                            <div style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                              {s.startDate} &rarr; <strong>{s.expiryDate}</strong>
                            </div>
                          </td>
                          <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                            ${s.price?.toLocaleString()}
                          </td>
                          <td>
                            <span className={`visibility-pill ${isBridge ? 'compliance_bridge' : 'original'}`}>
                              {isBridge ? 'Bridge (:5174)' : 'Original (:5173)'}
                            </span>
                          </td>
                          <td>
                            <StatusBadge status={(s.status || 'ACTIVE').toLowerCase()} />
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <button
                              type="button"
                              className="btn-secondary btn-sm"
                              onClick={() => handleOpenManageSub(s)}
                            >
                              Manage
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
      )}

      {/* Add / Edit Plan Modal */}
      <Modal
        isOpen={isPlanModalOpen}
        onClose={() => !planSubmitting && setIsPlanModalOpen(false)}
        title={selectedPlan ? `Edit Plan: ${selectedPlan.name}` : 'Add New Membership Plan'}
        size="large"
        footer={
          <>
            <button
              type="button"
              className="btn-secondary"
              disabled={planSubmitting}
              onClick={() => setIsPlanModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn-primary"
              disabled={planSubmitting}
              onClick={handleSavePlan}
            >
              {planSubmitting ? 'Saving...' : selectedPlan ? 'Save Changes' : 'Create Plan'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSavePlan}>
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Plan Name *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. 1 Year Premium Membership"
                value={planFormData.name}
                onChange={(e) => setPlanFormData({ ...planFormData, name: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Membership Type *</label>
              <select
                className="form-select"
                value={planFormData.type}
                onChange={(e) => setPlanFormData({ ...planFormData, type: e.target.value })}
              >
                <option value="INDIVIDUAL">Individual Professional</option>
                <option value="CORPORATE">Corporate Healthcare Team</option>
              </select>
            </div>
          </div>

          <div className="form-grid-3">
            <div className="form-group">
              <label className="form-label">Authoritative Price ($ USD) *</label>
              <input
                type="number"
                required
                min={0}
                className="form-input"
                value={planFormData.price}
                onChange={(e) => setPlanFormData({ ...planFormData, price: Number(e.target.value) })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Duration Label *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. 1 Year, 6 Months, 1 Month"
                value={planFormData.duration}
                onChange={(e) => setPlanFormData({ ...planFormData, duration: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Status *</label>
              <select
                className="form-select"
                value={planFormData.status}
                onChange={(e) => setPlanFormData({ ...planFormData, status: e.target.value })}
              >
                <option value="ACTIVE">ACTIVE (Available publicly)</option>
                <option value="INACTIVE">INACTIVE (Hidden)</option>
              </select>
            </div>
          </div>

          {planFormData.type === 'CORPORATE' && (
            <div className="form-group">
              <label className="form-label">Team Seats / Allocation</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Up to 15 team members"
                value={planFormData.seats}
                onChange={(e) => setPlanFormData({ ...planFormData, seats: e.target.value })}
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Plan Description &amp; Scope</label>
            <textarea
              rows={3}
              className="form-textarea"
              placeholder="Detail training library access, CEU credentials, and coordinator assistance..."
              value={planFormData.description}
              onChange={(e) => setPlanFormData({ ...planFormData, description: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={planFormData.isBestValue}
                onChange={(e) => setPlanFormData({ ...planFormData, isBestValue: e.target.checked })}
              />
              <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>Highlight with &ldquo;Best Value&rdquo; Badge on Public Website</span>
            </label>
          </div>
        </form>
      </Modal>

      {/* Delete Plan Confirmation Modal */}
      <Modal
        isOpen={isPlanDeleteModalOpen}
        onClose={() => !planSubmitting && setIsPlanDeleteModalOpen(false)}
        title="Confirm Plan Deletion"
        footer={
          <>
            <button
              type="button"
              className="btn-secondary"
              disabled={planSubmitting}
              onClick={() => setIsPlanDeleteModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn-danger"
              disabled={planSubmitting}
              onClick={handleDeletePlan}
            >
              {planSubmitting ? 'Deleting...' : 'Confirm Delete'}
            </button>
          </>
        }
      >
        {selectedPlan?.activeSubscribersCount > 0 ? (
          <div style={{ padding: '1rem', backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', color: '#991B1B', fontSize: '0.875rem' }}>
            <strong style={{ display: 'block', marginBottom: '0.5rem' }}>⚠️ Delete Protected</strong>
            Plan <strong>&ldquo;{selectedPlan?.name}&rdquo;</strong> currently has{' '}
            <strong>{selectedPlan?.activeSubscribersCount} active subscriber(s)</strong>. To prevent breaking historical records, please set the plan to <strong>INACTIVE</strong> instead.
          </div>
        ) : (
          <p style={{ color: 'var(--text-secondary)' }}>
            Are you sure you want to delete membership plan <strong>&ldquo;{selectedPlan?.name}&rdquo;</strong> from persistent storage?
          </p>
        )}
      </Modal>

      {/* Manage Member Subscription Modal */}
      <Modal
        isOpen={isSubModalOpen}
        onClose={() => !subSubmitting && setIsSubModalOpen(false)}
        title={`Manage Subscription: ${selectedSub?.id}`}
        size="large"
        footer={
          <>
            <button
              type="button"
              className="btn-secondary"
              disabled={subSubmitting}
              onClick={() => setIsSubModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn-primary"
              disabled={subSubmitting}
              onClick={handleSaveSub}
            >
              {subSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </>
        }
      >
        {selectedSub && (
          <form onSubmit={handleSaveSub} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-grid-2">
              <div>
                <label className="form-label">Subscriber Name</label>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
                  {selectedSub.userName}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{selectedSub.email}</div>
              </div>
              <div>
                <label className="form-label">User ID</label>
                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--color-primary)' }}>
                  {selectedSub.userId}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Platform: {selectedSub.website || 'ORIGINAL'}
                </div>
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Assigned Membership Plan *</label>
                <select
                  className="form-select"
                  value={subFormData.planId}
                  onChange={(e) => setSubFormData({ ...subFormData, planId: e.target.value })}
                >
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — ${p.price} ({p.type})
                    </option>
                  ))}
                </select>
                <div className="form-hint">Authoritative pricing is retrieved directly from backend storage.</div>
              </div>

              <div className="form-group">
                <label className="form-label">Subscription Status *</label>
                <select
                  className="form-select"
                  value={subFormData.status}
                  onChange={(e) => setSubFormData({ ...subFormData, status: e.target.value })}
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="EXPIRED">EXPIRED</option>
                  <option value="SUSPENDED">SUSPENDED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Expiry Date (YYYY-MM-DD) *</label>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input
                  type="date"
                  required
                  className="form-input"
                  style={{ maxWidth: '240px' }}
                  value={subFormData.expiryDate}
                  onChange={(e) => setSubFormData({ ...subFormData, expiryDate: e.target.value })}
                />
                <button
                  type="button"
                  className="btn-secondary btn-sm"
                  onClick={() => addMonthsToExpiry(1)}
                  title="Add 1 Month from current expiry"
                >
                  +1 Month
                </button>
                <button
                  type="button"
                  className="btn-secondary btn-sm"
                  onClick={() => addMonthsToExpiry(6)}
                  title="Add 6 Months from current expiry"
                >
                  +6 Months
                </button>
                <button
                  type="button"
                  className="btn-secondary btn-sm"
                  onClick={() => addMonthsToExpiry(12)}
                  title="Add 1 Year from current expiry"
                >
                  +1 Year
                </button>
              </div>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
