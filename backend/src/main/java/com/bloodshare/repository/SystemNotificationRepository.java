package com.bloodshare.repository;

import com.bloodshare.entity.SystemNotification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface SystemNotificationRepository extends JpaRepository<SystemNotification, Long> {
    Optional<SystemNotification> findByEventKey(String eventKey);
    List<SystemNotification> findByScopeKeyAndActiveTrue(String scopeKey);
    List<SystemNotification> findTop100ByScopeKeyOrderByCreatedAtDesc(String scopeKey);
    List<SystemNotification> findByScopeKeyAndActiveTrueAndSeenFalse(String scopeKey);
    List<SystemNotification> findByScopeKeyAndSeenFalse(String scopeKey);
}
