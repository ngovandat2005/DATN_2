package com.example.backend.dto;

import lombok.Data;

import java.util.List;

@Data
public class TraHangRequestDTO {
    private Integer idDonHang;
    private Integer idKhachHang;
    private String lyDo;
    private List<ItemTraHangDTO> items;

    @Data
    public static class ItemTraHangDTO {
        private Integer idDonHangChiTiet;
        private Integer soLuongTra;
        private Double giaHoan;
    }
}