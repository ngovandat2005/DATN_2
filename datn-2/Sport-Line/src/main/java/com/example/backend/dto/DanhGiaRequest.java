package com.example.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DanhGiaRequest {
    private Integer idKhachHang;
    private Integer idSanPham;
    private Integer soSao;
    private String binhLuan;
}
