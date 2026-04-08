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

    // 1. Lấy tất cả Sản phẩm đang kinh doanh
    public List<SanPham> getAllActive() {
        return sanPhamRepo.findAllByTrangThai(1); 
    }

    // 2. Lấy sản phẩm theo trạng thái
    public List<SanPham> getProducts() {
        return sanPhamRepo.findAllByTrangThai(1);
    }

    // 3. Hệ thống tìm kiếm
    public List<SanPham> searchAndFilter(Integer idCategory, Integer idBrand, String search) {
        return sanPhamRepo.filterProducts(idCategory, idBrand, search);
    }

    public SanPham getById(Integer id) {
        return sanPhamRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm"));
    }

    // 4. Tạo mới sản phẩm
    public SanPham create(SanPham sanPham) {
        Optional<SanPham> existing = sanPhamRepo.findByTenSanPhamIgnoreCase(sanPham.getTenSanPham());
        if (existing.isPresent()) {
            throw new RuntimeException("Tên sản phẩm đã tồn tại!");
        }
        sanPham.setTrangThai(1);
        return sanPhamRepo.save(sanPham);
    }

    // 5. Cập nhật sản phẩm
    public SanPham update(Integer id, SanPham sanPham) {
        SanPham current = sanPhamRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm"));

        current.setTenSanPham(sanPham.getTenSanPham());
        current.setMa(sanPham.getMa());
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

    // Lấy sản phẩm nổi bật cho trang chủ
    public List<SanPham> getFeaturedProducts() {
        return sanPhamRepo.findFeaturedProducts();
    }
}