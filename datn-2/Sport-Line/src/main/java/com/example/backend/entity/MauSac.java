package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "MauSac")
public class MauSac {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Id")
    private Integer id;

    @Column(name = "TenMauSac")
    private String tenMauSac;

    @Column(name = "TrangThai")
    private Integer trangThai;

    @Column(name = "Ma")
    private String ma;

    @PrePersist
    public void prePersist() {
        if (this.ma == null || this.ma.trim().isEmpty()) {
            this.ma = "MS" + java.util.UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        }
    }
}
