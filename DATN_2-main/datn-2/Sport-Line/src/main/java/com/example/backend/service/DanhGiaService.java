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
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

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

    public DanhGia submitReview(DanhGiaRequest request, List<MultipartFile> files) {
        // 1. Kiểm tra đầu vào
        if (request.getIdKhachHang() == null || request.getIdSanPham() == null) {
            throw new RuntimeException("ID Khách hàng hoặc Sản phẩm không được để trống!");
        }

        // 2. Tìm kiếm thông tin Khách hàng và Sản phẩm
        KhachHang khachHang = khachHangRepository.findById(request.getIdKhachHang())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng!"));

        SanPham sanPham = sanPhamRepository.findById(request.getIdSanPham())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm!"));

        // 3. Tạo đối tượng Đánh giá mới
        DanhGia danhGia = new DanhGia();
        danhGia.setKhachHang(khachHang);
        danhGia.setSanPham(sanPham);
        danhGia.setSoSao(request.getSoSao());
        danhGia.setBinhLuan(request.getBinhLuan());
        danhGia.setNgayDanhGia(LocalDateTime.now());
        danhGia.setTrangThai(1);

        // Gán các trường bổ sung từ request
        danhGia.setDungMoTa(request.getDungMoTa());
        danhGia.setChatLuongSP(request.getChatLuongSP());
        danhGia.setPhanLoaiHang(request.getPhanLoaiHang());

        // 4. XỬ LÝ LƯU FILE ẢNH VÀO Ổ E:
        List<String> fileNames = new ArrayList<>();

        if (files != null && !files.isEmpty()) {
            for (MultipartFile file : files) {
                if (!file.isEmpty()) {
                    try {
                        String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
                        Path path = Paths.get("E:/review-images/" + fileName);

                        Files.copy(file.getInputStream(), path, StandardCopyOption.REPLACE_EXISTING);
                        fileNames.add(fileName);

                    } catch (IOException e) {
                        throw new RuntimeException("Lỗi lưu ảnh: " + e.getMessage());
                    }
                }
            }

            danhGia.setDanhSachAnh(String.join(",", fileNames));

        } else {
            // Không có ảnh
            danhGia.setDanhSachAnh(null);
        }

        // 5. Lưu vào Database và trả về kết quả
        return danhGiaRepository.save(danhGia);
    }
}