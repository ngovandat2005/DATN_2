package com.example.backend.entity;

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
    @Column(name = "Id")
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "IdKhachHang", referencedColumnName = "id")
    private KhachHang khachHang;

    @ManyToOne
    @JoinColumn(name = "IdSanPham", referencedColumnName = "Id")
    private SanPham sanPham;

    @Column(name = "SoSao")
    private Integer soSao;

    @Column(name = "BinhLuan")
    private String binhLuan;

    @Column(name = "NgayDanhGia")
    private LocalDateTime ngayDanhGia;

    @Column(name = "TrangThai")
    private Integer trangThai;
}
