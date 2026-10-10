package com.example.movieticketbooking.service;

import com.example.movieticketbooking.dto.TicketResponse;
import com.example.movieticketbooking.entity.*;
import com.example.movieticketbooking.exception.ResourceNotFoundException;
import com.example.movieticketbooking.repository.BookingSeatRepository;
import com.example.movieticketbooking.repository.TicketRepository;
import com.example.movieticketbooking.security.CustomUserDetails;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TicketService {

    private final TicketRepository ticketRepository;
    private final BookingSeatRepository bookingSeatRepository;

    public TicketService(TicketRepository ticketRepository, BookingSeatRepository bookingSeatRepository) {
        this.ticketRepository = ticketRepository;
        this.bookingSeatRepository = bookingSeatRepository;
    }

    public TicketResponse getTicketById(Integer ticketId, CustomUserDetails currentUser) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with ID: " + ticketId));

        if (currentUser.getRole() != Role.ADMIN) {
            Integer ticketCustomerId = ticket.getBooking().getCustomer().getCustomerId();
            if (!ticketCustomerId.equals(currentUser.getCustomerId())) {
                throw new AccessDeniedException("You do not have permission to access this ticket.");
            }
        }

        return mapToTicketResponse(ticket);
    }

    public List<TicketResponse> getCustomerTickets(Integer customerId) {
        List<Ticket> tickets = ticketRepository.findByBookingCustomerCustomerIdOrderByIssuedAtDesc(customerId);
        return tickets.stream()
                .map(this::mapToTicketResponse)
                .collect(Collectors.toList());
    }

    public List<TicketResponse> getAllTickets() {
        List<Ticket> tickets = ticketRepository.findAllByOrderByIssuedAtDesc();
        return tickets.stream()
                .map(this::mapToTicketResponse)
                .collect(Collectors.toList());
    }

    public TicketResponse mapToTicketResponse(Ticket ticket) {
        TicketResponse res = new TicketResponse();
        res.setTicketId(ticket.getTicketId());
        res.setTicketNumber(ticket.getTicketNumber());
        res.setStatus(ticket.getStatus());
        res.setIssuedAt(ticket.getIssuedAt());

        Booking booking = ticket.getBooking();
        if (booking != null) {
            res.setBookingId(booking.getBookingId());
            res.setTotalAmount(booking.getTotalAmount());
            res.setNumberOfSeats(booking.getSeatsBooked());
            res.setBookingDate(booking.getBookingDate());

            if (booking.getCustomer() != null) {
                res.setCustomer(booking.getCustomer().getName());
                res.setCustomerEmail(booking.getCustomer().getEmail());
            }

            if (booking.getShow() != null) {
                Show show = booking.getShow();
                res.setShowDate(show.getShowDate());
                res.setShowTime(show.getShowTime());
                res.setTicketPrice(show.getTicketPrice());

                if (show.getMovie() != null) {
                    res.setMovie(show.getMovie().getTitle());
                    res.setMovieGenre(show.getMovie().getGenre());
                }

                if (show.getTheatre() != null) {
                    res.setTheatre(show.getTheatre().getName());
                    res.setTheatreLocation(show.getTheatre().getLocation());
                }
            }

            List<BookingSeat> bookingSeats = bookingSeatRepository.findByBookingBookingId(booking.getBookingId());
            List<String> seatNumbers = bookingSeats.stream()
                    .map(bs -> bs.getSeat().getSeatNumber())
                    .collect(Collectors.toList());
            res.setSeats(seatNumbers);
        }

        return res;
    }
}
