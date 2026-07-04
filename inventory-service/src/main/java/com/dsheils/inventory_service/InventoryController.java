package com.dsheils.inventory_service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

import java.util.List;

@RestController
@RequestMapping("/inventory")
public class InventoryController {
    @Autowired private InventoryService inventoryService;

    @GetMapping
    public List<UserInventory> getInventory() {
        return inventoryService.getInventory(currentUserId());
    }

    @PostMapping("/{lureId}")
    public void addToInventory(@PathVariable int lureId) {
        inventoryService.addToInventory(currentUserId(), lureId);
    }

    @PutMapping("/{lureId}")
    public UserInventory updateQuantity(@PathVariable int lureId, @Valid @RequestBody InventoryRequest request) {
        return inventoryService.updateQuantity(currentUserId(), lureId, request.getQuantity());
    }

    @DeleteMapping("/{lureId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeFromInventory(@PathVariable int lureId) {
        inventoryService.removeFromInventory(currentUserId(), lureId);
    }

    private int currentUserId() {
        UsernamePasswordAuthenticationToken auth =
                (UsernamePasswordAuthenticationToken) SecurityContextHolder.getContext().getAuthentication();
        return (int) auth.getDetails();
    }
}
