package com.bloodshare.repository;

import com.bloodshare.entity.StockAdjustment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface StockAdjustmentRepository extends JpaRepository<StockAdjustment, Long> {
    List<StockAdjustment> findTop100ByOrderByTimestampDesc();
    List<StockAdjustment> findTop100ByHospitalNameOrderByTimestampDesc(String hospitalName);
}
