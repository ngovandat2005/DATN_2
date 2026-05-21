package com.example.backend.controller;

import com.example.backend.dto.NhanVienDTO;
import com.example.backend.service.NhanVienService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class NhanVienController {

    @Autowired
    private NhanVienService nhanVienService;

    @GetMapping("/nhanvien")
    public ResponseEntity<List<NhanVienDTO>> getall(){
        return ResponseEntity.ok(nhanVienService.findall());
    }

    @GetMapping("/nhanvien/{id}")
    public ResponseEntity<?> getbyid(@PathVariable Integer id){
        NhanVienDTO dto = nhanVienService.findById(id);
        if (dto == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Không tìm thấy nhân viên với ID: " + id));
        }
        return ResponseEntity.ok(dto);
    }

    @PostMapping("/nhanvien/create")
    public ResponseEntity<?> create(@RequestBody NhanVienDTO nhanVienDTO){
        try {
            NhanVienDTO dto = nhanVienService.create(nhanVienDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(dto);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/nhanvien/update/{id}")
    public ResponseEntity<?> update(@PathVariable int id, @RequestBody NhanVienDTO dto) {
        try {
            NhanVienDTO updated = nhanVienService.update(id, dto);
            if (updated == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "Không tìm thấy nhân viên với ID: " + id));
            }
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/nhanvien/{id}/mat-khau")
    public ResponseEntity<Map<String, Object>> datMatKhau(
            @PathVariable Integer id,
            @RequestBody Map<String, String> body) {
        String matKhau = body != null ? body.get("matKhau") : null;
        nhanVienService.datMatKhau(id, matKhau);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Đặt mật khẩu thành công!"
        ));
    }

    @DeleteMapping("/nhanvien/delete/{id}")
    public ResponseEntity<?> delete(@PathVariable int id){
        boolean success = nhanVienService.delete(id);
        if (!success) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Không tìm thấy nhân viên với ID: " + id));
        }
        return ResponseEntity.ok(Map.of("message", "Xóa nhân viên thành công!"));
    }
}
