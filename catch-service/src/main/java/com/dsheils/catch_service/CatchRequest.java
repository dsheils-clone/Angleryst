package com.dsheils.catch_service;

import java.time.LocalDate;

public class CatchRequest {
    private int speciesId;
    private int lureId;
    private int locationId;
    private float weight;
    private float length;
    private LocalDate dateCaught;

    public int getSpeciesId() { return speciesId; }
    public void setSpeciesId(int speciesId) { this.speciesId = speciesId; }
    public int getLureId() { return lureId; }
    public void setLureId(int lureId) { this.lureId = lureId; }
    public int getLocationId() { return locationId; }
    public void setLocationId(int locationId) { this.locationId = locationId; }
    public float getWeight() { return weight; }
    public void setWeight(float weight) { this.weight = weight; }
    public float getLength() { return length; }
    public void setLength(float length) { this.length = length; }
    public LocalDate getDateCaught() { return dateCaught; }
    public void setDateCaught(LocalDate dateCaught) { this.dateCaught = dateCaught; }
}
