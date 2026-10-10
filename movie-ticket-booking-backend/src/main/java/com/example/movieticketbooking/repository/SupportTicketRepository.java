package com.example.movieticketbooking.repository;

import com.example.movieticketbooking.entity.SupportCategory;
import com.example.movieticketbooking.entity.SupportTicket;
import com.example.movieticketbooking.entity.SupportTicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SupportTicketRepository extends JpaRepository<SupportTicket, Integer> {

    List<SupportTicket> findByCustomer_CustomerIdOrderByUpdatedAtDesc(Integer customerId);

    Optional<SupportTicket> findByTicketReference(String ticketReference);

    boolean existsByTicketReference(String ticketReference);

    @Query("SELECT t FROM SupportTicket t WHERE " +
           "(:status IS NULL OR t.status = :status) AND " +
           "(:category IS NULL OR t.category = :category) AND " +
           "(:search IS NULL OR TRIM(:search) = '' OR " +
           " LOWER(t.ticketReference) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(t.subject) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(t.customer.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(t.customer.email) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "ORDER BY t.updatedAt DESC")
    List<SupportTicket> searchTickets(
            @Param("status") SupportTicketStatus status,
            @Param("category") SupportCategory category,
            @Param("search") String search);
}
