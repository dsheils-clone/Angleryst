package com.dsheils.recommendation_service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;

import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.ObjectMapper;

import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class RecommendationIntegrationTest {
    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @Autowired JwtUtil jwtUtil;

    private String token;

    @BeforeEach
    void setUp() {
        token = jwtUtil.generateToken(1, "user1");
    }

    @Test
    void getRecommendations_returnsListWithCorrectContract() throws Exception {
        String json = objectMapper.writeValueAsString(
            Map.of("timeOfDay", "MORNING", "season", "SPRING", "region", "Northeast")
        );

        mockMvc.perform(post("/recommendations")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$.length()").value(4));
    }

    @Test
    void getRecommendations_allItemsHaveRequiredFields() throws Exception {
        String json = objectMapper.writeValueAsString(
            Map.of("timeOfDay", "MORNING", "season", "SPRING", "region", "Northeast")
        );

        mockMvc.perform(post("/recommendations")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].lureId").exists())
            .andExpect(jsonPath("$[0].name").exists())
            .andExpect(jsonPath("$[0].brand").exists())
            .andExpect(jsonPath("$[0].type").exists())
            .andExpect(jsonPath("$[0].source").exists())
            .andExpect(jsonPath("$[0].sponsored").exists());
    }

    @Test
    void getRecommendations_stubAlwaysReturnsSponsoredFalse() throws Exception {
        String json = objectMapper.writeValueAsString(
            Map.of("timeOfDay", "MORNING", "season", "SPRING", "region", "Northeast")
        );

        mockMvc.perform(post("/recommendations")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].sponsored").value(false))
            .andExpect(jsonPath("$[1].sponsored").value(false))
            .andExpect(jsonPath("$[2].sponsored").value(false))
            .andExpect(jsonPath("$[3].sponsored").value(false));
    }

    @Test
    void getRecommendations_includesInventoryAndSuggestedPurchaseSources() throws Exception {
        String json = objectMapper.writeValueAsString(
            Map.of("timeOfDay", "MORNING", "season", "SPRING", "region", "Northeast")
        );

        String body = mockMvc.perform(post("/recommendations")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
            .andExpect(status().isOk())
            .andReturn().getResponse().getContentAsString();

        LureRecommendation[] recs = objectMapper.readValue(body, LureRecommendation[].class);
        long inventoryCount = java.util.Arrays.stream(recs)
            .filter(r -> r.getSource() == RecommendationSource.INVENTORY).count();
        long suggestedCount = java.util.Arrays.stream(recs)
            .filter(r -> r.getSource() == RecommendationSource.SUGGESTED_PURCHASE).count();
        org.assertj.core.api.Assertions.assertThat(inventoryCount).isGreaterThan(0);
        org.assertj.core.api.Assertions.assertThat(suggestedCount).isGreaterThan(0);
    }

    @Test
    void anyEndpoint_withoutToken_isRejected() throws Exception {
        mockMvc.perform(post("/recommendations")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
            .andExpect(status().is4xxClientError());
    }
}
