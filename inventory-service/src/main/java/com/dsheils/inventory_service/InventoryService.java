package com.dsheils.inventory_service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class InventoryService {
    @Autowired private InventoryRepository inventoryRepository;

    public List<UserInventory> getInventory(int userId) {
        return inventoryRepository.findByUserId(userId);
    }

    public void addToInventory(int userId, int lureId) {
        if (inventoryRepository.existsByUserIdAndLureId(userId, lureId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Lure already in inventory");
        }
        UserInventory item = new UserInventory();
        item.setUserId(userId);
        item.setLureId(lureId);
        item.setQuantity(1);
        inventoryRepository.save(item);
    }

    public UserInventory updateQuantity(int userId, int lureId, int quantity) {
        UserInventory item = inventoryRepository.findByUserIdAndLureId(userId, lureId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Lure not in inventory"));
        item.setQuantity(quantity);
        return inventoryRepository.save(item);
    }

    public void removeFromInventory(int userId, int lureId) {
        UserInventory item = inventoryRepository.findByUserIdAndLureId(userId, lureId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Lure not in inventory"));
        inventoryRepository.delete(item);
    }
}
