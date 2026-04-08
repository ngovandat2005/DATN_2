package com.example.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class XacNhanThanhToanDTO {
    private Double tongTien;
    private Integer idkhachHang;
    private String tenKhachHang;
    private String email;
    private String soDienThoai;
    private Integer phiVanChuyen; // Thêm phí vận chuyển
    private String diaChiGiaoHang; // Thêm địa chỉ giao hàng
}