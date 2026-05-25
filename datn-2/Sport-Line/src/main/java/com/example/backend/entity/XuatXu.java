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

    @Column(name = "Ma")
    private String ma;

    @PrePersist
    public void prePersist() {
        if (this.ma == null || this.ma.trim().isEmpty()) {
            this.ma = "XX" + java.util.UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        }
    }
}
