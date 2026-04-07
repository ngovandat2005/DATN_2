package com.example.backend.dto;

import java.time.LocalDate;
import java.util.Date;

public class KhachHangResponseDTO {

    private Integer id;
    private String tenKhachHang;
    private String email;
    private Date ngaySinh;
    private String diaChi;
    private String soDienThoai;
    private Boolean trangThai;
    private String maThongBao;
    private LocalDate thoiGianThongBao;

    public KhachHangResponseDTO() {
    }

    public KhachHangResponseDTO(Integer id, String tenKhachHang, String email, Date ngaySinh, String diaChi, String soDienThoai, Boolean trangThai, String maThongBao, LocalDate thoiGianThongBao) {
        this.id = id;
        this.tenKhachHang = tenKhachHang;
        this.email = email;
        this.ngaySinh = ngaySinh;
        this.diaChi = diaChi;
        this.soDienThoai = soDienThoai;
        this.trangThai = trangThai;
        this.maThongBao = maThongBao;
        this.thoiGianThongBao = thoiGianThongBao;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getTenKhachHang() {
        return tenKhachHang;
    }

    public void setTenKhachHang(String tenKhachHang) {
        this.tenKhachHang = tenKhachHang;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Date getNgaySinh() {
        return ngaySinh;
    }

    public void setNgaySinh(Date ngaySinh) {
        this.ngaySinh = ngaySinh;
    }

    public String getDiaChi() {
        return diaChi;
    }

    public void setDiaChi(String diaChi) {
        this.diaChi = diaChi;
    }

    public String getSoDienThoai() {
        return soDienThoai;
    }

    public void setSoDienThoai(String soDienThoai) {
        this.soDienThoai = soDienThoai;
    }

    public Boolean getTrangThai() {
        return trangThai;
    }

    public void setTrangThai(Boolean trangThai) {
        this.trangThai = trangThai;
    }

    public String getMaThongBao() {
        return maThongBao;
    }

    public void setMaThongBao(String maThongBao) {
        this.maThongBao = maThongBao;
    }

    public LocalDate getThoiGianThongBao() {
        return thoiGianThongBao;
    }

    public void setThoiGianThongBao(LocalDate thoiGianThongBao) {
        this.thoiGianThongBao = thoiGianThongBao;
    }
}
