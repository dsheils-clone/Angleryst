package com.dsheils.catch_service;

import java.time.LocalDate;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Positive;

public class CatchRequest {
    @Positive
    private int speciesId;
    @Positive
    private int lureId;
    @Positive
    private int locationId;
    @Positive
    private float weight;
    @Positive
    private float length;
    @NotNull
    @PastOrPresent
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
