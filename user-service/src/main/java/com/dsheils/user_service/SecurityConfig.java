package com.dsheils.user_service;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity config){
        config.csrf(csrf -> csrf.disable());
        config.authorizeHttpRequests(auth -> auth.requestMatchers("/users/register", "/users/login").permitAll().anyRequest().authenticated());
        config.formLogin(form -> form.disable());
        return config.build();
    }
}
