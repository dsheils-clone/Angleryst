package com.dsheils.inventory_service;

import jakarta.validation.constraints.Positive;

public class InventoryRequest {
    @Positive
    private int quantity;

    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }
}
