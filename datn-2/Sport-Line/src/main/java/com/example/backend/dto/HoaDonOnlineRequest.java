package com.example.backend.dto;

import java.util.List;

public class HoaDonOnlineRequest {

    private Integer idKhachHang;
    private String tenNguoiNhan;
    private String diaChiGiaoHang;
    private String soDienThoaiGiaoHang;
    private String emailGiaoHang;
    private Integer idVoucher;
    private Double tongTien;
    private Integer phiVanChuyen;
    private Integer idService;
    private List<SanPhamDatDTO> sanPhamDat;

    public HoaDonOnlineRequest() {
    }

    public Integer getIdKhachHang() {
        return idKhachHang;
    }

    public void setIdKhachHang(Integer idKhachHang) {
        this.idKhachHang = idKhachHang;
    }

    public String getTenNguoiNhan() {
        return tenNguoiNhan;
    }

    public void setTenNguoiNhan(String tenNguoiNhan) {
        this.tenNguoiNhan = tenNguoiNhan;
    }

    public String getDiaChiGiaoHang() {
        return diaChiGiaoHang;
    }

    public void setDiaChiGiaoHang(String diaChiGiaoHang) {
        this.diaChiGiaoHang = diaChiGiaoHang;
    }

    public String getSoDienThoaiGiaoHang() {
        return soDienThoaiGiaoHang;
    }

    public void setSoDienThoaiGiaoHang(String soDienThoaiGiaoHang) {
        this.soDienThoaiGiaoHang = soDienThoaiGiaoHang;
    }

    public String getEmailGiaoHang() {
        return emailGiaoHang;
    }

    public void setEmailGiaoHang(String emailGiaoHang) {
        this.emailGiaoHang = emailGiaoHang;
    }

    public Integer getIdVoucher() {
        return idVoucher;
    }

    public void setIdVoucher(Integer idVoucher) {
        this.idVoucher = idVoucher;
    }

    public Double getTongTien() {
        return tongTien;
    }

    public void setTongTien(Double tongTien) {
        this.tongTien = tongTien;
    }

    public Integer getPhiVanChuyen() {
        return phiVanChuyen;
    }

    public void setPhiVanChuyen(Integer phiVanChuyen) {
        this.phiVanChuyen = phiVanChuyen;
    }

    public Integer getIdService() {
        return idService;
    }

    public void setIdService(Integer idService) {
        this.idService = idService;
    }

    public List<SanPhamDatDTO> getSanPhamDat() {
        return sanPhamDat;
    }

    public void setSanPhamDat(List<SanPhamDatDTO> sanPhamDat) {
        this.sanPhamDat = sanPhamDat;
    }
}
