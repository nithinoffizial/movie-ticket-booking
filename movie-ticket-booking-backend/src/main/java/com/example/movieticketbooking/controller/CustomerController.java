package com.example.movieticketbooking.controller;

import com.example.movieticketbooking.entity.Customer;
import com.example.movieticketbooking.service.CustomerService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {

    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @GetMapping
    public List<Customer> getAllCustomers() {
        return customerService.getAllCustomers();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Customer> getCustomerById(
            @PathVariable Integer id) {

        return customerService.getCustomerById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Customer createCustomer(@RequestBody Customer customer) {
        return customerService.createCustomer(customer);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Customer> updateCustomer(
            @PathVariable Integer id,
            @RequestBody Customer customer) {

        try {
            return ResponseEntity.ok(
                    customerService.updateCustomer(id, customer)
            );
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCustomer(
            @PathVariable Integer id) {

        customerService.deleteCustomer(id);
        return ResponseEntity.noContent().build();
    }
}