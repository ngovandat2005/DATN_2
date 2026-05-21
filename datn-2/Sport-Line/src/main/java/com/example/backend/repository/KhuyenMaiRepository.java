package com.example.backend.repository;

import com.example.backend.entity.KhuyenMai;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface KhuyenMaiRepository extends JpaRepository<KhuyenMai,Integer> {
    boolean existsByTenKhuyenMai(String tenKhuyenMai);
    boolean existsByTenKhuyenMaiAndIdNot(String tenKhuyenMai, Integer id);
}

