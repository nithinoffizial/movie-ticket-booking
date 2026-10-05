package com.example.movieticketbooking.service;

import com.example.movieticketbooking.entity.Customer;
import com.example.movieticketbooking.repository.CustomerRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CustomerService {

    private final CustomerRepository customerRepository;

    public CustomerService(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    public List<Customer> getAllCustomers() {
        return customerRepository.findAll();
    }

    public Optional<Customer> getCustomerById(Integer customerId) {
        return customerRepository.findById(customerId);
    }

    public Customer createCustomer(Customer customer) {
        return customerRepository.save(customer);
    }

    public Customer updateCustomer(
            Integer customerId,
            Customer customerDetails) {

        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        customer.setName(customerDetails.getName());
        customer.setEmail(customerDetails.getEmail());
        customer.setPhone(customerDetails.getPhone());

        return customerRepository.save(customer);
    }

    public void deleteCustomer(Integer customerId) {
        customerRepository.deleteById(customerId);
    }
}