package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name="donHangChiTiet")

public class DonHangChiTiet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "idDonHang")
    @JsonIgnore
    private DonHang donHang;

    @ManyToOne
    @JoinColumn(name = "idSanPhamChiTiet")
    private SanPhamChiTiet sanPhamChiTiet;

    @Column( name = "soLuong")
    private Integer soLuong;

    @Column( name = "gia")
    private Double gia;

    @Column( name = "thanhTien")
    private Double thanhTien;
}
