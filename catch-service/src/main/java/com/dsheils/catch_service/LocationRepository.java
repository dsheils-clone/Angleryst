package com.dsheils.catch_service;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface LocationRepository extends JpaRepository<Location, Integer> {
    @Query("SELECT l FROM Location l WHERE l.isPublic = true OR l.userId = :userId")
    List<Location> findVisibleForUser(@Param("userId") int userId);
}
