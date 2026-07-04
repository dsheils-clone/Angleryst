package com.dsheils.tackle_service;

import jakarta.validation.constraints.NotBlank;

public class CustomLureRequest {
    @NotBlank
    private String name;
    @NotBlank
    private String type;
    private String brand;
    private String size;
    private String colorFamily;

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
}
