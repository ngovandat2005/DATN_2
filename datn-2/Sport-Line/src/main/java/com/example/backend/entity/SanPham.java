package com.example.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
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
    private Integer id;

    private String ma;
    private String tenSanPham;
    private String images;
    private Integer trangThai;

    @ManyToOne
    @JoinColumn(name = "IdDanhMuc")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private DanhMuc danhMuc;

    @ManyToOne
    @JoinColumn(name = "IdThuongHieu")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private ThuongHieu thuongHieu;

    @ManyToOne
    @JoinColumn(name = "IdXuatXu")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private XuatXu xuatXu;

    @ManyToOne
    @JoinColumn(name = "IdChatLieu")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private ChatLieu chatLieu;

    @OneToMany(mappedBy = "sanPham")
    @JsonIgnore // Chặn để không lặp: SanPham -> ChiTiet -> SanPham
    private List<SanPhamChiTiet> sanPhamChiTiets;

    @OneToMany(mappedBy = "sanPham")
    @JsonIgnore // Chặn để không lặp: SanPham -> DanhGia -> SanPham
    private List<DanhGia> danhGias;
}