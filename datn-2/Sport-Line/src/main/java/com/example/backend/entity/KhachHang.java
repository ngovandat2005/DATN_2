package com.example.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;
import java.util.Date;

@Entity
@Table(name="KhachHang")
public class KhachHang {

    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    @Column(name="id")
    private Integer id;

    @Column(name = "TenKhachHang")
    @NotEmpty(message = "Tên khách hàng không được để trống!")
    @Size(min = 5, max= 30, message = "Tên khách hàng phải từ 5 đên 30 ký tự!")
    private String tenKhachHang;

    @Column(name = "Email")
    private String email;

    @Column(name = "NgaySinh")
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private Date ngaySinh;

    @Column(name = "DiaChi")
    private String diaChi;

    @Column(name = "SoDienThoai")
    @NotEmpty(message = "Số điện thoại không được để trống!")
    @Size(min = 10, max=10, message = "Số điện thoại phải có đúng 10 chữ sổ!")
    @Pattern(regexp = "^\\d+$", message = "Số điện thoại chỉ được chứa chữ số!")
    private String soDienThoai;

    @Column(name="matKhau")
    private String matKhau;

    private Boolean trangThai;

    @Column(name = "MaThongBao")
    private String maThongBao;

    @Column(name = "ThoiGianThongBao")
    private LocalDate thoiGianThongBao;

    public KhachHang() {
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

    public String getMatKhau() {
        return matKhau;
    }

    public void setMatKhau(String matKhau) {
        this.matKhau = matKhau;
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
