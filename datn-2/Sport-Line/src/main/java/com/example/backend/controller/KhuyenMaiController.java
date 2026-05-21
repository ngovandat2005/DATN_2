package com.example.backend.controller;

import com.example.backend.dto.KhuyenMaiDTO;
import com.example.backend.entity.KhuyenMai;
import com.example.backend.service.KhuyenMaiService;
import com.example.backend.service.SPCTService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class KhuyenMaiController {

    @Autowired
    private KhuyenMaiService khuyenMaiService;

    @Autowired
    private SPCTService spctService;

    @PostMapping("/khuyen-mai/ap-dung/{idKhuyenMai}")
    public ResponseEntity<?> apDungKhuyenMai(
            @PathVariable Integer idKhuyenMai,
            @RequestBody List<Integer> ids) {
        spctService.addSanPhamDuocKhuyenMai(idKhuyenMai, ids);
        return ResponseEntity.ok(Map.of("message", "Áp dụng thành công"));
    }

    @PostMapping("/khuyen-mai/{idKhuyenMai}/bo-ap-dung")
    public ResponseEntity<?> boApDungKhuyenMai(
            @PathVariable Integer idKhuyenMai,
            @RequestBody List<Integer> ids) {
        spctService.removeSanPhamDuocKhuyenMai(idKhuyenMai, ids);
        return ResponseEntity.ok(Map.of("message", "Bỏ áp dụng thành công"));
    }

    @PostMapping("/khuyen-mai/tat/{id}")
    public ResponseEntity<KhuyenMai> tat(@PathVariable Integer id) {
        return ResponseEntity.ok(khuyenMaiService.tatKhuyenMai(id));
    }

    @GetMapping("/khuyenmai")
    public ResponseEntity<List<KhuyenMaiDTO>> getall() {
        khuyenMaiService.updateActiveKhuyenMai();
        return ResponseEntity.ok(khuyenMaiService.getall());
    }

    @GetMapping("/khuyenmai/{id}")
    public ResponseEntity<KhuyenMaiDTO> getbyid(@PathVariable Integer id) {
        return ResponseEntity.ok(khuyenMaiService.findById(id));
    }

    @PostMapping("/khuyenmai/create")
    public ResponseEntity<KhuyenMaiDTO> create(@RequestBody KhuyenMaiDTO khuyenMaiDTO) {
        return ResponseEntity.ok(khuyenMaiService.create(khuyenMaiDTO));
    }

    @PutMapping("/khuyenmai/update/{id}")
    public ResponseEntity<KhuyenMaiDTO> update(@PathVariable int id, @RequestBody KhuyenMaiDTO dto) {
        return ResponseEntity.ok(khuyenMaiService.update(id, dto));
    }

    @DeleteMapping("/khuyenmai/delete/{id}")
    public ResponseEntity<Map<String, Object>> delete(@PathVariable int id) {
        boolean success = khuyenMaiService.delete(id);
        if (!success) {
            throw new com.example.backend.KhongTimThay("Không tìm thấy khuyến mãi!");
        }
        return ResponseEntity.ok(Map.of("success", true));
    }
}
