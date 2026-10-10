package com.example.movieticketbooking.repository;

import com.example.movieticketbooking.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Integer> {

    List<Booking> findByCustomerCustomerIdOrderByBookingDateDesc(Integer customerId);

    List<Booking> findAllByOrderByBookingDateDesc();

    Booking findTopByOrderByBookingIdDesc();

    @Query("SELECT COALESCE(SUM(b.totalAmount), 0.0) FROM Booking b")
    Double calculateTotalRevenue();
}