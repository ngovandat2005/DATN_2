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
<<<<<<< HEAD
    @Query("SELECT COALESCE(SUM(dhct.soLuong), 0) FROM DonHangChiTiet dhct JOIN dhct.donHang dh WHERE dh.trangThai IN (1, 2, 3, 4) AND MONTH(dh.ngayMua) = :month AND YEAR(dh.ngayMua) = :year")
    Integer sumProductsSoldByMonthAndYear(@Param("month") int month, @Param("year") int year);

    @Query("SELECT COALESCE(SUM(dhct.soLuong), 0) FROM DonHangChiTiet dhct JOIN dhct.donHang dh WHERE dh.trangThai IN (1, 2, 3, 4) AND UPPER(dh.loaiDonHang) = UPPER(:channel) AND MONTH(dh.ngayMua) = :month AND YEAR(dh.ngayMua) = :year")
    Integer sumProductsSoldByChannelAndMonthAndYear(@Param("channel") String channel, @Param("month") int month, @Param("year") int year);
=======
    @Query("SELECT COALESCE(SUM(dhct.soLuong), 0) FROM DonHangChiTiet dhct JOIN dhct.donHang dh WHERE dh.trangThai IN (1, 4) AND dh.ngayMua BETWEEN :startDate AND :endDate")
    Integer sumProductsSoldByDateRange(@Param("startDate") java.time.LocalDate startDate, @Param("endDate") java.time.LocalDate endDate);

    @Query("SELECT COALESCE(SUM(dhct.soLuong), 0) FROM DonHangChiTiet dhct JOIN dhct.donHang dh WHERE dh.trangThai IN (1, 4) AND UPPER(dh.loaiDonHang) = UPPER(:channel) AND dh.ngayMua BETWEEN :startDate AND :endDate")
    Integer sumProductsSoldByChannelAndDateRange(@Param("channel") String channel, @Param("startDate") java.time.LocalDate startDate, @Param("endDate") java.time.LocalDate endDate);
>>>>>>> dbcc773015f481c98f8da0d3b9f78c0a448b6424

    @Query("SELECT new com.example.backend.dto.BestSellerDTO(sp.id, sp.tenSanPham, th.tenThuongHieu, SUM(CAST(dhct.soLuong AS long)), sp.images) " +
           "FROM DonHangChiTiet dhct " +
           "JOIN dhct.donHang dh " +
           "JOIN dhct.sanPhamChiTiet spct " +
           "JOIN spct.sanPham sp " +
           "LEFT JOIN sp.thuongHieu th " +
<<<<<<< HEAD
           "WHERE dh.trangThai IN (1, 2, 3, 4) " +
=======
           "WHERE dh.trangThai IN (1, 4) AND dh.ngayMua BETWEEN :startDate AND :endDate " +
>>>>>>> dbcc773015f481c98f8da0d3b9f78c0a448b6424
           "GROUP BY sp.id, sp.tenSanPham, th.tenThuongHieu, sp.images " +
           "ORDER BY SUM(CAST(dhct.soLuong AS long)) DESC")
    List<com.example.backend.dto.BestSellerDTO> getBestSellersByDateRange(@Param("startDate") java.time.LocalDate startDate, @Param("endDate") java.time.LocalDate endDate, org.springframework.data.domain.Pageable pageable);

    @Query("SELECT th.tenThuongHieu, SUM(CAST(dhct.soLuong AS long)) " +
           "FROM DonHangChiTiet dhct " +
           "JOIN dhct.donHang dh " +
           "JOIN dhct.sanPhamChiTiet spct " +
           "JOIN spct.sanPham sp " +
           "JOIN sp.thuongHieu th " +
           "WHERE dh.trangThai IN (1, 4) AND dh.ngayMua BETWEEN :startDate AND :endDate " +
           "GROUP BY th.tenThuongHieu")
    List<Object[]> countSoldByBrandInRange(@Param("startDate") java.time.LocalDate startDate, @Param("endDate") java.time.LocalDate endDate);

    @Query("SELECT COALESCE(dm.tenDanhMuc, 'Chưa phân loại'), SUM(CAST(dhct.soLuong AS long)) " +
           "FROM DonHangChiTiet dhct " +
           "JOIN dhct.donHang dh " +
           "JOIN dhct.sanPhamChiTiet spct " +
           "JOIN spct.sanPham sp " +
           "LEFT JOIN sp.danhMuc dm " +
           "WHERE dh.trangThai IN (1, 4) AND dh.ngayMua BETWEEN :startDate AND :endDate " +
           "GROUP BY COALESCE(dm.tenDanhMuc, 'Chưa phân loại')")
    List<Object[]> countSoldByCategoryInRange(@Param("startDate") java.time.LocalDate startDate, @Param("endDate") java.time.LocalDate endDate);

    @Query("SELECT COALESCE(dm.tenDanhMuc, 'Chưa phân loại'), SUM(dhct.thanhTien) " +
           "FROM DonHangChiTiet dhct " +
           "JOIN dhct.donHang dh " +
           "JOIN dhct.sanPhamChiTiet spct " +
           "JOIN spct.sanPham sp " +
           "LEFT JOIN sp.danhMuc dm " +
           "WHERE dh.trangThai IN (1, 4) AND dh.ngayMua BETWEEN :startDate AND :endDate " +
           "GROUP BY COALESCE(dm.tenDanhMuc, 'Chưa phân loại')")
    List<Object[]> sumRevenueByCategoryInRange(@Param("startDate") java.time.LocalDate startDate, @Param("endDate") java.time.LocalDate endDate);
}
