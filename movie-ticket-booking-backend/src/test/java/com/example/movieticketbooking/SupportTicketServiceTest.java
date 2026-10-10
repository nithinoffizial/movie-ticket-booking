package com.example.movieticketbooking;

import com.example.movieticketbooking.dto.CreateTicketRequest;
import com.example.movieticketbooking.dto.ReplyTicketRequest;
import com.example.movieticketbooking.dto.SupportTicketResponse;
import com.example.movieticketbooking.dto.UpdateTicketStatusRequest;
import com.example.movieticketbooking.entity.*;
import com.example.movieticketbooking.exception.BadRequestException;
import com.example.movieticketbooking.exception.ResourceNotFoundException;
import com.example.movieticketbooking.repository.CustomerRepository;
import com.example.movieticketbooking.repository.SupportTicketRepository;
import com.example.movieticketbooking.repository.TicketMessageRepository;
import com.example.movieticketbooking.repository.UserRepository;
import com.example.movieticketbooking.security.CustomUserDetails;
import com.example.movieticketbooking.service.SupportTicketService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class SupportTicketServiceTest {

    @Mock
    private SupportTicketRepository supportTicketRepository;

    @Mock
    private TicketMessageRepository ticketMessageRepository;

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private SupportTicketService supportTicketService;

    private Customer customer1;
    private Customer customer2;
    private Customer inactiveCustomer;
    private User user1;
    private User user2;
    private User adminUser;
    private CustomUserDetails customerDetails1;
    private CustomUserDetails customerDetails2;
    private CustomUserDetails adminDetails;

    @BeforeEach
    void setUp() {
        customer1 = new Customer("John Doe", "john@example.com", "9876543210");
        customer1.setCustomerId(101);
        customer1.setActive(true);

        customer2 = new Customer("Jane Smith", "jane@example.com", "9876543211");
        customer2.setCustomerId(102);
        customer2.setActive(true);

        inactiveCustomer = new Customer("Blocked User", "blocked@example.com", "9876543212");
        inactiveCustomer.setCustomerId(103);
        inactiveCustomer.setActive(false);

        user1 = new User("johndoe", "pass1", Role.CUSTOMER, customer1);
        user1.setUserId(11);

        user2 = new User("janesmith", "pass2", Role.CUSTOMER, customer2);
        user2.setUserId(12);

        adminUser = new User("admin", "adminpass", Role.ADMIN, null);
        adminUser.setUserId(1);

        customerDetails1 = new CustomUserDetails(user1);
        customerDetails2 = new CustomUserDetails(user2);
        adminDetails = new CustomUserDetails(adminUser);
    }

    @Test
    @DisplayName("Create Ticket: successfully creates ticket with OPEN status, initial message, and derived identity")
    void testCreateTicket_Success() {
        CreateTicketRequest req = new CreateTicketRequest(
                SupportCategory.BOOKING_ISSUE,
                "Seat not confirmed",
                "My payment went through but seat was not confirmed.",
                "TKT-20261009-001"
        );

        when(customerRepository.findById(101)).thenReturn(Optional.of(customer1));
        when(userRepository.findById(11)).thenReturn(Optional.of(user1));
        when(supportTicketRepository.existsByTicketReference(any())).thenReturn(false);
        when(supportTicketRepository.save(any(SupportTicket.class))).thenAnswer(inv -> {
            SupportTicket t = inv.getArgument(0);
            t.setTicketId(501);
            t.setCreatedAt(LocalDateTime.now());
            t.setUpdatedAt(LocalDateTime.now());
            return t;
        });

        SupportTicketResponse response = supportTicketService.createTicket(req, customerDetails1);

        assertNotNull(response);
        assertEquals(501, response.getTicketId());
        assertTrue(response.getTicketReference().startsWith("SUP-"));
        assertEquals(101, response.getCustomerId());
        assertEquals("John Doe", response.getCustomerName());
        assertEquals(SupportTicketStatus.OPEN, response.getStatus());
        assertEquals(SupportCategory.BOOKING_ISSUE, response.getCategory());
        assertEquals("TKT-20261009-001", response.getBookingReference());
        verify(supportTicketRepository).save(any(SupportTicket.class));
    }

    @Test
    @DisplayName("Create Ticket: rejects deactivated customer account")
    void testCreateTicket_DeactivatedCustomer_ThrowsAccessDenied() {
        User inactiveUser = new User("blocked", "pass", Role.CUSTOMER, inactiveCustomer);
        CustomUserDetails inactiveDetails = new CustomUserDetails(inactiveUser);

        when(customerRepository.findById(103)).thenReturn(Optional.of(inactiveCustomer));

        CreateTicketRequest req = new CreateTicketRequest(
                SupportCategory.OTHER, "Test subject", "Test message details", null
        );

        assertThrows(AccessDeniedException.class, () ->
                supportTicketService.createTicket(req, inactiveDetails)
        );
        verify(supportTicketRepository, never()).save(any());
    }

    @Test
    @DisplayName("Get Customer Tickets: lists only tickets belonging to authenticated customer")
    void testGetCustomerTickets_Success() {
        SupportTicket t1 = new SupportTicket("SUP-20261009-1111", customer1, SupportCategory.BOOKING_ISSUE, "Subject 1", null);
        t1.setTicketId(1);
        t1.setCreatedAt(LocalDateTime.now());
        t1.setUpdatedAt(LocalDateTime.now());

        when(supportTicketRepository.findByCustomer_CustomerIdOrderByUpdatedAtDesc(101))
                .thenReturn(List.of(t1));

        List<SupportTicketResponse> list = supportTicketService.getCustomerTickets(customerDetails1);

        assertEquals(1, list.size());
        assertEquals("SUP-20261009-1111", list.get(0).getTicketReference());
        assertEquals(101, list.get(0).getCustomerId());
    }

    @Test
    @DisplayName("Cross-customer ticket view is rejected with AccessDeniedException")
    void testGetCustomerTicketDetail_CrossCustomer_ThrowsAccessDenied() {
        SupportTicket t1 = new SupportTicket("SUP-20261009-1111", customer1, SupportCategory.BOOKING_ISSUE, "Subject 1", null);
        t1.setTicketId(1);

        when(supportTicketRepository.findById(1)).thenReturn(Optional.of(t1));

        assertThrows(AccessDeniedException.class, () ->
                supportTicketService.getCustomerTicketDetail(1, customerDetails2)
        );
    }

    @Test
    @DisplayName("Customer reply to WAITING_FOR_CUSTOMER reopens status to OPEN")
    void testCustomerReply_WaitingForCustomer_TransitionsToOpen() {
        SupportTicket ticket = new SupportTicket("SUP-20261009-1111", customer1, SupportCategory.BOOKING_ISSUE, "Subject 1", null);
        ticket.setTicketId(1);
        ticket.setStatus(SupportTicketStatus.WAITING_FOR_CUSTOMER);

        when(supportTicketRepository.findById(1)).thenReturn(Optional.of(ticket));
        when(userRepository.findById(11)).thenReturn(Optional.of(user1));
        when(supportTicketRepository.save(any(SupportTicket.class))).thenAnswer(inv -> inv.getArgument(0));

        ReplyTicketRequest reply = new ReplyTicketRequest("Here is the requested screenshot and ID.");
        SupportTicketResponse response = supportTicketService.customerReply(1, reply, customerDetails1);

        assertEquals(SupportTicketStatus.OPEN, response.getStatus());
        assertEquals(SupportTicketStatus.OPEN, ticket.getStatus());
        verify(supportTicketRepository).save(ticket);
    }

    @Test
    @DisplayName("Customer reply to RESOLVED reopens status to OPEN")
    void testCustomerReply_Resolved_TransitionsToOpen() {
        SupportTicket ticket = new SupportTicket("SUP-20261009-1111", customer1, SupportCategory.PAYMENT_ISSUE, "Double charged", null);
        ticket.setTicketId(2);
        ticket.setStatus(SupportTicketStatus.RESOLVED);

        when(supportTicketRepository.findById(2)).thenReturn(Optional.of(ticket));
        when(userRepository.findById(11)).thenReturn(Optional.of(user1));
        when(supportTicketRepository.save(any(SupportTicket.class))).thenAnswer(inv -> inv.getArgument(0));

        ReplyTicketRequest reply = new ReplyTicketRequest("The refund still hasn't arrived in my bank account.");
        SupportTicketResponse response = supportTicketService.customerReply(2, reply, customerDetails1);

        assertEquals(SupportTicketStatus.OPEN, response.getStatus());
        assertEquals(SupportTicketStatus.OPEN, ticket.getStatus());
        verify(supportTicketRepository).save(ticket);
    }

    @Test
    @DisplayName("Customer reply to CLOSED is rejected with BadRequestException")
    void testCustomerReply_ClosedTicket_ThrowsBadRequest() {
        SupportTicket ticket = new SupportTicket("SUP-20261009-1111", customer1, SupportCategory.OTHER, "Closed issue", null);
        ticket.setTicketId(3);
        ticket.setStatus(SupportTicketStatus.CLOSED);

        when(supportTicketRepository.findById(3)).thenReturn(Optional.of(ticket));

        ReplyTicketRequest reply = new ReplyTicketRequest("Can I ask another question here?");
        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                supportTicketService.customerReply(3, reply, customerDetails1)
        );

        assertTrue(ex.getMessage().contains("CLOSED"));
        verify(supportTicketRepository, never()).save(any());
    }

    @Test
    @DisplayName("Cross-customer reply attempt is rejected with AccessDeniedException")
    void testCustomerReply_CrossCustomer_ThrowsAccessDenied() {
        SupportTicket ticket = new SupportTicket("SUP-20261009-1111", customer1, SupportCategory.BOOKING_ISSUE, "Private issue", null);
        ticket.setTicketId(1);
        ticket.setStatus(SupportTicketStatus.OPEN);

        when(supportTicketRepository.findById(1)).thenReturn(Optional.of(ticket));

        ReplyTicketRequest reply = new ReplyTicketRequest("Unauthorized reply attempt");
        assertThrows(AccessDeniedException.class, () ->
                supportTicketService.customerReply(1, reply, customerDetails2)
        );
    }

    @Test
    @DisplayName("Customer close ticket: moves ticket to CLOSED status")
    void testCustomerCloseTicket_Success() {
        SupportTicket ticket = new SupportTicket("SUP-20261009-1111", customer1, SupportCategory.BOOKING_ISSUE, "Issue resolved", null);
        ticket.setTicketId(1);
        ticket.setStatus(SupportTicketStatus.OPEN);

        when(supportTicketRepository.findById(1)).thenReturn(Optional.of(ticket));
        when(supportTicketRepository.save(any(SupportTicket.class))).thenAnswer(inv -> inv.getArgument(0));

        SupportTicketResponse response = supportTicketService.customerCloseTicket(1, customerDetails1);

        assertEquals(SupportTicketStatus.CLOSED, response.getStatus());
        assertEquals(SupportTicketStatus.CLOSED, ticket.getStatus());
    }

    @Test
    @DisplayName("Customer close on already CLOSED ticket is rejected")
    void testCustomerCloseTicket_AlreadyClosed_ThrowsBadRequest() {
        SupportTicket ticket = new SupportTicket("SUP-20261009-1111", customer1, SupportCategory.BOOKING_ISSUE, "Closed ticket", null);
        ticket.setTicketId(1);
        ticket.setStatus(SupportTicketStatus.CLOSED);

        when(supportTicketRepository.findById(1)).thenReturn(Optional.of(ticket));

        assertThrows(BadRequestException.class, () ->
                supportTicketService.customerCloseTicket(1, customerDetails1)
        );
    }

    @Test
    @DisplayName("Admin reply: adds admin message to conversation and preserves ticket")
    void testAdminReply_Success() {
        SupportTicket ticket = new SupportTicket("SUP-20261009-1111", customer1, SupportCategory.TICKET_ISSUE, "Need PDF ticket", null);
        ticket.setTicketId(1);
        ticket.setStatus(SupportTicketStatus.OPEN);

        when(supportTicketRepository.findById(1)).thenReturn(Optional.of(ticket));
        when(userRepository.findById(1)).thenReturn(Optional.of(adminUser));
        when(supportTicketRepository.save(any(SupportTicket.class))).thenAnswer(inv -> inv.getArgument(0));

        ReplyTicketRequest reply = new ReplyTicketRequest("We have resent the digital ticket to your registered email.");
        SupportTicketResponse response = supportTicketService.adminReply(1, reply, adminDetails);

        assertNotNull(response);
        verify(supportTicketRepository).save(argThat(t ->
                t.getMessages().stream().anyMatch(m ->
                        m.getSenderType() == SenderType.ADMIN &&
                        m.getMessage().contains("resent the digital ticket")
                )
        ));
    }

    @Test
    @DisplayName("Admin status transition: valid transitions succeed")
    void testAdminStatusTransitions_Success() {
        SupportTicket ticket = new SupportTicket("SUP-20261009-1111", customer1, SupportCategory.BOOKING_ISSUE, "Subject", null);
        ticket.setTicketId(1);
        ticket.setStatus(SupportTicketStatus.OPEN);

        when(supportTicketRepository.findById(1)).thenReturn(Optional.of(ticket));
        when(supportTicketRepository.save(any(SupportTicket.class))).thenAnswer(inv -> inv.getArgument(0));

        // OPEN -> IN_PROGRESS
        SupportTicketResponse resp1 = supportTicketService.adminUpdateStatus(1, new UpdateTicketStatusRequest(SupportTicketStatus.IN_PROGRESS));
        assertEquals(SupportTicketStatus.IN_PROGRESS, resp1.getStatus());

        // IN_PROGRESS -> WAITING_FOR_CUSTOMER
        SupportTicketResponse resp2 = supportTicketService.adminUpdateStatus(1, new UpdateTicketStatusRequest(SupportTicketStatus.WAITING_FOR_CUSTOMER));
        assertEquals(SupportTicketStatus.WAITING_FOR_CUSTOMER, resp2.getStatus());

        // WAITING_FOR_CUSTOMER -> RESOLVED
        SupportTicketResponse resp3 = supportTicketService.adminUpdateStatus(1, new UpdateTicketStatusRequest(SupportTicketStatus.RESOLVED));
        assertEquals(SupportTicketStatus.RESOLVED, resp3.getStatus());

        // Reopening: RESOLVED -> OPEN
        SupportTicketResponse resp4 = supportTicketService.adminUpdateStatus(1, new UpdateTicketStatusRequest(SupportTicketStatus.OPEN));
        assertEquals(SupportTicketStatus.OPEN, resp4.getStatus());
    }

    @Test
    @DisplayName("Admin status transition: cannot reopen or modify CLOSED ticket (terminal)")
    void testAdminStatusTransitions_ClosedIsTerminal() {
        SupportTicket ticket = new SupportTicket("SUP-20261009-1111", customer1, SupportCategory.BOOKING_ISSUE, "Subject", null);
        ticket.setTicketId(1);
        ticket.setStatus(SupportTicketStatus.CLOSED);

        when(supportTicketRepository.findById(1)).thenReturn(Optional.of(ticket));

        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                supportTicketService.adminUpdateStatus(1, new UpdateTicketStatusRequest(SupportTicketStatus.OPEN))
        );

        assertTrue(ex.getMessage().contains("terminal"));
        verify(supportTicketRepository, never()).save(any());
    }
}
