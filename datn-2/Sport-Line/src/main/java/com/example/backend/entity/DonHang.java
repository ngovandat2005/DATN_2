package com.example.backend.entity;

import jakarta.persistence.*;

import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "DonHang")
public class DonHang {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "idNhanVien")
    private NhanVien nhanVien;

    @ManyToOne
    @JoinColumn(name = "idKhachHang")
    private KhachHang khachHang;

    @ManyToOne
    @JoinColumn(name = "idGiamGia")
    private Voucher giamGia;

    @Column(name="NgayMua")
    private LocalDate ngayMua;

    @Column(name="NgayTao")
    private LocalDate ngayTao;

    @Column(name="LoaiDonHang")
    private String loaiDonHang;

    @Column(name="TrangThai")
    private Integer trangThai;

    @Column(name="TongTien")
    private Double tongTien;

    @Column(name="TongTienGiamGia")
    private Double tongTienGiamGia;

    @Column(name="DiaChiGiaoHang")
    private String diaChiGiaoHang;

    @Column(name="SoDienThoaiGiaoHang")
    private String soDienThoaiGiaoHang;

    @Column(name="EmailGiaoHang")
    private String emailGiaoHang;

    @Column(name="TenNguoiNhan")
    private String tenNguoiNhan;

    @Column(name="PhiVanChuyen")
    private Integer phiVanChuyen = 0;

    @Column(name="MaVanDon")
    private String maVanDon;

    @Column(name="IdService")
    private Integer idService;

    @OneToMany(mappedBy = "donHang", cascade = CascadeType.ALL, fetch = FetchType.EAGER, orphanRemoval = true)
    private List<DonHangChiTiet> donHangChiTiets;

    public DonHang() {
    }

    public DonHang(Integer id, NhanVien nhanVien, KhachHang khachHang, Voucher giamGia, LocalDate ngayMua, LocalDate ngayTao, String loaiDonHang, Integer trangThai, Double tongTien, Double tongTienGiamGia, String diaChiGiaoHang, String soDienThoaiGiaoHang, String emailGiaoHang, String tenNguoiNhan, Integer phiVanChuyen, String maVanDon, Integer idService, List<DonHangChiTiet> donHangChiTiets) {
        this.id = id;
        this.nhanVien = nhanVien;
        this.khachHang = khachHang;
        this.giamGia = giamGia;
        this.ngayMua = ngayMua;
        this.ngayTao = ngayTao;
        this.loaiDonHang = loaiDonHang;
        this.trangThai = trangThai;
        this.tongTien = tongTien;
        this.tongTienGiamGia = tongTienGiamGia;
        this.diaChiGiaoHang = diaChiGiaoHang;
        this.soDienThoaiGiaoHang = soDienThoaiGiaoHang;
        this.emailGiaoHang = emailGiaoHang;
        this.tenNguoiNhan = tenNguoiNhan;
        this.phiVanChuyen = phiVanChuyen;
        this.maVanDon = maVanDon;
        this.idService = idService;
        this.donHangChiTiets = donHangChiTiets;
    }

    @PostLoad
    private void postLoad() {
        if (phiVanChuyen == null) {
            phiVanChuyen = 0;
        }
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public NhanVien getNhanVien() {
        return nhanVien;
    }

    public void setNhanVien(NhanVien nhanVien) {
        this.nhanVien = nhanVien;
    }

    public KhachHang getKhachHang() {
        return khachHang;
    }

    public void setKhachHang(KhachHang khachHang) {
        this.khachHang = khachHang;
    }

    public Voucher getGiamGia() {
        return giamGia;
    }

    public void setGiamGia(Voucher giamGia) {
        this.giamGia = giamGia;
    }

    public LocalDate getNgayMua() {
        return ngayMua;
    }

    public void setNgayMua(LocalDate ngayMua) {
        this.ngayMua = ngayMua;
    }

    public LocalDate getNgayTao() {
        return ngayTao;
    }

    public void setNgayTao(LocalDate ngayTao) {
        this.ngayTao = ngayTao;
    }

    public String getLoaiDonHang() {
        return loaiDonHang;
    }

    public void setLoaiDonHang(String loaiDonHang) {
        this.loaiDonHang = loaiDonHang;
    }

    public Integer getTrangThai() {
        return trangThai;
    }

    public void setTrangThai(Integer trangThai) {
        this.trangThai = trangThai;
    }

    public Double getTongTien() {
        return tongTien;
    }

    public void setTongTien(Double tongTien) {
        this.tongTien = tongTien;
    }

    public Double getTongTienGiamGia() {
        return tongTienGiamGia;
    }

    public void setTongTienGiamGia(Double tongTienGiamGia) {
        this.tongTienGiamGia = tongTienGiamGia;
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

    public String getTenNguoiNhan() {
        return tenNguoiNhan;
    }

    public void setTenNguoiNhan(String tenNguoiNhan) {
        this.tenNguoiNhan = tenNguoiNhan;
    }

    public Integer getPhiVanChuyen() {
        return phiVanChuyen;
    }

    public void setPhiVanChuyen(Integer phiVanChuyen) {
        this.phiVanChuyen = phiVanChuyen;
    }

    public String getMaVanDon() {
        return maVanDon;
    }

    public void setMaVanDon(String maVanDon) {
        this.maVanDon = maVanDon;
    }

    public Integer getIdService() {
        return idService;
    }

    public void setIdService(Integer idService) {
        this.idService = idService;
    }

    public List<DonHangChiTiet> getDonHangChiTiets() {
        return donHangChiTiets;
    }

    public void setDonHangChiTiets(List<DonHangChiTiet> donHangChiTiets) {
        this.donHangChiTiets = donHangChiTiets;
    }
}
