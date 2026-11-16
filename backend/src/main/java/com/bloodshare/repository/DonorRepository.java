package com.bloodshare.repository;

import com.bloodshare.entity.Donor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface DonorRepository extends JpaRepository<Donor, Long> {
    List<Donor> findByActiveTrue();
    List<Donor> findByActiveFalse();
    long countByActiveTrue();
    long countByActiveFalse();

    @Query("""
            SELECT d FROM Donor d
            WHERE d.active = true AND (
                LOWER(d.name) LIKE LOWER(CONCAT('%', :query, '%')) OR
                LOWER(COALESCE(d.fatherName, '')) LIKE LOWER(CONCAT('%', :query, '%')) OR
                LOWER(COALESCE(d.gender, '')) LIKE LOWER(CONCAT('%', :query, '%')) OR
                LOWER(COALESCE(d.bloodGroup, '')) LIKE LOWER(CONCAT('%', :query, '%')) OR
                LOWER(COALESCE(d.province, '')) LIKE LOWER(CONCAT('%', :query, '%')) OR
                LOWER(COALESCE(d.district, '')) LIKE LOWER(CONCAT('%', :query, '%'))
            )
            """)
    List<Donor> searchActive(String query);
}
