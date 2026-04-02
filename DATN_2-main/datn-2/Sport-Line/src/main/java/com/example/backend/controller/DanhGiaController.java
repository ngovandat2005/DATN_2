package com.example.backend.controller;

import com.example.backend.dto.DanhGiaRequest;
import com.example.backend.entity.DanhGia;
import com.example.backend.service.DanhGiaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    // Thêm vào trong class DanhGiaController
    @PostMapping("/them")
    public ResponseEntity<?> submitReview(@RequestBody DanhGiaRequest request) {
        try {
            // Gọi service xử lý
            DanhGia savedReview = danhGiaService.submitReview(request);
            return ResponseEntity.ok(savedReview);
        } catch (RuntimeException e) {
            // Trả về lỗi 400 nếu không tìm thấy khách hàng/sản phẩm
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            // Trả về lỗi 500 nếu có lỗi hệ thống khác
            return ResponseEntity.status(500).body("Lỗi hệ thống: " + e.getMessage());
        }
    }
}