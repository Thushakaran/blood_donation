package com.bloodshare.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDate;

public record DonorRequest(
        @NotBlank String name,
        @NotBlank String fatherName,
        @NotBlank String gender,
        LocalDate dateOfBirth,
        @NotBlank String bloodGroup,
        @NotBlank String bodyWeight,
        @NotBlank @Email String email,
        @NotBlank String province,
        @NotBlank String district,
        @NotBlank String address,
        @NotBlank String contactNumber,
        LocalDate lastBloodDonatedDate,
        boolean newDonor
) {
}
