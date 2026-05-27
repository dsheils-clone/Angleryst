package com.dsheils.catch_service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/catches")
public class CatchController {
    @Autowired
    private CatchService catchService;

    @PostMapping
    public Catch create(@RequestBody CatchRequest request) {
        return catchService.create(currentUserId(), request);
    }

    @GetMapping
    public List<Catch> getAll() {
        return catchService.getAllForUser(currentUserId());
    }

    @GetMapping("/{id}")
    public Catch getById(@PathVariable int id) {
        return catchService.getByIdForUser(id, currentUserId());
    }

    @PutMapping("/{id}")
    public Catch update(@PathVariable int id, @RequestBody CatchRequest request) {
        return catchService.update(id, currentUserId(), request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable int id) {
        catchService.delete(id, currentUserId());
    }

    private int currentUserId() {
        UsernamePasswordAuthenticationToken auth =
                (UsernamePasswordAuthenticationToken) SecurityContextHolder.getContext().getAuthentication();
        return (int) auth.getDetails();
    }
}
