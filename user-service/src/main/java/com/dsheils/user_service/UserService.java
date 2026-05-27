package com.dsheils.user_service;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private JwtUtil jwtUtil;
    private BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public User register(String username, String email, String password) {
        if (!userRepository.findByUsername(username).isEmpty()) {
            throw new RuntimeException("Username is taken!");
        }
        if (!userRepository.findByEmail(email).isEmpty()) {
            throw new RuntimeException("Email already in use!");
        }
        return userRepository.save(new User(username, email, passwordEncoder.encode(password), LocalDateTime.now()));
    }

    public String login(String username, String password) {
        Optional<User> account = userRepository.findByUsername(username);
        if (account.isEmpty()) {
            account = userRepository.findByEmail(username);
        }
        if (account.isEmpty()) {
            throw new RuntimeException("Username or email not found!");
        }
        User user = account.get();
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Incorrect password");
        }
        return jwtUtil.generateToken(user.getId(), user.getUsername());
    }
}
