package com.dsheils.user_service;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private JwtUtil jwtUtil;
    private BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public User register(String username, String email, String password) {
        if (userRepository.findByUsername(username).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username is taken");
        }
        if (userRepository.findByEmail(email).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already in use");
        }
        return userRepository.save(new User(username, email, passwordEncoder.encode(password), LocalDateTime.now()));
    }

    public String login(String username, String password) {
        Optional<User> account = userRepository.findByUsername(username);
        if (account.isEmpty()) {
            account = userRepository.findByEmail(username);
        }
        // One generic 401 for both an unknown account and a wrong password, so the
        // response can't be used to enumerate which usernames/emails exist.
        User user = account
                .filter(u -> passwordEncoder.matches(password, u.getPassword()))
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "Invalid username or password"));
        return jwtUtil.generateToken(user.getId(), user.getUsername());
    }
}
