package com.example.backend.repository;


import com.example.backend.entity.TraHangChiTiet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TraHangChiTietRepository extends JpaRepository<TraHangChiTiet, Integer> {
}