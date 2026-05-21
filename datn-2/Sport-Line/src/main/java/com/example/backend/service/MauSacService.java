package com.example.backend.service;

import com.example.backend.entity.MauSac;
import com.example.backend.repository.MauSacInterface;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class MauSacService {

    @Autowired
    private MauSacInterface msi;

    public List<MauSac> getAll() {
        return msi.findAllByTrangThai(1);
    }
    public List<MauSac> getAllFull() {
        return msi.findAll();
    }

    public ResponseEntity<?> getById(Integer id) {
        Optional<MauSac> found = msi.findById(id);
        return found.isPresent()
                ? ResponseEntity.ok(found.get())
                : ResponseEntity.status(HttpStatus.NOT_FOUND).body("Không tìm thấy Màu sắc với ID: " + id);
    }

    public ResponseEntity<?> create(MauSac mauSac) {
        if (mauSac.getTenMauSac() == null || mauSac.getTenMauSac().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Tên màu sắc không được để trống!");
        }
        String tenTrim = mauSac.getTenMauSac().trim();
        Optional<MauSac> existing = msi.findByTenMauSacIgnoreCase(tenTrim);
        if (existing.isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Màu sắc đã tồn tại!");
        }
        mauSac.setTenMauSac(tenTrim);
        MauSac saved = msi.save(mauSac);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    public ResponseEntity<?> update(Integer id, MauSac mauSac) {
        Optional<MauSac> current = msi.findById(id);
        if (current.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Không tìm thấy Màu sắc với ID: " + id);
        }

        if (mauSac.getTenMauSac() == null || mauSac.getTenMauSac().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Tên màu sắc không được để trống!");
        }
        String tenTrim = mauSac.getTenMauSac().trim();
        Optional<MauSac> existing = msi.findByTenMauSacIgnoreCase(tenTrim);
        if (existing.isPresent() && !existing.get().getId().equals(id)) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Tên màu sắc đã tồn tại!");
        }
        // Chỉ cập nhật tên, giữ nguyên trangThai để tránh vô tình xoá mềm
        MauSac ms = current.get();
        ms.setTenMauSac(tenTrim);
        return ResponseEntity.ok(msi.save(ms));
    }

    public ResponseEntity<?> delete(Integer id) {
        Optional<MauSac> optional = msi.findById(id);
        if (optional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Màu sắc với ID " + id + " không tìm thấy");
        }

        MauSac mauSac = optional.get();
        mauSac.setTrangThai(0);
        MauSac saved = msi.save(mauSac);
        return ResponseEntity.ok(saved);
    }

    public List<MauSac> getThungRac() {
        return msi.findAllByTrangThai(0);
    }
    public void khoiPhucMauSac(Integer id) {
        MauSac ms = msi.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy màu sắc!"));
        ms.setTrangThai(1); // 1 = Đang hoạt động
        msi.save(ms);
    }
}
