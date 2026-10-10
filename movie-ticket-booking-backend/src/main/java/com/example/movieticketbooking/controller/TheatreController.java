package com.example.movieticketbooking.controller;

import com.example.movieticketbooking.entity.Theatre;
import com.example.movieticketbooking.service.TheatreService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/theatres")
public class TheatreController {

    private final TheatreService theatreService;

    public TheatreController(TheatreService theatreService) {
        this.theatreService = theatreService;
    }

    @GetMapping
    public List<Theatre> getAllTheatres() {
        return theatreService.getAllTheatres();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Theatre> getTheatreById(@PathVariable Integer id) {
        return theatreService.getTheatreById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Theatre createTheatre(@RequestBody Theatre theatre) {
        return theatreService.createTheatre(theatre);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Theatre> updateTheatre(
            @PathVariable Integer id,
            @RequestBody Theatre theatre) {

        try {
            return ResponseEntity.ok(
                    theatreService.updateTheatre(id, theatre)
            );
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteTheatre(@PathVariable Integer id) {
        theatreService.deleteTheatre(id);
        return ResponseEntity.noContent().build();
    }
}