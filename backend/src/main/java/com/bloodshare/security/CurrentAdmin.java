package com.bloodshare.security;

import com.bloodshare.entity.AdminUser;
import com.bloodshare.repository.AdminUserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

@Component
public class CurrentAdmin {
    private final AdminUserRepository repository;
    public CurrentAdmin(AdminUserRepository repository) { this.repository = repository; }

    public AdminUser get() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || !(authentication.getPrincipal() instanceof String username)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Sign in required");
        }
        return repository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Account not found"));
    }

    public AdminUser requireSuperAdmin() {
        AdminUser admin = get();
        if (!"SUPERADMIN".equals(admin.getRole())) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Super admin access required");
        return admin;
    }

    public void requireHospital(String hospitalName) {
        AdminUser admin = get();
        if ("SUPERADMIN".equals(admin.getRole())) return;
        if (!"ADMIN".equals(admin.getRole()) || admin.getHospitalName() == null || !admin.getHospitalName().equals(hospitalName)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only manage your assigned hospital");
        }
    }
}
