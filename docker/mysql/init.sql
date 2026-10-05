USE movie_ticket_booking;

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
    phone VARCHAR(15)
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
(name, email, phone)
VALUES
('Nithin', 'nithin@gmail.com', '9876543210'),
('Arun', 'arun@gmail.com', '9876543211'),
('Rahul', 'rahul@gmail.com', '9876543212'),
('Karthik', 'karthik@gmail.com', '9876543213'),
('Vijay', 'vijay@gmail.com', '9876543214'),
('Sanjay', 'sanjay@gmail.com', '9876543215');

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
-- TRIGGER
-- ============================================

DELIMITER //

CREATE TRIGGER update_available_seats
AFTER INSERT ON bookings
FOR EACH ROW
BEGIN
    UPDATE shows
    SET available_seats = available_seats - NEW.seats_booked
    WHERE show_id = NEW.show_id;
END //

DELIMITER ;

-- ============================================
-- STORED PROCEDURE
-- ============================================

DELIMITER //

CREATE PROCEDURE book_ticket(
    IN p_customer_id INT,
    IN p_show_id INT,
    IN p_seats_booked INT
)
BEGIN
    DECLARE v_available_seats INT;
    DECLARE v_ticket_price DECIMAL(10,2);
    DECLARE v_total_amount DECIMAL(10,2);

    IF p_seats_booked <= 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Number of seats must be greater than 0';
    END IF;

    SELECT available_seats, ticket_price
    INTO v_available_seats, v_ticket_price
    FROM shows
    WHERE show_id = p_show_id;

    IF v_available_seats IS NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Show not found';
    END IF;

    IF p_seats_booked > v_available_seats THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Not enough seats available';
    END IF;

    SET v_total_amount =
        calculate_ticket_amount(
            v_ticket_price,
            p_seats_booked
        );

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
END //

DELIMITER ;

-- ============================================
-- INITIAL BOOKING DATA
-- ============================================

INSERT INTO bookings
(customer_id, show_id, seats_booked, total_amount)
VALUES
(1, 1, 2, 400.00),
(2, 2, 3, 750.00);

-- Adjust available seats to match the existing bookings
UPDATE shows
SET available_seats = available_seats - 2
WHERE show_id = 1;

UPDATE shows
SET available_seats = available_seats - 3
WHERE show_id = 2;