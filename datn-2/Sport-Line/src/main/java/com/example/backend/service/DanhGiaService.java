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
        if (request.getSoSao() == null || request.getSoSao() < 1 || request.getSoSao() > 5) {
            throw new RuntimeException("Số sao đánh giá phải từ 1 đến 5!");
        }

        KhachHang khachHang = khachHangRepository.findById(request.getIdKhachHang())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng!"));

        SanPham sanPham = sanPhamRepository.findById(request.getIdSanPham())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm!"));

        // Kiểm tra khách hàng đã mua sản phẩm này chưa (đơn hàng Hoàn thành - trạng thái 4)
        if (!danhGiaRepository.hasCustomerPurchasedProduct(request.getIdKhachHang(), request.getIdSanPham())) {
            throw new RuntimeException("Bạn chỉ có thể đánh giá sản phẩm sau khi đã mua và nhận hàng thành công!");
        }

        // Kiểm tra đã đánh giá sản phẩm này chưa
        if (danhGiaRepository.existsByKhachHang_IdAndSanPham_Id(request.getIdKhachHang(), request.getIdSanPham())) {
            throw new RuntimeException("Bạn đã đánh giá sản phẩm này rồi!");
        }

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
