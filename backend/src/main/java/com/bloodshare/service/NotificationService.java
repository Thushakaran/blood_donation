package com.bloodshare.service;

import com.bloodshare.entity.AdminUser;
import com.bloodshare.entity.SystemNotification;
import com.bloodshare.repository.BloodRequestRepository;
import com.bloodshare.repository.BloodStockRepository;
import com.bloodshare.repository.DonorRepository;
import com.bloodshare.repository.SystemNotificationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class NotificationService {
    public record NotificationView(Long id, String title, String detail, String severity, String to,
                                   boolean active, boolean seen, LocalDateTime createdAt,
                                   LocalDateTime seenAt, LocalDateTime resolvedAt) {
        static NotificationView from(SystemNotification n) {
            return new NotificationView(n.getId(), n.getTitle(), n.getDetail(), n.getSeverity(), n.getTargetPath(),
                    n.isActive(), n.isSeen(), n.getCreatedAt(), n.getSeenAt(), n.getResolvedAt());
        }
    }
    private record Candidate(String key, String title, String detail, String severity, String to) {}

    private final SystemNotificationRepository notifications;
    private final BloodStockRepository stocks;
    private final BloodRequestRepository requests;
    private final DonorRepository donors;
    public NotificationService(SystemNotificationRepository notifications, BloodStockRepository stocks,
                               BloodRequestRepository requests, DonorRepository donors) {
        this.notifications = notifications; this.stocks = stocks; this.requests = requests; this.donors = donors;
    }

    public String scope(AdminUser admin) {
        return "SUPERADMIN".equals(admin.getRole()) ? "SUPERADMIN" : "HOSPITAL:" + admin.getHospitalName();
    }

    @Transactional
    public synchronized List<NotificationView> refreshAndList(AdminUser admin) {
        String scope = scope(admin);
        List<Candidate> candidates = new ArrayList<>();
        var stockRows = "SUPERADMIN".equals(admin.getRole()) ? stocks.findAll() : stocks.findByHospitalName(admin.getHospitalName()).stream().toList();
        BloodStockTotals.byGroup(stockRows).stream().filter(g -> !"Optimal".equals(g.get("status"))).forEach(g ->
                candidates.add(new Candidate("stock:" + g.get("bloodGroup"), g.get("bloodGroup") + " blood stock " + g.get("status"),
                        g.get("units") + ("SUPERADMIN".equals(admin.getRole()) ? " units available across the network" : " units available at " + admin.getHospitalName()),
                        "Critical".equals(g.get("status")) ? "critical" : "warning", "/dashboard/stock")));

        var requestRows = "SUPERADMIN".equals(admin.getRole()) ? requests.findAll() : requests.findByHospitalAddress(admin.getHospitalName());
        requestRows.stream().filter(r -> "urgent".equalsIgnoreCase(r.getUrgency()) && !"Fulfilled".equals(r.getStatus())).forEach(r ->
                candidates.add(new Candidate("urgent-request:" + r.getId(), "Urgent blood request",
                        r.getBloodGroupType() + " needed at " + r.getHospitalAddress(), "critical", "/dashboard/requests/" + r.getId())));
        if ("SUPERADMIN".equals(admin.getRole())) {
            long pending = donors.countByActiveFalse();
            if (pending > 0) candidates.add(new Candidate("pending-donors", "Donors awaiting verification",
                    pending + " registration(s) need review", "warning", "/dashboard/inactive-donors"));
        }

        LocalDateTime now = LocalDateTime.now();
        Map<String, SystemNotification> activeBySource = new HashMap<>();
        for (SystemNotification n : notifications.findByScopeKeyAndActiveTrue(scope)) {
            activeBySource.putIfAbsent(n.getSourceKey(), n);
        }
        for (Candidate candidate : candidates) {
            SystemNotification n = activeBySource.remove(candidate.key());
            boolean changed = n != null && (!Objects.equals(n.getTitle(), candidate.title()) || !Objects.equals(n.getDetail(), candidate.detail()) || !Objects.equals(n.getSeverity(), candidate.severity()));
            if (changed) { n.setActive(false); n.setResolvedAt(now); notifications.save(n); n = null; }
            boolean isNew = n == null;
            if (n == null) {
                n = new SystemNotification();
                n.setEventKey(UUID.randomUUID().toString());
                n.setScopeKey(scope);
                n.setSourceKey(candidate.key());
                n.setCreatedAt(now);
                n.setSeen(false);
            }
            n.setTitle(candidate.title()); n.setDetail(candidate.detail()); n.setSeverity(candidate.severity());
            n.setTargetPath(candidate.to()); n.setActive(true); n.setResolvedAt(null);
            if (isNew) n.setSeenAt(null);
            notifications.save(n);
        }
        activeBySource.values().forEach(n -> { n.setActive(false); n.setResolvedAt(now); notifications.save(n); });
        return notifications.findTop100ByScopeKeyOrderByCreatedAtDesc(scope).stream().map(NotificationView::from).toList();
    }

    @Transactional
    public int unseenCount(AdminUser admin) { return notifications.findByScopeKeyAndActiveTrueAndSeenFalse(scope(admin)).size(); }

    @Transactional
    public NotificationView markSeen(AdminUser admin, Long id) {
        SystemNotification n = notifications.findById(id).orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND, "Notification not found"));
        if (!scope(admin).equals(n.getScopeKey())) throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.FORBIDDEN, "Notification belongs to another account scope");
        if (!n.isSeen()) { n.setSeen(true); n.setSeenAt(LocalDateTime.now()); notifications.save(n); }
        return NotificationView.from(n);
    }

    @Transactional
    public void markAllSeen(AdminUser admin) {
        for (SystemNotification n : notifications.findByScopeKeyAndSeenFalse(scope(admin))) {
            n.setSeen(true); n.setSeenAt(LocalDateTime.now()); notifications.save(n);
        }
    }
}
