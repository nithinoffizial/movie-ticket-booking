package com.example.movieticketbooking.repository;

import com.example.movieticketbooking.entity.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Integer> {
    Optional<Ticket> findByTicketNumber(String ticketNumber);
    Optional<Ticket> findByBookingBookingId(Integer bookingId);
    List<Ticket> findByBookingCustomerCustomerIdOrderByIssuedAtDesc(Integer customerId);
    List<Ticket> findAllByOrderByIssuedAtDesc();
}
