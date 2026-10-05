package com.example.movieticketbooking.repository;

import com.example.movieticketbooking.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;

public interface BookingRepository extends JpaRepository<Booking, Integer> {

    @Procedure(procedureName = "book_ticket")
    void bookTicket(
            @Param("p_customer_id") Integer customerId,
            @Param("p_show_id") Integer showId,
            @Param("p_seats_booked") Integer seatsBooked
    );

    Booking findTopByOrderByBookingIdDesc();
}