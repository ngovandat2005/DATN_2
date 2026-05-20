package com.example.backend.service;

import com.example.backend.entity.SanPham;
import com.example.backend.repository.SanPhamInterface;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SanPhamService {

    @Autowired
    private SanPhamInterface sanPhamRepo;

    public List<SanPham> getAllActive() {
        return sanPhamRepo.findAllByTrangThaiOrderByIdDesc(1);
    }

    public SanPham getById(Integer id) {
        return sanPhamRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm với ID: " + id));
    }

    public List<SanPham> searchAndFilter(Integer idDanhMuc, Integer idThuongHieu, String search) {
        return sanPhamRepo.filterProducts(idDanhMuc, idThuongHieu, search);
    }

    public SanPham create(SanPham sanPham) {
        if (sanPham.getTenSanPham() == null || sanPham.getTenSanPham().trim().isEmpty()) {
            throw new RuntimeException("Tên sản phẩm không được để trống!");
        }
        if (sanPham.getMa() == null || sanPham.getMa().trim().isEmpty()) {
            throw new RuntimeException("Mã sản phẩm không được để trống!");
        }
        String maSp = sanPham.getMa().trim();
        if (!maSp.matches("^[a-zA-Z0-9-_]+$")) {
            throw new RuntimeException("Mã sản phẩm không hợp lệ! Chỉ được chứa chữ cái, số, dấu gạch ngang (-) và gạch dưới (_), không chứa khoảng trắng.");
        }
        if (sanPhamRepo.existsByMa(maSp)) {
            throw new RuntimeException("Mã sản phẩm \"" + maSp + "\" đã tồn tại!");
        }

        Optional<SanPham> existing =
                sanPhamRepo.findByTenSanPhamIgnoreCase(sanPham.getTenSanPham().trim());

        if (existing.isPresent()) {
            throw new RuntimeException("Tên sản phẩm đã tồn tại!");
        }

        sanPham.setMa(maSp);
        sanPham.setTrangThai(1);
        return sanPhamRepo.save(sanPham);
    }

    public SanPham update(Integer id, SanPham sanPham) {

        SanPham current = sanPhamRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm"));

        if (sanPham.getTenSanPham() == null || sanPham.getTenSanPham().trim().isEmpty()) {
            throw new RuntimeException("Tên sản phẩm không được để trống!");
        }
        if (sanPham.getMa() == null || sanPham.getMa().trim().isEmpty()) {
            throw new RuntimeException("Mã sản phẩm không được để trống!");
        }
        String maSp = sanPham.getMa().trim();
        if (!maSp.matches("^[a-zA-Z0-9-_]+$")) {
            throw new RuntimeException("Mã sản phẩm không hợp lệ! Chỉ được chứa chữ cái, số, dấu gạch ngang (-) và gạch dưới (_), không chứa khoảng trắng.");
        }
        if (sanPhamRepo.existsByMaAndIdNot(maSp, id)) {
            throw new RuntimeException("Mã sản phẩm \"" + maSp + "\" đã tồn tại!");
        }

        Optional<SanPham> existing =
                sanPhamRepo.findByTenSanPhamIgnoreCase(sanPham.getTenSanPham().trim());

        if (existing.isPresent() && !existing.get().getId().equals(id)) {
            throw new RuntimeException("Tên sản phẩm đã tồn tại!");
        }

        current.setTenSanPham(sanPham.getTenSanPham().trim());
        current.setMa(maSp); // ✅ THÊM: Mã sản phẩm
        current.setThuongHieu(sanPham.getThuongHieu());
        current.setDanhMuc(sanPham.getDanhMuc());
        current.setChatLieu(sanPham.getChatLieu());
        current.setXuatXu(sanPham.getXuatXu());
        current.setImages(sanPham.getImages());

        return sanPhamRepo.save(current);
    }

    public void delete(Integer id) {
        SanPham sanPham = sanPhamRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm"));

        sanPham.setTrangThai(0);
        sanPhamRepo.save(sanPham);
    }

    public void restoreSanPham(Integer id) {
        SanPham sp = sanPhamRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm"));

        sp.setTrangThai(1);
        sanPhamRepo.save(sp);
    }

    public List<SanPham> getDeleted() {
        return sanPhamRepo.findAllByTrangThaiOrderByIdDesc(0);
    }
}
