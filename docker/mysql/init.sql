-- ============================================
-- MOVIES
-- ============================================

CREATE TABLE movies (
    movie_id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(150) NOT NULL,
    genre VARCHAR(50),
    duration_minutes INT,
    language VARCHAR(30)
);

-- ============================================
-- THEATRES
-- ============================================

CREATE TABLE theatres (
    theatre_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(150) NOT NULL,
    total_screens INT
);

-- ============================================
-- SHOWS
-- ============================================

CREATE TABLE shows (
    show_id INT PRIMARY KEY AUTO_INCREMENT,
    movie_id INT NOT NULL,
    theatre_id INT NOT NULL,
    show_date DATE NOT NULL,
    show_time TIME NOT NULL,
    ticket_price DECIMAL(10,2) NOT NULL,
    total_seats INT NOT NULL,
    available_seats INT NOT NULL,

    FOREIGN KEY (movie_id)
        REFERENCES movies(movie_id),

    FOREIGN KEY (theatre_id)
        REFERENCES theatres(theatre_id)
);

-- ============================================
-- CUSTOMERS
-- ============================================

CREATE TABLE customers (
    customer_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(15),
    active BOOLEAN NOT NULL DEFAULT TRUE
);

-- ============================================
-- USERS
-- ============================================

CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('ADMIN', 'CUSTOMER') NOT NULL,
    customer_id INT NULL UNIQUE,

    FOREIGN KEY (customer_id)
        REFERENCES customers(customer_id)
        ON DELETE CASCADE
);

-- ============================================
-- BOOKINGS
-- ============================================

CREATE TABLE bookings (
    booking_id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT NOT NULL,
    show_id INT NOT NULL,
    seats_booked INT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (customer_id)
        REFERENCES customers(customer_id),

    FOREIGN KEY (show_id)
        REFERENCES shows(show_id)
);

-- ============================================
-- SEATS
-- ============================================

CREATE TABLE seats (
    seat_id INT PRIMARY KEY AUTO_INCREMENT,
    show_id INT NOT NULL,
    seat_number VARCHAR(10) NOT NULL,
    status ENUM('AVAILABLE', 'BOOKED') NOT NULL DEFAULT 'AVAILABLE',

    FOREIGN KEY (show_id)
        REFERENCES shows(show_id)
        ON DELETE CASCADE,

    UNIQUE (show_id, seat_number)
);

-- ============================================
-- BOOKING SEATS
-- ============================================

CREATE TABLE booking_seats (
    booking_seat_id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT NOT NULL,
    seat_id INT NOT NULL,

    FOREIGN KEY (booking_id)
        REFERENCES bookings(booking_id)
        ON DELETE CASCADE,

    FOREIGN KEY (seat_id)
        REFERENCES seats(seat_id)
        ON DELETE RESTRICT,

    UNIQUE (booking_id, seat_id),
    UNIQUE (seat_id)
);

-- ============================================
-- TICKETS
-- ============================================

CREATE TABLE tickets (
    ticket_id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT NOT NULL UNIQUE,
    ticket_number VARCHAR(50) NOT NULL UNIQUE,
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('CONFIRMED', 'CANCELLED') NOT NULL DEFAULT 'CONFIRMED',

    FOREIGN KEY (booking_id)
        REFERENCES bookings(booking_id)
        ON DELETE CASCADE
);

-- ============================================
-- MOVIE DATA
-- ============================================

INSERT INTO movies
(title, genre, duration_minutes, language)
VALUES
('Interstellar', 'Sci-Fi', 169, 'English'),
('Leo', 'Action', 164, 'Tamil'),
('Vikram', 'Action', 174, 'Tamil'),
('Inception', 'Sci-Fi', 148, 'English'),
('Jailer', 'Action', 168, 'Tamil');

-- ============================================
-- THEATRE DATA
-- ============================================

INSERT INTO theatres
(name, location, total_screens)
VALUES
('PVR Cinemas', 'Velachery, Chennai', 5),
('AGS Cinemas', 'Navalur, Chennai', 4),
('Rohini Silver Screens', 'Koyambedu, Chennai', 6),
('Luxe Cinemas', 'Phoenix Marketcity, Chennai', 5);

-- ============================================
-- CUSTOMER DATA
-- ============================================

INSERT INTO customers
(customer_id, name, email, phone, active)
VALUES
(1, 'Nithin', 'nithin@gmail.com', '9876543210', TRUE),
(2, 'Arun', 'arun@gmail.com', '9876543211', TRUE),
(3, 'Rahul', 'rahul@gmail.com', '9876543212', TRUE),
(4, 'Karthik', 'karthik@gmail.com', '9876543213', TRUE),
(5, 'Vijay', 'vijay@gmail.com', '9876543214', TRUE),
(6, 'Sanjay', 'sanjay@gmail.com', '9876543215', TRUE);

-- ============================================
-- USER DATA
-- ============================================

-- Initial administrator and accounts are managed via Spring Boot DataInitializer using BCrypt hashing.

-- ============================================
-- SHOW DATA
-- ============================================

INSERT INTO shows
(movie_id, theatre_id, show_date, show_time,
 ticket_price, total_seats, available_seats)
VALUES
(1, 1, '2026-10-10', '10:00:00', 200.00, 150, 150),
(1, 1, '2026-10-10', '18:00:00', 250.00, 150, 150),
(2, 2, '2026-10-10', '14:00:00', 180.00, 200, 200),
(2, 2, '2026-10-10', '19:00:00', 220.00, 200, 200),
(3, 3, '2026-10-11', '18:00:00', 200.00, 180, 180),
(3, 3, '2026-10-11', '21:30:00', 220.00, 180, 180),
(4, 4, '2026-10-12', '11:00:00', 180.00, 120, 120),
(4, 4, '2026-10-12', '19:00:00', 220.00, 120, 120),
(5, 1, '2026-10-13', '15:00:00', 170.00, 150, 150),
(5, 1, '2026-10-13', '20:00:00', 200.00, 150, 150);

-- ============================================
-- GENERATE SEATS FOR ALL SHOWS
-- ============================================

INSERT INTO seats (show_id, seat_number)
WITH RECURSIVE seat_numbers AS (
    SELECT 1 AS n

    UNION ALL

    SELECT n + 1
    FROM seat_numbers
    WHERE n < 200
)
SELECT
    s.show_id,
    CONCAT(
        CHAR(64 + CEIL(sn.n / 10)),
        MOD(sn.n - 1, 10) + 1
    ) AS seat_number
FROM shows s
JOIN seat_numbers sn
    ON sn.n <= s.total_seats;

-- ============================================
-- FUNCTION
-- ============================================

DELIMITER //

CREATE FUNCTION calculate_ticket_amount(
    p_ticket_price DECIMAL(10,2),
    p_seats_booked INT
)
RETURNS DECIMAL(10,2)
DETERMINISTIC
BEGIN
    RETURN p_ticket_price * p_seats_booked;
END //

DELIMITER ;

-- ============================================
-- INITIAL BOOKINGS
-- ============================================

INSERT INTO bookings
(booking_id, customer_id, show_id, seats_booked, total_amount, booking_date)
VALUES
(1, 1, 1, 2, 400.00, '2026-10-07 10:00:00'),
(2, 2, 2, 3, 750.00, '2026-10-07 10:05:00'),
(3, 4, 1, 2, 400.00, '2026-10-08 10:00:00'),
(4, 4, 1, 1, 200.00, '2026-10-08 10:05:00');

-- ============================================
-- MAP BOOKINGS TO SEATS
-- ============================================

INSERT INTO booking_seats
(booking_id, seat_id)
SELECT 1, seat_id
FROM seats
WHERE show_id = 1
AND seat_number IN ('A1', 'A2');

INSERT INTO booking_seats
(booking_id, seat_id)
SELECT 2, seat_id
FROM seats
WHERE show_id = 2
AND seat_number IN ('A1', 'A2', 'A3');

INSERT INTO booking_seats
(booking_id, seat_id)
SELECT 3, seat_id
FROM seats
WHERE show_id = 1
AND seat_number IN ('A3', 'A4');

INSERT INTO booking_seats
(booking_id, seat_id)
SELECT 4, seat_id
FROM seats
WHERE show_id = 1
AND seat_number = 'A5';

-- ============================================
-- MARK BOOKED SEATS
-- ============================================

UPDATE seats
SET status = 'BOOKED'
WHERE show_id = 1
AND seat_number IN ('A1', 'A2', 'A3', 'A4', 'A5');

UPDATE seats
SET status = 'BOOKED'
WHERE show_id = 2
AND seat_number IN ('A1', 'A2', 'A3');

-- ============================================
-- UPDATE AVAILABLE SEATS
-- ============================================

UPDATE shows
SET available_seats = total_seats - (
    SELECT COUNT(*)
    FROM seats
    WHERE seats.show_id = shows.show_id
    AND seats.status = 'BOOKED'
);

-- ============================================
-- INITIAL TICKETS
-- ============================================

INSERT INTO tickets
(booking_id, ticket_number, status)
VALUES
(1, 'TKT-20261007-000001', 'CONFIRMED'),
(2, 'TKT-20261007-000002', 'CONFIRMED'),
(3, 'TKT-20261008-000003', 'CONFIRMED'),
(4, 'TKT-20261008-000004', 'CONFIRMED');

-- ============================================
-- STORED PROCEDURE
-- ============================================

DELIMITER //

CREATE PROCEDURE book_ticket(
    IN p_customer_id INT,
    IN p_show_id INT,
    IN p_seats_booked INT,
    IN p_seat_numbers VARCHAR(1000)
)
BEGIN
    DECLARE v_available_seats INT;
    DECLARE v_ticket_price DECIMAL(10,2);
    DECLARE v_total_amount DECIMAL(10,2);
    DECLARE v_customer_count INT;
    DECLARE v_show_count INT;
    DECLARE v_selected_count INT;
    DECLARE v_booking_id INT;
    DECLARE v_ticket_number VARCHAR(50);

    START TRANSACTION;

    -- Check customer
    SELECT COUNT(*)
    INTO v_customer_count
    FROM customers
    WHERE customer_id = p_customer_id;

    IF v_customer_count = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Customer not found';
    END IF;

    -- Check show
    SELECT COUNT(*)
    INTO v_show_count
    FROM shows
    WHERE show_id = p_show_id;

    IF v_show_count = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Show not found';
    END IF;

    -- Check seat count
    IF p_seats_booked <= 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Number of seats must be greater than 0';
    END IF;

    -- Lock show row
    SELECT available_seats, ticket_price
    INTO v_available_seats, v_ticket_price
    FROM shows
    WHERE show_id = p_show_id
    FOR UPDATE;

    -- Check availability
    IF p_seats_booked > v_available_seats THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Not enough seats available';
    END IF;

    -- Count selected seats
    SET v_selected_count =
        1 + LENGTH(p_seat_numbers)
        - LENGTH(REPLACE(p_seat_numbers, ',', ''));

    IF v_selected_count <> p_seats_booked THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Selected seat count does not match seats booked';
    END IF;

    -- Validate selected seats
    IF (
        SELECT COUNT(*)
        FROM seats
        WHERE show_id = p_show_id
        AND FIND_IN_SET(seat_number, p_seat_numbers) > 0
    ) <> p_seats_booked THEN

        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'One or more selected seats are invalid';

    END IF;

    -- Check whether seats are available
    IF (
        SELECT COUNT(*)
        FROM seats
        WHERE show_id = p_show_id
        AND FIND_IN_SET(seat_number, p_seat_numbers) > 0
        AND status = 'AVAILABLE'
    ) <> p_seats_booked THEN

        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'One or more selected seats are already booked';

    END IF;

    -- Calculate amount
    SET v_total_amount =
        calculate_ticket_amount(
            v_ticket_price,
            p_seats_booked
        );

    -- Create booking
    INSERT INTO bookings (
        customer_id,
        show_id,
        seats_booked,
        total_amount
    )
    VALUES (
        p_customer_id,
        p_show_id,
        p_seats_booked,
        v_total_amount
    );

    SET v_booking_id = LAST_INSERT_ID();

    -- Map selected seats to booking
    INSERT INTO booking_seats (
        booking_id,
        seat_id
    )
    SELECT
        v_booking_id,
        seat_id
    FROM seats
    WHERE show_id = p_show_id
    AND FIND_IN_SET(seat_number, p_seat_numbers) > 0;

    -- Mark seats as booked
    UPDATE seats
    SET status = 'BOOKED'
    WHERE show_id = p_show_id
    AND FIND_IN_SET(seat_number, p_seat_numbers) > 0;

    -- Update available seats
    UPDATE shows
    SET available_seats = available_seats - p_seats_booked
    WHERE show_id = p_show_id;

    -- Generate ticket number
    SET v_ticket_number =
        CONCAT(
            'TKT-',
            DATE_FORMAT(NOW(), '%Y%m%d'),
            '-',
            LPAD(v_booking_id, 6, '0')
        );

    -- Create ticket
    INSERT INTO tickets (
        booking_id,
        ticket_number,
        status
    )
    VALUES (
        v_booking_id,
        v_ticket_number,
        'CONFIRMED'
    );

    COMMIT;

    -- Return booking details
    SELECT
        v_booking_id AS booking_id,
        v_ticket_number AS ticket_number,
        v_total_amount AS total_amount,
        p_seats_booked AS seats_booked;

END //

DELIMITER ;

-- ============================================
-- SUPPORT TICKETS
-- ============================================

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

-- ============================================
-- TICKET MESSAGES
-- ============================================

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
