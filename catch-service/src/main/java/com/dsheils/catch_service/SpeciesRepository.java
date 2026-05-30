package com.dsheils.catch_service;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface SpeciesRepository extends JpaRepository<Species, Integer> {
    Optional<Species> findByName(String name);
}
