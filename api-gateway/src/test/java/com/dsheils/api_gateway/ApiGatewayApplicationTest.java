package com.dsheils.api_gateway;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class ApiGatewayApplicationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private GatewayProperties gatewayProperties;

    @Test
    void contextLoads() {
    }

    @Test
    void allRoutesAreConfigured() {
        assertThat(gatewayProperties.getRoutes()).containsOnlyKeys(
            "users", "catches", "locations", "species", "tackle", "inventory", "recommendations"
        );
    }

    @Test
    void unknownPath_returnsNotFound() throws Exception {
        mockMvc.perform(get("/unknown/resource"))
            .andExpect(status().isNotFound());
    }
}
