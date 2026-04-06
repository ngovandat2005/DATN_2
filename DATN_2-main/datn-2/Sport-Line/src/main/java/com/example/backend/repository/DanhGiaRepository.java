package com.example.backend.repository;

import com.example.backend.entity.DanhGia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DanhGiaRepository extends JpaRepository<DanhGia, Integer> {
    @Query("SELECT COUNT(dg) FROM DanhGia dg WHERE dg.khachHang.id = :khId AND dg.sanPham.id = :spId")
    long countReviewsSent(@Param("khId") Integer khachHangId, @Param("spId") Integer sanPhamId);
    List<DanhGia> findBySanPhamIdOrderByNgayDanhGiaDesc(Integer sanPhamId);
}
