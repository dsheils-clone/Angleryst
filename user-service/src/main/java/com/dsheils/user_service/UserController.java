package com.dsheils.user_service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/users")
public class UserController {
    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public User register(@Valid @RequestBody RegisterRequest request){
        return userService.register(request.getUsername(), request.getEmail(), request.getPassword());
    }
    @PostMapping("/login")
    public String login(@Valid @RequestBody LoginRequest request){
        return userService.login(request.getUsername(), request.getPassword());
    }
}
