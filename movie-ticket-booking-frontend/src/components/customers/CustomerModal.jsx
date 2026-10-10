import React, { useState } from 'react';
import { Loader2, Save } from 'lucide-react';
import Modal from '../common/Modal';

const CustomerModal = ({ isOpen, onClose, onSave, initialData = null, isSubmitting = false }) => {
  const [prevInitialData, setPrevInitialData] = useState(initialData);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  const [formData, setFormData] = useState(() => (initialData ? {
    name: initialData.name || '',
    email: initialData.email || '',
    phone: initialData.phone || '',
  } : { name: '', email: '', phone: '' }));
  const [errors, setErrors] = useState({});

  if (initialData !== prevInitialData || isOpen !== prevIsOpen) {
    setPrevInitialData(initialData);
    setPrevIsOpen(isOpen);
    setFormData(initialData ? {
      name: initialData.name || '',
      email: initialData.email || '',
      phone: initialData.phone || '',
    } : { name: '', email: '', phone: '' });
    setErrors({});
  }

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (formData.phone.trim().length < 8) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSave(formData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? `Edit Customer #${initialData.customerId}` : 'Register New Customer'}
      maxWidth="500px"
    >
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="customer-name">
            Customer Name *
          </label>
          <div style={{ position: 'relative' }}>
            <input
              id="customer-name"
              type="text"
              className="form-input"
              placeholder="e.g. John Doe"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={isSubmitting}
            />
          </div>
          {errors.name && (
            <span style={{ color: '#f87171', fontSize: '0.8rem', marginTop: '0.2rem' }}>
              {errors.name}
            </span>
          )}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="customer-email">
            Email Address *
          </label>
          <input
            id="customer-email"
            type="email"
            className="form-input"
            placeholder="e.g. john@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            disabled={isSubmitting}
          />
          {errors.email && (
            <span style={{ color: '#f87171', fontSize: '0.8rem', marginTop: '0.2rem' }}>
              {errors.email}
            </span>
          )}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="customer-phone">
            Phone Number *
          </label>
          <input
            id="customer-phone"
            type="tel"
            className="form-input"
            placeholder="e.g. 9876543210"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            disabled={isSubmitting}
          />
          {errors.phone && (
            <span style={{ color: '#f87171', fontSize: '0.8rem', marginTop: '0.2rem' }}>
              {errors.phone}
            </span>
          )}
        </div>

        <div className="modal-footer" style={{ padding: '1rem 0 0', marginTop: '1.5rem' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary btn-sm"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="spin-icon" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>{initialData ? 'Update Customer' : 'Save Customer'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CustomerModal;
