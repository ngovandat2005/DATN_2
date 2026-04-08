package com.example.backend.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
public class GhnOrderRequest {
    private Integer payment_type_id = 1; // Mặc định Shop trả phí
    private String note = "Sport-Line Order";
    private String required_note = "CHOXEMHANGKHONGTHU";
    private String to_name;
    private String to_phone;
    private String to_address;
    private String to_ward_code;
    private Integer to_district_id;
    private Integer cod_amount;
    private String content = "Giày thể thao Sport-Line";
    private Integer weight = 500;
    private Integer length = 20;
    private Integer width = 20;
    private Integer height = 10;
    private Integer service_id;
    private Integer service_type_id = 2; // Mặc định E-commerce (Nhanh)
    private List<GhnItem> items;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class GhnItem {
        private String name;
        private String code;
        private Integer quantity;
        private Integer price;
    }
}
