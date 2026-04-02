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
    // Quan trọng: Chặn Jackson lôi ngược danh sách đánh giá từ KhachHang
    @JsonIgnoreProperties({"danhGias", "password", "username", "hibernateLazyInitializer", "handler"})
    private KhachHang khachHang;

    @ManyToOne
    @JoinColumn(name = "IdSanPham")
    // Quan trọng: Chặn Jackson lôi ngược danh sách đánh giá từ SanPham
    @JsonIgnoreProperties({"danhGias", "hibernateLazyInitializer", "handler"})
    private SanPham sanPham;

    private Integer soSao;
    private String binhLuan;
    private LocalDateTime ngayDanhGia;
    private Integer trangThai;
}