package com.example.movieticketbooking.repository;

import com.example.movieticketbooking.entity.TicketMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketMessageRepository extends JpaRepository<TicketMessage, Integer> {

    List<TicketMessage> findByTicket_TicketIdOrderByCreatedAtAsc(Integer ticketId);
}
