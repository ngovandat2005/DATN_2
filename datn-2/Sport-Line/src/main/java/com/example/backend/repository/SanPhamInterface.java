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

    // 2. Tìm kiếm theo tên (thuần)
    Optional<SanPham> findByTenSanPhamIgnoreCase(String tenSanPham);

    // 3. Hệ thống lọc sản phẩm Mega
    @Query("""
        SELECT s FROM SanPham s
        WHERE (:idDanhMuc IS NULL OR s.danhMuc.id = :idDanhMuc)
          AND (:idThuongHieu IS NULL OR s.thuongHieu.id = :idThuongHieu)
          AND (:search IS NULL OR s.tenSanPham LIKE %:search% OR s.ma LIKE %:search%)
          AND (s.trangThai = 1)
    """)
    List<SanPham> filterProducts(
        @Param("idDanhMuc") Integer idDanhMuc,
        @Param("idThuongHieu") Integer idThuongHieu,
        @Param("search") String search
    );

    // 4. Lấy sản phẩm mới nhất cho trang chủ
    @Query("""
        SELECT s FROM SanPham s
        WHERE s.trangThai = 1 
        ORDER BY s.id DESC
    """)
    List<SanPham> findFeaturedProducts();
}