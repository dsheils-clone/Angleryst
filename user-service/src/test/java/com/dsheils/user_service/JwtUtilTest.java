package com.dsheils.user_service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;

class JwtUtilTest {
    private static final String SECRET = "REDACTED";

    private JwtUtil jwtUtil;

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil();
        ReflectionTestUtils.setField(jwtUtil, "secret", SECRET);
        ReflectionTestUtils.setField(jwtUtil, "expiration", 86400000L);
    }

    @Test
    void generateToken_returnsJwt() {
        String token = jwtUtil.generateToken(1, "angler");
        assertThat(token).isNotBlank().startsWith("eyJ");
    }

    @Test
    void isValid_withValidToken_returnsTrue() {
        String token = jwtUtil.generateToken(1, "angler");
        assertThat(jwtUtil.isValid(token)).isTrue();
    }

    @Test
    void isValid_withTamperedToken_returnsFalse() {
        String token = jwtUtil.generateToken(1, "angler");
        assertThat(jwtUtil.isValid(token + "tampered")).isFalse();
    }

    @Test
    void isValid_withExpiredToken_returnsFalse() {
        ReflectionTestUtils.setField(jwtUtil, "expiration", -1000L);
        String token = jwtUtil.generateToken(1, "angler");
        assertThat(jwtUtil.isValid(token)).isFalse();
    }

    @Test
    void extractUsername_returnsCorrectValue() {
        String token = jwtUtil.generateToken(42, "fisher");
        assertThat(jwtUtil.extractUsername(token)).isEqualTo("fisher");
    }
}
