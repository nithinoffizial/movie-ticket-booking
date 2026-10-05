import React, { useState, useEffect, useMemo } from 'react';
import { Users, Search, Plus, RefreshCw, UserCheck, AlertTriangle } from 'lucide-react';
import customerService from '../services/customerService';
import CustomerCard from '../components/customers/CustomerCard';
import CustomerModal from '../components/customers/CustomerModal';
import Modal from '../components/common/Modal';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';
import { useToast } from '../context/ToastContext';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete Confirmation State
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { addToast } = useToast();

  const fetchCustomers = async () => {
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
  };

  useEffect(() => {
    fetchCustomers();
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

  // Open Edit Modal
  const handleOpenEdit = (customer) => {
    setEditingCustomer(customer);
    setIsModalOpen(true);
  };

  // Handle Save (Create or Update)
  const handleSaveCustomer = async (formData) => {
    setIsSubmitting(true);
    try {
      if (editingCustomer) {
        // PUT /customers/{id}
        const updated = await customerService.updateCustomer(editingCustomer.customerId, formData);
        addToast(`Customer "${formData.name}" updated successfully!`, 'success');
        setCustomers((prev) =>
          prev.map((c) => (c.customerId === editingCustomer.customerId ? updated : c))
        );
      } else {
        // POST /customers
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

  // Handle Delete Confirmation
  const handleConfirmDelete = async () => {
    if (!customerToDelete) return;
    setIsDeleting(true);
    try {
      await customerService.deleteCustomer(customerToDelete.customerId);
      addToast(`Customer "${customerToDelete.name}" removed successfully!`, 'success');
      setCustomers((prev) => prev.filter((c) => c.customerId !== customerToDelete.customerId));
      setCustomerToDelete(null);
    } catch (err) {
      console.error('Error deleting customer:', err);
      addToast(
        err.message || 'Failed to delete customer. Note: customer may have existing bookings in the database.',
        'error'
      );
    } finally {
      setIsDeleting(false);
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
            <span>Customer Directory</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Manage registered patron profiles, view customer contacts, and initiate direct reservations.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
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
        <div className="grid-responsive">
          {filteredCustomers.map((customer) => (
            <CustomerCard
              key={customer.customerId}
              customer={customer}
              onEdit={handleOpenEdit}
              onDelete={(c) => setCustomerToDelete(c)}
            />
          ))}
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

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!customerToDelete}
        onClose={() => setCustomerToDelete(null)}
        title="Confirm Customer Removal"
        maxWidth="450px"
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
          <h4 style={{ color: '#ffffff', marginBottom: '0.5rem' }}>
            Delete {customerToDelete?.name}?
          </h4>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Are you sure you want to remove customer account #{customerToDelete?.customerId}? If this customer has existing bookings in the database, foreign key constraints may prevent deletion.
          </p>
        </div>

        <div className="modal-footer" style={{ padding: '1rem 0 0' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setCustomerToDelete(null)}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-danger btn-sm"
            onClick={handleConfirmDelete}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Confirm Delete'}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Customers;
