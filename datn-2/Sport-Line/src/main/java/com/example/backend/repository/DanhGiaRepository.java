package com.example.backend.repository;

import com.example.backend.entity.DanhGia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DanhGiaRepository extends JpaRepository<DanhGia, Integer> {
    List<DanhGia> findBySanPhamIdOrderByNgayDanhGiaDesc(Integer sanPhamId);

    boolean existsByKhachHang_IdAndSanPham_Id(Integer idKhachHang, Integer idSanPham);

    /**
     * Kiểm tra khách hàng đã mua sản phẩm này chưa (đơn hàng trạng thái = 4 = Hoàn thành)
     */
    @Query("""
        SELECT COUNT(dhct) > 0
        FROM DonHangChiTiet dhct
        JOIN dhct.donHang dh
        JOIN dhct.sanPhamChiTiet spct
        WHERE dh.khachHang.id = :idKhachHang
          AND spct.sanPham.id = :idSanPham
          AND dh.trangThai = 4
    """)
    boolean hasCustomerPurchasedProduct(@Param("idKhachHang") Integer idKhachHang,
                                        @Param("idSanPham") Integer idSanPham);
}
