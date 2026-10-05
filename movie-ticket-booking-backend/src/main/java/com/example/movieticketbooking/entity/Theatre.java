package com.example.movieticketbooking.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "theatres")
public class Theatre {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "theatre_id")
    private Integer theatreId;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 150)
    private String location;

    @Column(name = "total_screens")
    private Integer totalScreens;

    public Theatre() {
    }

    public Theatre(String name, String location, Integer totalScreens) {
        this.name = name;
        this.location = location;
        this.totalScreens = totalScreens;
    }

    public Integer getTheatreId() {
        return theatreId;
    }

    public void setTheatreId(Integer theatreId) {
        this.theatreId = theatreId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public Integer getTotalScreens() {
        return totalScreens;
    }

    public void setTotalScreens(Integer totalScreens) {
        this.totalScreens = totalScreens;
    }
}