package com.example.movieticketbooking;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;

@SpringBootTest
class MovieTicketBookingBackendApplicationTests {

    @Autowired
    private DataSource dataSource;

    @BeforeEach
    void verifyTestDatabaseSafetyGuard() throws SQLException {
        try (Connection conn = dataSource.getConnection()) {
            String catalog = conn.getCatalog();
            if (catalog == null || !catalog.equalsIgnoreCase("movie_ticket_booking_test")) {
                throw new IllegalStateException(
                        "SAFETY GUARD ABORT: Test suite must connect exclusively to isolated 'movie_ticket_booking_test'. " +
                        "Attempted connection to catalog: '" + catalog + "'."
                );
            }
        }
    }

    @Test
    void contextLoads() {
    }

}
