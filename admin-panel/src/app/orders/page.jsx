'use client';

import React, { useState, useEffect } from 'react';
import Modal from '../../components/Modal';
import StatusBadge from '../../components/StatusBadge';
import SearchFilter from '../../components/SearchFilter';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');
  const [websiteFilter, setWebsiteFilter] = useState('all');

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newOrderStatus, setNewOrderStatus] = useState('');
  const [newPaymentStatus, setNewPaymentStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [savingStatus, setSavingStatus] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/orders');
      if (!res.ok) {
        throw new Error(`Failed to load orders (HTTP ${res.status})`);
      }
      const json = await res.json();
      const list = json.data || json || [];
      setOrders(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Unable to load orders from backend on port 5001. Please verify backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const triggerSuccessMsg = (msg) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(null), 3500);
  };

  const handleOpenDetails = (order) => {
    setSelectedOrder(order);
    setNewOrderStatus(order.status ? order.status.toUpperCase() : 'PENDING');
    setNewPaymentStatus(order.paymentStatus ? order.paymentStatus.toUpperCase() : 'PENDING');
    setAdminNotes(order.notes || '');
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setSavingStatus(true);
    try {
      const res = await fetch(`/api/orders/${selectedOrder.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newOrderStatus,
          paymentStatus: newPaymentStatus,
          notes: adminNotes,
        }),
      });

      const json = await res.json();
      if (!res.ok || json.success === false) {
        throw new Error(json.message || 'Failed to update order.');
      }

      triggerSuccessMsg(`Order ${selectedOrder.id} successfully updated!`);
      setSelectedOrder(null);
      fetchOrders();
    } catch (err) {
      alert(`Update failed: ${err.message}`);
    } finally {
      setSavingStatus(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const q = search.trim().toLowerCase();
    const matchSearch =
      !q ||
      (o.id && o.id.toLowerCase().includes(q)) ||
      ((o.customerName || o.customer) && (o.customerName || o.customer).toLowerCase().includes(q)) ||
      ((o.customerEmail || o.email) && (o.customerEmail || o.email).toLowerCase().includes(q)) ||
      (o.itemsSummary && o.itemsSummary.toLowerCase().includes(q)) ||
      (Array.isArray(o.items) && o.items.some((it) => (it.productName || '').toLowerCase().includes(q)));

    const matchStatus =
      statusFilter === 'all' ||
      (o.status && o.status.toLowerCase() === statusFilter.toLowerCase());

    const matchPaymentStatus =
      paymentStatusFilter === 'all' ||
      (o.paymentStatus && o.paymentStatus.toLowerCase() === paymentStatusFilter.toLowerCase()) ||
      (paymentStatusFilter === 'success' && (o.paymentStatus || '').toLowerCase() === 'successful');

    const matchWebsite =
      websiteFilter === 'all' ||
      (o.website && o.website.toLowerCase() === websiteFilter.toLowerCase()) ||
      (o.website && o.website.toUpperCase() === 'BOTH');

    return matchSearch && matchStatus && matchPaymentStatus && matchWebsite;
  });

  return (
    <div>
      <div className="page-header">
        <div className="page-header-title-wrap">
          <h1 className="page-header-title">Order Management</h1>
          <p className="page-header-subtitle">
            View customer orders, webinar purchases, institutional licenses, invoices, and fulfillment status.
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
          <button type="button" className="btn-secondary btn-sm" onClick={fetchOrders}>
            Retry
          </button>
        </div>
      )}

      <div className="admin-card">
        <SearchFilter
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search by order ID, customer name, email, or items..."
          filters={[
            {
              key: 'status',
              label: 'Order Status',
              value: statusFilter,
              options: [
                { label: 'All Order Statuses', value: 'all' },
                { label: 'Completed', value: 'completed' },
                { label: 'Processing', value: 'processing' },
                { label: 'Pending', value: 'pending' },
                { label: 'Refunded', value: 'refunded' },
                { label: 'Cancelled', value: 'cancelled' },
              ],
            },
            {
              key: 'paymentStatus',
              label: 'Payment Status',
              value: paymentStatusFilter,
              options: [
                { label: 'All Payment Statuses', value: 'all' },
                { label: 'Paid (Success)', value: 'success' },
                { label: 'Pending Payment', value: 'pending' },
                { label: 'Refunded', value: 'refunded' },
                { label: 'Failed', value: 'failed' },
              ],
            },
            {
              key: 'website',
              label: 'Origin Platform',
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
            if (key === 'paymentStatus') setPaymentStatusFilter(val);
            if (key === 'website') setWebsiteFilter(val);
          }}
          actions={
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Showing <strong>{filteredOrders.length}</strong> of <strong>{orders.length}</strong> orders
            </div>
          }
        />

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div className="loading-spinner" style={{ margin: '0 auto 1rem' }}></div>
            <p>Loading real-time orders from backend...</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Items Purchased</th>
                  <th>Total Amount</th>
                  <th>Order Date</th>
                  <th>Origin Website</th>
                  <th>Order Status</th>
                  <th>Payment Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                      No orders found matching your search or filters.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((o) => {
                    const customerName = o.customerName || o.customer || 'Valued Customer';
                    const customerEmail = o.customerEmail || o.email || '—';
                    const totalAmt = o.total !== undefined ? o.total : (o.amount !== undefined ? o.amount : 0);
                    const orderDateStr = o.orderDate || o.date || (o.createdAt ? o.createdAt.slice(0, 10) : '—');
                    const webLabel = (o.website || 'ORIGINAL').toUpperCase() === 'BRIDGE' ? 'Compliance Bridge' : 'Original Website';

                    return (
                      <tr key={o.id}>
                        <td>
                          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--color-primary)' }}>
                            {o.id}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{customerName}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{customerEmail}</div>
                        </td>
                        <td style={{ maxWidth: '260px' }}>
                          <div style={{ fontSize: '0.825rem', whiteSpace: 'normal', wordBreak: 'break-word' }}>
                            {o.itemsSummary || (Array.isArray(o.items) && o.items.map(it => `${it.quantity}x ${it.productName}`).join(', ')) || '1x Order Item'}
                          </div>
                        </td>
                        <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                          ${totalAmt}
                        </td>
                        <td>{orderDateStr}</td>
                        <td>
                          <span className="visibility-pill">{webLabel}</span>
                        </td>
                        <td>
                          <StatusBadge status={(o.status || 'pending').toLowerCase()} />
                        </td>
                        <td>
                          <StatusBadge status={(o.paymentStatus || 'pending').toLowerCase()} />
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            type="button"
                            className="btn-secondary btn-sm"
                            onClick={() => handleOpenDetails(o)}
                          >
                            View Invoice
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

      {/* View Details / Invoice Modal */}
      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={`Order Details: ${selectedOrder?.id}`}
        footer={
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setSelectedOrder(null)}
            >
              Close
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={handleUpdateStatus}
              disabled={savingStatus}
            >
              {savingStatus ? 'Saving...' : 'Save Order Changes'}
            </button>
          </div>
        }
      >
        {selectedOrder && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Customer & Origin Header */}
            <div className="form-grid-2">
              <div>
                <label className="form-label">Customer Name</label>
                <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                  {selectedOrder.customerName || selectedOrder.customer || 'Valued Customer'}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  User ID: {selectedOrder.userId || 'USR-ANON'}
                </div>
              </div>
              <div>
                <label className="form-label">Customer Email</label>
                <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                  {selectedOrder.customerEmail || selectedOrder.email || '—'}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Platform: {selectedOrder.website || 'ORIGINAL'}
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <div>
              <label className="form-label">Purchased Line Items</label>
              <div style={{ border: '1px solid #E2E8F0', borderRadius: '8px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.825rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', textAlign: 'left' }}>
                      <th style={{ padding: '0.5rem 0.75rem' }}>Item Description</th>
                      <th style={{ padding: '0.5rem 0.75rem' }}>Type</th>
                      <th style={{ padding: '0.5rem 0.75rem', textAlign: 'center' }}>Qty</th>
                      <th style={{ padding: '0.5rem 0.75rem', textAlign: 'right' }}>Unit Price</th>
                      <th style={{ padding: '0.5rem 0.75rem', textAlign: 'right' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(selectedOrder.items) && selectedOrder.items.length > 0 ? (
                      selectedOrder.items.map((it, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                          <td style={{ padding: '0.6rem 0.75rem' }}>
                            <div style={{ fontWeight: 600 }}>{it.productName || 'Webinar Item'}</div>
                            {it.optionTitle && (
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                Option: {it.optionTitle}
                              </div>
                            )}
                          </td>
                          <td style={{ padding: '0.6rem 0.75rem' }}>
                            <span style={{ fontSize: '0.72rem', backgroundColor: '#EFF6FF', color: '#1D4ED8', padding: '2px 6px', borderRadius: '4px' }}>
                              {it.productType || 'WEBINAR'}
                            </span>
                          </td>
                          <td style={{ padding: '0.6rem 0.75rem', textAlign: 'center', fontWeight: 600 }}>
                            {it.quantity || 1}
                          </td>
                          <td style={{ padding: '0.6rem 0.75rem', textAlign: 'right' }}>
                            ${it.unitPrice || (it.totalPrice ? Math.round(it.totalPrice / (it.quantity || 1)) : selectedOrder.total)}
                          </td>
                          <td style={{ padding: '0.6rem 0.75rem', textAlign: 'right', fontWeight: 700 }}>
                            ${it.totalPrice || it.unitPrice || selectedOrder.total}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" style={{ padding: '0.75rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                          {selectedOrder.itemsSummary || 'Standard Webinar Purchase'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Financial Summary */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '1rem',
              backgroundColor: '#F8FAFC',
              padding: '0.85rem',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
            }}>
              <div>
                <label className="form-label" style={{ marginBottom: '2px' }}>Subtotal</label>
                <div style={{ fontWeight: 600 }}>
                  ${selectedOrder.subtotal !== undefined ? selectedOrder.subtotal : selectedOrder.total || selectedOrder.amount}
                </div>
              </div>
              <div>
                <label className="form-label" style={{ marginBottom: '2px' }}>Discount</label>
                <div style={{ color: selectedOrder.discount > 0 ? '#10B981' : 'inherit', fontWeight: 600 }}>
                  -${selectedOrder.discount || 0}
                </div>
              </div>
              <div>
                <label className="form-label" style={{ marginBottom: '2px' }}>Total Amount</label>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                  ${selectedOrder.total !== undefined ? selectedOrder.total : selectedOrder.amount}
                </div>
              </div>
            </div>

            {/* Status Management Form */}
            <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '1rem' }}>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
                Order &amp; Payment Status Management
              </h4>
              <div className="form-grid-2">
                <div>
                  <label className="form-label">Order Status</label>
                  <select
                    className="form-select"
                    value={newOrderStatus}
                    onChange={(e) => setNewOrderStatus(e.target.value)}
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="PROCESSING">PROCESSING</option>
                    <option value="CONFIRMED">CONFIRMED</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="CANCELLED">CANCELLED</option>
                    <option value="REFUNDED">REFUNDED</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Payment Status</label>
                  <select
                    className="form-select"
                    value={newPaymentStatus}
                    onChange={(e) => setNewPaymentStatus(e.target.value)}
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="SUCCESS">SUCCESS (Paid)</option>
                    <option value="REFUNDED">REFUNDED</option>
                    <option value="FAILED">FAILED</option>
                  </select>
                </div>
              </div>

              <div style={{ marginTop: '0.75rem' }}>
                <label className="form-label">Internal Admin Notes</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Optional fulfillment or audit notes..."
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
