package com.example.backend.service;

import com.example.backend.dto.SPCTDTO;
import com.example.backend.dto.SPCTRequest;
import com.example.backend.dto.SanPhamDonHangResponse;
import com.example.backend.entity.*;
import com.example.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.sql.Date;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SPCTService {

    @Autowired
    private SanPhamChiTietRepository spcti;

    @Autowired
    private SanPhamInterface spi;

    @Autowired
    private KichThuocInterface kti;

    @Autowired
    private MauSacInterface msi;

    @Autowired
    private KhuyenMaiRepository khuyenMaiRepository;

    @Autowired
    private KhuyenMaiService khuyenMaiService;

    @Transactional
    public SanPhamChiTiet createSanPhamChiTiet(Integer id, SPCTRequest request) {
        request.setIdSanPham(id);

        // Kiểm tra mã SKU
        if (request.getMa() == null || request.getMa().trim().isEmpty()) {
            throw new RuntimeException("Mã SKU không được để trống!");
        }
        String maSku = request.getMa().trim();
        if (!maSku.matches("^[a-zA-Z0-9-_]+$")) {
            throw new RuntimeException("Mã SKU không hợp lệ! Chỉ được chứa chữ cái, số, dấu gạch ngang (-) và gạch dưới (_), không chứa khoảng trắng.");
        }
        if (spcti.existsByMa(maSku)) {
            throw new RuntimeException("Mã SKU \"" + maSku + "\" đã tồn tại trên hệ thống!");
        }

        // Kiểm tra trùng biến thể
        boolean exists = spcti.existsBySanPham_IdAndMauSac_IdAndKichThuoc_Id(
                id, request.getIdMauSac(), request.getIdKichThuoc()
        );
        if (exists) {
            throw new RuntimeException("Biến thể với màu sắc và kích thước này đã tồn tại!");
        }

        SanPham sanPham = spi.findById(request.getIdSanPham())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm"));

        KichThuoc kichThuoc = kti.findById(request.getIdKichThuoc())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy kích thước"));

        MauSac mauSac = msi.findById(request.getIdMauSac())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy màu sắc"));

        SanPhamChiTiet spct = new SanPhamChiTiet();
        spct.setSanPham(sanPham);
        spct.setKichThuoc(kichThuoc);
        spct.setMauSac(mauSac);
        spct.setMa(maSku); // ✅ THÊM: Mã SKU đã trim
        spct.setSoLuong(request.getSoLuong());
        spct.setGiaBan(request.getGiaBan());
        spct.setNgaySanXuat((Date) request.getNgaySanXuat());
        spct.setNgayTao(LocalDateTime.now());
        spct.setTrangThai(1); // mặc định còn bán

        return spcti.save(spct);
    }

    @Transactional
    public SanPhamChiTiet updateSanPhamChiTiet(Integer idSpct, SPCTRequest request) {
        // Tìm biến thể cũ
        SanPhamChiTiet spct = spcti.findById(idSpct)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy biến thể sản phẩm"));

        // Lấy id sản phẩm, id màu sắc, id kích thước mới (ưu tiên giá trị mới, nếu không có thì lấy từ spct cũ)
        Integer idSanPham = request.getIdSanPham() != null ? request.getIdSanPham() : spct.getSanPham().getId();
        Integer idMauSac = request.getIdMauSac() != null ? request.getIdMauSac() : spct.getMauSac().getId();
        Integer idKichThuoc = request.getIdKichThuoc() != null ? request.getIdKichThuoc() : spct.getKichThuoc().getId();

        // Kiểm tra trùng biến thể (trừ chính nó)
        boolean exists = spcti.existsBySanPham_IdAndMauSac_IdAndKichThuoc_IdAndIdNot(
                idSanPham, idMauSac, idKichThuoc, idSpct
        );
        if (exists) {
            throw new RuntimeException("Biến thể này đã tồn tại!");
        }

        // Nếu muốn cho phép sửa các trường này:
        if (request.getIdSanPham() != null) {
            SanPham sanPham = spi.findById(request.getIdSanPham())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm"));
            spct.setSanPham(sanPham);
        }
        if (request.getIdKichThuoc() != null) {
            KichThuoc kichThuoc = kti.findById(request.getIdKichThuoc())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy kích thước"));
            spct.setKichThuoc(kichThuoc);
        }
        if (request.getIdMauSac() != null) {
            MauSac mauSac = msi.findById(request.getIdMauSac())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy màu sắc"));
            spct.setMauSac(mauSac);
        }
        if (request.getMa() != null) { // ✅ THÊM: Mã SKU
            String maSku = request.getMa().trim();
            if (maSku.isEmpty()) {
                throw new RuntimeException("Mã SKU không được để trống!");
            }
            if (!maSku.matches("^[a-zA-Z0-9-_]+$")) {
                throw new RuntimeException("Mã SKU không hợp lệ! Chỉ được chứa chữ cái, số, dấu gạch ngang (-) và gạch dưới (_), không chứa khoảng trắng.");
            }
            if (spcti.existsByMaAndIdNot(maSku, idSpct)) {
                throw new RuntimeException("Mã SKU \"" + maSku + "\" đã tồn tại trên hệ thống!");
            }
            spct.setMa(maSku);
        }
        if (request.getSoLuong() != null) {
            spct.setSoLuong(request.getSoLuong());
        }
        if (request.getGiaBan() != null) {
            spct.setGiaBan(request.getGiaBan());
        }
        if (request.getNgaySanXuat() != null) {
            spct.setNgaySanXuat((Date) request.getNgaySanXuat());
        }

        return spcti.save(spct);
    }

    public List<SanPhamChiTiet> getAll() {
        return spcti.findAll();
    }

    public List<SPCTDTO> getAllForOffline() {
        return spcti.getAllSPCTDTO();
    }

    public List<SanPhamDonHangResponse> getSanPhamByDonHang(Integer idDonHang) {
        return spcti.getSanPhamByDonHang(idDonHang);
    }

    public List<SanPhamChiTiet> addSanPhamDuocKhuyenMai(Integer idKhuyenMai, List<Integer> listIdSanPham) {
        KhuyenMai khuyenMai = khuyenMaiRepository.findById(idKhuyenMai)
                .orElseThrow(() -> new IllegalArgumentException("Khuyến mãi không tồn tại"));

        List<SanPhamChiTiet> danhSachSanPham = spcti.findAllById(listIdSanPham);

        for (SanPhamChiTiet sp : danhSachSanPham) {
            sp.setKhuyenMai(khuyenMai);
        }

        khuyenMaiService.capNhatGiaKhuyenMaiChoDanhSach(danhSachSanPham);

        return spcti.saveAll(danhSachSanPham);
    }

    public List<SanPhamChiTiet> removeSanPhamDuocKhuyenMai(Integer idKhuyenMai, List<Integer> listIdSanPham) {
        khuyenMaiRepository.findById(idKhuyenMai)
                .orElseThrow(() -> new IllegalArgumentException("Khuyến mãi không tồn tại"));

        List<SanPhamChiTiet> danhSachSanPham = spcti.findAllById(listIdSanPham);

        for (SanPhamChiTiet sp : danhSachSanPham) {
            if (sp.getKhuyenMai() != null && sp.getKhuyenMai().getId().equals(idKhuyenMai)) {
                sp.setKhuyenMai(null);
            }
        }

        // Tái tính toán lại giá
        khuyenMaiService.capNhatGiaKhuyenMaiChoDanhSach(danhSachSanPham);

        return spcti.saveAll(danhSachSanPham);
    }

    public List<SanPhamChiTiet> getSPCTDTOById(Integer id) {
        return spcti.findBySanPham_Id(id);
    }

    public SPCTDTO getSPCTDTOByIdSPCT(Integer id) {
        return spcti.getSPCTDTOById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm chi tiết"));
    }

    public List<SanPhamChiTiet> getThungrac(Integer id) {
        return spcti.findBySanPham_IdAndTrangThai(id,0);
    }

    public List<SPCTDTO> searchByTenSanPham(String keyword) {
        return spcti.searchByTenSanPham(keyword);
    }

    public List<SanPhamChiTiet> filterSPCT(Integer sanPhamId, Integer mauSacId, Integer kichThuocId, Integer trangThai) {
        return spcti.filterSPCT(sanPhamId, mauSacId, kichThuocId, trangThai);
    }

    public SanPhamChiTiet findById(Integer id) {
        return spcti.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm chi tiết"));
    }

    public void khoi_phuc(Integer id) {
        Optional<SanPhamChiTiet> optional = spcti.findById(id);
        if (optional.isPresent()) {
            SanPhamChiTiet spct = optional.get();
            spct.setTrangThai(1); // 1 = đang bán, 0 = đã xóa
            spcti.save(spct);
        } else {
            throw new RuntimeException("Không tìm thấy sản phẩm");
        }
    }

    public void xoa_mem(Integer id) {
        Optional<SanPhamChiTiet> optional = spcti.findById(id);
        if (optional.isPresent()) {
            SanPhamChiTiet spct = optional.get();
            spct.setTrangThai(0); // 1 = đang bán, 0 = đã xóa
            spcti.save(spct);
        } else {
            throw new RuntimeException("Không tìm thấy sản phẩm");
        }
    }

    public SanPhamChiTiet create(SanPhamChiTiet s) {
        if (s.getMa() == null || s.getMa().trim().isEmpty()) {
            throw new RuntimeException("Mã SKU không được để trống!");
        }
        String maSku = s.getMa().trim();
        if (!maSku.matches("^[a-zA-Z0-9-_]+$")) {
            throw new RuntimeException("Mã SKU không hợp lệ! Chỉ được chứa chữ cái, số, dấu gạch ngang (-) và gạch dưới (_), không chứa khoảng trắng.");
        }
        if (spcti.existsByMa(maSku)) {
            throw new RuntimeException("Mã SKU \"" + maSku + "\" đã tồn tại trên hệ thống!");
        }

        if (s.getSanPham() != null && s.getMauSac() != null && s.getKichThuoc() != null) {
            boolean exists = spcti.existsBySanPham_IdAndMauSac_IdAndKichThuoc_Id(
                    s.getSanPham().getId(), s.getMauSac().getId(), s.getKichThuoc().getId()
            );
            if (exists) {
                throw new RuntimeException("Biến thể với màu sắc và kích thước này đã tồn tại!");
            }
        }

        s.setMa(maSku);
        s.setNgayTao(LocalDateTime.now());
        if (s.getTrangThai() == null) {
            s.setTrangThai(1);
        }
        return spcti.save(s);
    }

    public SanPhamChiTiet update(Integer id, SanPhamChiTiet s) {
        SanPhamChiTiet old = spcti.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy biến thể"));

        if (s.getMa() != null) {
            String maSku = s.getMa().trim();
            if (maSku.isEmpty()) {
                throw new RuntimeException("Mã SKU không được để trống!");
            }
            if (!maSku.matches("^[a-zA-Z0-9-_]+$")) {
                throw new RuntimeException("Mã SKU không hợp lệ! Chỉ được chứa chữ cái, số, dấu gạch ngang (-) và gạch dưới (_), không chứa khoảng trắng.");
            }
            if (spcti.existsByMaAndIdNot(maSku, id)) {
                throw new RuntimeException("Mã SKU \"" + maSku + "\" đã tồn tại trên hệ thống!");
            }
            old.setMa(maSku);
        }

        Integer idSanPham = s.getSanPham() != null ? s.getSanPham().getId()
                : (old.getSanPham() != null ? old.getSanPham().getId() : null);
        Integer idMauSac = s.getMauSac() != null ? s.getMauSac().getId()
                : (old.getMauSac() != null ? old.getMauSac().getId() : null);
        Integer idKichThuoc = s.getKichThuoc() != null ? s.getKichThuoc().getId()
                : (old.getKichThuoc() != null ? old.getKichThuoc().getId() : null);

        if (idSanPham != null && idMauSac != null && idKichThuoc != null) {
            boolean exists = spcti.existsBySanPham_IdAndMauSac_IdAndKichThuoc_IdAndIdNot(
                    idSanPham, idMauSac, idKichThuoc, id
            );
            if (exists) {
                throw new RuntimeException("Biến thể này đã tồn tại!");
            }
        }

        if (s.getSanPham() != null) old.setSanPham(s.getSanPham());
        if (s.getMauSac() != null) old.setMauSac(s.getMauSac());
        if (s.getKichThuoc() != null) old.setKichThuoc(s.getKichThuoc());
        if (s.getSoLuong() != null) old.setSoLuong(s.getSoLuong());
        if (s.getGiaBan() != null) old.setGiaBan(s.getGiaBan());
        if (s.getNgaySanXuat() != null) old.setNgaySanXuat(s.getNgaySanXuat());
        if (s.getTrangThai() != null) old.setTrangThai(s.getTrangThai());

        return spcti.save(old);
    }

    @Transactional
    public void delete(Integer id) {
        Optional<SanPhamChiTiet> optional = spcti.findById(id);
        if (optional.isPresent()) {
            SanPhamChiTiet spct = optional.get();
            spct.setTrangThai(0); // Soft delete
            spcti.save(spct);
        }
    }
}
