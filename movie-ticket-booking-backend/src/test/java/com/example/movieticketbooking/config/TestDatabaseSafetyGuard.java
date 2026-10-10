package com.example.movieticketbooking.config;

import org.springframework.beans.BeansException;
import org.springframework.beans.factory.config.BeanPostProcessor;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;

/**
 * Early fail-fast guard that verifies the active database catalog immediately upon DataSource
 * instantiation, prior to any JPA/Hibernate initialization, CommandLineRunners, or test fixtures.
 */
@Component
public class TestDatabaseSafetyGuard implements BeanPostProcessor {

    @Override
    public Object postProcessAfterInitialization(Object bean, String beanName) throws BeansException {
        if (bean instanceof DataSource dataSource) {
            try (Connection conn = dataSource.getConnection()) {
                String catalog = conn.getCatalog();
                if (catalog == null || !catalog.equalsIgnoreCase("movie_ticket_booking_test")) {
                    throw new IllegalStateException(
                            "CRITICAL SAFETY GUARD ABORT: Test DataSource must connect exclusively to 'movie_ticket_booking_test'. " +
                            "Attempted catalog: '" + catalog + "'."
                    );
                }
            } catch (SQLException e) {
                throw new IllegalStateException("CRITICAL SAFETY GUARD: Could not verify test database catalog: " + e.getMessage(), e);
            }
        }
        return bean;
    }
}
