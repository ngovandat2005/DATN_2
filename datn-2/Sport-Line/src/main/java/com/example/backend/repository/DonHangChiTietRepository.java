package com.example.backend.repository;

import com.example.backend.dto.DonHangChiTietDTO;
import com.example.backend.entity.DonHangChiTiet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DonHangChiTietRepository extends JpaRepository<DonHangChiTiet,Integer> {

    @Modifying
    @Query("DELETE FROM DonHangChiTiet d WHERE d.donHang.id = :idDonHang")
    void deleteByDonHangId(@Param("idDonHang") Integer idDonHang);
    Optional<DonHangChiTiet> findByDonHang_IdAndSanPhamChiTiet_Id(Integer idDonHang, Integer idSanPhamChiTiet);
    @Query("""
    SELECT new com.example.backend.dto.DonHangChiTietDTO(
        dhct.id,
        dhct.donHang.id,
        dhct.sanPhamChiTiet.id,
        dhct.soLuong,
        dhct.gia,
        dhct.thanhTien
    )
    FROM DonHangChiTiet dhct
    JOIN dhct.sanPhamChiTiet spct
    JOIN spct.sanPham sp
    WHERE dhct.donHang.id = :id
    AND spct.trangThai = 1
    AND sp.trangThai = 1
    
""")
    List<DonHangChiTietDTO> findByDonHangId(@Param("id") Integer id);

    List<DonHangChiTiet> findByDonHang_Id(Integer donHangId);

    // Thống kê Queries
    @Query("SELECT COALESCE(SUM(dhct.soLuong), 0) FROM DonHangChiTiet dhct JOIN dhct.donHang dh WHERE dh.trangThai IN (1, 2, 3, 4) AND MONTH(dh.ngayMua) = :month AND YEAR(dh.ngayMua) = :year")
    Integer sumProductsSoldByMonthAndYear(@Param("month") int month, @Param("year") int year);

    @Query("SELECT COALESCE(SUM(dhct.soLuong), 0) FROM DonHangChiTiet dhct JOIN dhct.donHang dh WHERE dh.trangThai IN (1, 2, 3, 4) AND UPPER(dh.loaiDonHang) = UPPER(:channel) AND MONTH(dh.ngayMua) = :month AND YEAR(dh.ngayMua) = :year")
    Integer sumProductsSoldByChannelAndMonthAndYear(@Param("channel") String channel, @Param("month") int month, @Param("year") int year);

    @Query("SELECT new com.example.backend.dto.BestSellerDTO(sp.id, sp.tenSanPham, th.tenThuongHieu, SUM(CAST(dhct.soLuong AS long)), sp.images) " +
           "FROM DonHangChiTiet dhct " +
           "JOIN dhct.donHang dh " +
           "JOIN dhct.sanPhamChiTiet spct " +
           "JOIN spct.sanPham sp " +
           "LEFT JOIN sp.thuongHieu th " +
           "WHERE dh.trangThai IN (1, 2, 3, 4) " +
           "GROUP BY sp.id, sp.tenSanPham, th.tenThuongHieu, sp.images " +
           "ORDER BY SUM(CAST(dhct.soLuong AS long)) DESC")
    List<com.example.backend.dto.BestSellerDTO> getBestSellers(org.springframework.data.domain.Pageable pageable);
}








