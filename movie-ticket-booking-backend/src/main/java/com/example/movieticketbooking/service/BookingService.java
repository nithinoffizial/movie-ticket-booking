package com.example.movieticketbooking.service;

import com.example.movieticketbooking.entity.Booking;
import com.example.movieticketbooking.repository.BookingRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;

    public BookingService(BookingRepository bookingRepository) {
        this.bookingRepository = bookingRepository;
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    public Optional<Booking> getBookingById(Integer bookingId) {
        return bookingRepository.findById(bookingId);
    }

    public Booking createBooking(Booking booking) {

        Integer customerId = booking.getCustomer().getCustomerId();
        Integer showId = booking.getShow().getShowId();
        Integer seatsBooked = booking.getSeatsBooked();

        bookingRepository.bookTicket(
                customerId,
                showId,
                seatsBooked
        );

        return bookingRepository.findTopByOrderByBookingIdDesc();
    }

    public Booking updateBooking(
            Integer bookingId,
            Booking bookingDetails) {

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        booking.setCustomer(bookingDetails.getCustomer());
        booking.setShow(bookingDetails.getShow());
        booking.setSeatsBooked(bookingDetails.getSeatsBooked());
        booking.setTotalAmount(bookingDetails.getTotalAmount());
        booking.setBookingDate(bookingDetails.getBookingDate());

        return bookingRepository.save(booking);
    }

    public void deleteBooking(Integer bookingId) {
        bookingRepository.deleteById(bookingId);
    }
}