package com.example.backend.dto;




import lombok.Data;

@Data
public class SanPhamDTO {
    private String tenSanPham;
    private Integer idDanhMuc;
    private Integer idThuongHieu;
    private Integer idChatLieu;
    private Integer idXuatXu;
    private Integer idKhuyenMai;
    private String images;
    private Integer trangThai;
}
