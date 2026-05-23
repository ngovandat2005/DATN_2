
package com.example.backend.service;


import com.example.backend.KhongTimThay;
import com.example.backend.dto.KhuyenMaiDTO;
import com.example.backend.entity.KhuyenMai;

import com.example.backend.entity.SanPhamChiTiet;
import com.example.backend.repository.KhuyenMaiRepository;
import com.example.backend.repository.SanPhamChiTietRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class KhuyenMaiService {

    @Autowired
    private KhuyenMaiRepository khuyenMaiRepository;

    @Autowired
    private SanPhamChiTietRepository sanPhamChiTietRepository;

    public KhuyenMaiDTO convertDTO(KhuyenMai km) {
        return new KhuyenMaiDTO(
                km.getId(),
                km.getTenKhuyenMai(),
                km.getGiaTri(),
                km.getNgayBatDau(),
                km.getNgayKetThuc(),
                km.getTrangThai()
        );
    }

    // ham lay all khuyen mai
    public List<KhuyenMaiDTO> getall() {
        return khuyenMaiRepository.findAll().stream()
                .map(khuyenMai -> new KhuyenMaiDTO(
                        khuyenMai.getId(),
                        khuyenMai.getTenKhuyenMai(),
                        khuyenMai.getGiaTri(),
                        khuyenMai.getNgayBatDau(),
                        khuyenMai.getNgayKetThuc(),
                        khuyenMai.getTrangThai()
                )).toList();
    }

    //ham lay danh sach theo id
    public KhuyenMaiDTO findById(Integer id) {
        return khuyenMaiRepository.findById(id)
                .map(khuyenMai -> new KhuyenMaiDTO(
                        khuyenMai.getId(),
                        khuyenMai.getTenKhuyenMai(),
                        khuyenMai.getGiaTri(),
                        khuyenMai.getNgayBatDau(),
                        khuyenMai.getNgayKetThuc(),
                        khuyenMai.getTrangThai()
                ))
                .orElseThrow(() -> new KhongTimThay("Không tìm thấy khuyến mãi!"));
    }

    // ham create khuyenmai
    public KhuyenMaiDTO create(KhuyenMaiDTO dto) {
        if (dto.getTenKhuyenMai() == null || dto.getTenKhuyenMai().trim().isEmpty()) {
            throw new RuntimeException("Tên khuyến mãi không được để trống!");
        }
        if (khuyenMaiRepository.existsByTenKhuyenMai(dto.getTenKhuyenMai().trim())) {
            throw new RuntimeException("Tên khuyến mãi \"" + dto.getTenKhuyenMai() + "\" đã tồn tại!");
        }
        if (dto.getGiaTri() <= 0 || dto.getGiaTri() > 100) {
            throw new RuntimeException("Giá trị khuyến mãi phải lớn hơn 0 và không vượt quá 100%!");
        }
        if (dto.getNgayBatDau() == null || dto.getNgayKetThuc() == null) {
            throw new RuntimeException("Ngày bắt đầu và ngày kết thúc không được để trống!");
        }
        if (!dto.getNgayKetThuc().isAfter(dto.getNgayBatDau())) {
            throw new RuntimeException("Ngày kết thúc phải sau ngày bắt đầu!");
        }

        KhuyenMai km = new KhuyenMai();
        km.setTenKhuyenMai(dto.getTenKhuyenMai().trim());
        km.setGiaTri(dto.getGiaTri());
        km.setNgayBatDau(dto.getNgayBatDau());
        km.setNgayKetThuc(dto.getNgayKetThuc());
        km.setTrangThai(dto.getTrangThai());

        return convertDTO(khuyenMaiRepository.save(km));
    }

    @Transactional
    public boolean delete(Integer id) {
        Optional<KhuyenMai> opt = khuyenMaiRepository.findById(id);
        if (opt.isPresent()) {
            // Cần gỡ khuyến mãi khỏi các sản phẩm chi tiết trước
            List<SanPhamChiTiet> chiTietList = sanPhamChiTietRepository.findByKhuyenMai_Id(id);
            for (SanPhamChiTiet ct : chiTietList) {
                ct.setKhuyenMai(null);
                ct.setGiaBanGiamGia(ct.getGiaBan());
            }
            sanPhamChiTietRepository.saveAll(chiTietList);
            
            KhuyenMai km = opt.get();
            km.setTrangThai(0);
            km.setNgayKetThuc(LocalDateTime.now());
            khuyenMaiRepository.save(km);
            return true;
        }
        return false;
    }

    //ham update khuyen mai
    public KhuyenMaiDTO update(int id, KhuyenMaiDTO dto) {
        if (dto.getTenKhuyenMai() == null || dto.getTenKhuyenMai().trim().isEmpty()) {
            throw new RuntimeException("Tên khuyến mãi không được để trống!");
        }
        if (khuyenMaiRepository.existsByTenKhuyenMaiAndIdNot(dto.getTenKhuyenMai().trim(), id)) {
            throw new RuntimeException("Tên khuyến mãi \"" + dto.getTenKhuyenMai() + "\" đã tồn tại!");
        }
        if (dto.getGiaTri() <= 0 || dto.getGiaTri() > 100) {
            throw new RuntimeException("Giá trị khuyến mãi phải lớn hơn 0 và không vượt quá 100%!");
        }
        if (dto.getNgayBatDau() == null || dto.getNgayKetThuc() == null) {
            throw new RuntimeException("Ngày bắt đầu và ngày kết thúc không được để trống!");
        }
        if (!dto.getNgayKetThuc().isAfter(dto.getNgayBatDau())) {
            throw new RuntimeException("Ngày kết thúc phải sau ngày bắt đầu!");
        }

        return khuyenMaiRepository.findById(id)
                .map(km -> {
                    km.setTenKhuyenMai(dto.getTenKhuyenMai().trim());
                    km.setGiaTri(dto.getGiaTri());
                    km.setNgayBatDau(dto.getNgayBatDau());
                    km.setNgayKetThuc(dto.getNgayKetThuc());
                    km.setTrangThai(dto.getTrangThai());

                    return convertDTO(khuyenMaiRepository.save(km));
                })
                .orElseThrow(() -> new KhongTimThay("Không tìm thấy khuyến mãi!"));
    }

    @Transactional
    public KhuyenMai tatKhuyenMai(int id) {
        LocalDateTime now = LocalDateTime.now();
        Optional<KhuyenMai> khuyenMai = khuyenMaiRepository.findById(id);
        if (khuyenMai.isPresent()) {
            KhuyenMai km = khuyenMai.get();
            km.setTrangThai(0);
            km.setNgayKetThuc(now);

            // Cập nhật lại giá cho các sản phẩm liên quan ngay lập tức
            List<SanPhamChiTiet> chiTietList = sanPhamChiTietRepository.findByKhuyenMai_Id(id);
            for (SanPhamChiTiet ct : chiTietList) {
                ct.setKhuyenMai(null);
                ct.setGiaBanGiamGia(ct.getGiaBan());
            }
            sanPhamChiTietRepository.saveAll(chiTietList);

            return khuyenMaiRepository.save(km);
        }
        throw new KhongTimThay("Không tìm thấy khuyến mãi!");
    }

    public void capNhatGiaKhuyenMaiChoDanhSach(List<SanPhamChiTiet> danhSachSanPham) {
        LocalDateTime now = LocalDateTime.now();

        for (SanPhamChiTiet sp : danhSachSanPham) {
            KhuyenMai km = sp.getKhuyenMai();
            if (km != null &&
                    km.getTrangThai() == 1 &&
                    now.isAfter(km.getNgayBatDau()) &&
                    now.isBefore(km.getNgayKetThuc())) {

                Float giaTri = km.getGiaTri();
                if (giaTri != null && giaTri > 0) {
                    double giamGia = sp.getGiaBan() * giaTri / 100.0;
                    sp.setGiaBanGiamGia(sp.getGiaBan() - giamGia);
                    continue;
                }
            }

            // Không có khuyến mãi hợp lệ
            sp.setGiaBanGiamGia(sp.getGiaBan());
        }
    }

    @Scheduled(fixedRate = 60000) // Cập nhật mỗi 60 giây
    public void updateActiveKhuyenMai() {
        updateKhuyenMaiActive();
    }

    /**
     * Cập nhật trạng thái khuyến mãi:
     * - Nếu đã hết hạn: gỡ khỏi sản phẩm, trạng thái = 0
     * - Nếu đang hoạt động: trạng thái = 1, tính giá giảm cho các sản phẩm
     * - Nếu chưa bắt đầu hoặc hết hạn: trạng thái = 0
     */
    @Transactional
    public void updateKhuyenMaiActive() {
        LocalDateTime now = LocalDateTime.now();

        List<KhuyenMai> khuyenMaiList = khuyenMaiRepository.findAll();
        List<KhuyenMai> khuyenMaiCapNhat = new ArrayList<>();
        List<SanPhamChiTiet> sanPhamChiTietCapNhat = new ArrayList<>();

        for (KhuyenMai km : khuyenMaiList) {
            boolean isExpired = km.getNgayKetThuc() != null && km.getNgayKetThuc().isBefore(now);
            boolean isActive = km.getNgayBatDau() != null && km.getNgayBatDau().isBefore(now)
                    && km.getNgayKetThuc() != null && km.getNgayKetThuc().isAfter(now);

            List<SanPhamChiTiet> chiTietList = sanPhamChiTietRepository.findByKhuyenMai_Id((km.getId()));

            if (isExpired) {
                // HẾT HẠN → Gỡ khỏi sản phẩm + cập nhật trạng thái KM
                for (SanPhamChiTiet ct : chiTietList) {
                    ct.setKhuyenMai(null);
                    ct.setGiaBanGiamGia(ct.getGiaBan());
                    sanPhamChiTietCapNhat.add(ct);
                }
                if (km.getTrangThai() != 0) {
                    km.setTrangThai(0);
                    khuyenMaiCapNhat.add(km);
                }

            } else if (isActive) {
                // ĐANG HIỆU LỰC
                // Đảm bảo trạng thái = 1
                if (km.getTrangThai() != 1) {
                    km.setTrangThai(1);
                    khuyenMaiCapNhat.add(km);
                }
                // Đồng bộ giá giảm cho các sản phẩm
                for (SanPhamChiTiet ct : chiTietList) {
                    Float giaTri = km.getGiaTri();
                    if (giaTri != null && giaTri > 0) {
                        double newGiam = ct.getGiaBan() - (ct.getGiaBan() * giaTri / 100.0);
                        if (ct.getGiaBanGiamGia() == null || Math.abs(ct.getGiaBanGiamGia() - newGiam) > 0.01) {
                            ct.setGiaBanGiamGia(newGiam);
                            sanPhamChiTietCapNhat.add(ct);
                        }
                    }
                }
            } else {
                // CHƯA ĐẾN hoặc KHÔNG HỢP LỆ
                if (km.getTrangThai() != 0) {
                    km.setTrangThai(0);
                    khuyenMaiCapNhat.add(km);
                }
            }
        }

        if (!sanPhamChiTietCapNhat.isEmpty()) {
            sanPhamChiTietRepository.saveAll(sanPhamChiTietCapNhat);
        }

        if (!khuyenMaiCapNhat.isEmpty()) {
            khuyenMaiRepository.saveAll(khuyenMaiCapNhat);
        }
    }
}
