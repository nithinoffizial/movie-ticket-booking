package com.example.movieticketbooking.repository;

import com.example.movieticketbooking.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
    Optional<User> findByUsername(String username);
    boolean existsByUsername(String username);
    Optional<User> findByCustomerCustomerId(Integer customerId);
    Optional<User> findByCustomerEmail(String email);

    @Query("SELECT u FROM User u LEFT JOIN u.customer c WHERE u.username = :identifier OR (c IS NOT NULL AND c.email = :identifier)")
    Optional<User> findByUsernameOrEmail(@Param("identifier") String identifier);
}
