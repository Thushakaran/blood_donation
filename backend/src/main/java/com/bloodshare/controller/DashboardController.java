package com.bloodshare.controller;

import com.bloodshare.dto.DashboardStats;
import com.bloodshare.repository.BloodRequestRepository;
import com.bloodshare.repository.DonorRepository;
import com.bloodshare.repository.InboxMessageRepository;
import com.bloodshare.repository.BloodStockRepository;
import com.bloodshare.service.BloodStockTotals;
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
        List<Map<String, Object>> byGroup = BloodStockTotals.byGroup(bloodStockRepository.findAll());
        long totalUnits = BloodStockTotals.total(byGroup);
        return Map.of("stockByGroup", byGroup, "totalUnits", totalUnits, "monthlyDonations", List.of(), "notifications", List.of(), "recentActivities", List.of(), "donationHistory", List.of(), "stockHistory", List.of());
    }
}
