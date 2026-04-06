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

    // 1. Lấy tất cả Sản phẩm NAM (Bỏ qua nữ hoàn toàn)
    public List<SanPham> getAllActive() {
        return sanPhamRepo.findAllByTrangThaiAndGioiTinh(1, 0); 
    }

    // 2. Chỉ phục vụ cho giày Nam
    public List<SanPham> getProductsByGender(Integer gender) {
        // Luôn trả về giới tính 0 bất kể đầu vào
        return sanPhamRepo.findAllByTrangThaiAndGioiTinh(1, 0);
    }

    // 3. Hệ thống tìm kiếm - LUÔN LUÔN là giày Nam
    public List<SanPham> searchAndFilter(Integer gender, Integer idCategory, Integer idBrand, String search) {
        // Cưỡng chế giới tính là 0 để xóa sạch dữ liệu nữ
        return sanPhamRepo.filterProducts(0, idCategory, idBrand, search);
    }

    public SanPham getById(Integer id) {
        return sanPhamRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm"));
    }

    // 4. Tạo mới sản phẩm (Bắt buộc phải có Giới tính từ đây)
    public SanPham create(SanPham sanPham) {
        Optional<SanPham> existing = sanPhamRepo.findByTenSanPhamIgnoreCase(sanPham.getTenSanPham());
        if (existing.isPresent()) {
            throw new RuntimeException("Tên sản phẩm đã tồn tại!");
        }
        if (sanPham.getGioiTinh() == null) {
            sanPham.setGioiTinh(0); // Mặc định là Nam nếu không chọn
        }
        sanPham.setTrangThai(1);
        return sanPhamRepo.save(sanPham);
    }

    // 5. Cập nhật và lưu lại chuẩn Giới tính
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
        current.setGioiTinh(sanPham.getGioiTinh()); // ✅ Chuẩn hóa giới tính

        return sanPhamRepo.save(current);
    }

    public void delete(Integer id) {
        SanPham sanPham = sanPhamRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm"));
        sanPham.setTrangThai(0);
        sanPhamRepo.save(sanPham);
    }

    // Lấy sản phẩm nổi bật theo giới tính cho Mega Menu
    public List<SanPham> getFeaturedByGender(Integer gender) {
        return sanPhamRepo.findFeaturedByGender(gender);
    }
}