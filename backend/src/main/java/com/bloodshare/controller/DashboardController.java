package com.bloodshare.controller;

import com.bloodshare.dto.DashboardStats;
import com.bloodshare.repository.BloodRequestRepository;
import com.bloodshare.repository.DonorRepository;
import com.bloodshare.repository.InboxMessageRepository;
import com.bloodshare.repository.BloodStockRepository;
import com.bloodshare.service.BloodStockTotals;
import com.bloodshare.security.CurrentAdmin;
import com.bloodshare.service.NotificationService;
import com.bloodshare.repository.StockAdjustmentRepository;
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
    private final NotificationService notificationService;
    private final StockAdjustmentRepository adjustmentRepository;

    public DashboardController(
            DonorRepository donorRepository,
            InboxMessageRepository inboxMessageRepository,
            BloodRequestRepository bloodRequestRepository, BloodStockRepository bloodStockRepository,
            CurrentAdmin currentAdmin, NotificationService notificationService,
            StockAdjustmentRepository adjustmentRepository
    ) {
        this.donorRepository = donorRepository;
        this.inboxMessageRepository = inboxMessageRepository;
        this.bloodRequestRepository = bloodRequestRepository;
        this.bloodStockRepository = bloodStockRepository;
        this.currentAdmin = currentAdmin;
        this.notificationService = notificationService;
        this.adjustmentRepository = adjustmentRepository;
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
        var adjustments = "SUPERADMIN".equals(admin.getRole())
                ? adjustmentRepository.findTop100ByOrderByTimestampDesc()
                : adjustmentRepository.findTop100ByHospitalNameOrderByTimestampDesc(admin.getHospitalName());
        var activities = adjustments.stream().map(item -> Map.<String, Object>of(
                "id", item.getId(), "title", "Blood stock " + item.getAction(),
                "detail", item.getUnits() + " units of " + item.getBloodGroup() + " at " + item.getHospitalName(),
                "timestamp", item.getTimestamp().toString())).toList();
        var donationHistory = "SUPERADMIN".equals(admin.getRole())
                ? donorRepository.findByActiveTrue().stream().filter(donor -> donor.getLastBloodDonatedDate() != null)
                    .sorted((a, b) -> b.getLastBloodDonatedDate().compareTo(a.getLastBloodDonatedDate()))
                    .limit(20).map(donor -> Map.<String, Object>of("id", donor.getId(), "donorName", donor.getName(),
                            "bloodGroup", java.util.Objects.toString(donor.getBloodGroup(), ""), "district", java.util.Objects.toString(donor.getDistrict(), ""),
                            "date", donor.getLastBloodDonatedDate().toString())).toList()
                : List.of();
        return Map.of("stockByGroup", byGroup, "totalUnits", totalUnits,
                "monthlyDonations", List.of(), "notifications", notificationService.refreshAndList(admin),
                "recentActivities", activities, "donationHistory", donationHistory, "stockHistory", adjustments);
    }
}
