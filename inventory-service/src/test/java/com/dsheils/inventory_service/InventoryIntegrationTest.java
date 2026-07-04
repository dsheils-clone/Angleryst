package com.dsheils.inventory_service;

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
class InventoryIntegrationTest {
    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @Autowired JwtUtil jwtUtil;
    @Autowired InventoryRepository inventoryRepository;

    private String tokenUser1;
    private String tokenUser2;

    @BeforeEach
    void setUp() {
        tokenUser1 = jwtUtil.generateToken(1, "user1");
        tokenUser2 = jwtUtil.generateToken(2, "user2");
    }

    @Test
    void addToInventory_success() throws Exception {
        mockMvc.perform(post("/inventory/42")
                .header("Authorization", "Bearer " + tokenUser1))
            .andExpect(status().isOk());

        assertThat(inventoryRepository.existsByUserIdAndLureId(1, 42)).isTrue();
    }

    @Test
    void addToInventory_setsDefaultQuantityOfOne() throws Exception {
        mockMvc.perform(post("/inventory/42")
                .header("Authorization", "Bearer " + tokenUser1))
            .andExpect(status().isOk());

        UserInventory item = inventoryRepository.findByUserIdAndLureId(1, 42).orElseThrow();
        assertThat(item.getQuantity()).isEqualTo(1);
    }

    @Test
    void addToInventory_duplicate_fails() throws Exception {
        saveItem(1, 42, 1);

        mockMvc.perform(post("/inventory/42")
                .header("Authorization", "Bearer " + tokenUser1))
            .andExpect(status().isConflict());
    }

    @Test
    void updateQuantity_success() throws Exception {
        saveItem(1, 42, 1);

        String json = objectMapper.writeValueAsString(Map.of("quantity", 5));

        mockMvc.perform(put("/inventory/42")
                .header("Authorization", "Bearer " + tokenUser1)
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.quantity").value(5))
            .andExpect(jsonPath("$.lureId").value(42));
    }

    @Test
    void updateQuantity_notInInventory_fails() throws Exception {
        String json = objectMapper.writeValueAsString(Map.of("quantity", 3));

        mockMvc.perform(put("/inventory/99")
                .header("Authorization", "Bearer " + tokenUser1)
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
            .andExpect(status().isNotFound());
    }

    @Test
    void removeFromInventory_success() throws Exception {
        saveItem(1, 42, 2);

        mockMvc.perform(delete("/inventory/42")
                .header("Authorization", "Bearer " + tokenUser1))
            .andExpect(status().isNoContent());

        assertThat(inventoryRepository.existsByUserIdAndLureId(1, 42)).isFalse();
    }

    @Test
    void removeFromInventory_notInInventory_fails() throws Exception {
        mockMvc.perform(delete("/inventory/99")
                .header("Authorization", "Bearer " + tokenUser1))
            .andExpect(status().isNotFound());
    }

    @Test
    void getInventory_returnsOnlyCallersItems() throws Exception {
        saveItem(1, 10, 1);
        saveItem(1, 20, 3);
        saveItem(2, 10, 1);

        String body = mockMvc.perform(get("/inventory")
                .header("Authorization", "Bearer " + tokenUser1))
            .andExpect(status().isOk())
            .andReturn().getResponse().getContentAsString();

        UserInventory[] items = objectMapper.readValue(body, UserInventory[].class);
        assertThat(items).hasSize(2).allMatch(i -> i.getUserId() == 1);
    }

    @Test
    void anyEndpoint_withoutToken_isRejected() throws Exception {
        mockMvc.perform(get("/inventory"))
            .andExpect(status().is4xxClientError());
    }

    private void saveItem(int userId, int lureId, int quantity) {
        UserInventory item = new UserInventory();
        item.setUserId(userId);
        item.setLureId(lureId);
        item.setQuantity(quantity);
        inventoryRepository.save(item);
    }
}
