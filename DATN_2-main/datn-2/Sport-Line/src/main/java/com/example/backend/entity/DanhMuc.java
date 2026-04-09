package com.example.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "DanhMuc")
// ✅ Ngăn lỗi Lazy Loading và lỗi Proxy khi chuyển sang JSON
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class DanhMuc {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Id")
    private Integer id;

    @Column(name = "TenDanhMuc")
    private String tenDanhMuc;

    @Column(name = "TrangThai")
    private Integer trangThai;
}