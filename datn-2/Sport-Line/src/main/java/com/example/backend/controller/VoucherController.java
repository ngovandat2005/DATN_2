package com.example.backend.controller;

import com.example.backend.dto.VoucherDTO;
import com.example.backend.service.VoucherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class VoucherController {

    @Autowired
    private VoucherService voucherService;

    @GetMapping("/voucher")
    public ResponseEntity<List<VoucherDTO>> getall() {
        return ResponseEntity.ok(voucherService.getall());
    }

    @GetMapping("/voucher/available")
    public ResponseEntity<List<VoucherDTO>> getAvailableVouchers(@RequestParam Integer orderId) {
        return ResponseEntity.ok(voucherService.getAvailableVouchers(orderId));
    }

    @GetMapping("/voucher/{id}")
    public ResponseEntity<VoucherDTO> getbyid(@PathVariable Integer id) {
        return ResponseEntity.ok(voucherService.findById(id));
    }

    @PostMapping("/voucher/create")
    public ResponseEntity<VoucherDTO> create(@RequestBody VoucherDTO voucherDTO) {
        return ResponseEntity.ok(voucherService.create(voucherDTO));
    }

    @PutMapping("/voucher/update/{id}")
    public ResponseEntity<VoucherDTO> update(@PathVariable int id, @RequestBody VoucherDTO dto) {
        return ResponseEntity.ok(voucherService.update(id, dto));
    }

    @DeleteMapping("/voucher/delete/{id}")
    public ResponseEntity<Map<String, Boolean>> delete(@PathVariable int id) {
        voucherService.delete(id);
        return ResponseEntity.ok(Map.of("success", true));
    }

    @PostMapping("/voucher/kiem-tra")
    public ResponseEntity<?> kiemTraVoucher(@RequestBody Map<String, Object> body) {
        try {
            Object idObj = body.get("idVoucher");
            Object tongObj = body.get("tongTienHang");
            if (idObj == null || tongObj == null) {
                return ResponseEntity.badRequest().body(Map.of("valid", false, "message", "Thiếu idVoucher hoặc tongTienHang"));
            }
            int idVoucher = idObj instanceof Number ? ((Number) idObj).intValue() : Integer.parseInt(idObj.toString());
            double tongTienHang = tongObj instanceof Number ? ((Number) tongObj).doubleValue() : Double.parseDouble(tongObj.toString());
            return ResponseEntity.ok(voucherService.kiemTraVaTinhGiam(idVoucher, tongTienHang));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("valid", false, "message", e.getMessage()));
        }
    }
}
