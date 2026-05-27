package com.dsheils.catch_service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/locations")
public class LocationController {
    @Autowired
    private LocationRepository locationRepository;

    @GetMapping
    public List<Location> list(@RequestParam(required = false) Integer limit) {
        List<Location> all = locationRepository.findAll();
        if (limit != null && limit > 0 && limit < all.size()) {
            return all.subList(0, limit);
        }
        return all;
    }
}
