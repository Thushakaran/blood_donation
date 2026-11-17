package com.bloodshare.controller;

import com.bloodshare.dto.ApiMessage;
import com.bloodshare.entity.BloodStock;
import com.bloodshare.repository.BloodStockRepository;
import com.bloodshare.security.CurrentAdmin;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;

@RestController
@RequestMapping("/api/hospitals")
public class HospitalController {
    private final BloodStockRepository stockRepository;
    private final CurrentAdmin currentAdmin;
    public HospitalController(BloodStockRepository stockRepository, CurrentAdmin currentAdmin) {
        this.stockRepository = stockRepository; this.currentAdmin = currentAdmin;
    }

    public record HospitalRequest(@NotBlank String hospitalName, String address, String contactNumber) {}

    @GetMapping
    public List<BloodStock> list() {
        var admin = currentAdmin.get();
        if ("SUPERADMIN".equals(admin.getRole())) return stockRepository.findAll();
        return stockRepository.findByHospitalName(admin.getHospitalName()).stream().toList();
    }

    @PostMapping
    public BloodStock create(@Valid @RequestBody HospitalRequest request) {
        currentAdmin.requireSuperAdmin();
        if (stockRepository.findByHospitalName(request.hospitalName().trim()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Hospital already exists");
        }
        BloodStock hospital = new BloodStock();
        hospital.setHospitalName(request.hospitalName().trim());
        hospital.setAddress(request.address());
        hospital.setContactNumber(request.contactNumber());
        return stockRepository.save(hospital);
    }

    @PutMapping("/{hospitalName}")
    public BloodStock update(@PathVariable String hospitalName, @RequestBody HospitalRequest request) {
        currentAdmin.requireHospital(hospitalName);
        BloodStock hospital = stockRepository.findByHospitalName(hospitalName)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Hospital not found"));
        hospital.setAddress(request.address());
        hospital.setContactNumber(request.contactNumber());
        return stockRepository.save(hospital);
    }
}
