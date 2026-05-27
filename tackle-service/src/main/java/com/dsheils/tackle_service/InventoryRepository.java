package com.dsheils.tackle_service;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface InventoryRepository extends JpaRepository<InventoryItem, Integer> {
    List<InventoryItem> findByUserId(int userId);
    Optional<InventoryItem> findByUserIdAndLureId(int userId, int lureId);
    boolean existsByUserIdAndLureId(int userId, int lureId);
}
