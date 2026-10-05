package com.example.movieticketbooking.controller;

import com.example.movieticketbooking.entity.Show;
import com.example.movieticketbooking.service.ShowService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/shows")
public class ShowController {

    private final ShowService showService;

    public ShowController(ShowService showService) {
        this.showService = showService;
    }

    @GetMapping
    public List<Show> getAllShows() {
        return showService.getAllShows();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Show> getShowById(@PathVariable Integer id) {
        return showService.getShowById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Show createShow(@RequestBody Show show) {
        return showService.createShow(show);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Show> updateShow(
            @PathVariable Integer id,
            @RequestBody Show show) {

        try {
            return ResponseEntity.ok(
                    showService.updateShow(id, show)
            );
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteShow(@PathVariable Integer id) {
        showService.deleteShow(id);
        return ResponseEntity.noContent().build();
    }
}