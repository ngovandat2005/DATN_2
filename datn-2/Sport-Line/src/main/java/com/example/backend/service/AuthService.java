package com.example.backend.service;

import com.example.backend.dto.AuthResponse;
import com.example.backend.dto.DangNhapRequest;
import com.example.backend.entity.KhachHang;
import com.example.backend.entity.NhanVien;
import com.example.backend.repository.KhachHangRepository;
import com.example.backend.repository.NhanVienRepository;
import com.example.backend.PasswordUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private KhachHangRepository khachHangRepo;
    @Autowired
    private NhanVienRepository nhanVienRepo;
    @Autowired
    private PasswordUtil passwordUtil;

    public AuthResponse dangNhap(DangNhapRequest req) {
        String email = req.getEmail();
        String password = req.getMatKhau();

        Optional<KhachHang> khOpt = khachHangRepo.findByEmail(email);
        if (khOpt.isPresent()) {
            KhachHang kh = khOpt.get();

            if (!passwordUtil.matches(password, kh.getMatKhau())) {
                throw new RuntimeException("Sai mật khẩu khách hàng");
            }

            if (!Boolean.TRUE.equals(kh.getTrangThai())) {
                throw new RuntimeException("Tài khoản khách hàng bị khóa");
            }

            upgradePasswordIfPlain(kh, password);
            return new AuthResponse(kh.getId(), kh.getTenKhachHang(), "KHACH", "/trang-chu");
        }

        Optional<NhanVien> nvOpt = nhanVienRepo.findByEmail(email);
        if (nvOpt.isPresent()) {
            NhanVien nv = nvOpt.get();

            if (!passwordUtil.matches(password, nv.getMatKhau())) {
                throw new RuntimeException("Sai mật khẩu nhân viên");
            }

            if (!Boolean.TRUE.equals(nv.getTrangThai())) {
                throw new RuntimeException("Tài khoản nhân viên bị khóa");
            }

            upgradePasswordIfPlain(nv, password);
            return new AuthResponse(nv.getId(), nv.getTenNhanVien(), "NHANVIEN", "/admin/ban-hang");
        }
        throw new RuntimeException("Email không tồn tại trong hệ thống");
    }

    private void upgradePasswordIfPlain(KhachHang kh, String rawPassword) {
        if (!passwordUtil.isEncoded(kh.getMatKhau())) {
            kh.setMatKhau(passwordUtil.encode(rawPassword));
            khachHangRepo.save(kh);
        }
    }

    private void upgradePasswordIfPlain(NhanVien nv, String rawPassword) {
        if (!passwordUtil.isEncoded(nv.getMatKhau())) {
            nv.setMatKhau(passwordUtil.encode(rawPassword));
            nhanVienRepo.save(nv);
        }
    }

    public KhachHang dangKy(com.example.backend.dto.DangKyRequest req) {
        Optional<KhachHang> khOpt = khachHangRepo.findByEmail(req.getEmail());
        if (khOpt.isPresent()) {
            throw new RuntimeException("Email đã tồn tại!");
        }

        Optional<NhanVien> nvOpt = nhanVienRepo.findByEmail(req.getEmail());
        if (nvOpt.isPresent()) {
            throw new RuntimeException("Email đã tồn tại!");
        }

        Optional<KhachHang> phoneOpt = khachHangRepo.findBySoDienThoai(req.getSoDienThoai());
        if (phoneOpt.isPresent()) {
            throw new RuntimeException("Số điện thoại đã tồn tại!");
        }

        if (req.getMatKhau() == null || req.getMatKhau().trim().isEmpty()) {
            throw new RuntimeException("Mật khẩu không được để trống!");
        }

        KhachHang kh = new KhachHang();
        kh.setTenKhachHang(req.getTenKhachHang());
        kh.setEmail(req.getEmail());
        kh.setNgaySinh(req.getNgaySinh());
        kh.setDiaChi(req.getDiaChi());
        kh.setSoDienThoai(req.getSoDienThoai());
        kh.setMatKhau(passwordUtil.encode(req.getMatKhau()));
        kh.setTrangThai(true);

        return khachHangRepo.save(kh);
    }
}
