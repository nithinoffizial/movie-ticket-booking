package com.example.movieticketbooking.repository;

import com.example.movieticketbooking.entity.Seat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SeatRepository extends JpaRepository<Seat, Integer> {

    @Query("SELECT s FROM Seat s WHERE s.show.showId = :showId ORDER BY SUBSTRING(s.seatNumber, 1, 1) ASC, CAST(SUBSTRING(s.seatNumber, 2) AS int) ASC")
    List<Seat> findByShowShowIdOrdered(@Param("showId") Integer showId);

    List<Seat> findByShowShowId(Integer showId);

    List<Seat> findByShowShowIdAndSeatNumberIn(Integer showId, List<String> seatNumbers);
}
