package com.dsheils.catch_service;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;

public class LocationRequest {
    @NotBlank
    private String name;
    private String town;
    @DecimalMin("-90.0")
    @DecimalMax("90.0")
    private double latitude;
    @DecimalMin("-180.0")
    @DecimalMax("180.0")
    private double longitude;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getTown() { return town; }
    public void setTown(String town) { this.town = town; }
    public double getLatitude() { return latitude; }
    public void setLatitude(double latitude) { this.latitude = latitude; }
    public double getLongitude() { return longitude; }
    public void setLongitude(double longitude) { this.longitude = longitude; }
}
