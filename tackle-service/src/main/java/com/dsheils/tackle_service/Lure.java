package com.dsheils.tackle_service;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "lures")
public class Lure {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    private String name;
    @Column(name = "type")
    private String type;
    private String brand;
    private String size;
    private String colorFamily;
    private String purchaseUrl;
    private String sku;
    @Column(name = "is_custom")
    private boolean custom;
    private Integer userId;

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }
    public String getSize() { return size; }
    public void setSize(String size) { this.size = size; }
    public String getColorFamily() { return colorFamily; }
    public void setColorFamily(String colorFamily) { this.colorFamily = colorFamily; }
    public String getPurchaseUrl() { return purchaseUrl; }
    public void setPurchaseUrl(String purchaseUrl) { this.purchaseUrl = purchaseUrl; }
    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }
    public boolean isCustom() { return custom; }
    public void setCustom(boolean custom) { this.custom = custom; }
    public Integer getUserId() { return userId; }
    public void setUserId(Integer userId) { this.userId = userId; }
}
