package com.bloodshare.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDate;

public record BloodRequestDto(
        @NotBlank String patientName,
        @NotBlank String gender,
        @NotBlank String bloodGroupType,
        @NotBlank String units,
        @NotBlank String hospitalAddress,
        @NotBlank String doctorName,
        LocalDate requiredDate,
        @NotBlank @Email String email,
        @NotBlank String contactNumber,
        @NotBlank String reason,
        String urgency
) {
}
