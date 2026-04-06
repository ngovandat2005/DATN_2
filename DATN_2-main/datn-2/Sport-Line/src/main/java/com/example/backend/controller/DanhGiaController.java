package com.example.backend.controller;

import com.example.backend.dto.DanhGiaRequest;
import com.example.backend.entity.DanhGia;
import com.example.backend.service.DanhGiaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/danh-gia")
@CrossOrigin(originPatterns = "*", allowCredentials = "true")
public class DanhGiaController {

    @Autowired
    private DanhGiaService danhGiaService;

    @GetMapping("/san-pham/{id}")
    public ResponseEntity<?> getReviewsByProductId(@PathVariable Integer id) {
        try {
            List<DanhGia> reviews = danhGiaService.getReviewsByProductId(id);
            return ResponseEntity.ok(reviews);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi Backend: " + e.getMessage());
        }
    }

    @PostMapping("/them")
    public ResponseEntity<?> submitReview(
            @RequestParam(value = "images", required = false) List<MultipartFile> files,
            @RequestParam("idKhachHang") Integer idKhachHang,
            @RequestParam("idSanPham") Integer idSanPham,
            @RequestParam("soSao") Integer soSao,
            @RequestParam("binhLuan") String binhLuan) {

        try {
            // 1. Tạo request object
            DanhGiaRequest request = new DanhGiaRequest();
            request.setIdKhachHang(idKhachHang);
            request.setIdSanPham(idSanPham);
            request.setSoSao(soSao);
            request.setBinhLuan(binhLuan);

            // 2. Gọi service
            DanhGia saved = danhGiaService.submitReview(request, files);

            // 3. Trả về kết quả
            return ResponseEntity.ok(saved);

        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi: " + e.getMessage());
        }
    }
}