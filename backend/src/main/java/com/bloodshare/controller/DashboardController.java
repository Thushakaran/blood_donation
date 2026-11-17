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
        List<Map<String, Object>> notifications = new java.util.ArrayList<>();
        byGroup.stream().filter(group -> !"Optimal".equals(group.get("status"))).forEach(group -> notifications.add(Map.of(
                "id", "stock-" + group.get("bloodGroup"),
                "title", group.get("bloodGroup") + " blood stock " + group.get("status"),
                "detail", group.get("units") + " units available across the network",
                "severity", "Critical".equals(group.get("status")) ? "critical" : "warning",
                "to", "/dashboard/stock")));
        bloodRequestRepository.findAll().stream()
                .filter(request -> "urgent".equalsIgnoreCase(request.getUrgency()) && !"Fulfilled".equals(request.getStatus()))
                .limit(5).forEach(request -> notifications.add(Map.of(
                        "id", "request-" + request.getId(), "title", "Urgent blood request",
                        "detail", request.getBloodGroupType() + " needed at " + request.getHospitalAddress(),
                        "severity", "critical", "to", "/dashboard/requests/" + request.getId())));
        long pendingDonors = donorRepository.countByActiveFalse();
        if (pendingDonors > 0) notifications.add(Map.of(
                "id", "pending-donors", "title", "Donors awaiting verification",
                "detail", pendingDonors + " registration(s) need review", "severity", "warning",
                "to", "/dashboard/inactive-donors"));

        return Map.of("stockByGroup", byGroup, "totalUnits", totalUnits,
                "monthlyDonations", List.of(), "notifications", notifications,
                "recentActivities", List.of(), "donationHistory", List.of(), "stockHistory", List.of());
    }
}
