package com.bloodshare.dto;

public record DashboardStats(
        long activeDonors,
        long inactiveDonors,
        long inboxMessages,
        long bloodRequests
) {
}
