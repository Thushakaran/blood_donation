package com.bloodshare.controller;

import com.bloodshare.dto.ApiMessage;
import com.bloodshare.entity.AdminUser;
import com.bloodshare.repository.AdminUserRepository;
import com.bloodshare.repository.BloodStockRepository;
import com.bloodshare.security.CurrentAdmin;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;

@RestController
@RequestMapping("/api/admins")
public class AdminManagementController {
    private final AdminUserRepository adminRepository;
    private final BloodStockRepository stockRepository;
    private final PasswordEncoder passwordEncoder;
    private final CurrentAdmin currentAdmin;
    public AdminManagementController(AdminUserRepository adminRepository, BloodStockRepository stockRepository,
                                     PasswordEncoder passwordEncoder, CurrentAdmin currentAdmin) {
        this.adminRepository = adminRepository; this.stockRepository = stockRepository;
        this.passwordEncoder = passwordEncoder; this.currentAdmin = currentAdmin;
    }

    public record CreateAdminRequest(@NotBlank String username, @NotBlank @Size(min = 8) String password, @NotBlank String hospitalName) {}
    public record AdminView(Long id, String username, String role, String hospitalName) {
        static AdminView from(AdminUser admin) { return new AdminView(admin.getId(), admin.getUsername(), admin.getRole(), admin.getHospitalName()); }
    }

    @GetMapping
    public List<AdminView> list() {
        currentAdmin.requireSuperAdmin();
        return adminRepository.findAll().stream().map(AdminView::from).toList();
    }

    @PostMapping
    public AdminView create(@Valid @RequestBody CreateAdminRequest request) {
        currentAdmin.requireSuperAdmin();
        String username = request.username().trim();
        if (adminRepository.findByUsername(username).isPresent()) throw new ResponseStatusException(HttpStatus.CONFLICT, "Username already exists");
        if (stockRepository.findByHospitalName(request.hospitalName()).isEmpty()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Select an existing hospital");
        AdminUser admin = new AdminUser();
        admin.setUsername(username);
        admin.setPassword(passwordEncoder.encode(request.password()));
        admin.setRole("ADMIN");
        admin.setHospitalName(request.hospitalName());
        return AdminView.from(adminRepository.save(admin));
    }

    @DeleteMapping("/{id}")
    public ApiMessage delete(@PathVariable Long id) {
        currentAdmin.requireSuperAdmin();
        AdminUser target = adminRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Admin not found"));
        if ("SUPERADMIN".equals(target.getRole())) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Super admin accounts cannot be removed here");
        adminRepository.delete(target);
        return new ApiMessage("Hospital admin removed");
    }
}
