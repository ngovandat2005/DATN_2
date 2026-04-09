package com.example.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "ThuongHieu")
// ✅ Ngăn lỗi Lazy Loading và lỗi Proxy khi chuyển sang JSON
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class ThuongHieu {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Id")
    private Integer id;

    @Column(name = "TenThuongHieu")
    private String tenThuongHieu;

    @Column(name = "TrangThai")
    private Integer trangThai;

}