package com.bloodshare.repository;

import com.bloodshare.entity.BloodStock;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BloodStockRepository extends JpaRepository<BloodStock, Long> {
    Optional<BloodStock> findByHospitalName(String hospitalName);
}
