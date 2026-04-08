package com.example.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "XuatXu")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class XuatXu {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Id")
    private Integer id;

    @Column(name = "TenXuatXu")
    private String tenXuatXu;

    @Column(name = "TrangThai")
    private Integer trangThai;
}