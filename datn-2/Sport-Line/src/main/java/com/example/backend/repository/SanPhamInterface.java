package com.example.backend.repository;

import com.example.backend.entity.SanPham;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface SanPhamInterface extends JpaRepository<SanPham, Integer> {

    // 0. Lấy tất cả sản phẩm đang kinh doanh
    List<SanPham> findAllByTrangThai(Integer trangThai);

    // 1. Lấy sản phẩm đang kinh doanh theo giới tính
    List<SanPham> findAllByTrangThaiAndGioiTinh(Integer trangThai, Integer gioiTinh);

    // 2. Tìm kiếm theo tên (thuần)
    Optional<SanPham> findByTenSanPhamIgnoreCase(String tenSanPham);

    // 3. Hệ thống lọc sản phẩm Mega (Hỗ trợ lọc theo giới tính)
    @Query("""
        SELECT s FROM SanPham s
        WHERE (:gioiTinh IS NULL OR s.gioiTinh = :gioiTinh)
          AND (:idDanhMuc IS NULL OR s.danhMuc.id = :idDanhMuc)
          AND (:idThuongHieu IS NULL OR s.thuongHieu.id = :idThuongHieu)
          AND (:search IS NULL OR s.tenSanPham LIKE %:search% OR s.ma LIKE %:search%)
          AND (s.trangThai = 1)
    """)
    List<SanPham> filterProducts(
        @Param("gioiTinh") Integer gioiTinh,
        @Param("idDanhMuc") Integer idDanhMuc,
        @Param("idThuongHieu") Integer idThuongHieu,
        @Param("search") String search
    );

    // 4. Lấy sản phẩm mới nhất theo giới tính cho trang chủ (Cập nhật: không bắt buộc KM để tránh trống menu)
    @Query("""
        SELECT s FROM SanPham s
        WHERE s.trangThai = 1 
          AND s.gioiTinh = :gioiTinh
        ORDER BY s.id DESC
    """)
    List<SanPham> findFeaturedByGender(@Param("gioiTinh") Integer gioiTinh);
}