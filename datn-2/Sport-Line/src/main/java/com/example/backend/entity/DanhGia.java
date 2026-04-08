package com.example.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "DanhGia")
public class DanhGia {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "IdKhachHang")
    @JsonIgnoreProperties({"danhGias", "password", "username", "hibernateLazyInitializer", "handler"})
    private KhachHang khachHang;

    @ManyToOne
    @JoinColumn(name = "IdSanPham")
    @JsonIgnoreProperties({"danhGias", "hibernateLazyInitializer", "handler"})
    private SanPham sanPham;

    private Integer soSao;

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String binhLuan;

    private LocalDateTime ngayDanhGia;
    private Integer trangThai;

    // --- Các trường thêm mới cho giống Shopee ---
    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String danhSachAnh; // Lưu chuỗi: "url1,url2,url3"

    private String dungMoTa;    // Ví dụ: "Đúng với mô tả"
    private String chatLuongSP; // Ví dụ: "Chất lượng tuyệt vời"
    private String phanLoaiHang; // Ví dụ: "Màu Đen, Size 42"
}