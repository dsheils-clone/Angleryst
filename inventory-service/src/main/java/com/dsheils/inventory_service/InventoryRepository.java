package com.dsheils.inventory_service;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface InventoryRepository extends JpaRepository<UserInventory, Integer> {
    List<UserInventory> findByUserId(int userId);
    Optional<UserInventory> findByUserIdAndLureId(int userId, int lureId);
    boolean existsByUserIdAndLureId(int userId, int lureId);
}
