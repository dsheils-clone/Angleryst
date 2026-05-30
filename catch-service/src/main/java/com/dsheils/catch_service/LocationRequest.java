package com.dsheils.catch_service;

public class LocationRequest {
    private String name;
    private String town;
    private double latitude;
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
