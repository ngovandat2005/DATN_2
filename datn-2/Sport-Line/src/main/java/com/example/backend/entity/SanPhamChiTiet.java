package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.*;


import java.time.*;
import java.sql.Date;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "SanPhamChiTiet")
public class SanPhamChiTiet {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Id")
    private Integer id;

    @Column(name = "SoLuong")
    private Integer soLuong;

    @Column(name = "Ma") // ✅ THÊM: Mã biến thể (SKU)
    private String ma;

    @Column(name = "NgaySanXuat")
    private Date ngaySanXuat;

    @ManyToOne
    @JoinColumn(name = "IdSanPham", referencedColumnName = "Id")
    private SanPham sanPham;

    @ManyToOne
    @JoinColumn(name = "IdKichThuoc", referencedColumnName = "Id")
    private KichThuoc kichThuoc;

    @ManyToOne
    @JoinColumn(name = "IdMauSac", referencedColumnName = "Id")
    private MauSac mauSac;

    @ManyToOne
    @JoinColumn(name = "IdKhuyenMai", referencedColumnName = "Id")
    private KhuyenMai khuyenMai;

    @Column(name = "NgayTao")
    private LocalDateTime ngayTao;

    @Column(name = "TrangThai")
    private Integer trangThai;

    @Column(name = "GiaBan")
    private Double giaBan;

    @Column(name = "GiaBanGiamGia")
    private Double giaBanGiamGia;

    // Getter thủ công để fallback về giaBan nếu giaBanGiamGia bị null
    public Double getGiaBanGiamGia() {
        if (giaBanGiamGia == null || giaBanGiamGia <= 0) {
            return giaBan;
        }
        return giaBanGiamGia;
    }

    @PrePersist
    @PreUpdate
    private void ensureGiaBanGiamGia() {
        if (giaBanGiamGia == null || giaBanGiamGia <= 0) {
            giaBanGiamGia = giaBan;
        }
    }
}
