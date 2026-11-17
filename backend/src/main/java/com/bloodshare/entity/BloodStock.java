package com.bloodshare.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import com.fasterxml.jackson.annotation.JsonProperty;

@Entity
@Table(name = "blood_stock")
public class BloodStock {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String hospitalName;

    private int aPositive;
    private int aNegative;
    private int bPositive;
    private int bNegative;
    private int abPositive;
    private int abNegative;
    private int oPositive;
    private int oNegative;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getHospitalName() { return hospitalName; }
    public void setHospitalName(String hospitalName) { this.hospitalName = hospitalName; }
    @JsonProperty("aPositive")
    public int getAPositive() { return aPositive; }
    public void setAPositive(int aPositive) { this.aPositive = aPositive; }
    @JsonProperty("aNegative")
    public int getANegative() { return aNegative; }
    public void setANegative(int aNegative) { this.aNegative = aNegative; }
    @JsonProperty("bPositive")
    public int getBPositive() { return bPositive; }
    public void setBPositive(int bPositive) { this.bPositive = bPositive; }
    @JsonProperty("bNegative")
    public int getBNegative() { return bNegative; }
    public void setBNegative(int bNegative) { this.bNegative = bNegative; }
    public int getAbPositive() { return abPositive; }
    public void setAbPositive(int abPositive) { this.abPositive = abPositive; }
    public int getAbNegative() { return abNegative; }
    public void setAbNegative(int abNegative) { this.abNegative = abNegative; }
    @JsonProperty("oPositive")
    public int getOPositive() { return oPositive; }
    public void setOPositive(int oPositive) { this.oPositive = oPositive; }
    @JsonProperty("oNegative")
    public int getONegative() { return oNegative; }
    public void setONegative(int oNegative) { this.oNegative = oNegative; }
}
