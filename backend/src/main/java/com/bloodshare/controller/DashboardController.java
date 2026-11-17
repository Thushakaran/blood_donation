package com.bloodshare.controller;

import com.bloodshare.dto.DashboardStats;
import com.bloodshare.repository.BloodRequestRepository;
import com.bloodshare.repository.DonorRepository;
import com.bloodshare.repository.InboxMessageRepository;
import com.bloodshare.repository.BloodStockRepository;
import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {
    private final DonorRepository donorRepository;
    private final InboxMessageRepository inboxMessageRepository;
    private final BloodRequestRepository bloodRequestRepository;
    private final BloodStockRepository bloodStockRepository;

    public DashboardController(
            DonorRepository donorRepository,
            InboxMessageRepository inboxMessageRepository,
            BloodRequestRepository bloodRequestRepository, BloodStockRepository bloodStockRepository
    ) {
        this.donorRepository = donorRepository;
        this.inboxMessageRepository = inboxMessageRepository;
        this.bloodRequestRepository = bloodRequestRepository;
        this.bloodStockRepository = bloodStockRepository;
    }

    @GetMapping("/stats")
    public DashboardStats stats() {
        return new DashboardStats(
                donorRepository.countByActiveTrue(),
                donorRepository.countByActiveFalse(),
                inboxMessageRepository.count(),
                bloodRequestRepository.count()
        );
    }

    @GetMapping("/analytics")
    public Map<String, Object> analytics() {
        var stock = bloodStockRepository.findAll();
        String[] groups = {"A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"};
        List<Map<String, Object>> byGroup = java.util.stream.IntStream.range(0, groups.length).mapToObj(i -> {
            long units = stock.stream().mapToLong(s -> switch(i) { case 0 -> s.getAPositive(); case 1 -> s.getANegative(); case 2 -> s.getBPositive(); case 3 -> s.getBNegative(); case 4 -> s.getAbPositive(); case 5 -> s.getAbNegative(); case 6 -> s.getOPositive(); default -> s.getONegative(); }).sum();
            return Map.<String,Object>of("bloodGroup", groups[i], "units", units, "status", units <= 10 ? "Critical" : units <= 30 ? "Low Stock" : "Adequate");
        }).toList();
        long totalUnits = byGroup.stream().mapToLong(m -> (long)m.get("units")).sum();
        return Map.of("stockByGroup", byGroup, "totalUnits", totalUnits, "monthlyDonations", List.of(), "notifications", List.of(), "recentActivities", List.of(), "donationHistory", List.of(), "stockHistory", List.of());
    }
}
