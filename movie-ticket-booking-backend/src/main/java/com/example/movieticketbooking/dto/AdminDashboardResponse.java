package com.example.movieticketbooking.dto;

public class AdminDashboardResponse {

    private long totalCustomers;
    private long totalMovies;
    private long totalTheatres;
    private long totalShows;
    private long totalBookings;
    private double totalRevenue;

    public AdminDashboardResponse() {
    }

    public AdminDashboardResponse(long totalCustomers, long totalMovies, long totalTheatres,
                                  long totalShows, long totalBookings, double totalRevenue) {
        this.totalCustomers = totalCustomers;
        this.totalMovies = totalMovies;
        this.totalTheatres = totalTheatres;
        this.totalShows = totalShows;
        this.totalBookings = totalBookings;
        this.totalRevenue = totalRevenue;
    }

    public long getTotalCustomers() {
        return totalCustomers;
    }

    public void setTotalCustomers(long totalCustomers) {
        this.totalCustomers = totalCustomers;
    }

    public long getTotalMovies() {
        return totalMovies;
    }

    public void setTotalMovies(long totalMovies) {
        this.totalMovies = totalMovies;
    }

    public long getTotalTheatres() {
        return totalTheatres;
    }

    public void setTotalTheatres(long totalTheatres) {
        this.totalTheatres = totalTheatres;
    }

    public long getTotalShows() {
        return totalShows;
    }

    public void setTotalShows(long totalShows) {
        this.totalShows = totalShows;
    }

    public long getTotalBookings() {
        return totalBookings;
    }

    public void setTotalBookings(long totalBookings) {
        this.totalBookings = totalBookings;
    }

    public double getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(double totalRevenue) {
        this.totalRevenue = totalRevenue;
    }
}
