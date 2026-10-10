package com.example.movieticketbooking.service;

import com.example.movieticketbooking.dto.CustomerProfileResponse;
import com.example.movieticketbooking.entity.Customer;
import com.example.movieticketbooking.exception.BadRequestException;
import com.example.movieticketbooking.exception.ResourceNotFoundException;
import com.example.movieticketbooking.repository.BookingRepository;
import com.example.movieticketbooking.repository.CustomerRepository;
import com.example.movieticketbooking.repository.TicketRepository;
import com.example.movieticketbooking.security.CustomUserDetails;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final BookingRepository bookingRepository;
    private final TicketRepository ticketRepository;

    public CustomerService(CustomerRepository customerRepository,
                           BookingRepository bookingRepository,
                           TicketRepository ticketRepository) {
        this.customerRepository = customerRepository;
        this.bookingRepository = bookingRepository;
        this.ticketRepository = ticketRepository;
    }

    public List<Customer> getAllCustomers() {
        return customerRepository.findAll();
    }

    public Optional<Customer> getCustomerById(Integer customerId) {
        return customerRepository.findById(customerId);
    }

    public CustomerProfileResponse getCustomerProfile(CustomUserDetails currentUser) {
        if (currentUser.getCustomerId() == null) {
            throw new BadRequestException("No customer profile linked to authenticated user.");
        }

        Customer customer = customerRepository.findById(currentUser.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + currentUser.getCustomerId()));

        int bookingCount = bookingRepository.findByCustomerCustomerIdOrderByBookingDateDesc(customer.getCustomerId()).size();
        int ticketCount = ticketRepository.findByBookingCustomerCustomerIdOrderByIssuedAtDesc(customer.getCustomerId()).size();

        return new CustomerProfileResponse(
                customer.getCustomerId(),
                customer.getName(),
                customer.getEmail(),
                customer.getPhone(),
                currentUser.getUsername(),
                bookingCount,
                ticketCount,
                Boolean.TRUE.equals(customer.getActive())
        );
    }

    public Customer toggleCustomerStatus(Integer customerId, boolean active, CustomUserDetails currentUser) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + customerId));

        if (!active && currentUser != null && currentUser.getCustomerId() != null && currentUser.getCustomerId().equals(customerId)) {
            throw new BadRequestException("Administrator cannot deactivate their own account.");
        }

        customer.setActive(active);
        return customerRepository.save(customer);
    }

    public Customer createCustomer(Customer customer) {
        if (customer.getActive() == null) {
            customer.setActive(true);
        }
        return customerRepository.save(customer);
    }

    public Customer updateCustomer(Integer customerId, Customer customerDetails) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + customerId));

        customer.setName(customerDetails.getName());
        customer.setEmail(customerDetails.getEmail());
        customer.setPhone(customerDetails.getPhone());
        if (customerDetails.getActive() != null) {
            customer.setActive(customerDetails.getActive());
        }

        return customerRepository.save(customer);
    }

    public void deleteCustomer(Integer customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + customerId));
        // Soft-deactivate to preserve booking history and integrity
        customer.setActive(false);
        customerRepository.save(customer);
    }
}