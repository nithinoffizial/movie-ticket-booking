package com.example.movieticketbooking;

import com.example.movieticketbooking.entity.Customer;
import com.example.movieticketbooking.entity.Movie;
import com.example.movieticketbooking.entity.Role;
import com.example.movieticketbooking.entity.Theatre;
import com.example.movieticketbooking.entity.User;
import com.example.movieticketbooking.repository.CustomerRepository;
import com.example.movieticketbooking.repository.MovieRepository;
import com.example.movieticketbooking.repository.TheatreRepository;
import com.example.movieticketbooking.repository.UserRepository;
import com.example.movieticketbooking.security.JwtUtil;
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
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.util.ArrayList;
import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
public class MovieAndTheatreSecurityIntegrationTest {

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
    private MovieRepository movieRepository;

    @Autowired
    private TheatreRepository theatreRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private MockMvc mockMvc;
    private String customerToken;
    private String adminToken;

    private final List<Integer> createdMovieIds = new ArrayList<>();
    private final List<Integer> createdTheatreIds = new ArrayList<>();

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext)
                .addFilters(springSecurityFilterChain)
                .build();

        Customer customer = customerRepository.findByEmail("customer.sec@cinepass.com")
                .orElseGet(() -> {
                    Customer c = new Customer();
                    c.setName("Security Customer");
                    c.setEmail("customer.sec@cinepass.com");
                    c.setPhone("9876549999");
                    c.setActive(true);
                    return customerRepository.save(c);
                });

        User customerUser = userRepository.findByUsername("sec_customer")
                .orElseGet(() -> {
                    User u = new User();
                    u.setUsername("sec_customer");
                    u.setPassword(passwordEncoder.encode("password123"));
                    u.setRole(Role.CUSTOMER);
                    u.setCustomer(customer);
                    return userRepository.save(u);
                });

        User adminUser = userRepository.findByUsername("sec_admin")
                .orElseGet(() -> {
                    User u = new User();
                    u.setUsername("sec_admin");
                    u.setPassword(passwordEncoder.encode("password123"));
                    u.setRole(Role.ADMIN);
                    u.setCustomer(null);
                    return userRepository.save(u);
                });

        customerToken = "Bearer " + jwtUtil.generateToken(
                customerUser.getUsername(),
                customerUser.getUserId(),
                "ROLE_CUSTOMER",
                customer.getCustomerId()
        );

        adminToken = "Bearer " + jwtUtil.generateToken(
                adminUser.getUsername(),
                adminUser.getUserId(),
                "ROLE_ADMIN",
                null
        );
    }

    @AfterEach
    void tearDown() {
        for (Integer id : createdMovieIds) {
            try {
                movieRepository.deleteById(id);
            } catch (Exception ignored) {}
        }
        for (Integer id : createdTheatreIds) {
            try {
                theatreRepository.deleteById(id);
            } catch (Exception ignored) {}
        }
    }

    // ==========================================
    // 1. PUBLIC READ ACCESS VERIFICATION
    // ==========================================

    @Test
    @DisplayName("Public visitors can read movies list without authentication")
    void testPublicCanReadMovies() throws Exception {
        mockMvc.perform(get("/api/movies"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Public visitors can read theatres list without authentication")
    void testPublicCanReadTheatres() throws Exception {
        mockMvc.perform(get("/api/theatres"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Public visitors can read shows list without authentication")
    void testPublicCanReadShows() throws Exception {
        mockMvc.perform(get("/api/shows"))
                .andExpect(status().isOk());
    }

    // ==========================================
    // 2. MOVIE MUTATIONS AUTHORIZATION
    // ==========================================

    @Test
    @DisplayName("Anonymous user cannot create movie (401 Unauthorized)")
    void testAnonymousCannotCreateMovie() throws Exception {
        Movie movie = new Movie("Inception 2", "Sci-Fi", 148, "English");
        mockMvc.perform(post("/api/movies")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(movie)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Customer cannot create movie (403 Forbidden)")
    void testCustomerCannotCreateMovie() throws Exception {
        Movie movie = new Movie("Rogue Movie", "Action", 120, "English");
        mockMvc.perform(post("/api/movies")
                        .header("Authorization", customerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(movie)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Customer cannot update movie (403 Forbidden)")
    void testCustomerCannotUpdateMovie() throws Exception {
        Movie movie = new Movie("Updated Title", "Action", 130, "English");
        mockMvc.perform(put("/api/movies/1")
                        .header("Authorization", customerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(movie)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Customer cannot delete movie (403 Forbidden)")
    void testCustomerCannotDeleteMovie() throws Exception {
        mockMvc.perform(delete("/api/movies/1")
                        .header("Authorization", customerToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Admin can create movie (200 OK)")
    void testAdminCanCreateMovie() throws Exception {
        Movie movie = new Movie("Admin Created Blockbuster", "Action", 150, "English");
        String response = mockMvc.perform(post("/api/movies")
                        .header("Authorization", adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(movie)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        Movie created = objectMapper.readValue(response, Movie.class);
        if (created.getMovieId() != null) {
            createdMovieIds.add(created.getMovieId());
        }
    }

    // ==========================================
    // 3. THEATRE MUTATIONS AUTHORIZATION
    // ==========================================

    @Test
    @DisplayName("Anonymous user cannot create theatre (401 Unauthorized)")
    void testAnonymousCannotCreateTheatre() throws Exception {
        Theatre theatre = new Theatre("Rogue Multiplex", "Downtown", 5);
        mockMvc.perform(post("/api/theatres")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(theatre)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Customer cannot create theatre (403 Forbidden)")
    void testCustomerCannotCreateTheatre() throws Exception {
        Theatre theatre = new Theatre("Unauthorized Cinema", "Uptown", 4);
        mockMvc.perform(post("/api/theatres")
                        .header("Authorization", customerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(theatre)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Customer cannot update theatre (403 Forbidden)")
    void testCustomerCannotUpdateTheatre() throws Exception {
        Theatre theatre = new Theatre("Updated Name", "Uptown", 6);
        mockMvc.perform(put("/api/theatres/1")
                        .header("Authorization", customerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(theatre)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Customer cannot delete theatre (403 Forbidden)")
    void testCustomerCannotDeleteTheatre() throws Exception {
        mockMvc.perform(delete("/api/theatres/1")
                        .header("Authorization", customerToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Admin can create theatre (200 OK)")
    void testAdminCanCreateTheatre() throws Exception {
        Theatre theatre = new Theatre("Admin IMAX Theatre", "City Center", 8);
        String response = mockMvc.perform(post("/api/theatres")
                        .header("Authorization", adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(theatre)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        Theatre created = objectMapper.readValue(response, Theatre.class);
        if (created.getTheatreId() != null) {
            createdTheatreIds.add(created.getTheatreId());
        }
    }

    // ==========================================
    // 4. SHOW MUTATIONS AUTHORIZATION
    // ==========================================

    @Test
    @DisplayName("Customer cannot create show (403 Forbidden)")
    void testCustomerCannotCreateShow() throws Exception {
        mockMvc.perform(post("/api/shows")
                        .header("Authorization", customerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"movieId\":1,\"theatreId\":1,\"showDate\":\"2026-10-15\",\"showTime\":\"18:00:00\",\"ticketPrice\":300,\"totalSeats\":50}"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Customer cannot delete show (403 Forbidden)")
    void testCustomerCannotDeleteShow() throws Exception {
        mockMvc.perform(delete("/api/shows/1")
                        .header("Authorization", customerToken))
                .andExpect(status().isForbidden());
    }
}
