package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Setter
@Getter
@Table(name = "TraHang")
@NoArgsConstructor // Thêm constructor mặc định
@AllArgsConstructor // Thêm constructor đầy đủ tham số
public class TraHang {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "IdDonHang")
    private DonHang donHang;

    private LocalDateTime ngayYeuCau;
    private String lyDo;
    private Integer trangThai;
    private Double tongTienHoan;

    @OneToMany(mappedBy = "traHang", cascade = CascadeType.ALL)
    // KHỞI TẠO LUÔN LIST Ở ĐÂY ĐỂ TRÁNH NULL POINTER
    private List<TraHangChiTiet> chiTietTraHangs = new java.util.ArrayList<>();
}