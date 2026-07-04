package com.dsheils.tackle_service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class TackleService {
    @Autowired private LureRepository lureRepository;

    public List<Lure> getCatalog() {
        return lureRepository.findByCustomFalse();
    }

    public Lure getCatalogById(int id) {
        return lureRepository.findByIdAndCustomFalse(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Lure not found in catalog"));
    }

    public List<Lure> getCustomLures(int userId) {
        return lureRepository.findByCustomTrueAndUserId(userId);
    }

    public Lure createCustomLure(int userId, CustomLureRequest request) {
        Lure lure = new Lure();
        lure.setName(request.getName());
        lure.setType(request.getType());
        lure.setBrand(request.getBrand());
        lure.setSize(request.getSize());
        lure.setColorFamily(request.getColorFamily());
        lure.setCustom(true);
        lure.setUserId(userId);
        return lureRepository.save(lure);
    }

    public void deleteCustomLure(int userId, int lureId) {
        Lure lure = lureRepository.findByIdAndCustomTrueAndUserId(lureId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Custom lure not found"));
        lureRepository.delete(lure);
    }
}
