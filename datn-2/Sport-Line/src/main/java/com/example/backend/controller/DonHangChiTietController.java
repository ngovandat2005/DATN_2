package com.example.backend.controller;



import com.example.backend.dto.DonHangChiTietDTO;
import com.example.backend.entity.DonHang;
import com.example.backend.repository.DonHangRepository;
import com.example.backend.service.DonHangChiTietService;
import com.example.backend.service.VoucherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import com.example.backend.repository.VoucherRepository;
import com.example.backend.service.DonHangService;
import com.example.backend.entity.Voucher;
import org.springframework.transaction.annotation.Transactional;


@RestController
@RequestMapping("/api")
public class DonHangChiTietController {

    @Autowired
    private DonHangChiTietService chiTietService;
    @Autowired
    private DonHangRepository donHangRepository;

    @Autowired
    private VoucherService voucherService;

    @Autowired
    private VoucherRepository voucherRepository;

    @Autowired
    private DonHangService donHangService;

    @GetMapping("/donhangchitiet")
    public ResponseEntity<List<DonHangChiTietDTO>> getAll() {
        return ResponseEntity.ok(chiTietService.getAll());
    }

    @GetMapping("/donhangchitiet/{id}")
    public ResponseEntity<DonHangChiTietDTO> getById(@PathVariable int id) {
        DonHangChiTietDTO dto = chiTietService.getById(id);
        return dto != null ? ResponseEntity.ok(dto) : ResponseEntity.notFound().build();
    }
    @GetMapping("/donhangchitiet/don-hang/{id}")
    public ResponseEntity<List<DonHangChiTietDTO>> getByIdDonHang(@PathVariable Integer id){
        return ResponseEntity.ok(chiTietService.getDonHangById(id));
    }

    @PostMapping("/donhangchitiet/create")
    public ResponseEntity<DonHangChiTietDTO> create(@RequestBody DonHangChiTietDTO dto) {
        return ResponseEntity.ok(chiTietService.create(dto));
    }

    @PutMapping("/donhangchitiet/update/{id}")
    public ResponseEntity<DonHangChiTietDTO> update(@PathVariable int id, @RequestBody DonHangChiTietDTO dto) {
        DonHangChiTietDTO updated = chiTietService.update(id, dto);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/donhangchitiet/delete/{id}")
    public ResponseEntity<Void> delete(@PathVariable int id) {
        chiTietService.delete(id);
        return ResponseEntity.ok().build();
    }




    @PostMapping("/don-hang-chi-tiet/{idDonHang}/apply-voucher/{idVoucher}")
    public ResponseEntity<?> applyVoucherToDonHang(
            @PathVariable Integer idDonHang,
            @PathVariable Integer idVoucher
    ) {
        DonHang dh = donHangRepository.findById(idDonHang)
                .orElseThrow(() -> new RuntimeException("Đơn hàng không tồn tại"));

        try {
            voucherService.updateVoucherForDonHang(dh,idVoucher);
            donHangRepository.save(dh);

            return ResponseEntity.ok(dh);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/don-hang-chi-tiet/{idDonHang}/remove-voucher")
    @Transactional
    public ResponseEntity<?> removeVoucherFromDonHang(@PathVariable Integer idDonHang) {
        DonHang dh = donHangRepository.findById(idDonHang)
                .orElseThrow(() -> new RuntimeException("Đơn hàng không tồn tại"));

        if (dh.getGiamGia() != null) {
            Voucher v = dh.getGiamGia();
            v.setSoLuong(v.getSoLuong() + 1);
            voucherRepository.save(v);
        }

        dh.setGiamGia(null);
        dh.setTongTienGiamGia(0.0);
        donHangRepository.save(dh);

        // Cập nhật lại tổng tiền đơn hàng sau khi gỡ voucher
        donHangService.capNhatTongTienDonHang(idDonHang);

        DonHang updatedDh = donHangRepository.findById(idDonHang).orElse(dh);
        return ResponseEntity.ok(updatedDh);
    }
}
