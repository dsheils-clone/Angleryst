package com.dsheils.recommendation_service;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RecommendationService {

    public List<LureRecommendation> getRecommendations(RecommendationRequest request) {
        return List.of(
            new LureRecommendation(1, "Rapala Original Floater", "Rapala", "Crankbait", RecommendationSource.INVENTORY),
            new LureRecommendation(2, "Zoom Trick Worm", "Zoom", "Soft Plastic", RecommendationSource.INVENTORY),
            new LureRecommendation(3, "Strike King Rage Tail Craw", "Strike King", "Soft Plastic", RecommendationSource.SUGGESTED_PURCHASE),
            new LureRecommendation(4, "Heddon Torpedo", "Heddon", "Topwater", RecommendationSource.SUGGESTED_PURCHASE)
        );
    }
}
