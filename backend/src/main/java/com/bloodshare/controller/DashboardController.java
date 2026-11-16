package com.bloodshare.controller;

import com.bloodshare.dto.DashboardStats;
import com.bloodshare.repository.BloodRequestRepository;
import com.bloodshare.repository.DonorRepository;
import com.bloodshare.repository.InboxMessageRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {
    private final DonorRepository donorRepository;
    private final InboxMessageRepository inboxMessageRepository;
    private final BloodRequestRepository bloodRequestRepository;

    public DashboardController(
            DonorRepository donorRepository,
            InboxMessageRepository inboxMessageRepository,
            BloodRequestRepository bloodRequestRepository
    ) {
        this.donorRepository = donorRepository;
        this.inboxMessageRepository = inboxMessageRepository;
        this.bloodRequestRepository = bloodRequestRepository;
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
}
