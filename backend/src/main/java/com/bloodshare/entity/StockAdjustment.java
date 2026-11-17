package com.bloodshare.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "blood_stock_adjustments")
public class StockAdjustment {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false) private String hospitalName;
    @Column(nullable = false) private String bloodGroup;
    @Column(nullable = false) private String action;
    @Column(nullable = false) private int units;
    @Column(nullable = false) private String performedBy;
    @Column(name = "event_timestamp", nullable = false) private LocalDateTime timestamp;
    @PrePersist protected void onCreate() { if (timestamp == null) timestamp = LocalDateTime.now(); }
    public Long getId() { return id; }
    public String getHospitalName() { return hospitalName; }
    public void setHospitalName(String hospitalName) { this.hospitalName = hospitalName; }
    public String getBloodGroup() { return bloodGroup; }
    public void setBloodGroup(String bloodGroup) { this.bloodGroup = bloodGroup; }
    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }
    public int getUnits() { return units; }
    public void setUnits(int units) { this.units = units; }
    public String getPerformedBy() { return performedBy; }
    public void setPerformedBy(String performedBy) { this.performedBy = performedBy; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
