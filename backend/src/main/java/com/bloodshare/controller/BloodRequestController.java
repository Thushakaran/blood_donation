package com.bloodshare.controller;

import com.bloodshare.dto.ApiMessage;
import com.bloodshare.dto.BloodRequestDto;
import com.bloodshare.entity.BloodRequest;
import com.bloodshare.repository.BloodRequestRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/requests")
public class BloodRequestController {
    private final BloodRequestRepository bloodRequestRepository;

    public BloodRequestController(BloodRequestRepository bloodRequestRepository) {
        this.bloodRequestRepository = bloodRequestRepository;
    }

    @PostMapping
    public ApiMessage create(@Valid @RequestBody BloodRequestDto dto) {
        BloodRequest request = new BloodRequest();
        request.setPatientName(dto.patientName());
        request.setGender(dto.gender());
        request.setBloodGroupType(dto.bloodGroupType());
        request.setUnits(dto.units());
        request.setHospitalAddress(dto.hospitalAddress());
        request.setDoctorName(dto.doctorName());
        request.setRequiredDate(dto.requiredDate());
        request.setEmail(dto.email());
        request.setContactNumber(dto.contactNumber());
        request.setReason(dto.reason());
        bloodRequestRepository.save(request);
        return new ApiMessage("Request successful");
    }

    @GetMapping
    public List<BloodRequest> list() {
        return bloodRequestRepository.findAll();
    }

    @DeleteMapping("/{id}")
    public ApiMessage delete(@PathVariable Long id) {
        if (!bloodRequestRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Request not found");
        }
        bloodRequestRepository.deleteById(id);
        return new ApiMessage("Request deleted");
    }
}
