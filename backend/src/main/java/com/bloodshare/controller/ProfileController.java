package com.bloodshare.controller;

import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.HashMap;
import java.util.concurrent.ConcurrentHashMap;
import com.bloodshare.security.JwtService;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {
    private static final Map<String, Map<String,Object>> profiles = new ConcurrentHashMap<>();
    private final JwtService jwtService;
    public ProfileController(JwtService jwtService) { this.jwtService = jwtService; }
    @GetMapping
    public Map<String,Object> get(@RequestHeader("Authorization") String authorization) {
        String username = jwtService.extractUsername(authorization.substring("Bearer ".length()));
        return profiles.computeIfAbsent(username, key -> {
            Map<String, Object> defaults = new HashMap<>();
            defaults.put("fullName", key);
            defaults.put("role", "Hospital Coordinator");
            defaults.put("donorId", "ADMIN");
            defaults.put("bloodGroup", "O+");
            defaults.put("eligibleToDonate", true);
            defaults.put("hospital", "Colombo General Hospital");
            defaults.put("lastDonatedDate", "");
            defaults.put("personalDonations", java.util.List.of());
            defaults.put("email", "");
            defaults.put("phone", "");
            defaults.put("notifyUrgentRequests", true);
            defaults.put("notifyLowStock", true);
            defaults.put("notifyNewDonors", true);
            return new ConcurrentHashMap<>(defaults);
        });
    }
    @PutMapping
    public Map<String,Object> update(@RequestHeader("Authorization") String authorization, @RequestBody Map<String,Object> body) {
        String username = jwtService.extractUsername(authorization.substring("Bearer ".length()));
        Map<String,Object> profile = get(authorization);
        profile.putAll(body);
        return Map.of("message", "Profile updated successfully", "profile", profile);
    }
}
