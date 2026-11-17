package com.bloodshare.controller;

import com.bloodshare.dto.ApiMessage;
import com.bloodshare.dto.DonorRequest;
import com.bloodshare.entity.Donor;
import com.bloodshare.repository.DonorRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/donors")
public class DonorController {
    private final DonorRepository donorRepository;

    public DonorController(DonorRepository donorRepository) {
        this.donorRepository = donorRepository;
    }

    @PostMapping
    public ApiMessage register(@Valid @RequestBody DonorRequest request) {
        Donor donor = map(request);
        donor.setActive(false);
        donorRepository.save(donor);
        return new ApiMessage("Registration successful");
    }

    @GetMapping("/search")
    public List<Donor> search(@RequestParam(required = false) String q) {
        if (q == null || q.isBlank()) {
            return donorRepository.findByActiveTrue();
        }
        return donorRepository.searchActive(q.trim());
    }

    @GetMapping("/active")
    public List<Donor> active(@RequestParam(required = false) String q) {
        if (q == null || q.isBlank()) {
            return donorRepository.findByActiveTrue();
        }
        return donorRepository.searchActive(q.trim());
    }

    @GetMapping("/inactive")
    public List<Donor> inactive() {
        return donorRepository.findByActiveFalse();
    }

    @PutMapping("/{id}/activate")
    public ApiMessage activate(@PathVariable Long id) {
        Donor donor = donorRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Donor not found"));
        donor.setActive(true);
        donorRepository.save(donor);
        return new ApiMessage("Donor activated");
    }

    public record AvailabilityUpdate(boolean available) {}

    @PutMapping("/{id}/availability")
    public ApiMessage availability(@PathVariable Long id, @RequestBody AvailabilityUpdate update) {
        Donor donor = donorRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Donor not found"));
        donor.setAvailable(update.available()); donorRepository.save(donor);
        return new ApiMessage("Donor availability updated");
    }

    @DeleteMapping("/{id}")
    public ApiMessage delete(@PathVariable Long id) {
        if (!donorRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Donor not found");
        }
        donorRepository.deleteById(id);
        return new ApiMessage("Donor deleted");
    }

    private Donor map(DonorRequest request) {
        Donor donor = new Donor();
        donor.setName(request.name());
        donor.setFatherName(request.fatherName());
        donor.setGender(request.gender());
        donor.setDateOfBirth(request.dateOfBirth());
        donor.setBloodGroup(request.bloodGroup());
        donor.setBodyWeight(request.bodyWeight());
        donor.setEmail(request.email());
        donor.setProvince(request.province());
        donor.setDistrict(request.district());
        donor.setAddress(request.address());
        donor.setContactNumber(request.contactNumber());
        donor.setLastBloodDonatedDate(request.lastBloodDonatedDate());
        donor.setNewDonor(request.newDonor());
        return donor;
    }
}
