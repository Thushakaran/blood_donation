package com.bloodshare.controller;

import com.bloodshare.repository.BloodRequestRepository;
import com.bloodshare.repository.BloodStockRepository;
import com.bloodshare.repository.DonorRepository;
import com.bloodshare.entity.BloodRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.List;
import java.time.LocalDate;
import java.util.Comparator;
import com.bloodshare.service.BloodStockTotals;

@RestController
@RequestMapping("/api/public")
public class PublicController {
    private final DonorRepository donors;
    private final BloodStockRepository stock;
    private final BloodRequestRepository requests;
    public PublicController(DonorRepository donors, BloodStockRepository stock, BloodRequestRepository requests) {
        this.donors = donors; this.stock = stock; this.requests = requests;
    }
    @GetMapping("/overview")
    public Map<String, Object> overview() {
        var allStocks = stock.findAll();
        var stockByGroup = BloodStockTotals.byGroup(allStocks);
        long units = BloodStockTotals.total(stockByGroup);
        var hospitalNames = allStocks.stream().map(row -> row.getHospitalName()).sorted().toList();
        var allRequests = requests.findAll();
        var recent = allRequests.stream()
                .filter(r -> !"Fulfilled".equalsIgnoreCase(r.getStatus()))
                .filter(r -> r.getRequiredDate() == null || !r.getRequiredDate().isBefore(LocalDate.now()))
                .sorted(Comparator.comparingInt((BloodRequest r) -> urgencyRank(r.getUrgency()))
                        .thenComparing(BloodRequest::getRequiredDate,
                                Comparator.nullsLast(Comparator.<LocalDate>naturalOrder())))
                .limit(4)
                .map(r -> new PublicRequest(r.getId(), r.getBloodGroupType(), r.getUnits(),
                        r.getHospitalAddress(), r.getReason(), r.getRequiredDate(), r.getUrgency(), r.getStatus()))
                .toList();
        long fulfilled = allRequests.stream().filter(r -> "Fulfilled".equalsIgnoreCase(r.getStatus())).count();
        return Map.of("totalDonors", donors.count(), "activeDonors", donors.countByActiveTrue(), "availableUnits", units, "stockByGroup", stockByGroup, "hospitals", hospitalNames, "successfulDonations", 0L, "requestsFulfilled", fulfilled, "recentRequests", recent);
    }

    private static int urgencyRank(String urgency) {
        if (urgency == null) return 2;
        if (urgency.equalsIgnoreCase("critical")) return 0;
        if (urgency.equalsIgnoreCase("urgent")) return 1;
        return 2;
    }

    public record PublicRequest(Long id, String bloodGroupType, String units, String hospitalAddress,
                                String reason, LocalDate requiredDate, String urgency, String status) {}

    @GetMapping("/hospitals")
    public List<String> hospitals() {
        return stock.findAll().stream().map(row -> row.getHospitalName()).sorted().toList();
    }
}
