'use client';

import React, { useState, useEffect } from 'react';
import Modal from '../../components/Modal';
import StatusBadge from '../../components/StatusBadge';
import SearchFilter from '../../components/SearchFilter';

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [websiteFilter, setWebsiteFilter] = useState('all');

  const [selectedPayment, setSelectedPayment] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [savingStatus, setSavingStatus] = useState(false);

  const fetchPayments = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/payments');
      if (!res.ok) {
        throw new Error(`Failed to load payments (HTTP ${res.status})`);
      }
      const json = await res.json();
      const list = json.data || json || [];
      setPayments(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Error fetching payments:', err);
      setError('Unable to load payments from backend on port 5001. Please verify backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const triggerSuccessMsg = (msg) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(null), 3500);
  };

  const handleOpenDetails = (payment) => {
    setSelectedPayment(payment);
    setNewStatus(payment.status ? payment.status.toUpperCase() : 'PENDING');
    setAdminNotes(payment.notes || '');
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedPayment) return;

    setSavingStatus(true);
    try {
      const res = await fetch(`/api/payments/${selectedPayment.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          notes: adminNotes,
        }),
      });

      const json = await res.json();
      if (!res.ok || json.success === false) {
        throw new Error(json.message || 'Failed to update payment status.');
      }

      triggerSuccessMsg(`Payment ${selectedPayment.id} updated successfully!`);
      setSelectedPayment(null);
      fetchPayments();
    } catch (err) {
      alert(`Update failed: ${err.message}`);
    } finally {
      setSavingStatus(false);
    }
  };

  const filteredPayments = payments.filter((p) => {
    const q = search.trim().toLowerCase();
    const matchSearch =
      !q ||
      (p.id && p.id.toLowerCase().includes(q)) ||
      (p.orderId && p.orderId.toLowerCase().includes(q)) ||
      ((p.customerName || p.customer) && (p.customerName || p.customer).toLowerCase().includes(q)) ||
      ((p.customerEmail || p.email) && (p.customerEmail || p.email).toLowerCase().includes(q)) ||
      ((p.paymentMethod || p.method) && (p.paymentMethod || p.method).toLowerCase().includes(q)) ||
      (p.transactionId && p.transactionId.toLowerCase().includes(q));

    const matchStatus =
      statusFilter === 'all' ||
      (p.status && p.status.toLowerCase() === statusFilter.toLowerCase()) ||
      (statusFilter === 'successful' && (p.status || '').toLowerCase() === 'success') ||
      (statusFilter === 'success' && (p.status || '').toLowerCase() === 'successful');

    const matchMethod =
      methodFilter === 'all' ||
      ((p.paymentMethod || p.method) && (p.paymentMethod || p.method).toLowerCase().includes(methodFilter.toLowerCase()));

    const matchWebsite =
      websiteFilter === 'all' ||
      (p.website && p.website.toLowerCase() === websiteFilter.toLowerCase()) ||
      (p.website && p.website.toUpperCase() === 'BOTH');

    return matchSearch && matchStatus && matchMethod && matchWebsite;
  });

  return (
    <div>
      <div className="page-header">
        <div className="page-header-title-wrap">
          <h1 className="page-header-title">Payments &amp; Transactions</h1>
          <p className="page-header-subtitle">
            Financial ledger of credit card settlements, institutional invoices, purchase orders, and refunds.
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
          <button type="button" className="btn-secondary btn-sm" onClick={fetchPayments}>
            Retry
          </button>
        </div>
      )}

      <div className="admin-card">
        <SearchFilter
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search by payment ID, order ID, customer, method, or transaction ref..."
          filters={[
            {
              key: 'status',
              label: 'Transaction Status',
              value: statusFilter,
              options: [
                { label: 'All Statuses', value: 'all' },
                { label: 'Successful / Paid', value: 'successful' },
                { label: 'Pending', value: 'pending' },
                { label: 'Refunded', value: 'refunded' },
                { label: 'Failed', value: 'failed' },
              ],
            },
            {
              key: 'method',
              label: 'Payment Method',
              value: methodFilter,
              options: [
                { label: 'All Methods', value: 'all' },
                { label: 'Credit Card (Stripe)', value: 'stripe' },
                { label: 'Corporate Invoice / PO', value: 'invoice' },
                { label: 'Manual / Other', value: 'manual' },
              ],
            },
            {
              key: 'website',
              label: 'Platform',
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
            if (key === 'method') setMethodFilter(val);
            if (key === 'website') setWebsiteFilter(val);
          }}
          actions={
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Showing <strong>{filteredPayments.length}</strong> of <strong>{payments.length}</strong> transactions
            </div>
          }
        />

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div className="loading-spinner" style={{ margin: '0 auto 1rem' }}></div>
            <p>Loading real-time financial records from backend...</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Payment ID</th>
                  <th>Order Ref</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Payment Method</th>
                  <th>Timestamp</th>
                  <th>Platform</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                      No payment records found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((p) => {
                    const customerName = p.customerName || p.customer || 'Valued Customer';
                    const customerEmail = p.customerEmail || p.email || '';
                    const method = p.paymentMethod || p.method || 'Credit Card';
                    const timestamp = p.paymentDate || p.date || (p.createdAt ? p.createdAt.replace('T', ' ').slice(0, 16) : '—');
                    const webLabel = (p.website || 'ORIGINAL').toUpperCase() === 'BRIDGE' ? 'Compliance Bridge' : 'Original Website';

                    return (
                      <tr key={p.id}>
                        <td>
                          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--color-primary)' }}>
                            {p.id}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                            {p.orderId}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{customerName}</div>
                          {customerEmail && (
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{customerEmail}</div>
                          )}
                        </td>
                        <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                          ${p.amount}
                        </td>
                        <td>{method}</td>
                        <td>{timestamp}</td>
                        <td>
                          <span className="visibility-pill">{webLabel}</span>
                        </td>
                        <td>
                          <StatusBadge status={(p.status || 'pending').toLowerCase()} />
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            type="button"
                            className="btn-secondary btn-sm"
                            onClick={() => handleOpenDetails(p)}
                          >
                            Details
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

      {/* View Details / Status Management Modal */}
      <Modal
        isOpen={!!selectedPayment}
        onClose={() => setSelectedPayment(null)}
        title={`Payment Details: ${selectedPayment?.id}`}
        footer={
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setSelectedPayment(null)}
            >
              Close
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={handleUpdateStatus}
              disabled={savingStatus}
            >
              {savingStatus ? 'Saving...' : 'Update Status'}
            </button>
          </div>
        }
      >
        {selectedPayment && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-grid-2">
              <div>
                <label className="form-label">Payment ID</label>
                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-primary)' }}>
                  {selectedPayment.id}
                </div>
              </div>
              <div>
                <label className="form-label">Linked Order ID</label>
                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                  {selectedPayment.orderId}
                </div>
              </div>
            </div>

            <div className="form-grid-2">
              <div>
                <label className="form-label">Customer Name</label>
                <div style={{ fontWeight: 600 }}>
                  {selectedPayment.customerName || selectedPayment.customer || 'Valued Customer'}
                </div>
              </div>
              <div>
                <label className="form-label">Customer Email</label>
                <div style={{ fontWeight: 600 }}>
                  {selectedPayment.customerEmail || selectedPayment.email || '—'}
                </div>
              </div>
            </div>

            <div className="form-grid-3">
              <div>
                <label className="form-label">Amount</label>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                  ${selectedPayment.amount} {selectedPayment.currency || 'USD'}
                </div>
              </div>
              <div>
                <label className="form-label">Method</label>
                <div style={{ fontWeight: 600 }}>
                  {selectedPayment.paymentMethod || selectedPayment.method || 'Credit Card'}
                </div>
              </div>
              <div>
                <label className="form-label">Platform</label>
                <div>
                  <span className="visibility-pill">{selectedPayment.website || 'ORIGINAL'}</span>
                </div>
              </div>
            </div>

            <div className="form-grid-2">
              <div>
                <label className="form-label">Transaction Reference</label>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                  {selectedPayment.transactionId || 'tx_pending'}
                </div>
              </div>
              <div>
                <label className="form-label">Transaction Date</label>
                <div style={{ fontSize: '0.875rem' }}>
                  {selectedPayment.paymentDate || selectedPayment.date || selectedPayment.createdAt}
                </div>
              </div>
            </div>

            {/* Status Modification */}
            <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '1rem' }}>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
                Administrative Status Adjustment
              </h4>
              <div>
                <label className="form-label">Payment Status</label>
                <select
                  className="form-select"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                >
                  <option value="PENDING">PENDING</option>
                  <option value="SUCCESS">SUCCESS (Settled / Confirmed)</option>
                  <option value="REFUNDED">REFUNDED (Administrative Refund)</option>
                  <option value="FAILED">FAILED</option>
                </select>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Changing status here automatically synchronizes the linked order&apos;s financial status in orders.json.
                </div>
              </div>

              <div style={{ marginTop: '0.75rem' }}>
                <label className="form-label">Audit / Processing Notes</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Optional audit log or transaction notes..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
