package com.dsheils.tackle_service;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LureRepository extends JpaRepository<Lure, Integer> {
    List<Lure> findByCustomFalse();
    Optional<Lure> findByIdAndCustomFalse(int id);
    List<Lure> findByCustomTrueAndUserId(int userId);
    Optional<Lure> findByIdAndCustomTrueAndUserId(int id, int userId);
}
