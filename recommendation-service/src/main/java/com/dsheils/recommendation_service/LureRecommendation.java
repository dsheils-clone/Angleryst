package com.dsheils.recommendation_service;

public class LureRecommendation {
    private int lureId;
    private String name;
    private String brand;
    private String type;
    private RecommendationSource source;
    private boolean sponsored;
    private String purchaseUrl;
    private String disclosureLabel;

    public LureRecommendation(int lureId, String name, String brand, String type, RecommendationSource source) {
        this.lureId = lureId;
        this.name = name;
        this.brand = brand;
        this.type = type;
        this.source = source;
        this.sponsored = false;
        this.purchaseUrl = null;
        this.disclosureLabel = null;
    }

    public int getLureId() { return lureId; }
    public String getName() { return name; }
    public String getBrand() { return brand; }
    public String getType() { return type; }
    public RecommendationSource getSource() { return source; }
    public boolean isSponsored() { return sponsored; }
    public String getPurchaseUrl() { return purchaseUrl; }
    public String getDisclosureLabel() { return disclosureLabel; }
}
