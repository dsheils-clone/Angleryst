package com.dsheils.tackle_service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class TackleService {
    @Autowired private LureRepository lureRepository;
    @Autowired private InventoryRepository inventoryRepository;

    public List<Lure> getCatalog() {
        return lureRepository.findByCustomFalse();
    }

    public Lure getCatalogById(int id) {
        return lureRepository.findByIdAndCustomFalse(id)
                .orElseThrow(() -> new RuntimeException("Lure not found in catalog"));
    }

    public List<Lure> getInventory(int userId) {
        List<InventoryItem> items = inventoryRepository.findByUserId(userId);
        List<Integer> lureIds = items.stream().map(InventoryItem::getLureId).toList();
        List<Lure> owned = (List<Lure>) lureRepository.findAllById(lureIds);
        List<Lure> custom = lureRepository.findByCustomTrueAndUserId(userId);
        List<Lure> result = new ArrayList<>(owned);
        result.addAll(custom);
        return result;
    }

    public void addToInventory(int userId, int lureId) {
        lureRepository.findByIdAndCustomFalse(lureId)
                .orElseThrow(() -> new RuntimeException("Lure not found in catalog"));
        if (inventoryRepository.existsByUserIdAndLureId(userId, lureId)) {
            throw new RuntimeException("Lure already in inventory");
        }
        InventoryItem item = new InventoryItem();
        item.setUserId(userId);
        item.setLureId(lureId);
        inventoryRepository.save(item);
    }

    public void removeFromInventory(int userId, int lureId) {
        InventoryItem item = inventoryRepository.findByUserIdAndLureId(userId, lureId)
                .orElseThrow(() -> new RuntimeException("Lure not in inventory"));
        inventoryRepository.delete(item);
    }

    public Lure createCustomLure(int userId, CustomLureRequest request) {
        Lure lure = new Lure();
        lure.setName(request.getName());
        lure.setType(request.getType());
        lure.setBrand(request.getBrand());
        lure.setSize(request.getSize());
        lure.setColorFamily(request.getColorFamily());
        lure.setCustom(true);
        lure.setUserId(userId);
        return lureRepository.save(lure);
    }

    public void deleteCustomLure(int userId, int lureId) {
        Lure lure = lureRepository.findByIdAndCustomTrueAndUserId(lureId, userId)
                .orElseThrow(() -> new RuntimeException("Custom lure not found"));
        lureRepository.delete(lure);
    }
}
