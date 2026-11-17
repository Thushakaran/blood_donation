package com.bloodshare.config;

import com.bloodshare.entity.AdminUser;
import com.bloodshare.entity.BloodStock;
import com.bloodshare.repository.AdminUserRepository;
import com.bloodshare.repository.BloodStockRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {
    public static final List<String> HOSPITALS = List.of(
            "Colombo General Hospital",
            "Sri Jayewardenepura General Hospital",
            "National Hospital of Sri Lanka",
            "Kandy Teaching Hospital",
            "Ruhuna University Teaching Hospital",
            "Jaffna Teaching Hospital",
            "Anuradhapura Teaching Hospital",
            "Batticaloa Teaching Hospital",
            "Negombo General Hospital",
            "Matara General Hospital"
    );

    private final AdminUserRepository adminUserRepository;
    private final BloodStockRepository bloodStockRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.username}")
    private String adminUsername;

    @Value("${app.admin.password}")
    private String adminPassword;

    public DataSeeder(
            AdminUserRepository adminUserRepository,
            BloodStockRepository bloodStockRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.adminUserRepository = adminUserRepository;
        this.bloodStockRepository = bloodStockRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (adminUserRepository.findByUsername(adminUsername).isEmpty()) {
            AdminUser admin = new AdminUser();
            admin.setUsername(adminUsername);
            admin.setPassword(passwordEncoder.encode(adminPassword));
            admin.setRole("SUPERADMIN");
            adminUserRepository.save(admin);
        } else {
            AdminUser bootstrapAdmin = adminUserRepository.findByUsername(adminUsername).orElseThrow();
            bootstrapAdmin.setRole("SUPERADMIN");
            bootstrapAdmin.setHospitalName(null);
            adminUserRepository.save(bootstrapAdmin);
        }

        for (String hospital : HOSPITALS) {
            if (bloodStockRepository.findByHospitalName(hospital).isEmpty()) {
                BloodStock stock = new BloodStock();
                stock.setHospitalName(hospital);
                bloodStockRepository.save(stock);
            }
        }
    }
}
