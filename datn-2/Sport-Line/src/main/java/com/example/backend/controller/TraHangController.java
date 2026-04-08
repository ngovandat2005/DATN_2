package com.example.backend.controller;

import com.example.backend.dto.TraHangRequestDTO;
import com.example.backend.repository.TraHangRepository;
import com.example.backend.service.TraHangService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tra-hang")
@CrossOrigin(originPatterns = "*", allowCredentials = "true")
public class TraHangController {
    @Autowired
    private TraHangService service;
    @Autowired private TraHangRepository repo;

    @GetMapping("/get-all")
    public ResponseEntity<?> getAll() {
        return ResponseEntity.ok(repo.findAll());
    }

    @PostMapping("/yeu-cau")
    public ResponseEntity<?> requestReturn(@RequestBody TraHangRequestDTO dto) {
        try {
            return ResponseEntity.ok(service.createRequest(dto));
        } catch (Exception e) {
            e.printStackTrace(); // In lỗi chi tiết ra console IntelliJ
            return ResponseEntity.internalServerError().body("Lỗi: " + e.getMessage());
        }
    }
    @PutMapping("/duyet/{id}")
    public ResponseEntity<?> approve(@PathVariable Integer id) {
        service.approveRequest(id);
        return ResponseEntity.ok("Đã duyệt yêu cầu và cập nhật kho!");
    }
}