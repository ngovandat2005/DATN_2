package com.example.backend.controller;

import com.example.backend.entity.SanPham;
import com.example.backend.service.SanPhamService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/san-pham")
public class SanPhamRestController {

    @Autowired
    private SanPhamService sanPhamService;

    // 1. Lấy tất cả (Cho Admin)
    @GetMapping("/getAll")
    public List<SanPham> getAll() {
        return sanPhamService.getAllActive();
    }

    // 2. Tách biệt sản phẩm NAM (0)
    @GetMapping("/nam")
    public ResponseEntity<?> getMenProducts() {
        try {
            return ResponseEntity.ok(sanPhamService.getProductsByGender(0));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi Backend: " + e.getMessage());
        }
    }

    // 4. API lọc thông minh toàn diện
    @GetMapping("/filter")
    public List<SanPham> filter(
            @RequestParam(required = false) Integer gioiTinh,
            @RequestParam(required = false) Integer idDanhMuc,
            @RequestParam(required = false) Integer idThuongHieu,
            @RequestParam(required = false) String search) {
        return sanPhamService.searchAndFilter(gioiTinh, idDanhMuc, idThuongHieu, search);
    }

    @GetMapping({ "/{id}", "/get/{id}" })
    public ResponseEntity<?> getById(@PathVariable Integer id) {
        try {
            return ResponseEntity.ok(sanPhamService.getById(id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/add")
    public ResponseEntity<?> add(@RequestBody SanPham sp) {
        try {
            return ResponseEntity.ok(sanPhamService.create(sp));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Integer id, @RequestBody SanPham sp) {
        try {
            return ResponseEntity.ok(sanPhamService.update(id, sp));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Integer id) {
        try {
            sanPhamService.delete(id);
            return ResponseEntity.ok("Xóa thành công!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
