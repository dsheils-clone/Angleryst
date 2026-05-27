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
    private BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public User register(String username, String email, String password){
        Optional<User> usernameExists = userRepository.findByUsername(username);
        

        if(!usernameExists.isEmpty()){
            throw new RuntimeException("Username is taken!");
        }
        Optional<User> emailExists = userRepository.findByEmail(email);
        if(!emailExists.isEmpty()){
            throw new RuntimeException("Email already in use!");
        }
        return userRepository.save(new User(username, email, passwordEncoder.encode(password), LocalDateTime.now()));


    }

    public String login(String username, String password){
        Optional<User> usernameAccount = userRepository.findByUsername(username);
        if(usernameAccount.isEmpty()){
            Optional<User> emailAccount = userRepository.findByEmail(username);
            if(emailAccount.isEmpty()){
                throw new RuntimeException("Username and email not found!");
            }
            usernameAccount = emailAccount;
        }
        User userAccount = usernameAccount.get();
        if(!passwordEncoder.matches(password, userAccount.getPassword())){
            throw new RuntimeException("Incorrect Password");
        }

        return "Confirmed";

    }
}
