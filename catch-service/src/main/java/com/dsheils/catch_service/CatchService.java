package com.dsheils.catch_service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class CatchService {
    @Autowired
    private CatchRepository catchRepository;

    public Catch create(int userId, CatchRequest request) {
        Catch c = new Catch();
        c.setUserId(userId);
        c.setSpeciesId(request.getSpeciesId());
        c.setLureId(request.getLureId());
        c.setLocationId(request.getLocationId());
        c.setWeight(request.getWeight());
        c.setLength(request.getLength());
        c.setDateCaught(request.getDateCaught());
        c.setCreatedAt(LocalDateTime.now());
        return catchRepository.save(c);
    }

    public List<Catch> getAllForUser(int userId) {
        return catchRepository.findByUserId(userId);
    }

    public Catch getByIdForUser(int id, int userId) {
        return catchRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new RuntimeException("Catch not found"));
    }

    public Catch update(int id, int userId, CatchRequest request) {
        Catch c = getByIdForUser(id, userId);
        c.setSpeciesId(request.getSpeciesId());
        c.setLureId(request.getLureId());
        c.setLocationId(request.getLocationId());
        c.setWeight(request.getWeight());
        c.setLength(request.getLength());
        c.setDateCaught(request.getDateCaught());
        return catchRepository.save(c);
    }

    public void delete(int id, int userId) {
        Catch c = getByIdForUser(id, userId);
        catchRepository.delete(c);
    }
}
