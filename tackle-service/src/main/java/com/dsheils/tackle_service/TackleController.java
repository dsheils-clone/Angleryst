package com.dsheils.tackle_service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/tackle")
public class TackleController {
    @Autowired private TackleService tackleService;

    @GetMapping("/catalog")
    public List<Lure> getCatalog() {
        return tackleService.getCatalog();
    }

    @GetMapping("/catalog/{id}")
    public Lure getCatalogById(@PathVariable int id) {
        return tackleService.getCatalogById(id);
    }

    @GetMapping("/inventory")
    public List<Lure> getInventory() {
        return tackleService.getInventory(currentUserId());
    }

    @PostMapping("/inventory/{lureId}")
    public void addToInventory(@PathVariable int lureId) {
        tackleService.addToInventory(currentUserId(), lureId);
    }

    @DeleteMapping("/inventory/{lureId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeFromInventory(@PathVariable int lureId) {
        tackleService.removeFromInventory(currentUserId(), lureId);
    }

    @PostMapping("/custom")
    public Lure createCustomLure(@RequestBody CustomLureRequest request) {
        return tackleService.createCustomLure(currentUserId(), request);
    }

    @DeleteMapping("/custom/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteCustomLure(@PathVariable int id) {
        tackleService.deleteCustomLure(currentUserId(), id);
    }

    private int currentUserId() {
        UsernamePasswordAuthenticationToken auth =
                (UsernamePasswordAuthenticationToken) SecurityContextHolder.getContext().getAuthentication();
        return (int) auth.getDetails();
    }
}
