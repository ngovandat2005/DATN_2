package com.example.backend.repository;

import com.example.backend.entity.SanPham;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface SanPhamInterface extends JpaRepository<SanPham, Integer> {

        // Lấy sản phẩm theo trạng thái
        List<SanPham> findAllByTrangThai(Integer trangThai);

        // Tìm theo tên sản phẩm
        Optional<SanPham> findByTenSanPhamIgnoreCase(String tenSanPham);

        // Tìm theo full điều kiện
        List<SanPham> findByTenSanPhamAndDanhMuc_IdAndThuongHieu_IdAndChatLieu_IdAndXuatXu_Id(
                        String tenSanPham,
                        Integer idDanhMuc,
                        Integer idThuongHieu,
                        Integer idChatLieu,
                        Integer idXuatXu);

        // Tìm theo danh mục + thương hiệu + chất liệu + xuất xứ
        List<SanPham> findByDanhMuc_IdAndThuongHieu_IdAndChatLieu_IdAndXuatXu_Id(
                        Integer idDanhMuc,
                        Integer idThuongHieu,
                        Integer idChatLieu,
                        Integer idXuatXu);

        // Filter linh hoạt
        @Query("""
                            SELECT s FROM SanPham s
                            WHERE (:idDanhMuc IS NULL OR s.danhMuc.id = :idDanhMuc)
                              AND (:idThuongHieu IS NULL OR s.thuongHieu.id = :idThuongHieu)
                              AND (:idChatLieu IS NULL OR s.chatLieu.id = :idChatLieu)
                              AND (:idXuatXu IS NULL OR s.xuatXu.id = :idXuatXu)
                              AND (:trangThai IS NULL OR s.trangThai = :trangThai)
                        """)
        List<SanPham> filterSanPham(
                        @Param("idDanhMuc") Integer idDanhMuc,
                        @Param("idThuongHieu") Integer idThuongHieu,
                        @Param("idChatLieu") Integer idChatLieu,
                        @Param("idXuatXu") Integer idXuatXu,
                        @Param("trangThai") Integer trangThai);

        // ✅ THÊM: Lấy danh sách sản phẩm có khuyến mãi (check qua SPCT)
        @Query("""
                            SELECT DISTINCT s FROM SanPham s
                            JOIN SanPhamChiTiet spct ON spct.sanPham.id = s.id
                            WHERE s.trangThai = 1 
                              AND spct.khuyenMai IS NOT NULL
                        """)
        List<SanPham> findByHasKhuyenMai();
}