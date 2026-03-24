package com.example.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.sql.Date;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor

public class SPCTRequest {
    private Integer idSanPham;
    private String ma; // ✅ THÊM: Mã biến thể (SKU)
    private Integer idKichThuoc;
    private Integer idMauSac;
    private Integer soLuong;
    private Double giaBan;
    private Date ngaySanXuat;
}