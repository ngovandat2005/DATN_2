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

    // 2. Lấy danh sách sản phẩm hiển thị
    @GetMapping("/active")
    public List<SanPham> getActive() {
        return sanPhamService.getAllActive();
    }

    // 4. API lọc thông minh
    @GetMapping("/filter")
    public List<SanPham> filter(
            @RequestParam(required = false) Integer idDanhMuc,
            @RequestParam(required = false) Integer idThuongHieu,
            @RequestParam(required = false) String search) {
        return sanPhamService.searchAndFilter(idDanhMuc, idThuongHieu, search);
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
