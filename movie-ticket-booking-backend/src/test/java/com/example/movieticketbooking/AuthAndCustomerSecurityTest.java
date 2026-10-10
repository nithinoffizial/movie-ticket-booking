package com.example.movieticketbooking;

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
import com.example.movieticketbooking.service.AuthService;
import com.example.movieticketbooking.service.CustomerService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthAndCustomerSecurityTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private AuthenticationManager authenticationManager;

    @InjectMocks
    private AuthService authService;

    @InjectMocks
    private CustomerService customerService;

    private Customer activeCustomer;
    private Customer inactiveCustomer;
    private User customerUser;
    private User adminUser;

    @BeforeEach
    void setUp() {
        activeCustomer = new Customer("John Doe", "john@example.com", "9876543210");
        activeCustomer.setCustomerId(10);
        activeCustomer.setActive(true);

        inactiveCustomer = new Customer("Jane Inactive", "jane@example.com", "9876543211");
        inactiveCustomer.setCustomerId(11);
        inactiveCustomer.setActive(false);

        customerUser = new User("johndoe", "encodedPass", Role.CUSTOMER, activeCustomer);
        customerUser.setUserId(20);

        adminUser = new User("nithin", "encodedAdminPass", Role.ADMIN, null);
        adminUser.setUserId(1);
    }

    // ==========================================
    // 1. REGISTRATION TESTS
    // ==========================================

    @Test
    @DisplayName("Registration succeeds with valid fields, hashes password and assigns ROLE_CUSTOMER")
    void testRegister_Success() {
        RegisterRequest req = new RegisterRequest();
        req.setName("Alex Rivera");
        req.setEmail("alex@example.com");
        req.setPhone("9876543212");
        req.setUsername("alexr");
        req.setPassword("Password123!");
        req.setConfirmPassword("Password123!");

        when(userRepository.existsByUsername("alexr")).thenReturn(false);
        when(customerRepository.existsByEmail("alex@example.com")).thenReturn(false);
        when(passwordEncoder.encode("Password123!")).thenReturn("$2a$10$hashed");
        when(customerRepository.save(any(Customer.class))).thenAnswer(inv -> {
            Customer c = inv.getArgument(0);
            c.setCustomerId(12);
            return c;
        });

        RegisterResponse resp = authService.register(req);

        assertNotNull(resp);
        assertEquals("alexr", resp.getUsername());
        assertEquals(12, resp.getCustomerId());
        verify(userRepository).save(argThat(u ->
            u.getRole() == Role.CUSTOMER &&
            u.getUsername().equals("alexr") &&
            u.getPassword().equals("$2a$10$hashed")
        ));
    }

    @Test
    @DisplayName("Registration rejects mismatched password confirmation")
    void testRegister_PasswordMismatch_ThrowsBadRequest() {
        RegisterRequest req = new RegisterRequest();
        req.setName("Alex Rivera");
        req.setEmail("alex@example.com");
        req.setPhone("9876543212");
        req.setUsername("alexr");
        req.setPassword("Password123!");
        req.setConfirmPassword("DifferentPassword");

        BadRequestException ex = assertThrows(BadRequestException.class, () -> authService.register(req));
        assertTrue(ex.getMessage().contains("match"));
    }

    @Test
    @DisplayName("Registration rejects reserved admin username nithin")
    void testRegister_ReservedAdminUsername_ThrowsConflict() {
        RegisterRequest req = new RegisterRequest();
        req.setName("Alex Rivera");
        req.setEmail("alex@example.com");
        req.setPhone("9876543212");
        req.setUsername("nithin");
        req.setPassword("Password123!");
        req.setConfirmPassword("Password123!");

        ConflictException ex = assertThrows(ConflictException.class, () -> authService.register(req));
        assertTrue(ex.getMessage().contains("reserved"));
    }

    @Test
    @DisplayName("Registration rejects duplicate username with HTTP 409 ConflictException")
    void testRegister_DuplicateUsername_ThrowsConflict() {
        RegisterRequest req = new RegisterRequest();
        req.setName("Alex Rivera");
        req.setEmail("alex@example.com");
        req.setPhone("9876543212");
        req.setUsername("alexr");
        req.setPassword("Password123!");
        req.setConfirmPassword("Password123!");

        when(userRepository.existsByUsername("alexr")).thenReturn(true);

        ConflictException ex = assertThrows(ConflictException.class, () -> authService.register(req));
        assertTrue(ex.getMessage().contains("already in use"));
    }

    @Test
    @DisplayName("Registration rejects duplicate email with HTTP 409 ConflictException")
    void testRegister_DuplicateEmail_ThrowsConflict() {
        RegisterRequest req = new RegisterRequest();
        req.setName("Alex Rivera");
        req.setEmail("john@example.com"); // existing email
        req.setPhone("9876543212");
        req.setUsername("alexr");
        req.setPassword("Password123!");
        req.setConfirmPassword("Password123!");

        when(userRepository.existsByUsername("alexr")).thenReturn(false);
        when(customerRepository.existsByEmail("john@example.com")).thenReturn(true);

        ConflictException ex = assertThrows(ConflictException.class, () -> authService.register(req));
        assertTrue(ex.getMessage().contains("already registered"));
    }

    // ==========================================
    // 2. LOGIN TESTS (Username, Email, Admin)
    // ==========================================

    @Test
    @DisplayName("Customer login succeeds with username")
    void testLogin_CustomerUsername_Success() {
        LoginRequest req = new LoginRequest("johndoe", "secret");
        CustomUserDetails userDetails = new CustomUserDetails(customerUser);

        Authentication auth = mock(Authentication.class);
        when(auth.getPrincipal()).thenReturn(userDetails);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(auth);
        when(jwtUtil.generateToken(any(), any(), any(), any())).thenReturn("mock.jwt.token");

        LoginResponse resp = authService.login(req);

        assertNotNull(resp);
        assertEquals("mock.jwt.token", resp.getToken());
        assertEquals("ROLE_CUSTOMER", resp.getRole());
        assertEquals(10, resp.getCustomerId());
    }

    @Test
    @DisplayName("Customer login succeeds with email")
    void testLogin_CustomerEmail_Success() {
        LoginRequest req = new LoginRequest("john@example.com", "secret");
        CustomUserDetails userDetails = new CustomUserDetails(customerUser);

        Authentication auth = mock(Authentication.class);
        when(auth.getPrincipal()).thenReturn(userDetails);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(auth);
        when(jwtUtil.generateToken(any(), any(), any(), any())).thenReturn("mock.jwt.token");

        LoginResponse resp = authService.login(req);

        assertNotNull(resp);
        assertEquals("mock.jwt.token", resp.getToken());
        assertEquals("ROLE_CUSTOMER", resp.getRole());
        assertEquals(10, resp.getCustomerId());
    }

    @Test
    @DisplayName("Admin login succeeds with username nithin and admin role")
    void testLogin_AdminUsername_Success() {
        LoginRequest req = new LoginRequest("nithin", "9487412927");
        CustomUserDetails adminDetails = new CustomUserDetails(adminUser);

        Authentication auth = mock(Authentication.class);
        when(auth.getPrincipal()).thenReturn(adminDetails);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(auth);
        when(jwtUtil.generateToken(any(), any(), any(), any())).thenReturn("mock.admin.jwt");

        LoginResponse resp = authService.login(req);

        assertNotNull(resp);
        assertEquals("mock.admin.jwt", resp.getToken());
        assertEquals("ROLE_ADMIN", resp.getRole());
        assertNull(resp.getCustomerId());
    }

    // ==========================================
    // 3. INACTIVE CUSTOMER TESTS
    // ==========================================

    @Test
    @DisplayName("Inactive customer login is rejected with DisabledException")
    void testLogin_InactiveCustomer_ThrowsDisabledException() {
        User inactiveUser = new User("jane", "encodedPass", Role.CUSTOMER, inactiveCustomer);
        CustomUserDetails inactiveDetails = new CustomUserDetails(inactiveUser);

        LoginRequest req = new LoginRequest("jane", "secret");
        Authentication auth = mock(Authentication.class);
        when(auth.getPrincipal()).thenReturn(inactiveDetails);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(auth);

        DisabledException ex = assertThrows(DisabledException.class, () -> authService.login(req));
        assertTrue(ex.getMessage().contains("deactivated"));
    }

    @Test
    @DisplayName("CustomUserDetails accurately reflects inactive customer status in isEnabled()")
    void testCustomUserDetails_DisabledForInactiveCustomer() {
        CustomUserDetails activeDetails = new CustomUserDetails(customerUser);
        assertTrue(activeDetails.isEnabled());
        assertTrue(activeDetails.isAccountNonLocked());

        User inactiveUser = new User("jane", "encodedPass", Role.CUSTOMER, inactiveCustomer);
        CustomUserDetails inactiveDetails = new CustomUserDetails(inactiveUser);
        assertFalse(inactiveDetails.isEnabled());
        assertFalse(inactiveDetails.isAccountNonLocked());
    }

    // ==========================================
    // 4. ACTIVATE / DEACTIVATE CUSTOMER TESTS
    // ==========================================

    @Test
    @DisplayName("Admin successfully deactivates an active customer")
    void testAdminDeactivateCustomer_Success() {
        when(customerRepository.findById(10)).thenReturn(Optional.of(activeCustomer));
        when(customerRepository.save(any(Customer.class))).thenAnswer(inv -> inv.getArgument(0));

        CustomUserDetails adminDetails = new CustomUserDetails(adminUser);
        Customer result = customerService.toggleCustomerStatus(10, false, adminDetails);

        assertFalse(result.getActive());
        verify(customerRepository).save(activeCustomer);
    }

    @Test
    @DisplayName("Admin successfully reactivates an inactive customer")
    void testAdminActivateCustomer_Success() {
        when(customerRepository.findById(11)).thenReturn(Optional.of(inactiveCustomer));
        when(customerRepository.save(any(Customer.class))).thenAnswer(inv -> inv.getArgument(0));

        CustomUserDetails adminDetails = new CustomUserDetails(adminUser);
        Customer result = customerService.toggleCustomerStatus(11, true, adminDetails);

        assertTrue(result.getActive());
        verify(customerRepository).save(inactiveCustomer);
    }

    @Test
    @DisplayName("Administrator cannot accidentally deactivate their own account")
    void testAdminCannotDeactivateSelf() {
        User adminWithCustomer = new User("admin_linked", "pass", Role.ADMIN, activeCustomer);
        CustomUserDetails adminDetails = new CustomUserDetails(adminWithCustomer);

        when(customerRepository.findById(10)).thenReturn(Optional.of(activeCustomer));

        BadRequestException ex = assertThrows(BadRequestException.class, () ->
            customerService.toggleCustomerStatus(10, false, adminDetails)
        );
        assertTrue(ex.getMessage().contains("cannot deactivate their own account"));
    }
}
