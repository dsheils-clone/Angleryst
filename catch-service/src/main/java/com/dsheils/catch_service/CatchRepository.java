package com.dsheils.catch_service;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CatchRepository extends JpaRepository<Catch, Integer> {
    List<Catch> findByUserId(int userId);
    Optional<Catch> findByIdAndUserId(int id, int userId);
}
