package com.example.movieticketbooking.controller;

import com.example.movieticketbooking.dto.LoginRequest;
import com.example.movieticketbooking.dto.LoginResponse;
import com.example.movieticketbooking.dto.RegisterRequest;
import com.example.movieticketbooking.dto.RegisterResponse;
import com.example.movieticketbooking.security.CustomUserDetails;
import com.example.movieticketbooking.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        LoginResponse response = authService.login(loginRequest);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(@Valid @RequestBody RegisterRequest registerRequest) {
        RegisterResponse response = authService.register(registerRequest);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/me")
    public ResponseEntity<LoginResponse> getCurrentUser(@AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).build();
        }
        LoginResponse response = new LoginResponse(
                null,
                userDetails.getUserId(),
                userDetails.getUsername(),
                "ROLE_" + userDetails.getRole().name(),
                userDetails.getCustomerId(),
                userDetails.getCustomerName()
        );
        return ResponseEntity.ok(response);
    }
}
