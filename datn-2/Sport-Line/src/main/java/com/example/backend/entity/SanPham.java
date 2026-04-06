package com.example.backend.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;

import java.sql.Date;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "SanPham")

public class SanPham {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Id")
    private Integer id;

//    @Column(name = "MaSanPham", unique = true)
//    private String maSanPham;

    @Column(name = "TenSanPham")
    private String tenSanPham;

    @Column(name = "Ma") // ✅ THÊM: Mã sản phẩm
    private String ma;

    @Column(name = "NgayTao")
    private Date ngayTao;

    @ManyToOne
    @JoinColumn(name = "IdThuongHieu", referencedColumnName = "Id")
    private ThuongHieu thuongHieu;

    @ManyToOne
    @JoinColumn(name = "IdXuatXu", referencedColumnName = "Id")
    private XuatXu xuatXu;

    @ManyToOne
    @JoinColumn(name = "IdChatLieu", referencedColumnName = "Id")
    private ChatLieu chatLieu;

    @ManyToOne
    @JoinColumn(name = "IdDanhMuc", referencedColumnName = "Id")
    private DanhMuc danhMuc;

    @Column(name = "Images")
    private String images;

    @Column(name = "GioiTinh") // ✅ THÊM: Giới tính (0: Nam, 1: Nữ, 2: Unisex)
    @com.fasterxml.jackson.annotation.JsonProperty("gioiTinh")
    private Integer gioiTinh;

    @Column(name = "TrangThai")
    private Integer trangThai;

    public Integer getGioiTinh() {
        return gioiTinh;
    }

    public void setGioiTinh(Integer gioiTinh) {
        this.gioiTinh = gioiTinh;
    }

    @OneToMany(mappedBy = "sanPham", fetch = FetchType.EAGER)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties("sanPham")
    private List<SanPhamChiTiet> sanPhamChiTiets; 
}
