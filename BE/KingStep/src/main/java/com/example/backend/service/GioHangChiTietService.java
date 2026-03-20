package com.example.backend.service;

import com.example.backend.ThongBao;
import com.example.backend.dto.ThemGioHangDTO;
import com.example.backend.entity.GioHangChiTiet;
import com.example.backend.entity.KhachHang;
import com.example.backend.entity.SanPhamChiTiet;
import com.example.backend.repository.GioHangChiTietRepo;
import com.example.backend.repository.KhachHangRepository;
import com.example.backend.repository.SanPhamChiTietRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class GioHangChiTietService {

    @Autowired
    private GioHangChiTietRepo repo;

    @Autowired
    private SanPhamChiTietRepository spctRepo;

    @Autowired
    private KhachHangRepository khachRepo;

    public GioHangChiTiet themVaoGio(ThemGioHangDTO req) {
        SanPhamChiTiet spct = spctRepo.findById(req.getIdSanPhamChiTiet())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm"));

        KhachHang kh = khachRepo.findById(req.getIdKhachHang())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng"));

        GioHangChiTiet tonTai = repo.findBySanPhamChiTietIdAndKhachHangId(
                spct.getId(), kh.getId());

        if (tonTai != null) {
            int soLuongMoi = tonTai.getSoLuong() + req.getSoLuong();
            if (soLuongMoi > spct.getSoLuong()) {
                throw new ThongBao("Số lượng vượt quá tồn kho. Tồn kho còn lại: " + spct.getSoLuong());
            }
            tonTai.setSoLuong(soLuongMoi);
            tonTai.setGia(spct.getGiaBan());
            return repo.save(tonTai);
        }

        if (req.getSoLuong() > spct.getSoLuong()) {
            throw new ThongBao("Số lượng vượt quá tồn kho. Tồn kho còn lại: " + spct.getSoLuong());
        }

        GioHangChiTiet moi = new GioHangChiTiet();
        moi.setSanPhamChiTiet(spct);
        moi.setKhachHang(kh);
        moi.setSoLuong(req.getSoLuong());
        moi.setGia(spct.getGiaBan());
        return repo.save(moi);
    }

    // 2. Lấy danh sách giỏ hàng theo khách
    public List<GioHangChiTiet> getDanhSachTheoKhach(Integer idKhachHang) {
        return repo.findByKhachHangId(idKhachHang);
    }

    // 3. Cập nhật số lượng
    public GioHangChiTiet capNhatSoLuong(Integer id, int soLuongMoi) {
        GioHangChiTiet chiTiet = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy chi tiết giỏ hàng"));

        SanPhamChiTiet spct = chiTiet.getSanPhamChiTiet();
        if (soLuongMoi > spct.getSoLuong()) {
            throw new ThongBao("Số lượng vượt quá tồn kho. Còn lại: " + spct.getSoLuong());
        }

        chiTiet.setSoLuong(soLuongMoi);
        return repo.save(chiTiet);
    }

    // 4. Xóa toàn bộ sản phẩm trong giỏ của 1 khách
    public void xoaTatCaTheoKhach(Integer idKhach) {
        List<GioHangChiTiet> danhSach = repo.findByKhachHangId(idKhach);
        repo.deleteAll(danhSach);
    }

    // 5. Đếm số loại sản phẩm
    public int soLoaiSanPham(Integer idKhach) {
        return repo.findByKhachHangId(idKhach).size();
    }

    // 6. Tổng số lượng
    public int tongSoLuong(Integer idKhachHang) {
        return repo.demTongSoLuongTrongGioKhach(idKhachHang);
    }

    // 7. Tổng tiền
    public double tongTien(Integer idKhachHang) {
        return repo.tinhTongTienGioHang(idKhachHang);
    }
}
