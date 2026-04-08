package com.example.backend.controller;




import com.example.backend.dto.KhachHangResponseDTO;

import com.example.backend.service.KhachHangService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class KhachHangController {
    @Autowired
    KhachHangService khachHangService;

    @GetMapping("/khachhang")
    public ResponseEntity<List<KhachHangResponseDTO>> getall() {
        return ResponseEntity.ok(khachHangService.findAll());
    }

    @GetMapping("/khachhang/{id}")
    public ResponseEntity<KhachHangResponseDTO> getbyid(@PathVariable int id) {
        KhachHangResponseDTO khachHangDTO = khachHangService.findAllbyid(id);
        if(khachHangDTO==null){
            return ResponseEntity.notFound().build();
        }


        return ResponseEntity.ok(khachHangDTO);
    }

    // KhachHangController.java
    @PostMapping("/khachhang/create")
    public ResponseEntity<?> create(@RequestBody KhachHangResponseDTO khachHangDTO) {
        try {
            KhachHangResponseDTO dto = khachHangService.create(khachHangDTO);
            return ResponseEntity.ok(dto);
        } catch (RuntimeException e) {
            // Lỗi chủ động (ví dụ: số điện thoại đã tồn tại)
            return ResponseEntity
                    .badRequest()
                    .body(java.util.Collections.singletonMap("message", e.getMessage()));
        } catch (Exception e) {
            // Bắt mọi lỗi khác (ví dụ: Query did not return a unique result)
            return ResponseEntity
                    .badRequest()
                    .body(java.util.Collections.singletonMap("message", "Dữ liệu khách hàng đã tồn tại!"));
        }
    }

    @DeleteMapping("/khachhang/delete/{id}")
    public Boolean delete(@PathVariable int id) {
        return khachHangService.deleteById(id);
    }

    @PutMapping("/khachhang/update/{id}")
    public ResponseEntity<KhachHangResponseDTO> update(@PathVariable int id, @RequestBody KhachHangResponseDTO dto) {
        return ResponseEntity.ok(khachHangService.update(id, dto));
    }
}
