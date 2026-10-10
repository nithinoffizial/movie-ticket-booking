package com.example.movieticketbooking.service;

import com.example.movieticketbooking.dto.AdminDashboardResponse;
import com.example.movieticketbooking.repository.*;
import org.springframework.stereotype.Service;

@Service
public class AdminService {

    private final CustomerRepository customerRepository;
    private final MovieRepository movieRepository;
    private final TheatreRepository theatreRepository;
    private final ShowRepository showRepository;
    private final BookingRepository bookingRepository;

    public AdminService(CustomerRepository customerRepository,
                        MovieRepository movieRepository,
                        TheatreRepository theatreRepository,
                        ShowRepository showRepository,
                        BookingRepository bookingRepository) {
        this.customerRepository = customerRepository;
        this.movieRepository = movieRepository;
        this.theatreRepository = theatreRepository;
        this.showRepository = showRepository;
        this.bookingRepository = bookingRepository;
    }

    public AdminDashboardResponse getDashboardStatistics() {
        long totalCustomers = customerRepository.count();
        long totalMovies = movieRepository.count();
        long totalTheatres = theatreRepository.count();
        long totalShows = showRepository.count();
        long totalBookings = bookingRepository.count();
        Double revenue = bookingRepository.calculateTotalRevenue();
        double totalRevenue = revenue != null ? revenue : 0.0;

        return new AdminDashboardResponse(
                totalCustomers,
                totalMovies,
                totalTheatres,
                totalShows,
                totalBookings,
                totalRevenue
        );
    }
}
