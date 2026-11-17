package com.bloodshare.controller;

import com.bloodshare.repository.BloodRequestRepository;
import com.bloodshare.repository.BloodStockRepository;
import com.bloodshare.repository.DonorRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.List;
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
        var stockByGroup = BloodStockTotals.byGroup(stock.findAll());
        long units = BloodStockTotals.total(stockByGroup);
        var recent = requests.findAll().stream().filter(r -> !"Fulfilled".equals(r.getStatus())).limit(4).toList();
        long fulfilled = requests.findAll().stream().filter(r -> "Fulfilled".equals(r.getStatus())).count();
        return Map.of("totalDonors", donors.count(), "activeDonors", donors.countByActiveTrue(), "availableUnits", units, "stockByGroup", stockByGroup, "successfulDonations", 0L, "requestsFulfilled", fulfilled, "recentRequests", recent);
    }
}
