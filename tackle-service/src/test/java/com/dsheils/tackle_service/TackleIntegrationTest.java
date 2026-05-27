package com.dsheils.tackle_service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.ObjectMapper;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class TackleIntegrationTest {
    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @Autowired JwtUtil jwtUtil;
    @Autowired LureRepository lureRepository;
    @Autowired InventoryRepository inventoryRepository;

    private String tokenUser1;
    private String tokenUser2;

    @BeforeEach
    void setUp() {
        tokenUser1 = jwtUtil.generateToken(1, "user1");
        tokenUser2 = jwtUtil.generateToken(2, "user2");
    }

    @Test
    void getCatalog_returnsSeededLures() throws Exception {
        saveCatalogLure("Rapala", "crankbait");
        saveCatalogLure("Zoom", "soft plastic");

        String body = mockMvc.perform(get("/tackle/catalog")
                .header("Authorization", "Bearer " + tokenUser1))
            .andExpect(status().isOk())
            .andReturn().getResponse().getContentAsString();

        Lure[] lures = objectMapper.readValue(body, Lure[].class);
        assertThat(lures).hasSize(2);
    }

    @Test
    void getCatalogById_success() throws Exception {
        Lure lure = saveCatalogLure("Strike King", "spinnerbait");

        mockMvc.perform(get("/tackle/catalog/" + lure.getId())
                .header("Authorization", "Bearer " + tokenUser1))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.name").value("Strike King"));
    }

    @Test
    void getCatalogById_notFound_fails() throws Exception {
        mockMvc.perform(get("/tackle/catalog/999")
                .header("Authorization", "Bearer " + tokenUser1))
            .andExpect(status().isBadRequest());
    }

    @Test
    void addToInventory_success() throws Exception {
        Lure lure = saveCatalogLure("Rapala", "crankbait");

        mockMvc.perform(post("/tackle/inventory/" + lure.getId())
                .header("Authorization", "Bearer " + tokenUser1))
            .andExpect(status().isOk());

        assertThat(inventoryRepository.existsByUserIdAndLureId(1, lure.getId())).isTrue();
    }

    @Test
    void addToInventory_customLure_fails() throws Exception {
        Lure custom = saveCustomLure(1, "My Jig", "jig");

        mockMvc.perform(post("/tackle/inventory/" + custom.getId())
                .header("Authorization", "Bearer " + tokenUser1))
            .andExpect(status().isBadRequest());
    }

    @Test
    void addToInventory_duplicate_fails() throws Exception {
        Lure lure = saveCatalogLure("Rapala", "crankbait");
        addToInventoryDirect(1, lure.getId());

        mockMvc.perform(post("/tackle/inventory/" + lure.getId())
                .header("Authorization", "Bearer " + tokenUser1))
            .andExpect(status().isBadRequest());
    }

    @Test
    void removeFromInventory_success() throws Exception {
        Lure lure = saveCatalogLure("Rapala", "crankbait");
        addToInventoryDirect(1, lure.getId());

        mockMvc.perform(delete("/tackle/inventory/" + lure.getId())
                .header("Authorization", "Bearer " + tokenUser1))
            .andExpect(status().isNoContent());

        assertThat(inventoryRepository.existsByUserIdAndLureId(1, lure.getId())).isFalse();
    }

    @Test
    void getInventory_includesOwnedAndCustom() throws Exception {
        Lure catalog = saveCatalogLure("Rapala", "crankbait");
        addToInventoryDirect(1, catalog.getId());
        saveCustomLure(1, "My Jig", "jig");
        saveCustomLure(2, "Other Jig", "jig");

        String body = mockMvc.perform(get("/tackle/inventory")
                .header("Authorization", "Bearer " + tokenUser1))
            .andExpect(status().isOk())
            .andReturn().getResponse().getContentAsString();

        Lure[] inventory = objectMapper.readValue(body, Lure[].class);
        assertThat(inventory).hasSize(2);
    }

    @Test
    void createCustomLure_success() throws Exception {
        String json = objectMapper.writeValueAsString(Map.of(
            "name", "My Spoon", "type", "spoon"
        ));

        mockMvc.perform(post("/tackle/custom")
                .header("Authorization", "Bearer " + tokenUser1)
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.name").value("My Spoon"))
            .andExpect(jsonPath("$.custom").value(true));
    }

    @Test
    void deleteCustomLure_success() throws Exception {
        Lure custom = saveCustomLure(1, "My Jig", "jig");

        mockMvc.perform(delete("/tackle/custom/" + custom.getId())
                .header("Authorization", "Bearer " + tokenUser1))
            .andExpect(status().isNoContent());

        assertThat(lureRepository.findById(custom.getId())).isEmpty();
    }

    @Test
    void deleteCustomLure_otherUser_fails() throws Exception {
        Lure custom = saveCustomLure(2, "User2 Jig", "jig");

        mockMvc.perform(delete("/tackle/custom/" + custom.getId())
                .header("Authorization", "Bearer " + tokenUser1))
            .andExpect(status().isBadRequest());
    }

    @Test
    void anyEndpoint_withoutToken_isRejected() throws Exception {
        mockMvc.perform(get("/tackle/catalog"))
            .andExpect(status().is4xxClientError());
    }

    private Lure saveCatalogLure(String name, String type) {
        Lure l = new Lure();
        l.setName(name);
        l.setType(type);
        l.setCustom(false);
        return lureRepository.save(l);
    }

    private Lure saveCustomLure(int userId, String name, String type) {
        Lure l = new Lure();
        l.setName(name);
        l.setType(type);
        l.setCustom(true);
        l.setUserId(userId);
        return lureRepository.save(l);
    }

    private void addToInventoryDirect(int userId, int lureId) {
        InventoryItem item = new InventoryItem();
        item.setUserId(userId);
        item.setLureId(lureId);
        inventoryRepository.save(item);
    }
}
