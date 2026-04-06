package com.example.backend.repository;

import com.example.backend.entity.DonHang;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DonHangRepository extends JpaRepository<DonHang, Integer> {
//    List<DonHang> getAllByTrangThai(Integer id);
    @EntityGraph(attributePaths = {"donHangChiTiets"})
    @Query("SELECT d FROM DonHang d WHERE (:trangThai IS NULL OR d.trangThai = :trangThai) AND (:loai IS NULL OR LOWER(d.loaiDonHang) LIKE LOWER(CONCAT('%', :loai, '%')))")
    List<DonHang> findByTrangThaiAndLoaiDonHang(@Param("trangThai") Integer trangThai, @Param("loai") String loaiDonHang);

    @EntityGraph(attributePaths = {"donHangChiTiets"})
    @Query("SELECT d FROM DonHang d WHERE LOWER(d.loaiDonHang) = LOWER(:loai)")
    List<DonHang> findByLoaiDonHangOnly(@Param("loai") String loaiDonHang);

    @EntityGraph(attributePaths = {"donHangChiTiets"})
    @Query("SELECT d FROM DonHang d WHERE d.trangThai = :trangThai AND LOWER(d.loaiDonHang) = LOWER(:loai)")
    List<DonHang> findByTrangThaiAndLoaiDonHangOnly(@Param("trangThai") Integer trangThai, @Param("loai") String loaiDonHang);

    @EntityGraph(attributePaths = {"donHangChiTiets"})
    List<DonHang> findByKhachHangIdOrderByNgayTaoDesc(Integer idKhachHang);
    List<DonHang> findByKhachHangIdAndTrangThaiOrderByNgayTaoDesc(Integer idKhachHang, Integer trangThai);

    @EntityGraph(attributePaths = {"donHangChiTiets"})
    List<DonHang> findByKhachHangIdAndTrangThaiOrderByNgayTaoDesc(Integer idKhachHang, Integer trangThai);

    // Dùng trong admin lọc đơn theo trạng thái
    @EntityGraph(attributePaths = {"donHangChiTiets"})
    List<DonHang> findByTrangThai(Integer trangThai);

    // Tổng doanh thu (Chỉ tính đơn hợp lệ)
    @Query("SELECT SUM(d.tongTien) FROM DonHang d WHERE d.trangThai IN (1, 2, 3, 4)")
    double sumTongTien();

    // Đếm đơn theo trạng thái
    int countByTrangThai(Integer trangThai);

    @EntityGraph(attributePaths = {"donHangChiTiets"})
    @Query("SELECT d FROM DonHang d WHERE d.id = :id")
    DonHang findWithChiTiet(@Param("id") Integer id);

    // Đếm đơn theo trạng thái
    List<DonHang> findAllByGiamGia_Id(Integer idVoucher);

<<<<<<< HEAD
    // Thống kê Queries
    @Query("SELECT COUNT(d) FROM DonHang d WHERE d.trangThai IN (1, 2, 3, 4) AND d.ngayMua = :date")
    Integer countOrdersByDate(@Param("date") java.time.LocalDate date);

    @Query("SELECT COALESCE(SUM(d.tongTien), 0) FROM DonHang d WHERE d.trangThai IN (1, 2, 3, 4) AND d.ngayMua = :date")
    Double sumRevenueByDate(@Param("date") java.time.LocalDate date);

    @Query("SELECT COALESCE(SUM(d.tongTien), 0) FROM DonHang d WHERE d.trangThai IN (1, 2, 3, 4) AND MONTH(d.ngayMua) = :month AND YEAR(d.ngayMua) = :year")
    Double sumRevenueByMonthAndYear(@Param("month") int month, @Param("year") int year);

    @Query("SELECT COUNT(d) FROM DonHang d WHERE d.trangThai IN (1, 2, 3, 4) AND MONTH(d.ngayMua) = :month AND YEAR(d.ngayMua) = :year")
    Integer countOrdersCompletedByMonthAndYear(@Param("month") int month, @Param("year") int year);

    @Query("SELECT COALESCE(SUM(d.tongTien), 0) FROM DonHang d WHERE d.trangThai IN (1, 2, 3, 4) AND UPPER(d.loaiDonHang) = UPPER(:channel) AND MONTH(d.ngayMua) = :month AND YEAR(d.ngayMua) = :year")
    Double sumRevenueByChannelAndMonthAndYear(@Param("channel") String channel, @Param("month") int month, @Param("year") int year);
=======
    @Query("SELECT COALESCE(SUM(d.tongTien), 0) FROM DonHang d WHERE d.trangThai IN (1, 4) AND d.ngayMua BETWEEN :startDate AND :endDate")
    Double sumRevenueByDateRange(@Param("startDate") java.time.LocalDate startDate, @Param("endDate") java.time.LocalDate endDate);

    @Query("SELECT COUNT(d) FROM DonHang d WHERE d.trangThai IN (1, 4) AND d.ngayMua BETWEEN :startDate AND :endDate")
    Integer countOrdersCompletedByDateRange(@Param("startDate") java.time.LocalDate startDate, @Param("endDate") java.time.LocalDate endDate);

    @Query("SELECT COALESCE(SUM(d.tongTien), 0) FROM DonHang d WHERE d.trangThai IN (1, 4) AND UPPER(d.loaiDonHang) = UPPER(:channel) AND d.ngayMua BETWEEN :startDate AND :endDate")
    Double sumRevenueByChannelAndDateRange(@Param("channel") String channel, @Param("startDate") java.time.LocalDate startDate, @Param("endDate") java.time.LocalDate endDate);

    @Query("SELECT d.trangThai, COUNT(d) FROM DonHang d WHERE d.ngayMua BETWEEN :startDate AND :endDate GROUP BY d.trangThai")
    List<Object[]> countOrdersByStatusInRange(@Param("startDate") java.time.LocalDate startDate, @Param("endDate") java.time.LocalDate endDate);
>>>>>>> dbcc773015f481c98f8da0d3b9f78c0a448b6424
}
