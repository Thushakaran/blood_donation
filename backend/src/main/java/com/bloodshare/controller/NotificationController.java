package com.bloodshare.controller;

import com.bloodshare.dto.ApiMessage;
import com.bloodshare.security.CurrentAdmin;
import com.bloodshare.service.NotificationService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {
    private final NotificationService service;
    private final CurrentAdmin currentAdmin;
    public NotificationController(NotificationService service, CurrentAdmin currentAdmin) {
        this.service = service; this.currentAdmin = currentAdmin;
    }
    @GetMapping
    public List<NotificationService.NotificationView> list() { return service.refreshAndList(currentAdmin.get()); }
    @GetMapping("/unseen-count")
    public java.util.Map<String, Integer> unseenCount() { return java.util.Map.of("count", service.unseenCount(currentAdmin.get())); }
    @PutMapping("/{id}/seen")
    public NotificationService.NotificationView markSeen(@PathVariable Long id) { return service.markSeen(currentAdmin.get(), id); }
    @PutMapping("/seen")
    public ApiMessage markAllSeen() { service.markAllSeen(currentAdmin.get()); return new ApiMessage("Notifications marked as seen"); }
}
