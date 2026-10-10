package com.example.movieticketbooking.service;

import com.example.movieticketbooking.dto.*;
import com.example.movieticketbooking.entity.*;
import com.example.movieticketbooking.exception.BadRequestException;
import com.example.movieticketbooking.exception.ResourceNotFoundException;
import com.example.movieticketbooking.repository.CustomerRepository;
import com.example.movieticketbooking.repository.SupportTicketRepository;
import com.example.movieticketbooking.repository.TicketMessageRepository;
import com.example.movieticketbooking.repository.UserRepository;
import com.example.movieticketbooking.security.CustomUserDetails;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SupportTicketService {

    private final SupportTicketRepository supportTicketRepository;
    private final TicketMessageRepository ticketMessageRepository;
    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;
    private final SecureRandom random = new SecureRandom();

    public SupportTicketService(SupportTicketRepository supportTicketRepository,
                                TicketMessageRepository ticketMessageRepository,
                                CustomerRepository customerRepository,
                                UserRepository userRepository) {
        this.supportTicketRepository = supportTicketRepository;
        this.ticketMessageRepository = ticketMessageRepository;
        this.customerRepository = customerRepository;
        this.userRepository = userRepository;
    }

    // ==========================================
    // CUSTOMER OPERATIONS
    // ==========================================

    @Transactional
    public SupportTicketResponse createTicket(CreateTicketRequest request, CustomUserDetails userDetails) {
        if (userDetails == null || userDetails.getCustomerId() == null) {
            throw new BadRequestException("No customer profile found for the authenticated user.");
        }

        Customer customer = customerRepository.findById(userDetails.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer record not found."));

        if (Boolean.FALSE.equals(customer.getActive())) {
            throw new AccessDeniedException("Deactivated customer accounts cannot submit support tickets.");
        }

        String ticketReference = generateUniqueTicketReference();

        String bookingRef = (request.getBookingReference() != null && !request.getBookingReference().trim().isEmpty())
                ? request.getBookingReference().trim()
                : null;

        SupportTicket ticket = new SupportTicket(
                ticketReference,
                customer,
                request.getCategory(),
                request.getSubject().trim(),
                bookingRef
        );

        User senderUser = userDetails.getUserId() != null
                ? userRepository.findById(userDetails.getUserId()).orElse(null)
                : null;

        TicketMessage initialMessage = new TicketMessage(
                ticket,
                SenderType.CUSTOMER,
                senderUser,
                customer.getName(),
                request.getMessage().trim()
        );

        ticket.addMessage(initialMessage);

        SupportTicket saved = supportTicketRepository.save(ticket);
        return toTicketResponse(saved, true);
    }

    @Transactional(readOnly = true)
    public List<SupportTicketResponse> getCustomerTickets(CustomUserDetails userDetails) {
        if (userDetails == null || userDetails.getCustomerId() == null) {
            throw new BadRequestException("No customer profile found for the authenticated user.");
        }

        return supportTicketRepository.findByCustomer_CustomerIdOrderByUpdatedAtDesc(userDetails.getCustomerId())
                .stream()
                .map(t -> toTicketResponse(t, false))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SupportTicketResponse getCustomerTicketDetail(Integer ticketId, CustomUserDetails userDetails) {
        if (userDetails == null || userDetails.getCustomerId() == null) {
            throw new BadRequestException("No customer profile found for the authenticated user.");
        }

        SupportTicket ticket = supportTicketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Support ticket not found with id: " + ticketId));

        if (!ticket.getCustomer().getCustomerId().equals(userDetails.getCustomerId())) {
            throw new AccessDeniedException("Access denied: You do not have permission to view this ticket.");
        }

        return toTicketResponse(ticket, true);
    }

    @Transactional
    public SupportTicketResponse customerReply(Integer ticketId, ReplyTicketRequest request, CustomUserDetails userDetails) {
        if (userDetails == null || userDetails.getCustomerId() == null) {
            throw new BadRequestException("No customer profile found for the authenticated user.");
        }

        SupportTicket ticket = supportTicketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Support ticket not found with id: " + ticketId));

        if (!ticket.getCustomer().getCustomerId().equals(userDetails.getCustomerId())) {
            throw new AccessDeniedException("Access denied: You do not have permission to reply to this ticket.");
        }

        if (ticket.getStatus() == SupportTicketStatus.CLOSED) {
            throw new BadRequestException("This ticket is CLOSED and cannot accept replies. Please create a new support ticket if you require further assistance.");
        }

        // Automatic status transition rules when customer replies
        if (ticket.getStatus() == SupportTicketStatus.WAITING_FOR_CUSTOMER ||
            ticket.getStatus() == SupportTicketStatus.RESOLVED) {
            ticket.setStatus(SupportTicketStatus.OPEN);
        }

        User senderUser = userDetails.getUserId() != null
                ? userRepository.findById(userDetails.getUserId()).orElse(null)
                : null;

        TicketMessage replyMessage = new TicketMessage(
                ticket,
                SenderType.CUSTOMER,
                senderUser,
                ticket.getCustomer().getName(),
                request.getMessage().trim()
        );

        ticket.addMessage(replyMessage);
        ticket.setUpdatedAt(LocalDateTime.now());

        SupportTicket updated = supportTicketRepository.save(ticket);
        return toTicketResponse(updated, true);
    }

    @Transactional
    public SupportTicketResponse customerCloseTicket(Integer ticketId, CustomUserDetails userDetails) {
        if (userDetails == null || userDetails.getCustomerId() == null) {
            throw new BadRequestException("No customer profile found for the authenticated user.");
        }

        SupportTicket ticket = supportTicketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Support ticket not found with id: " + ticketId));

        if (!ticket.getCustomer().getCustomerId().equals(userDetails.getCustomerId())) {
            throw new AccessDeniedException("Access denied: You do not have permission to modify this ticket.");
        }

        if (ticket.getStatus() == SupportTicketStatus.CLOSED) {
            throw new BadRequestException("Ticket is already closed.");
        }

        ticket.setStatus(SupportTicketStatus.CLOSED);
        ticket.setUpdatedAt(LocalDateTime.now());

        SupportTicket updated = supportTicketRepository.save(ticket);
        return toTicketResponse(updated, true);
    }

    // ==========================================
    // ADMINISTRATOR OPERATIONS
    // ==========================================

    @Transactional(readOnly = true)
    public List<SupportTicketResponse> getAdminTickets(SupportTicketStatus status, SupportCategory category, String search) {
        String querySearch = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
        return supportTicketRepository.searchTickets(status, category, querySearch)
                .stream()
                .map(t -> toTicketResponse(t, false))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SupportTicketResponse getAdminTicketDetail(Integer ticketId) {
        SupportTicket ticket = supportTicketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Support ticket not found with id: " + ticketId));
        return toTicketResponse(ticket, true);
    }

    @Transactional
    public SupportTicketResponse adminReply(Integer ticketId, ReplyTicketRequest request, CustomUserDetails userDetails) {
        SupportTicket ticket = supportTicketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Support ticket not found with id: " + ticketId));

        if (ticket.getStatus() == SupportTicketStatus.CLOSED) {
            throw new BadRequestException("Cannot reply to a CLOSED ticket.");
        }

        User senderUser = userDetails != null && userDetails.getUserId() != null
                ? userRepository.findById(userDetails.getUserId()).orElse(null)
                : null;

        String senderName = (userDetails != null && userDetails.getUsername() != null)
                ? "CinePass Support (" + userDetails.getUsername() + ")"
                : "CinePass Support Desk";

        TicketMessage replyMessage = new TicketMessage(
                ticket,
                SenderType.ADMIN,
                senderUser,
                senderName,
                request.getMessage().trim()
        );

        ticket.addMessage(replyMessage);
        ticket.setUpdatedAt(LocalDateTime.now());

        SupportTicket updated = supportTicketRepository.save(ticket);
        return toTicketResponse(updated, true);
    }

    @Transactional
    public SupportTicketResponse adminUpdateStatus(Integer ticketId, UpdateTicketStatusRequest request) {
        SupportTicket ticket = supportTicketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Support ticket not found with id: " + ticketId));

        SupportTicketStatus currentStatus = ticket.getStatus();
        SupportTicketStatus targetStatus = request.getStatus();

        if (currentStatus == SupportTicketStatus.CLOSED && targetStatus != SupportTicketStatus.CLOSED) {
            throw new BadRequestException("CLOSED is a terminal ticket state. Closed tickets cannot be reopened or modified.");
        }

        if (currentStatus == targetStatus) {
            return toTicketResponse(ticket, true);
        }

        ticket.setStatus(targetStatus);
        ticket.setUpdatedAt(LocalDateTime.now());

        SupportTicket updated = supportTicketRepository.save(ticket);
        return toTicketResponse(updated, true);
    }

    // ==========================================
    // HELPER METHODS
    // ==========================================

    private String generateUniqueTicketReference() {
        String datePart = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String reference;
        int attempts = 0;
        do {
            int randomNum = 1000 + random.nextInt(9000); // 4-digit random number
            reference = "SUP-" + datePart + "-" + randomNum;
            attempts++;
            if (attempts > 50) {
                reference = "SUP-" + datePart + "-" + System.currentTimeMillis() % 100000;
                break;
            }
        } while (supportTicketRepository.existsByTicketReference(reference));

        return reference;
    }

    private SupportTicketResponse toTicketResponse(SupportTicket ticket, boolean includeMessages) {
        SupportTicketResponse resp = new SupportTicketResponse();
        resp.setTicketId(ticket.getTicketId());
        resp.setTicketReference(ticket.getTicketReference());
        resp.setCustomerId(ticket.getCustomer().getCustomerId());
        resp.setCustomerName(ticket.getCustomer().getName());
        resp.setCustomerEmail(ticket.getCustomer().getEmail());
        resp.setCategory(ticket.getCategory());
        resp.setSubject(ticket.getSubject());
        resp.setBookingReference(ticket.getBookingReference());
        resp.setStatus(ticket.getStatus());
        resp.setCreatedAt(ticket.getCreatedAt());
        resp.setUpdatedAt(ticket.getUpdatedAt());

        if (includeMessages) {
            List<TicketMessage> messages = ticketMessageRepository.findByTicket_TicketIdOrderByCreatedAtAsc(ticket.getTicketId());
            List<TicketMessageResponse> msgResponses = messages.stream()
                    .map(m -> new TicketMessageResponse(
                            m.getMessageId(),
                            m.getSenderType(),
                            m.getSenderName(),
                            m.getMessage(),
                            m.getCreatedAt()
                    ))
                    .collect(Collectors.toList());
            resp.setMessages(msgResponses);
        } else {
            List<TicketMessage> messages = ticket.getMessages();
            resp.setMessageCount(messages != null ? messages.size() : 0);
        }

        return resp;
    }
}
