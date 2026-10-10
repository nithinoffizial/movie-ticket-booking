package com.example.movieticketbooking.security;

import com.example.movieticketbooking.entity.Role;
import com.example.movieticketbooking.entity.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;

public class CustomUserDetails implements UserDetails {

    private final Integer userId;
    private final String username;
    private final String password;
    private final Role role;
    private final Integer customerId;
    private final String customerName;
    private final boolean active;
    private final Collection<? extends GrantedAuthority> authorities;

    public CustomUserDetails(User user) {
        this.userId = user.getUserId();
        this.username = user.getUsername();
        this.password = user.getPassword();
        this.role = user.getRole();
        if (user.getCustomer() != null) {
            this.customerId = user.getCustomer().getCustomerId();
            this.customerName = user.getCustomer().getName();
            this.active = Boolean.TRUE.equals(user.getCustomer().getActive());
        } else {
            this.customerId = null;
            this.customerName = null;
            this.active = true; // Admin has no customer profile, active by default
        }
        this.authorities = Collections.singletonList(
                new SimpleGrantedAuthority("ROLE_" + user.getRole().name())
        );
    }

    public Integer getUserId() {
        return userId;
    }

    public Role getRole() {
        return role;
    }

    public Integer getCustomerId() {
        return customerId;
    }

    public String getCustomerName() {
        return customerName;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }

    public boolean isActive() {
        return active;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return active;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return active;
    }
}
