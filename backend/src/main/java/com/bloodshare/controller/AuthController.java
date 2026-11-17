package com.bloodshare.controller;

import com.bloodshare.dto.LoginRequest;
import com.bloodshare.dto.LoginResponse;
import com.bloodshare.repository.AdminUserRepository;
import com.bloodshare.security.JwtService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AdminUserRepository adminUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthController(
            AdminUserRepository adminUserRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService
    ) {
        this.adminUserRepository = adminUserRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        var admin = adminUserRepository.findByUsername(request.username())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Username or password do not match"));
        if (!passwordEncoder.matches(request.password(), admin.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Username or password do not match");
        }
        return new LoginResponse(jwtService.generateToken(admin.getUsername()), admin.getUsername(), admin.getRole(), admin.getHospitalName());
    }

    @GetMapping("/me")
    public LoginResponse me(@RequestHeader("Authorization") String authorization) {
        String token = authorization.replace("Bearer ", "");
        String username = jwtService.extractUsername(token);
        var admin = adminUserRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Account not found"));
        return new LoginResponse(token, username, admin.getRole(), admin.getHospitalName());
    }
}
