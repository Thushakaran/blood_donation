package com.bloodshare.controller;

import com.bloodshare.dto.ApiMessage;
import com.bloodshare.dto.StockUpdateRequest;
import com.bloodshare.entity.BloodStock;
import com.bloodshare.repository.BloodStockRepository;
import com.bloodshare.security.CurrentAdmin;
import com.bloodshare.entity.StockAdjustment;
import com.bloodshare.repository.StockAdjustmentRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import org.springframework.transaction.annotation.Transactional;

@RestController
@RequestMapping("/api/stock")
public class BloodStockController {
    private final BloodStockRepository bloodStockRepository;
    private final CurrentAdmin currentAdmin;
    private final StockAdjustmentRepository adjustmentRepository;

    public BloodStockController(BloodStockRepository bloodStockRepository, CurrentAdmin currentAdmin,
                                StockAdjustmentRepository adjustmentRepository) {
        this.bloodStockRepository = bloodStockRepository;
        this.currentAdmin = currentAdmin;
        this.adjustmentRepository = adjustmentRepository;
    }

    @GetMapping
    public List<BloodStock> list() {
        var admin = currentAdmin.get();
        if ("SUPERADMIN".equals(admin.getRole())) return bloodStockRepository.findAll();
        return bloodStockRepository.findByHospitalName(admin.getHospitalName()).stream().toList();
    }

    @PutMapping
    @Transactional
    public ApiMessage update(@Valid @RequestBody StockUpdateRequest request) {
        currentAdmin.requireHospital(request.hospitalName());
        if (!"increase".equalsIgnoreCase(request.action()) && !"decrease".equalsIgnoreCase(request.action())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Action must be increase or decrease");
        }
        BloodStock stock = bloodStockRepository.findByHospitalName(request.hospitalName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Hospital not found"));

        int current = getUnits(stock, request.bloodGroup());
        long proposed = "decrease".equalsIgnoreCase(request.action())
                ? Math.max(0L, (long) current - request.units())
                : (long) current + request.units();
        if (proposed > Integer.MAX_VALUE) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Stock value is too large");
        int next = (int) proposed;
        setUnits(stock, request.bloodGroup(), next);
        bloodStockRepository.save(stock);
        StockAdjustment adjustment = new StockAdjustment();
        adjustment.setHospitalName(stock.getHospitalName());
        adjustment.setBloodGroup(normalize(request.bloodGroup()));
        adjustment.setAction("decrease".equalsIgnoreCase(request.action()) ? "decrease" : "increase");
        adjustment.setUnits(Math.abs(next - current));
        adjustment.setPerformedBy(currentAdmin.get().getUsername());
        adjustmentRepository.save(adjustment);
        return new ApiMessage("Stock updated successfully");
    }

    private int getUnits(BloodStock stock, String group) {
        return switch (normalize(group)) {
            case "A+" -> stock.getAPositive();
            case "A-" -> stock.getANegative();
            case "B+" -> stock.getBPositive();
            case "B-" -> stock.getBNegative();
            case "AB+" -> stock.getAbPositive();
            case "AB-" -> stock.getAbNegative();
            case "O+" -> stock.getOPositive();
            case "O-" -> stock.getONegative();
            default -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown blood group");
        };
    }

    private void setUnits(BloodStock stock, String group, int units) {
        switch (normalize(group)) {
            case "A+" -> stock.setAPositive(units);
            case "A-" -> stock.setANegative(units);
            case "B+" -> stock.setBPositive(units);
            case "B-" -> stock.setBNegative(units);
            case "AB+" -> stock.setAbPositive(units);
            case "AB-" -> stock.setAbNegative(units);
            case "O+" -> stock.setOPositive(units);
            case "O-" -> stock.setONegative(units);
            default -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown blood group");
        }
    }

    private String normalize(String group) {
        return switch (group) {
            case "A_positive" -> "A+";
            case "A_negative" -> "A-";
            case "B_positive" -> "B+";
            case "B_negative" -> "B-";
            case "AB_positive" -> "AB+";
            case "AB_negative" -> "AB-";
            case "O_positive" -> "O+";
            case "O_negative" -> "O-";
            default -> group;
        };
    }
}
