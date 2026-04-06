package com.example.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "TraHangChiTiet")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TraHangChiTiet {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "IdTraHang")
    @JsonIgnore
    private TraHang traHang;

    @Column(name = "IdDonHangChiTiet")
    private Integer idDonHangChiTiet;

    private Integer soLuongTra;
    private Double giaHoan;
}