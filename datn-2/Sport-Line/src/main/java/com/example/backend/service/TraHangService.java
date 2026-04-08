package com.example.backend.service;

import com.example.backend.dto.TraHangRequestDTO;
import com.example.backend.entity.DonHang;
import com.example.backend.entity.TraHang;
import com.example.backend.entity.TraHangChiTiet;
import com.example.backend.repository.DonHangChiTietRepository;
import com.example.backend.repository.SanPhamChiTietRepository;
import com.example.backend.repository.TraHangChiTietRepository;
import com.example.backend.repository.TraHangRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TraHangService {
    @Autowired
    private TraHangRepository traHangRepo;
    @Autowired private TraHangChiTietRepository thctRepo;
    @Autowired private SanPhamChiTietRepository spctRepo;
    @Autowired private DonHangChiTietRepository dhctRepo; // Giả định bạn đã có

    @Transactional
    public TraHang createRequest(TraHangRequestDTO dto) {
        TraHang th = new TraHang();

        // Gán DonHang
        DonHang dh = new DonHang();
        dh.setId(dto.getIdDonHang());
        th.setDonHang(dh);

        th.setLyDo(dto.getLyDo());
        th.setNgayYeuCau(LocalDateTime.now());
        th.setTrangThai(0);

        // Tính tổng tiền từ DTO
        double tong = dto.getItems().stream()
                .mapToDouble(i -> i.getGiaHoan() * i.getSoLuongTra()).sum();
        th.setTongTienHoan(tong);

        // BƯỚC 1: Lưu phiếu trả hàng trước
        TraHang saved = traHangRepo.save(th);

        // BƯỚC 2: Tạo danh sách chi tiết
        List<TraHangChiTiet> details = dto.getItems().stream().map(i -> {
            TraHangChiTiet ct = new TraHangChiTiet();
            ct.setTraHang(saved); // Gán object vừa save (đã có ID) vào đây
            ct.setIdDonHangChiTiet(i.getIdDonHangChiTiet());
            ct.setSoLuongTra(i.getSoLuongTra());
            ct.setGiaHoan(i.getGiaHoan());
            return ct;
        }).collect(Collectors.toList());

        // BƯỚC 3: Lưu toàn bộ chi tiết
        thctRepo.saveAll(details);

        return saved;
    }
    @Transactional
    public void approveRequest(Integer idTraHang) {
        // 1. Tìm phiếu trả hàng
        TraHang th = traHangRepo.findById(idTraHang)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phiếu trả hàng có ID: " + idTraHang));

        // Kiểm tra nếu đã duyệt rồi thì không cho duyệt nữa
        if (th.getTrangThai() != 0) {
            throw new RuntimeException("Phiếu trả hàng này đã được xử lý (Duyệt/Từ chối) trước đó!");
        }

        th.setTrangThai(1); // Cập nhật trạng thái thành: Đã duyệt

        // 2. Hoàn kho cho từng sản phẩm
        // Lưu ý: Tên hàm phải là getChiTietTraHangs khớp với Entity TraHang
        for (TraHangChiTiet ct : th.getChiTietTraHangs()) {

            // Lấy chi tiết đơn hàng để biết nó thuộc Sản phẩm chi tiết (SPCT) nào
            var dhct = dhctRepo.findById(ct.getIdDonHangChiTiet())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy chi tiết đơn hàng ID: " + ct.getIdDonHangChiTiet()));

            // Lấy ID của SPCT từ đối tượng dhct
            Integer idSPCT = dhct.getSanPhamChiTiet().getId();

            // 3. Cập nhật lại số lượng trong kho
            // Đảm bảo trong SanPhamChiTietRepository đã có hàm updateStock (hoặc updateSoLuongSauKhiTra)
            spctRepo.updateStock(idSPCT, ct.getSoLuongTra());
        }

        // 4. Lưu thay đổi trạng thái của phiếu trả
        traHangRepo.save(th);
    }
}