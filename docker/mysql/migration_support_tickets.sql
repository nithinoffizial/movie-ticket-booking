-- ============================================================
-- CINEPASS CUSTOMER SUPPORT FEATURE MIGRATION
-- Additive migration for support_tickets and ticket_messages
-- Safe to re-run, preserves all existing tables and data
-- ============================================================

CREATE TABLE IF NOT EXISTS support_tickets (
    ticket_id INT PRIMARY KEY AUTO_INCREMENT,
    ticket_reference VARCHAR(50) NOT NULL UNIQUE,
    customer_id INT NOT NULL,
    category VARCHAR(50) NOT NULL,
    subject VARCHAR(200) NOT NULL,
    booking_reference VARCHAR(50) NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'OPEN',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (customer_id)
        REFERENCES customers(customer_id)
        ON DELETE CASCADE,

    INDEX idx_support_tickets_customer (customer_id),
    INDEX idx_support_tickets_status (status),
    INDEX idx_support_tickets_ref (ticket_reference)
);

CREATE TABLE IF NOT EXISTS ticket_messages (
    message_id INT PRIMARY KEY AUTO_INCREMENT,
    ticket_id INT NOT NULL,
    sender_type VARCHAR(20) NOT NULL,
    sender_user_id INT NULL,
    sender_name VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (ticket_id)
        REFERENCES support_tickets(ticket_id)
        ON DELETE CASCADE,

    FOREIGN KEY (sender_user_id)
        REFERENCES users(user_id)
        ON DELETE SET NULL,

    INDEX idx_ticket_messages_ticket (ticket_id)
);
