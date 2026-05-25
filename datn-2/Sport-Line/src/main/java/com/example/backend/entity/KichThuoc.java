package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "KichThuoc")
public class KichThuoc {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Id")
    private Integer id;

    @Column(name = "TenKichThuoc")
    private String tenKichThuoc;

    @Column(name = "TrangThai")
    private Integer trangThai;

    @Column(name = "Ma")
    private String ma;

    @PrePersist
    public void prePersist() {
        if (this.ma == null || this.ma.trim().isEmpty()) {
            this.ma = "KT" + java.util.UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        }
    }
}
