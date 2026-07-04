package com.dsheils.recommendation_service;

import jakarta.validation.constraints.NotBlank;

public class RecommendationRequest {
    @NotBlank
    private String timeOfDay;   // MORNING, AFTERNOON, EVENING
    @NotBlank
    private String season;      // SPRING, SUMMER, FALL, WINTER
    private String region;

    public String getTimeOfDay() { return timeOfDay; }
    public void setTimeOfDay(String timeOfDay) { this.timeOfDay = timeOfDay; }
    public String getSeason() { return season; }
    public void setSeason(String season) { this.season = season; }
    public String getRegion() { return region; }
    public void setRegion(String region) { this.region = region; }
}
