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
public class DanhGiaController {

    @Autowired
    private DanhGiaService danhGiaService;

    @GetMapping("/san-pham/{id}")
    public ResponseEntity<List<DanhGia>> getReviewsByProductId(@PathVariable Integer id) {
        return ResponseEntity.ok(danhGiaService.getReviewsByProductId(id));
    }

    @PostMapping("/them")
    public ResponseEntity<?> submitReview(@RequestBody DanhGiaRequest request) {
        try {
            return ResponseEntity.ok(danhGiaService.submitReview(request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
