package com.bloodshare.controller;

import com.bloodshare.dto.DashboardStats;
import com.bloodshare.repository.BloodRequestRepository;
import com.bloodshare.repository.DonorRepository;
import com.bloodshare.repository.InboxMessageRepository;
import com.bloodshare.repository.BloodStockRepository;
import com.bloodshare.service.BloodStockTotals;
import com.bloodshare.security.CurrentAdmin;
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
    private final CurrentAdmin currentAdmin;

    public DashboardController(
            DonorRepository donorRepository,
            InboxMessageRepository inboxMessageRepository,
            BloodRequestRepository bloodRequestRepository, BloodStockRepository bloodStockRepository,
            CurrentAdmin currentAdmin
    ) {
        this.donorRepository = donorRepository;
        this.inboxMessageRepository = inboxMessageRepository;
        this.bloodRequestRepository = bloodRequestRepository;
        this.bloodStockRepository = bloodStockRepository;
        this.currentAdmin = currentAdmin;
    }

    @GetMapping("/stats")
    public DashboardStats stats() {
        var admin = currentAdmin.get();
        long requests = "SUPERADMIN".equals(admin.getRole()) ? bloodRequestRepository.count() : bloodRequestRepository.findByHospitalAddress(admin.getHospitalName()).size();
        return new DashboardStats(
                "SUPERADMIN".equals(admin.getRole()) ? donorRepository.countByActiveTrue() : 0,
                "SUPERADMIN".equals(admin.getRole()) ? donorRepository.countByActiveFalse() : 0,
                "SUPERADMIN".equals(admin.getRole()) ? inboxMessageRepository.count() : 0,
                requests
        );
    }

    @GetMapping("/analytics")
    public Map<String, Object> analytics() {
        var admin = currentAdmin.get();
        var stockRows = "SUPERADMIN".equals(admin.getRole()) ? bloodStockRepository.findAll() : bloodStockRepository.findByHospitalName(admin.getHospitalName()).stream().toList();
        List<Map<String, Object>> byGroup = BloodStockTotals.byGroup(stockRows);
        long totalUnits = BloodStockTotals.total(byGroup);
        List<Map<String, Object>> notifications = new java.util.ArrayList<>();
        byGroup.stream().filter(group -> !"Optimal".equals(group.get("status"))).forEach(group -> notifications.add(Map.of(
                "id", "stock-" + group.get("bloodGroup"),
                "title", group.get("bloodGroup") + " blood stock " + group.get("status"),
                "detail", group.get("units") + ("SUPERADMIN".equals(admin.getRole()) ? " units available across the network" : " units available at " + admin.getHospitalName()),
                "severity", "Critical".equals(group.get("status")) ? "critical" : "warning",
                "to", "/dashboard/stock")));
        var requests = "SUPERADMIN".equals(admin.getRole()) ? bloodRequestRepository.findAll() : bloodRequestRepository.findByHospitalAddress(admin.getHospitalName());
        requests.stream()
                .filter(request -> "urgent".equalsIgnoreCase(request.getUrgency()) && !"Fulfilled".equals(request.getStatus()))
                .limit(5).forEach(request -> notifications.add(Map.of(
                        "id", "request-" + request.getId(), "title", "Urgent blood request",
                        "detail", request.getBloodGroupType() + " needed at " + request.getHospitalAddress(),
                        "severity", "critical", "to", "/dashboard/requests/" + request.getId())));
        long pendingDonors = "SUPERADMIN".equals(admin.getRole()) ? donorRepository.countByActiveFalse() : 0;
        if (pendingDonors > 0) notifications.add(Map.of(
                "id", "pending-donors", "title", "Donors awaiting verification",
                "detail", pendingDonors + " registration(s) need review", "severity", "warning",
                "to", "/dashboard/inactive-donors"));

        return Map.of("stockByGroup", byGroup, "totalUnits", totalUnits,
                "monthlyDonations", List.of(), "notifications", notifications,
                "recentActivities", List.of(), "donationHistory", List.of(), "stockHistory", List.of());
    }
}
