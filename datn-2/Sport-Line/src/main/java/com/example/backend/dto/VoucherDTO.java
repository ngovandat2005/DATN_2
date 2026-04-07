package com.example.backend.dto;

import java.time.LocalDateTime;

public class VoucherDTO {

    private Integer id;
    private String maVoucher;
    private String tenVoucher;
    private String loaiVoucher;
    private String moTa;
    private Integer soLuong;
    private Double giaTri;
    private Double donToiThieu;
    private LocalDateTime ngayBatDau;
    private LocalDateTime ngayKetThuc;
    private Boolean isAvailable;

    public VoucherDTO() {
    }

    public VoucherDTO(Integer id, String maVoucher, String tenVoucher, String loaiVoucher, String moTa, Integer soLuong, Double giaTri, Double donToiThieu, LocalDateTime ngayBatDau, LocalDateTime ngayKetThuc, Boolean isAvailable) {
        this.id = id;
        this.maVoucher = maVoucher;
        this.tenVoucher = tenVoucher;
        this.loaiVoucher = loaiVoucher;
        this.moTa = moTa;
        this.soLuong = soLuong;
        this.giaTri = giaTri;
        this.donToiThieu = donToiThieu;
        this.ngayBatDau = ngayBatDau;
        this.ngayKetThuc = ngayKetThuc;
        this.isAvailable = isAvailable;
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

    public Double getGiaTri() {
        return giaTri;
    }

    public void setGiaTri(Double giaTri) {
        this.giaTri = giaTri;
    }

    public Double getDonToiThieu() {
        return donToiThieu;
    }

    public void setDonToiThieu(Double donToiThieu) {
        this.donToiThieu = donToiThieu;
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

    public Boolean getIsAvailable() {
        return isAvailable;
    }

    public void setIsAvailable(Boolean isAvailable) {
        this.isAvailable = isAvailable;
    }

    public Integer getTrangThai() {
        if (ngayBatDau == null || ngayKetThuc == null) {
            return 0; // Hết hạn nếu không có ngày
        }

        LocalDateTime now = LocalDateTime.now();

        // Kiểm tra điều kiện hoạt động
        boolean isExpired = ngayKetThuc.isBefore(now);
        boolean isNotStarted = ngayBatDau.isAfter(now);
        boolean isOutOfStock = soLuong != null && soLuong <= 0;

        // Voucher hoạt động nếu không hết hạn, đã bắt đầu và còn số lượng
        if (!isExpired && !isNotStarted && !isOutOfStock) {
            return 1; // Đang hoạt động
        } else {
            return 0; // Hết hạn
        }
    }
}
