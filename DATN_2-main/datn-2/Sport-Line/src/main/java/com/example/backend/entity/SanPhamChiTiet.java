package com.example.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
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

    @Column(name = "Ma")
    private String ma;

    @Column(name = "NgaySanXuat")
    private Date ngaySanXuat;

    @ManyToOne
    @JoinColumn(name = "IdSanPham")
    @JsonIgnoreProperties({"sanPhamChiTiets", "danhGias", "hibernateLazyInitializer", "handler"})
    private SanPham sanPham;

    @ManyToOne
    @JoinColumn(name = "IdKichThuoc")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private KichThuoc kichThuoc;

    @ManyToOne
    @JoinColumn(name = "IdMauSac")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private MauSac mauSac;

    @ManyToOne
    @JoinColumn(name = "IdKhuyenMai")
    @JsonIgnoreProperties({"sanPhamChiTiets", "hibernateLazyInitializer", "handler"})
    private KhuyenMai khuyenMai;

    @Column(name = "NgayTao")
    private LocalDateTime ngayTao;

    @Column(name = "TrangThai")
    private Integer trangThai;

    @Column(name = "GiaBan")
    private Double giaBan;

    @Column(name = "GiaBanGiamGia")
    private Double giaBanGiamGia;
}