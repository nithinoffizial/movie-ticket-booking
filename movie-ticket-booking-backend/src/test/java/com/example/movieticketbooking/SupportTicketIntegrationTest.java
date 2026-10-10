package com.example.movieticketbooking;

import com.example.movieticketbooking.entity.Customer;
import com.example.movieticketbooking.entity.Role;
import com.example.movieticketbooking.entity.SupportCategory;
import com.example.movieticketbooking.entity.SupportTicket;
import com.example.movieticketbooking.entity.SupportTicketStatus;
import com.example.movieticketbooking.entity.User;
import com.example.movieticketbooking.repository.CustomerRepository;
import com.example.movieticketbooking.repository.SupportTicketRepository;
import com.example.movieticketbooking.repository.TicketMessageRepository;
import com.example.movieticketbooking.repository.UserRepository;
import com.example.movieticketbooking.security.JwtUtil;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.FilterChainProxy;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.HashSet;
import java.util.Set;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
public class SupportTicketIntegrationTest {

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private FilterChainProxy springSecurityFilterChain;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private SupportTicketRepository supportTicketRepository;

    @Autowired
    private TicketMessageRepository ticketMessageRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private javax.sql.DataSource dataSource;

    private MockMvc mockMvc;
    private String mayalinToken;
    private String jonathanToken;
    private String adminToken;
    private final Set<Integer> testTicketIds = new HashSet<>();

    @BeforeEach
    void setUp() {
        // Fail-fast safety guard: refuse to run if effective database catalog is not movie_ticket_booking_test
        verifyTestDatabaseSafetyGuard();

        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext)
                .addFilters(springSecurityFilterChain)
                .build();

        // Ensure uniquely identifiable test fixtures exist in the isolated test database
        Customer mayaCustomer = customerRepository.findByEmail("mayalin.test@cinepass.com")
                .orElseGet(() -> {
                    Customer c = new Customer();
                    c.setName("Maya Lin");
                    c.setEmail("mayalin.test@cinepass.com");
                    c.setPhone("9876500001");
                    c.setActive(true);
                    return customerRepository.save(c);
                });

        User mayaUser = userRepository.findByUsername("mayalin_test")
                .orElseGet(() -> {
                    User u = new User();
                    u.setUsername("mayalin_test");
                    u.setPassword(passwordEncoder.encode("password123"));
                    u.setRole(Role.CUSTOMER);
                    u.setCustomer(mayaCustomer);
                    return userRepository.save(u);
                });

        Customer jonathanCustomer = customerRepository.findByEmail("jonathan.test@cinepass.com")
                .orElseGet(() -> {
                    Customer c = new Customer();
                    c.setName("Jonathan");
                    c.setEmail("jonathan.test@cinepass.com");
                    c.setPhone("9876500002");
                    c.setActive(true);
                    return customerRepository.save(c);
                });

        User jonathanUser = userRepository.findByUsername("jonathan_test")
                .orElseGet(() -> {
                    User u = new User();
                    u.setUsername("jonathan_test");
                    u.setPassword(passwordEncoder.encode("password123"));
                    u.setRole(Role.CUSTOMER);
                    u.setCustomer(jonathanCustomer);
                    return userRepository.save(u);
                });

        User adminUser = userRepository.findByUsername("admin_test")
                .orElseGet(() -> {
                    User u = new User();
                    u.setUsername("admin_test");
                    u.setPassword(passwordEncoder.encode("password123"));
                    u.setRole(Role.ADMIN);
                    u.setCustomer(null);
                    return userRepository.save(u);
                });

        mayalinToken = "Bearer " + jwtUtil.generateToken(mayaUser.getUsername(), mayaUser.getUserId(), "ROLE_CUSTOMER", mayaCustomer.getCustomerId());
        jonathanToken = "Bearer " + jwtUtil.generateToken(jonathanUser.getUsername(), jonathanUser.getUserId(), "ROLE_CUSTOMER", jonathanCustomer.getCustomerId());
        adminToken = "Bearer " + jwtUtil.generateToken(adminUser.getUsername(), adminUser.getUserId(), "ROLE_ADMIN", null);
    }

    private void verifyTestDatabaseSafetyGuard() {
        try (Connection conn = dataSource.getConnection()) {
            String catalog = conn.getCatalog();
            if (catalog == null || !catalog.equalsIgnoreCase("movie_ticket_booking_test")) {
                throw new IllegalStateException(
                        "SAFETY GUARD ABORT: Integration tests are strictly prohibited from connecting to '"
                                + catalog + "'. " +
                                "Tests must connect exclusively to isolated catalog 'movie_ticket_booking_test' to protect operational data.");
            }
        } catch (SQLException e) {
            throw new IllegalStateException("SAFETY GUARD FAILURE: Could not verify test database catalog: "
                    + e.getMessage(), e);
        }
    }

    @AfterEach
    @org.springframework.transaction.annotation.Transactional
    void tearDown() {
        // Guarantee only specifically created test tickets are deleted, never operational tickets
        for (Integer id : testTicketIds) {
            try {
                var messages = ticketMessageRepository.findByTicket_TicketIdOrderByCreatedAtAsc(id);
                ticketMessageRepository.deleteAll(messages);
                supportTicketRepository.deleteById(id);
            } catch (Exception e) {
                System.err.println("Failed to clean up test ticket " + id + ": " + e.getMessage());
            }
        }
        testTicketIds.clear();
    }

    @Test
    @DisplayName("Security: Unauthenticated request to /api/support/tickets returns 401 Unauthorized")
    void testUnauthenticatedAccess_Returns401() throws Exception {
        mockMvc.perform(get("/api/support/tickets"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(post("/api/support/tickets")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"category\":\"BOOKING_ISSUE\",\"subject\":\"Test\",\"message\":\"Test message details\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Security: Customer token accessing /api/admin/support/tickets returns 403 Forbidden")
    void testCustomerAccessingAdminEndpoints_Returns403() throws Exception {
        mockMvc.perform(get("/api/admin/support/tickets")
                .header("Authorization", mayalinToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Security: Admin token accessing /api/support/tickets returns 403 Forbidden")
    void testAdminAccessingCustomerEndpoints_Returns403() throws Exception {
        mockMvc.perform(get("/api/support/tickets")
                .header("Authorization", adminToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Validation: Empty required fields reject ticket creation with 400 Bad Request")
    void testCreateTicket_ValidationFailure_Returns400() throws Exception {
        mockMvc.perform(post("/api/support/tickets")
                .header("Authorization", mayalinToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"category\":null,\"subject\":\"\",\"message\":\"\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").exists());
    }

    @Test
    @DisplayName("End-to-End Customer Support Flow: Create, List, Detail, Admin Reply, Customer Reply, and Close")
    void testFullCustomerSupportWorkflow() throws Exception {
        // 1. Customer creates ticket
        String createJson = """
                {
                    "category": "BOOKING_ISSUE",
                    "subject": "Missing confirmation email for show",
                    "message": "I booked tickets yesterday but didn't receive the confirmation email.",
                    "bookingReference": "TKT-20261009-001"
                }
                """;

        MvcResult result = mockMvc.perform(post("/api/support/tickets")
                .header("Authorization", mayalinToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(createJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.ticketId").isNumber())
                .andExpect(jsonPath("$.ticketReference", startsWith("SUP-")))
                .andExpect(jsonPath("$.status", is("OPEN")))
                .andExpect(jsonPath("$.customerName", is("Maya Lin")))
                .andExpect(jsonPath("$.subject", is("Missing confirmation email for show")))
                .andExpect(jsonPath("$.messages[0].senderType", is("CUSTOMER")))
                .andExpect(jsonPath("$.messages[0].message",
                        containsString("booked tickets yesterday")))
                .andReturn();

        // Extract ticket ID directly from the created response and track for isolated cleanup
        JsonNode rootNode = new ObjectMapper().readTree(result.getResponse().getContentAsString());
        int ticketId = rootNode.get("ticketId").asInt();
        testTicketIds.add(ticketId);

        // 2. Customer lists tickets -> sees created ticket
        mockMvc.perform(get("/api/support/tickets")
                .header("Authorization", mayalinToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.ticketId == " + ticketId + ")].status").value("OPEN"));

        // 3. Another customer (jonathan) cannot view or modify mayalin's ticket (Cross-customer security)
        mockMvc.perform(get("/api/support/tickets/" + ticketId)
                .header("Authorization", jonathanToken))
                .andExpect(status().isForbidden());

        mockMvc.perform(post("/api/support/tickets/" + ticketId + "/messages")
                .header("Authorization", jonathanToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"message\":\"Malicious cross-customer reply attempt\"}"))
                .andExpect(status().isForbidden());

        mockMvc.perform(patch("/api/support/tickets/" + ticketId + "/close")
                .header("Authorization", jonathanToken))
                .andExpect(status().isForbidden());

        // 4. Admin views tickets -> sees the open ticket
        mockMvc.perform(get("/api/admin/support/tickets")
                .header("Authorization", adminToken)
                .param("status", "OPEN"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.ticketId == " + ticketId + ")].ticketId").exists());

        // 5. Admin updates status to WAITING_FOR_CUSTOMER and replies to customer
        mockMvc.perform(patch("/api/admin/support/tickets/" + ticketId + "/status")
                .header("Authorization", adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"status\":\"WAITING_FOR_CUSTOMER\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("WAITING_FOR_CUSTOMER")));

        String adminReplyJson = """
                {
                    "message": "Hello, we have resent your confirmation email. Please check your spam folder and reply if still not received."
                }
                """;

        mockMvc.perform(post("/api/admin/support/tickets/" + ticketId + "/messages")
                .header("Authorization", adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(adminReplyJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.messages", hasSize(2)))
                .andExpect(jsonPath("$.messages[1].senderType", is("ADMIN")));

        // 6. Customer replies -> verifies status automatically reverts from WAITING_FOR_CUSTOMER to OPEN!
        String customerReplyJson = """
                {
                    "message": "I checked the spam folder and received the email now. Thank you!"
                }
                """;

        mockMvc.perform(post("/api/support/tickets/" + ticketId + "/messages")
                .header("Authorization", mayalinToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(customerReplyJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("OPEN")))
                .andExpect(jsonPath("$.messages", hasSize(3)))
                .andExpect(jsonPath("$.messages[2].senderType", is("CUSTOMER")));

        // 7. Customer closes the ticket
        mockMvc.perform(patch("/api/support/tickets/" + ticketId + "/close")
                .header("Authorization", mayalinToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("CLOSED")));

        // 8. Rejection of customer replies to CLOSED ticket (400 Bad Request)
        mockMvc.perform(post("/api/support/tickets/" + ticketId + "/messages")
                .header("Authorization", mayalinToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"message\":\"Attempt to reply to closed ticket\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("CLOSED")));

        // 9. Admin cannot reopen CLOSED ticket (CLOSED is terminal)
        mockMvc.perform(patch("/api/admin/support/tickets/" + ticketId + "/status")
                .header("Authorization", adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"status\":\"OPEN\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("terminal")));
    }
}
