package com.example.movieticketbooking.repository;

import com.example.movieticketbooking.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomerRepository extends JpaRepository<Customer, Integer> {
}