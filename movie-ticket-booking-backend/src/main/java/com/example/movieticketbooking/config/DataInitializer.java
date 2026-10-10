package com.example.movieticketbooking.config;

import com.example.movieticketbooking.entity.Role;
import com.example.movieticketbooking.entity.User;
import com.example.movieticketbooking.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        // Initialize initial administrator 'nithin' with BCrypt hash if not already present
        if (!userRepository.existsByUsername("nithin")) {
            User admin = new User();
            admin.setUsername("nithin");
            admin.setPassword(passwordEncoder.encode("9487412927"));
            admin.setRole(Role.ADMIN);
            admin.setCustomer(null);
            userRepository.save(admin);
            System.out.println(">>> Initial administrator 'nithin' initialized with role ADMIN and BCrypt hash.");
        }
    }
}
