package com.example.backend.entity;

import jakarta.persistence.*;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDateTime;

@Entity
@Table(name = "Voucher")
public class Voucher {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Id")
    private Integer id;

    @Column(name = "MaVoucher")
    private String maVoucher;

    @Column(name = "TenVoucher")
    private String tenVoucher;

    @Column(name = "LoaiVoucher")
    private String loaiVoucher;

    @Column(name = "MoTa")
    private String moTa;

    @Column(name = "SoLuong")
    private Integer soLuong;

    @Column(name = "DonToiThieu")
    private Double donToiThieu;

    @Column(name = "GiaTri")
    private Double giaTri;

    @DateTimeFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.sss")
    @Column(name = "NgayBatDau")
    private LocalDateTime ngayBatDau;

    @DateTimeFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.sss")
    @Column(name = "NgayKetThuc")
    private LocalDateTime ngayKetThuc;

    @Column(name = "TrangThai")
    private Integer trangThai;

    public Voucher() {
    }

    public Voucher(Integer id, String maVoucher, String tenVoucher, String loaiVoucher, String moTa, Integer soLuong, Double donToiThieu, Double giaTri, LocalDateTime ngayBatDau, LocalDateTime ngayKetThuc, Integer trangThai) {
        this.id = id;
        this.maVoucher = maVoucher;
        this.tenVoucher = tenVoucher;
        this.loaiVoucher = loaiVoucher;
        this.moTa = moTa;
        this.soLuong = soLuong;
        this.donToiThieu = donToiThieu;
        this.giaTri = giaTri;
        this.ngayBatDau = ngayBatDau;
        this.ngayKetThuc = ngayKetThuc;
        this.trangThai = trangThai;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getMaVoucher() {
        return maVoucher;
    }

    public void setMaVoucher(String maVoucher) {
        this.maVoucher = maVoucher;
    }

    public String getTenVoucher() {
        return tenVoucher;
    }

    public void setTenVoucher(String tenVoucher) {
        this.tenVoucher = tenVoucher;
    }

    public String getLoaiVoucher() {
        return loaiVoucher;
    }

    public void setLoaiVoucher(String loaiVoucher) {
        this.loaiVoucher = loaiVoucher;
    }

    public String getMoTa() {
        return moTa;
    }

    public void setMoTa(String moTa) {
        this.moTa = moTa;
    }

    public Integer getSoLuong() {
        return soLuong;
    }

    public void setSoLuong(Integer soLuong) {
        this.soLuong = soLuong;
    }

    public Double getDonToiThieu() {
        return donToiThieu;
    }

    public void setDonToiThieu(Double donToiThieu) {
        this.donToiThieu = donToiThieu;
    }

    public Double getGiaTri() {
        return giaTri;
    }

    public void setGiaTri(Double giaTri) {
        this.giaTri = giaTri;
    }

    public LocalDateTime getNgayBatDau() {
        return ngayBatDau;
    }

    public void setNgayBatDau(LocalDateTime ngayBatDau) {
        this.ngayBatDau = ngayBatDau;
    }

    public LocalDateTime getNgayKetThuc() {
        return ngayKetThuc;
    }

    public void setNgayKetThuc(LocalDateTime ngayKetThuc) {
        this.ngayKetThuc = ngayKetThuc;
    }

    public Integer getTrangThai() {
        return trangThai;
    }

    public void setTrangThai(Integer trangThai) {
        this.trangThai = trangThai;
    }
}
