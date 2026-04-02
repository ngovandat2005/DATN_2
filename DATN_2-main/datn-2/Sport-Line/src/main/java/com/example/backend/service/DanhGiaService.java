package com.example.backend.service;

import com.example.backend.dto.DanhGiaRequest;
import com.example.backend.entity.DanhGia;
import com.example.backend.entity.KhachHang;
import com.example.backend.entity.SanPham;
import com.example.backend.repository.DanhGiaRepository;
import com.example.backend.repository.KhachHangRepository;
import com.example.backend.repository.SanPhamInterface;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class DanhGiaService {

    @Autowired
    private DanhGiaRepository danhGiaRepository;

    @Autowired
    private KhachHangRepository khachHangRepository;

    @Autowired
    private SanPhamInterface sanPhamRepository;

    public List<DanhGia> getReviewsByProductId(Integer productId) {
        return danhGiaRepository.findBySanPhamIdOrderByNgayDanhGiaDesc(productId);
    }

    public DanhGia submitReview(DanhGiaRequest request) {
        if (request.getIdKhachHang() == null || request.getIdSanPham() == null) {
            throw new RuntimeException("ID Khách hàng hoặc Sản phẩm không được để trống!");
        }

        KhachHang khachHang = khachHangRepository.findById(request.getIdKhachHang())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng với ID: " + request.getIdKhachHang()));

        SanPham sanPham = sanPhamRepository.findById(request.getIdSanPham())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm với ID: " + request.getIdSanPham()));
        DanhGia danhGia = new DanhGia();
        danhGia.setKhachHang(khachHang);
        danhGia.setSanPham(sanPham);
        danhGia.setSoSao(request.getSoSao());
        danhGia.setBinhLuan(request.getBinhLuan());
        danhGia.setNgayDanhGia(LocalDateTime.now());
        danhGia.setTrangThai(1);

        return danhGiaRepository.save(danhGia);
    }
}
