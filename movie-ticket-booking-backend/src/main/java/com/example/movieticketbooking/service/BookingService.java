package com.example.movieticketbooking.service;

import com.example.movieticketbooking.dto.BookingRequest;
import com.example.movieticketbooking.dto.BookingResponse;
import com.example.movieticketbooking.dto.TicketResponse;
import com.example.movieticketbooking.entity.*;
import com.example.movieticketbooking.exception.BadRequestException;
import com.example.movieticketbooking.exception.ResourceNotFoundException;
import com.example.movieticketbooking.repository.BookingRepository;
import com.example.movieticketbooking.repository.BookingSeatRepository;
import com.example.movieticketbooking.repository.CustomerRepository;
import com.example.movieticketbooking.repository.TicketRepository;
import com.example.movieticketbooking.security.CustomUserDetails;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.sql.SQLException;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final BookingSeatRepository bookingSeatRepository;
    private final TicketRepository ticketRepository;
    private final CustomerRepository customerRepository;
    private final JdbcTemplate jdbcTemplate;

    public BookingService(BookingRepository bookingRepository,
                          BookingSeatRepository bookingSeatRepository,
                          TicketRepository ticketRepository,
                          CustomerRepository customerRepository,
                          JdbcTemplate jdbcTemplate) {
        this.bookingRepository = bookingRepository;
        this.bookingSeatRepository = bookingSeatRepository;
        this.ticketRepository = ticketRepository;
        this.customerRepository = customerRepository;
        this.jdbcTemplate = jdbcTemplate;
    }

    public TicketResponse bookTicket(BookingRequest request, CustomUserDetails currentUser) {
        if (request.getSeatNumbers() == null || request.getSeatNumbers().isEmpty()) {
            throw new BadRequestException("At least one seat must be selected.");
        }

        Integer customerId;
        if (currentUser.getRole() == Role.CUSTOMER) {
            customerId = currentUser.getCustomerId();
            if (customerId == null) {
                throw new BadRequestException("No customer profile associated with this account.");
            }
            Customer customer = customerRepository.findById(customerId)
                    .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + customerId));
            if (!Boolean.TRUE.equals(customer.getActive())) {
                throw new AccessDeniedException("Your customer account has been deactivated. Booking is disabled.");
            }
        } else {
            // ADMIN booking
            if (request.getCustomerId() != null) {
                customerId = request.getCustomerId();
            } else if (currentUser.getCustomerId() != null) {
                customerId = currentUser.getCustomerId();
            } else {
                // If admin did not specify customer, default to first customer or throw
                Customer firstCustomer = customerRepository.findAll().stream().findFirst()
                        .orElseThrow(() -> new BadRequestException("No customer exists in database to assign booking to."));
                customerId = firstCustomer.getCustomerId();
            }
        }

        int seatsBooked = request.getSeatNumbers().size();
        String seatNumbersJoined = String.join(",", request.getSeatNumbers());

        try {
            List<BookingResult> results = jdbcTemplate.query(
                    "CALL book_ticket(?, ?, ?, ?)",
                    (rs, rowNum) -> new BookingResult(
                            rs.getInt("booking_id"),
                            rs.getString("ticket_number"),
                            rs.getDouble("total_amount"),
                            rs.getInt("seats_booked")
                    ),
                    customerId,
                    request.getShowId(),
                    seatsBooked,
                    seatNumbersJoined
            );

            if (results.isEmpty()) {
                throw new BadRequestException("Booking procedure did not return booking confirmation.");
            }

            Integer bookingId = results.get(0).bookingId;
            return getTicketResponseByBookingId(bookingId);

        } catch (DataAccessException ex) {
            String message = extractRootCauseMessage(ex);
            throw new BadRequestException(message);
        }
    }

    public BookingResponse getBookingById(Integer bookingId, CustomUserDetails currentUser) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + bookingId));

        if (currentUser.getRole() != Role.ADMIN) {
            if (!booking.getCustomer().getCustomerId().equals(currentUser.getCustomerId())) {
                throw new AccessDeniedException("You do not have permission to access this booking.");
            }
        }

        return mapToBookingResponse(booking);
    }

    public List<BookingResponse> getCustomerBookings(Integer customerId) {
        List<Booking> bookings = bookingRepository.findByCustomerCustomerIdOrderByBookingDateDesc(customerId);
        return bookings.stream()
                .map(this::mapToBookingResponse)
                .collect(Collectors.toList());
    }

    public List<BookingResponse> getAllBookings() {
        List<Booking> bookings = bookingRepository.findAllByOrderByBookingDateDesc();
        return bookings.stream()
                .map(this::mapToBookingResponse)
                .collect(Collectors.toList());
    }

    public TicketResponse getTicketResponseByBookingId(Integer bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + bookingId));

        Ticket ticket = ticketRepository.findByBookingBookingId(bookingId)
                .orElse(null);

        List<BookingSeat> bookingSeats = bookingSeatRepository.findByBookingBookingId(bookingId);
        List<String> seatNumbers = bookingSeats.stream()
                .map(bs -> bs.getSeat().getSeatNumber())
                .collect(Collectors.toList());

        TicketResponse res = new TicketResponse();
        if (ticket != null) {
            res.setTicketId(ticket.getTicketId());
            res.setTicketNumber(ticket.getTicketNumber());
            res.setStatus(ticket.getStatus());
            res.setIssuedAt(ticket.getIssuedAt());
        } else {
            res.setStatus("CONFIRMED");
        }

        res.setBookingId(booking.getBookingId());
        res.setCustomer(booking.getCustomer().getName());
        res.setCustomerEmail(booking.getCustomer().getEmail());

        if (booking.getShow() != null) {
            Show show = booking.getShow();
            if (show.getMovie() != null) {
                res.setMovie(show.getMovie().getTitle());
                res.setMovieGenre(show.getMovie().getGenre());
            }
            if (show.getTheatre() != null) {
                res.setTheatre(show.getTheatre().getName());
                res.setTheatreLocation(show.getTheatre().getLocation());
            }
            res.setShowDate(show.getShowDate());
            res.setShowTime(show.getShowTime());
            res.setTicketPrice(show.getTicketPrice());
        }

        res.setSeats(seatNumbers);
        res.setNumberOfSeats(booking.getSeatsBooked());
        res.setTotalAmount(booking.getTotalAmount());
        res.setBookingDate(booking.getBookingDate());

        return res;
    }

    public BookingResponse mapToBookingResponse(Booking booking) {
        BookingResponse res = new BookingResponse();
        res.setBookingId(booking.getBookingId());
        res.setCustomerId(booking.getCustomer().getCustomerId());
        res.setCustomerName(booking.getCustomer().getName());
        res.setCustomerEmail(booking.getCustomer().getEmail());

        if (booking.getShow() != null) {
            Show show = booking.getShow();
            res.setShowId(show.getShowId());
            if (show.getMovie() != null) {
                res.setMovie(show.getMovie().getTitle());
            }
            if (show.getTheatre() != null) {
                res.setTheatre(show.getTheatre().getName());
                res.setTheatreLocation(show.getTheatre().getLocation());
            }
            res.setShowDate(show.getShowDate());
            res.setShowTime(show.getShowTime());
            res.setTicketPrice(show.getTicketPrice());
        }

        List<BookingSeat> bookingSeats = bookingSeatRepository.findByBookingBookingId(booking.getBookingId());
        List<String> seatNumbers = bookingSeats.stream()
                .map(bs -> bs.getSeat().getSeatNumber())
                .collect(Collectors.toList());
        res.setSeats(seatNumbers);

        res.setNumberOfSeats(booking.getSeatsBooked());
        res.setTotalAmount(booking.getTotalAmount());
        res.setBookingDate(booking.getBookingDate());

        Ticket ticket = ticketRepository.findByBookingBookingId(booking.getBookingId()).orElse(null);
        if (ticket != null) {
            res.setTicketNumber(ticket.getTicketNumber());
            res.setStatus(ticket.getStatus());
        } else {
            res.setStatus("CONFIRMED");
        }

        return res;
    }

    private String extractRootCauseMessage(Throwable ex) {
        Throwable cause = ex;
        while (cause.getCause() != null) {
            cause = cause.getCause();
        }
        String msg = cause.getMessage();
        if (msg != null) {
            // MySQL error messages from SIGNAL SQLSTATE '45000' often have "Unhandled user-defined exception: ..."
            // or directly the message text
            return msg.replaceAll("(?i)^.*?error\\s*\\d*\\s*\\(\\d*\\):\\s*", "").trim();
        }
        return "Booking transaction failed.";
    }

    private static class BookingResult {
        final Integer bookingId;
        final String ticketNumber;
        final Double totalAmount;
        final Integer seatsBooked;

        BookingResult(Integer bookingId, String ticketNumber, Double totalAmount, Integer seatsBooked) {
            this.bookingId = bookingId;
            this.ticketNumber = ticketNumber;
            this.totalAmount = totalAmount;
            this.seatsBooked = seatsBooked;
        }
    }
}