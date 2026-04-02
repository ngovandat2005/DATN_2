package com.example.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BestSellerDTO {
    private Integer id;
    private String productName;
    private String brandName;
    private Long totalSold;
    private String images;
}
