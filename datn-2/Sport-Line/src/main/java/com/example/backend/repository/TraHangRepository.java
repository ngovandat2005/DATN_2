package com.example.backend.repository;


import com.example.backend.entity.TraHang; // Phải import đúng Entity
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TraHangRepository extends JpaRepository<TraHang, Integer> {
    // Kiểu đầu tiên phải là Entity TraHang, không phải TraHangRepository
}