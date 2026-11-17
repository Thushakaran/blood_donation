package com.bloodshare.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDate;

@Entity
@Table(name = "need_blood")
public class BloodRequest {
    @Id
    @Column(name = "`Patient Id`")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "`Patient Name`")
    private String patientName;
    private String gender;
    @Column(name = "`Blood Group Type`")
    private String bloodGroupType;
    @Column(name = "`Need Unit of Blood`")
    private String units;
    @Column(name = "`Hospital Address`")
    private String hospitalAddress;
    @Column(name = "`Doctor Name`")
    private String doctorName;
    @Column(name = "`Required Date`")
    private LocalDate requiredDate;
    private String email;
    @Column(name = "`Contact Number`")
    private String contactNumber;
    private String reason;
    private String status = "Pending";
    private String urgency = "normal";

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getPatientName() { return patientName; }
    public void setPatientName(String patientName) { this.patientName = patientName; }
    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }
    public String getBloodGroupType() { return bloodGroupType; }
    public void setBloodGroupType(String bloodGroupType) { this.bloodGroupType = bloodGroupType; }
    public String getUnits() { return units; }
    public void setUnits(String units) { this.units = units; }
    public String getHospitalAddress() { return hospitalAddress; }
    public void setHospitalAddress(String hospitalAddress) { this.hospitalAddress = hospitalAddress; }
    public String getDoctorName() { return doctorName; }
    public void setDoctorName(String doctorName) { this.doctorName = doctorName; }
    public LocalDate getRequiredDate() { return requiredDate; }
    public void setRequiredDate(LocalDate requiredDate) { this.requiredDate = requiredDate; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getContactNumber() { return contactNumber; }
    public void setContactNumber(String contactNumber) { this.contactNumber = contactNumber; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getUrgency() { return urgency; }
    public void setUrgency(String urgency) { this.urgency = urgency; }
}
