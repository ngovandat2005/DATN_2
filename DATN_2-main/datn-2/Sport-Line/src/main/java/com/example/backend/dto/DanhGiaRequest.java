package com.example.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DanhGiaRequest {
    private Integer idKhachHang;
    private Integer idSanPham;
    private Integer soSao;
    private String binhLuan;
    private String danhSachAnh;  // Frontend sẽ nối chuỗi ảnh trước khi gửi
    private String dungMoTa;
    private String chatLuongSP;
    private String phanLoaiHang;
}