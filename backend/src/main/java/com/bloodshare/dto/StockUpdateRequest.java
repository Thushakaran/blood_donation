package com.bloodshare.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record StockUpdateRequest(
        @NotBlank String hospitalName,
        @NotBlank String bloodGroup,
        @NotBlank String action,
        @Min(1) int units
) {
}
