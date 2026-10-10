import React from 'react';
import Modal from '../common/Modal';
import DigitalTicketCard from './DigitalTicketCard';

const DigitalTicketModal = ({ isOpen, onClose, ticket }) => {
  if (!ticket) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Digital Movie Ticket" maxWidth="620px">
      <div style={{ padding: '0.5rem 0' }}>
        <DigitalTicketCard ticket={ticket} />
      </div>
    </Modal>
  );
};

export default DigitalTicketModal;
