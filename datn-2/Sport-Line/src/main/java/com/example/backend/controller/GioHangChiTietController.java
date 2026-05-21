package com.example.backend.controller;

import com.example.backend.dto.ThemGioHangDTO;
import com.example.backend.entity.GioHangChiTiet;
import com.example.backend.service.GioHangChiTietService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/gio-hang-chi-tiet")
public class GioHangChiTietController {

    @Autowired
    private GioHangChiTietService gioHangChiTietService;

    // Thêm sản phẩm vào giỏ hàng
    @PostMapping("/them")
    public ResponseEntity<?> themVaoGio(@RequestBody ThemGioHangDTO req) {
        try {
            return ResponseEntity.ok(gioHangChiTietService.themVaoGio(req));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Lỗi khi thêm vào giỏ hàng!"));
        }
    }

    @GetMapping("/{idKhachHang}")
    public ResponseEntity<List<GioHangChiTiet>> layDanhSachTheoKhach(@PathVariable Integer idKhachHang) {
        return ResponseEntity.ok(gioHangChiTietService.getDanhSachTheoKhach(idKhachHang));
    }

    @PutMapping("/cap-nhat")
    public ResponseEntity<?> capNhatSoLuong(@RequestParam Integer id, @RequestParam int soLuongMoi) {
        try {
            GioHangChiTiet capNhat = gioHangChiTietService.capNhatSoLuong(id, soLuongMoi);
            return ResponseEntity.ok(capNhat);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Lỗi khi cập nhật số lượng!"));
        }
    }

    @DeleteMapping("/xoa-tat-ca/{idKhach}")
    public ResponseEntity<Void> xoaHetTheoKhach(@PathVariable Integer idKhach) {
        gioHangChiTietService.xoaTatCaTheoKhach(idKhach);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/xoa/{id}")
    public ResponseEntity<Void> xoaSanPhamKhoiGio(@PathVariable Integer id) {
        gioHangChiTietService.xoaTheoId(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/so-loai/{idKhach}")
    public ResponseEntity<Integer> soLoai(@PathVariable Integer idKhach) {
        int count = gioHangChiTietService.soLoaiSanPham(idKhach);
        return ResponseEntity.ok(count);
    }

    @GetMapping("/tong-so-luong/{idKhachHang}")
    public ResponseEntity<Integer> tongSoLuong(@PathVariable Integer idKhachHang) {
        return ResponseEntity.ok(gioHangChiTietService.tongSoLuong(idKhachHang));
    }

    @GetMapping("/tong-tien/{idKhachHang}")
    public ResponseEntity<Double> tongTien(@PathVariable Integer idKhachHang) {
        return ResponseEntity.ok(gioHangChiTietService.tongTien(idKhachHang));
    }
}

