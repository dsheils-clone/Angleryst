package com.dsheils.catch_service;

import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "catches")
public class Catch {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    private int userId;
    @Column(name = "species")
    private int speciesId;
    private int lureId;
    @Column(name = "location")
    private int locationId;
    private float weight;
    private float length;
    private LocalDate dateCaught;
    private LocalDateTime createdAt;

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    public int getUserId() { return userId; }
    public void setUserId(int userId) { this.userId = userId; }
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
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
