package com.bloodshare.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record InboxRequest(
        @NotBlank String fullName,
        @NotBlank String phoneNumber,
        @NotBlank @Email String email,
        @NotBlank String hospital,
        @NotBlank String message
) {
}
