package com.example.backend.service;

import com.example.backend.entity.KichThuoc;
import com.example.backend.repository.KichThuocInterface;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class KichThuocService {

    @Autowired
    private KichThuocInterface kti;

    public List<KichThuoc> getAll() {
        return kti.findAllByTrangThai(1);
    }
    public List<KichThuoc> getAlla2() {
        return kti.findAll();
    }

    public KichThuoc getById(Integer id) {
        return kti.findById(id).orElse(null);
    }

    public ResponseEntity<?> create(KichThuoc kichThuoc) {
        if (kichThuoc.getTenKichThuoc() == null || kichThuoc.getTenKichThuoc().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Tên kích thước không được để trống!");
        }
        String tenTrim = kichThuoc.getTenKichThuoc().trim();
        Optional<KichThuoc> existing = kti.findByTenKichThuocIgnoreCase(tenTrim);
        if (existing.isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Kích thước đã tồn tại!");
        }
        kichThuoc.setTenKichThuoc(tenTrim);
        KichThuoc newKichThuoc = kti.save(kichThuoc);
        return ResponseEntity.status(HttpStatus.CREATED).body(newKichThuoc);
    }

    public ResponseEntity<?> update(Integer id, KichThuoc kichThuoc) {
        if (kichThuoc.getTenKichThuoc() == null || kichThuoc.getTenKichThuoc().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Tên kích thước không được để trống!");
        }
        String tenTrim = kichThuoc.getTenKichThuoc().trim();
        Optional<KichThuoc> current = kti.findById(id);
        if (current.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Không tìm thấy Kích thước với ID: " + id);
        }

        Optional<KichThuoc> existing = kti.findByTenKichThuocIgnoreCase(tenTrim);
        if (existing.isPresent() && !existing.get().getId().equals(id)) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Tên kích thước đã tồn tại!");
        }

        // Chỉ cập nhật tên, giữ nguyên trangThai để tránh vô tình xoá mềm
        KichThuoc kt = current.get();
        kt.setTenKichThuoc(tenTrim);
        return ResponseEntity.ok(kti.save(kt));
    }

    public ResponseEntity<?> delete(Integer id) {
        Optional<KichThuoc> optional = kti.findById(id);
        if (optional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Kích thước với ID " + id + " không tìm thấy");
        }

        KichThuoc kichThuoc = optional.get();
        kichThuoc.setTrangThai(0);
        return ResponseEntity.ok(kti.save(kichThuoc));
    }
    public void khoiPhucKichThuoc(Integer id) {
        KichThuoc kt = kti.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy kích thước!"));
        kt.setTrangThai(1); // 1 = Đang hoạt động
        kti.save(kt);
    }

    public List<KichThuoc> getThungRac() {
        return kti.findAllByTrangThai(0);
    }
}
