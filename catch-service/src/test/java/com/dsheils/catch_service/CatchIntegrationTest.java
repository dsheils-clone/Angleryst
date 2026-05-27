package com.dsheils.catch_service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.ObjectMapper;

import java.time.LocalDate;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class CatchIntegrationTest {
    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @Autowired JwtUtil jwtUtil;
    @Autowired CatchRepository catchRepository;

    private String tokenUser1;
    private String tokenUser2;

    @BeforeEach
    void setUp() {
        tokenUser1 = jwtUtil.generateToken(1, "user1");
        tokenUser2 = jwtUtil.generateToken(2, "user2");
    }

    @Test
    void createCatch_success() throws Exception {
        mockMvc.perform(post("/catches")
                .header("Authorization", "Bearer " + tokenUser1)
                .contentType(MediaType.APPLICATION_JSON)
                .content(catchJson()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.userId").value(1))
            .andExpect(jsonPath("$.weight").value(3.5))
            .andExpect(jsonPath("$.length").value(14.0));
    }

    @Test
    void getAllCatches_returnsOnlyCallersCatches() throws Exception {
        saveCatchForUser(1);
        saveCatchForUser(1);
        saveCatchForUser(2);

        String body = mockMvc.perform(get("/catches")
                .header("Authorization", "Bearer " + tokenUser1))
            .andExpect(status().isOk())
            .andReturn().getResponse().getContentAsString();

        Catch[] catches = objectMapper.readValue(body, Catch[].class);
        assertThat(catches).hasSize(2).allMatch(c -> c.getUserId() == 1);
    }

    @Test
    void getCatchById_success() throws Exception {
        Catch saved = saveCatchForUser(1);

        mockMvc.perform(get("/catches/" + saved.getId())
                .header("Authorization", "Bearer " + tokenUser1))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(saved.getId()));
    }

    @Test
    void getCatchById_otherUsersCatch_fails() throws Exception {
        Catch saved = saveCatchForUser(2);

        mockMvc.perform(get("/catches/" + saved.getId())
                .header("Authorization", "Bearer " + tokenUser1))
            .andExpect(status().isBadRequest());
    }

    @Test
    void updateCatch_success() throws Exception {
        Catch saved = saveCatchForUser(1);

        String updated = objectMapper.writeValueAsString(Map.of(
            "speciesId", 2, "lureId", 2, "locationId", 2,
            "weight", 5.0, "length", 18.0, "dateCaught", "2026-05-01"
        ));

        mockMvc.perform(put("/catches/" + saved.getId())
                .header("Authorization", "Bearer " + tokenUser1)
                .contentType(MediaType.APPLICATION_JSON)
                .content(updated))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.weight").value(5.0))
            .andExpect(jsonPath("$.length").value(18.0));
    }

    @Test
    void deleteCatch_success() throws Exception {
        Catch saved = saveCatchForUser(1);

        mockMvc.perform(delete("/catches/" + saved.getId())
                .header("Authorization", "Bearer " + tokenUser1))
            .andExpect(status().isNoContent());

        assertThat(catchRepository.findByIdAndUserId(saved.getId(), 1)).isEmpty();
    }

    @Test
    void anyEndpoint_withoutToken_isRejected() throws Exception {
        mockMvc.perform(get("/catches"))
            .andExpect(status().is4xxClientError());
    }

    private Catch saveCatchForUser(int userId) {
        Catch c = new Catch();
        c.setUserId(userId);
        c.setSpeciesId(1);
        c.setLureId(1);
        c.setLocationId(1);
        c.setWeight(3.5f);
        c.setLength(14.0f);
        c.setDateCaught(LocalDate.of(2026, 5, 1));
        return catchRepository.save(c);
    }

    private String catchJson() throws Exception {
        return objectMapper.writeValueAsString(Map.of(
            "speciesId", 1, "lureId", 1, "locationId", 1,
            "weight", 3.5, "length", 14.0, "dateCaught", "2026-05-01"
        ));
    }
}
