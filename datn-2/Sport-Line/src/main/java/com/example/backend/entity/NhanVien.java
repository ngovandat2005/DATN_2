package com.example.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;

@Entity
@Table(name = "NhanVien")
public class NhanVien {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @NotBlank(message = "Tên nhân viên không được bỏ trống !")
    @Column(name = "TenNhanVien")
    private String tenNhanVien;

    @NotBlank(message = "Email không được bỏ trống !")
    @Email(message = "Email không hợp lệ !")
    @Column(unique = true, name = "Email")
    private String email;

    @Size(max = 10, message = "Số điện thoại không được dài quá 10 ký tự")
    @NotBlank(message = "Số điện thoại không được bỏ trống !")
    @Column(unique = true, name = "SoDienThoai")
    private String soDienThoai;

    @NotNull(message = "Ngày sinh không được bỏ trống !")
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    @Column(name = "NgaySinh")
    private LocalDate ngaySinh;

    @NotBlank(message = "Địa chỉ không được bỏ trống !")
    @Column(name = "DiaChi")
    private String diaChi;

    @Column(name = "VaiTro")
    private Boolean vaiTro;

    @Column(name = "MatKhau")
    private String matKhau;

    @Column(unique = true, name = "CCCD")
    private String cccd;

    @NotNull(message = "Trạng thái không được bỏ trống !")
    @Column(name = "TrangThai")
    private Boolean trangThai;

    public NhanVien() {
    }

    public NhanVien(Integer id, String tenNhanVien, String email, String soDienThoai, LocalDate ngaySinh, String diaChi, Boolean vaiTro, String matKhau, String cccd, Boolean trangThai) {
        this.id = id;
        this.tenNhanVien = tenNhanVien;
        this.email = email;
        this.soDienThoai = soDienThoai;
        this.ngaySinh = ngaySinh;
        this.diaChi = diaChi;
        this.vaiTro = vaiTro;
        this.matKhau = matKhau;
        this.cccd = cccd;
        this.trangThai = trangThai;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getTenNhanVien() {
        return tenNhanVien;
    }

    public void setTenNhanVien(String tenNhanVien) {
        this.tenNhanVien = tenNhanVien;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getSoDienThoai() {
        return soDienThoai;
    }

    public void setSoDienThoai(String soDienThoai) {
        this.soDienThoai = soDienThoai;
    }

    public LocalDate getNgaySinh() {
        return ngaySinh;
    }

    public void setNgaySinh(LocalDate ngaySinh) {
        this.ngaySinh = ngaySinh;
    }

    public String getDiaChi() {
        return diaChi;
    }

    public void setDiaChi(String diaChi) {
        this.diaChi = diaChi;
    }

    public Boolean getVaiTro() {
        return vaiTro;
    }

    public void setVaiTro(Boolean vaiTro) {
        this.vaiTro = vaiTro;
    }

    public String getMatKhau() {
        return matKhau;
    }

    public void setMatKhau(String matKhau) {
        this.matKhau = matKhau;
    }

    public String getCccd() {
        return cccd;
    }

    public void setCccd(String cccd) {
        this.cccd = cccd;
    }

    public Boolean getTrangThai() {
        return trangThai;
    }

    public void setTrangThai(Boolean trangThai) {
        this.trangThai = trangThai;
    }
}
