package com.example.movieticketbooking;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import static org.junit.jupiter.api.Assertions.assertTrue;

public class PasswordHashTest {

    @Test
    void testPasswordHashes() {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String adminHash = encoder.encode("9487412927");

        assertTrue(encoder.matches("9487412927", adminHash));
    }
}
