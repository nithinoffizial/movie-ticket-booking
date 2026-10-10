package com.example.movieticketbooking.service;

import com.example.movieticketbooking.dto.LoginRequest;
import com.example.movieticketbooking.dto.LoginResponse;
import com.example.movieticketbooking.dto.RegisterRequest;
import com.example.movieticketbooking.dto.RegisterResponse;
import com.example.movieticketbooking.entity.Customer;
import com.example.movieticketbooking.entity.Role;
import com.example.movieticketbooking.entity.User;
import com.example.movieticketbooking.exception.BadRequestException;
import com.example.movieticketbooking.exception.ConflictException;
import com.example.movieticketbooking.repository.CustomerRepository;
import com.example.movieticketbooking.repository.UserRepository;
import com.example.movieticketbooking.security.CustomUserDetails;
import com.example.movieticketbooking.security.JwtUtil;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(AuthenticationManager authenticationManager,
                       JwtUtil jwtUtil,
                       UserRepository userRepository,
                       CustomerRepository customerRepository,
                       PasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
        this.customerRepository = customerRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public LoginResponse login(LoginRequest request) {
        String identifier = request.getUsername() != null ? request.getUsername().trim() : "";
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(identifier, request.getPassword())
        );

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

        if (!userDetails.isEnabled()) {
            throw new DisabledException("Your customer account has been deactivated. Please contact support.");
        }

        String roleString = "ROLE_" + userDetails.getRole().name();
        String token = jwtUtil.generateToken(
                userDetails.getUsername(),
                userDetails.getUserId(),
                roleString,
                userDetails.getCustomerId()
        );

        return new LoginResponse(
                token,
                userDetails.getUserId(),
                userDetails.getUsername(),
                roleString,
                userDetails.getCustomerId(),
                userDetails.getCustomerName()
        );
    }

    @Transactional
    public RegisterResponse register(RegisterRequest request) {
        if (request.getPassword() == null || !request.getPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Password and confirmation password do not match.");
        }

        String username = request.getUsername().trim();
        String email = request.getEmail().trim();

        // Enforce reservation of admin username
        if ("nithin".equalsIgnoreCase(username)) {
            throw new ConflictException("Username 'nithin' is reserved for system administration.");
        }

        if (userRepository.existsByUsername(username)) {
            throw new ConflictException("Username '" + username + "' is already in use.");
        }

        if (customerRepository.existsByEmail(email)) {
            throw new ConflictException("Email address '" + email + "' is already registered.");
        }

        // Create Customer record with active = true
        Customer customer = new Customer(
                request.getName().trim(),
                email,
                request.getPhone() != null ? request.getPhone().trim() : null,
                true
        );
        Customer savedCustomer = customerRepository.save(customer);

        // Create User record with role CUSTOMER
        User user = new User(
                username,
                passwordEncoder.encode(request.getPassword()),
                Role.CUSTOMER,
                savedCustomer
        );
        userRepository.save(user);

        return new RegisterResponse(
                "Customer registration successful. Please log in with your credentials.",
                user.getUsername(),
                savedCustomer.getCustomerId()
        );
    }
}
