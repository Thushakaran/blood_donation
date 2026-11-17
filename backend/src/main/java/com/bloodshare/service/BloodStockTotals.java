package com.bloodshare.service;

import com.bloodshare.entity.BloodStock;
import java.util.List;
import java.util.Map;

/** Shared network inventory aggregation used by both public and admin overviews. */
public final class BloodStockTotals {
    private static final List<String> GROUPS = List.of("A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-");

    private BloodStockTotals() {}

    public static List<Map<String, Object>> byGroup(List<BloodStock> stock) {
        return java.util.stream.IntStream.range(0, GROUPS.size()).mapToObj(index -> {
            long units = stock.stream().mapToLong(row -> unitsFor(row, index)).sum();
            String status = units < 25 ? "Critical" : units < 50 ? "Low Stock" : "Optimal";
            return Map.<String, Object>of("bloodGroup", GROUPS.get(index), "units", units, "status", status);
        }).toList();
    }

    public static long total(List<Map<String, Object>> groups) {
        return groups.stream().mapToLong(group -> ((Number) group.get("units")).longValue()).sum();
    }

    private static long unitsFor(BloodStock row, int index) {
        return switch (index) {
            case 0 -> row.getAPositive();
            case 1 -> row.getANegative();
            case 2 -> row.getBPositive();
            case 3 -> row.getBNegative();
            case 4 -> row.getAbPositive();
            case 5 -> row.getAbNegative();
            case 6 -> row.getOPositive();
            default -> row.getONegative();
        };
    }
}
