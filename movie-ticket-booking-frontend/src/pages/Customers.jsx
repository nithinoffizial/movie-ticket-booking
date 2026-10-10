import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Users, Search, Plus, RefreshCw, UserCheck, UserX, AlertTriangle } from 'lucide-react';
import customerService from '../services/customerService';
import CustomerModal from '../components/customers/CustomerModal';
import Modal from '../components/common/Modal';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

const Customers = () => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');

  // Modal State for Create/Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Status Change / Deactivate State
  const [customerToDeactivate, setCustomerToDeactivate] = useState(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const { addToast } = useToast();

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await customerService.getAllCustomers();
      setCustomers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError({
        message: err.message || 'Unable to retrieve customers from database.',
        endpoint: 'GET /customers',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    customerService.getAllCustomers()
      .then((data) => {
        if (active) setCustomers(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (active) {
          console.error('Error fetching customers:', err);
          setError({
            message: err.message || 'Unable to retrieve customers from database.',
            endpoint: 'GET /customers',
          });
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const term = searchTerm.toLowerCase();
      return (
        c.name?.toLowerCase().includes(term) ||
        c.email?.toLowerCase().includes(term) ||
        c.phone?.toLowerCase().includes(term) ||
        String(c.customerId).includes(term)
      );
    });
  }, [customers, searchTerm]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingCustomer(null);
    setIsModalOpen(true);
  };

  // Handle Save (Create or Update)
  const handleSaveCustomer = async (formData) => {
    setIsSubmitting(true);
    try {
      if (editingCustomer) {
        const updated = await customerService.updateCustomer(editingCustomer.customerId, formData);
        addToast(`Customer "${formData.name}" updated successfully!`, 'success');
        setCustomers((prev) =>
          prev.map((c) => (c.customerId === editingCustomer.customerId ? updated : c))
        );
      } else {
        const created = await customerService.createCustomer(formData);
        addToast(`Customer "${formData.name}" registered successfully!`, 'success');
        setCustomers((prev) => [...prev, created]);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error saving customer:', err);
      addToast(err.message || 'Failed to save customer', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle Customer Active/Inactive Status
  const handleToggleCustomerStatus = async (customer) => {
    if (customer.active !== false) {
      // Prevent admin from deactivating their own account
      if (
        (user?.customerId && user.customerId === customer.customerId) ||
        (user?.username && customer.email && user.username.toLowerCase() === customer.email.toLowerCase()) ||
        (user?.email && customer.email && user.email.toLowerCase() === customer.email.toLowerCase())
      ) {
        addToast('You cannot deactivate your own administrator account.', 'error');
        return;
      }
      setCustomerToDeactivate(customer);
      return;
    }

    setIsUpdatingStatus(true);
    try {
      await customerService.updateCustomerStatus(customer.customerId, true);
      addToast(`Customer "${customer.name}" reactivated successfully!`, 'success');
      setCustomers((prev) =>
        prev.map((c) => (c.customerId === customer.customerId ? { ...c, active: true } : c))
      );
    } catch (err) {
      console.error('Error activating customer:', err);
      addToast(err.message || 'Failed to activate customer.', 'error');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Confirm Deactivation
  const handleConfirmDeactivation = async () => {
    if (!customerToDeactivate) return;
    setIsUpdatingStatus(true);
    try {
      await customerService.updateCustomerStatus(customerToDeactivate.customerId, false);
      addToast(`Customer "${customerToDeactivate.name}" deactivated successfully.`, 'success');
      setCustomers((prev) =>
        prev.map((c) => (c.customerId === customerToDeactivate.customerId ? { ...c, active: false } : c))
      );
      setCustomerToDeactivate(null);
    } catch (err) {
      console.error('Error deactivating customer:', err);
      addToast(err.message || 'Failed to deactivate customer.', 'error');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <div className="page-wrapper">
      {/* Page Header */}
      <div className="section-header">
        <div className="section-title-wrap">
          <span className="section-subtitle">Account Directory</span>
          <h1 className="section-title">
            <Users size={32} color="var(--accent-cyan)" />
            <span>Customer Management</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Manage registered patron accounts, track account status, and toggle activation states.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button onClick={fetchCustomers} className="btn btn-secondary btn-sm" disabled={loading}>
            <RefreshCw size={15} className={loading ? 'spin-icon' : ''} />
            <span>Refresh</span>
          </button>
          <button onClick={handleOpenCreate} className="btn btn-primary btn-sm">
            <Plus size={16} />
            <span>Add Customer</span>
          </button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="filter-bar">
        <div className="search-input-wrap">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="form-input search-input"
            placeholder="Search by customer name, email, phone number, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
          Total Customers: <strong>{customers.length}</strong>
        </div>
      </div>

      {/* Content Rendering */}
      {loading ? (
        <LoadingState message="Loading registered customers..." />
      ) : error ? (
        <ErrorState
          title="Could Not Load Customers"
          message={error.message}
          endpoint={error.endpoint}
          onRetry={fetchCustomers}
        />
      ) : filteredCustomers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No Customers Found"
          message={
            searchTerm
              ? 'No registered customers match your current search query.'
              : 'There are no customer accounts registered yet.'
          }
          actionText={searchTerm ? 'Clear Search' : 'Register New Customer'}
          onAction={searchTerm ? () => setSearchTerm('') : handleOpenCreate}
        />
      ) : (
        <div
          className="card"
          style={{
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-subtle)',
            overflow: 'hidden',
          }}
        >
          <div className="table-responsive">
            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
              <thead>
                <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-subtle)' }}>
                  <th style={{ padding: '1rem' }}>Customer</th>
                  <th style={{ padding: '1rem' }}>Email</th>
                  <th style={{ padding: '1rem' }}>Phone</th>
                  <th style={{ padding: '1rem' }}>Status</th>
                  <th style={{ padding: '1rem' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((c) => (
                  <tr key={c.customerId} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{c.name}</div>
                      <div style={{ fontSize: '0.8rem', color: '#38bdf8' }}>#{c.customerId}</div>
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                      {c.email}
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>
                      {c.phone || 'N/A'}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.25rem 0.65rem',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          background: c.active !== false ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                          color: c.active !== false ? 'var(--accent-emerald)' : '#f87171',
                          border: `1px solid ${c.active !== false ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                        }}
                      >
                        <span
                          style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            background: c.active !== false ? 'var(--accent-emerald)' : '#f87171',
                          }}
                        />
                        {c.active !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {c.active !== false ? (
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          style={{
                            borderColor: 'rgba(239, 68, 68, 0.4)',
                            color: '#f87171',
                            padding: '0.35rem 0.75rem',
                            fontSize: '0.8rem',
                          }}
                          onClick={() => handleToggleCustomerStatus(c)}
                          disabled={isUpdatingStatus}
                        >
                          <UserX size={14} />
                          <span>Deactivate</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          style={{
                            borderColor: 'rgba(16, 185, 129, 0.4)',
                            color: 'var(--accent-emerald)',
                            padding: '0.35rem 0.75rem',
                            fontSize: '0.8rem',
                          }}
                          onClick={() => handleToggleCustomerStatus(c)}
                          disabled={isUpdatingStatus}
                        >
                          <UserCheck size={14} />
                          <span>Activate</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Customer Create/Edit Modal */}
      <CustomerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCustomer}
        initialData={editingCustomer}
        isSubmitting={isSubmitting}
      />

      {/* Deactivate Confirmation Modal */}
      <Modal
        isOpen={!!customerToDeactivate}
        onClose={() => setCustomerToDeactivate(null)}
        title="Confirm Customer Deactivation"
        maxWidth="460px"
      >
        <div style={{ textAlign: 'center', padding: '1rem 0' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.15)',
              color: '#f87171',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
            }}
          >
            <AlertTriangle size={28} />
          </div>
          <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            Deactivate {customerToDeactivate?.name}?
          </h4>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>
            Are you sure you want to deactivate customer account #{customerToDeactivate?.customerId}?
            They will be prevented from logging in and booking tickets.
            Their existing bookings and tickets will remain intact.
          </p>
        </div>

        <div className="modal-footer" style={{ padding: '1rem 0 0', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setCustomerToDeactivate(null)}
            disabled={isUpdatingStatus}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-danger btn-sm"
            onClick={handleConfirmDeactivation}
            disabled={isUpdatingStatus}
          >
            {isUpdatingStatus ? 'Deactivating...' : 'Confirm Deactivate'}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Customers;
