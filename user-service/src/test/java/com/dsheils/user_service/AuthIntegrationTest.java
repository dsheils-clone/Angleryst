package com.dsheils.user_service;

import tools.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class AuthIntegrationTest {
    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;

    // --- register ---

    @Test
    void register_success_returnsUserWithoutPassword() throws Exception {
        mockMvc.perform(post("/users/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json("angler1", "angler1@test.com", "pass123")))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.username").value("angler1"))
            .andExpect(jsonPath("$.email").value("angler1@test.com"))
            .andExpect(jsonPath("$.password").doesNotExist());
    }

    @Test
    void register_duplicateUsername_fails() throws Exception {
        mockMvc.perform(post("/users/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json("dup", "first@test.com", "pass")));

        mockMvc.perform(post("/users/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json("dup", "second@test.com", "pass")))
            .andExpect(status().isBadRequest());
    }

    @Test
    void register_duplicateEmail_fails() throws Exception {
        mockMvc.perform(post("/users/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json("user1", "shared@test.com", "pass")));

        mockMvc.perform(post("/users/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json("user2", "shared@test.com", "pass")))
            .andExpect(status().isBadRequest());
    }

    // --- login ---

    @Test
    void login_success_returnsJwt() throws Exception {
        mockMvc.perform(post("/users/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json("fisher", "fisher@test.com", "secret")));

        String token = mockMvc.perform(post("/users/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("username", "fisher", "password", "secret"))))
            .andExpect(status().isOk())
            .andReturn().getResponse().getContentAsString();

        assertThat(token).isNotBlank().startsWith("eyJ");
    }

    @Test
    void login_byEmail_success() throws Exception {
        mockMvc.perform(post("/users/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json("emailuser", "emailuser@test.com", "secret")));

        String token = mockMvc.perform(post("/users/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("username", "emailuser@test.com", "password", "secret"))))
            .andExpect(status().isOk())
            .andReturn().getResponse().getContentAsString();

        assertThat(token).isNotBlank().startsWith("eyJ");
    }

    @Test
    void login_wrongPassword_fails() throws Exception {
        mockMvc.perform(post("/users/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json("wrongpass", "wrongpass@test.com", "correct")));

        mockMvc.perform(post("/users/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("username", "wrongpass", "password", "wrong"))))
            .andExpect(status().isBadRequest());
    }

    @Test
    void login_unknownUser_fails() throws Exception {
        mockMvc.perform(post("/users/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("username", "nobody", "password", "pass"))))
            .andExpect(status().isBadRequest());
    }

    // --- JWT protection ---

    @Test
    void protectedPath_withoutToken_isRejected() throws Exception {
        mockMvc.perform(get("/protected"))
            .andExpect(status().is4xxClientError());
    }

    @Test
    void protectedPath_withInvalidToken_isRejected() throws Exception {
        mockMvc.perform(get("/protected")
                .header("Authorization", "Bearer notavalidtoken"))
            .andExpect(status().is4xxClientError());
    }

    @Test
    void protectedPath_withValidToken_isAuthenticated() throws Exception {
        mockMvc.perform(post("/users/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json("tokenuser", "token@test.com", "pass")));

        String token = mockMvc.perform(post("/users/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("username", "tokenuser", "password", "pass"))))
            .andReturn().getResponse().getContentAsString();

        // 404 means the request reached Spring MVC (authenticated); anything else means security rejected it
        mockMvc.perform(get("/protected")
                .header("Authorization", "Bearer " + token))
            .andExpect(status().isNotFound());
    }

    private String json(String username, String email, String password) throws Exception {
        return objectMapper.writeValueAsString(
                Map.of("username", username, "email", email, "password", password));
    }
}
