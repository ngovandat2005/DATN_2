package com.example.backend.service;

import com.example.backend.dto.DonHangDTO;
import com.example.backend.dto.HoaDonOnlineRequest;
import com.example.backend.dto.SanPhamDatDTO;
import com.example.backend.entity.*;
import com.example.backend.enums.TrangThaiDonHang;
import com.example.backend.repository.*;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class DonHangService {

    @Autowired
    private DonHangChiTietRepository donHangChiTietRepository;
    @Autowired
    private DonHangRepository donHangRepository;
    @Autowired
    private NhanVienRepository nhanVienRepository;
    @Autowired
    private KhachHangRepository khachHangRepository;
    @Autowired
    private SanPhamChiTietRepository sanPhamChiTietRepository;
    @Autowired
    private VoucherRepository voucherRepository;
    @Autowired
    private VoucherService voucherService;
    @Autowired
    private GHNClientService ghnClientService;

    public List<DonHangDTO> getAll() {
        return donHangRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public DonHangDTO getById(int id) {
        return donHangRepository.findById(id)
                .map(this::convertToDTO)
                .orElse(null);
    }

    @Transactional
    public DonHangDTO create(DonHangDTO dto) {
        DonHang donHang = convertToEntity(dto);
        if (donHang.getNgayTao() == null) {
            donHang.setNgayTao(LocalDate.now());
        }
        if (donHang.getTrangThai() == null) {
            donHang.setTrangThai(0);
        }
        if (donHang.getLoaiDonHang() == null) {
            donHang.setLoaiDonHang("Bán hàng tại quầy");
        }

        // Atomic Checkout
        if (donHang.getGiamGia() != null) {
            try {
                Voucher voucher = donHang.getGiamGia();
                voucherService.kiemTraDieuKienVoucher(donHang, voucher.getId());
                
                if (voucher.getSoLuong() != null && voucher.getSoLuong() > 0) {
                    voucher.setSoLuong(voucher.getSoLuong() - 1);
                    voucherRepository.save(voucher);
                } else {
                    throw new RuntimeException("Voucher đã hết lượt sử dụng");
                }

                double tongTien = donHang.getTongTien() != null ? donHang.getTongTien() : 0;
                double giam = tinhTienGiamVoucher(tongTien, voucher);
                donHang.setTongTienGiamGia(giam);
                donHang.setTongTien(tongTien - giam + (donHang.getPhiVanChuyen() != null ? donHang.getPhiVanChuyen() : 0));
            } catch (Exception e) {
                throw new RuntimeException("Voucher không hợp lệ: " + e.getMessage());
            }
        } else {
            donHang.setTongTienGiamGia(0.0);
        }

        return convertToDTO(donHangRepository.save(donHang));
    }

    public DonHangDTO update(int id, DonHangDTO dto) {
        Optional<DonHang> optional = donHangRepository.findById(id);
        if (optional.isPresent()) {
            DonHang donHang = convertToEntity(dto);
            donHang.setId(id);
            return convertToDTO(donHangRepository.save(donHang));
        }
        return null;
    }

    @Transactional
    public DonHangDTO updateVoucher(Integer idDonHang, Integer idgiamGia) {
        Optional<DonHang> optional = donHangRepository.findById(idDonHang);
        if (optional.isPresent()) {
            DonHang donHang = optional.get();
            Voucher oldVoucher = donHang.getGiamGia();

            if (oldVoucher != null) {
                oldVoucher.setSoLuong(oldVoucher.getSoLuong() + 1);
                voucherRepository.save(oldVoucher);
            }

            if (idgiamGia != null) {
                Voucher newVoucher = voucherRepository.findById(idgiamGia).orElseThrow();
                if (newVoucher.getSoLuong() <= 0) throw new RuntimeException("Voucher đã hết lượt");
                newVoucher.setSoLuong(newVoucher.getSoLuong() - 1);
                voucherRepository.save(newVoucher);
                donHang.setGiamGia(newVoucher);
            } else {
                donHang.setGiamGia(null);
            }

            capNhatTongTienDonHang(idDonHang);
            return convertToDTO(donHangRepository.save(donHang));
        }
        return null;
    }

    public DonHangDTO updateKhachHang(Integer idDonHang, Integer idkhachHang) {
        Optional<DonHang> optional = donHangRepository.findById(idDonHang);
        if (optional.isPresent()) {
            DonHang donHang = optional.get();
            if (idkhachHang != null) {
                khachHangRepository.findById(idkhachHang).ifPresent(donHang::setKhachHang);
            } else {
                donHang.setKhachHang(null);
            }
            return convertToDTO(donHangRepository.save(donHang));
        }
        return null;
    }

    @Transactional
    public void delete(Integer id) {
        donHangRepository.findById(id).ifPresent(donHang -> {
            if (donHang.getTrangThai() != null && donHang.getTrangThai() > 0) {
                for (DonHangChiTiet ct : donHang.getDonHangChiTiets()) {
                    SanPhamChiTiet sp = ct.getSanPhamChiTiet();
                    if (sp != null) {
                        sp.setSoLuong(sp.getSoLuong() + ct.getSoLuong());
                        sanPhamChiTietRepository.save(sp);
                    }
                }
            }
            donHangRepository.delete(donHang);
        });
    }

    public List<DonHangDTO> filterByTrangThaiAndLoai(Integer trangThai, String loaiDonHang) {
        List<DonHang> list = (trangThai == null) ?
                donHangRepository.findByLoaiDonHangOnly(loaiDonHang) :
                donHangRepository.findByTrangThaiAndLoaiDonHangOnly(trangThai, loaiDonHang);
        return list.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Transactional
    public DonHangDTO xacNhanDonHang(Integer id, Double tongTien, Integer idkhachHang, String tenKhachHang, String email, String sdt, Integer ship, String diaChi) {
        Optional<DonHang> optional = donHangRepository.findById(id);
        if (optional.isPresent()) {
            DonHang donHang = optional.get();
            
            // Trừ tồn kho tại quầy
            if (donHang.getTrangThai() != null && donHang.getTrangThai() == 0) {
                for (DonHangChiTiet ct : donHang.getDonHangChiTiets()) {
                    SanPhamChiTiet sp = ct.getSanPhamChiTiet();
                    if (sp != null) {
                        if (sp.getSoLuong() < ct.getSoLuong()) throw new RuntimeException("Sản phẩm hết hàng");
                        sp.setSoLuong(sp.getSoLuong() - ct.getSoLuong());
                        sanPhamChiTietRepository.save(sp);
                    }
                }
            }

            donHang.setTrangThai(1);
            donHang.setNgayMua(LocalDate.now());
            if (ship != null) donHang.setPhiVanChuyen(ship);
            if (diaChi != null) donHang.setDiaChiGiaoHang(diaChi);
            
            capNhatTongTienDonHang(donHang.getId());

            if (idkhachHang != null) {
                khachHangRepository.findById(idkhachHang).ifPresent(donHang::setKhachHang);
            } else if (tenKhachHang != null && !tenKhachHang.isEmpty()) {
                KhachHang kh = new KhachHang();
                kh.setTenKhachHang(tenKhachHang);
                kh.setEmail(email);
                kh.setSoDienThoai(sdt);
                donHang.setKhachHang(khachHangRepository.save(kh));
            }

            return convertToDTO(donHangRepository.save(donHang));
        }
        return null;
    }

    public void capNhatTongTienDonHang(Integer idDonHang) {
        DonHang donHang = donHangRepository.findById(idDonHang).orElseThrow();
        List<DonHangChiTiet> chiTiets = donHangChiTietRepository.findByDonHang_Id(idDonHang);
        double tongTienGoc = chiTiets.stream().mapToDouble(DonHangChiTiet::getThanhTien).sum();

        double giam = 0.0;
        Voucher v = donHang.getGiamGia();
        if (v != null) {
            if (tongTienGoc < v.getDonToiThieu()) {
                donHang.setGiamGia(null);
                donHang.setTongTienGiamGia(0.0);
            } else {
                giam = tinhTienGiamVoucher(tongTienGoc, v);
                donHang.setTongTienGiamGia(giam);
            }
        } else {
            donHang.setTongTienGiamGia(0.0);
        }

        double subTotal = tongTienGoc - giam;
        int ship = donHang.getPhiVanChuyen() != null ? donHang.getPhiVanChuyen() : 0;
        donHang.setTongTien(subTotal + ship);
        donHangRepository.save(donHang);
    }

    @Transactional
    public DonHangDTO taoHoaDonOnline(HoaDonOnlineRequest req) {
        DonHang don = new DonHang();
        don.setNgayTao(LocalDate.now());
        don.setLoaiDonHang("ONLINE");
        don.setTrangThai(TrangThaiDonHang.CHO_XAC_NHAN.getValue());
        don.setDiaChiGiaoHang(req.getDiaChiGiaoHang());
        don.setSoDienThoaiGiaoHang(req.getSoDienThoaiGiaoHang());
        don.setEmailGiaoHang(req.getEmailGiaoHang());
        don.setTenNguoiNhan(req.getTenNguoiNhan());
        don.setPhiVanChuyen(req.getPhiVanChuyen() != null ? req.getPhiVanChuyen() : 0);
        don.setKhachHang(khachHangRepository.findById(req.getIdKhachHang()).orElse(null));

        double tongTien = 0;
        List<DonHangChiTiet> chiTiets = new ArrayList<>();
        for (SanPhamDatDTO dto : req.getSanPhamDat()) {
            SanPhamChiTiet sp = sanPhamChiTietRepository.findById(dto.getIdSanPhamChiTiet()).orElseThrow();
            if (sp.getSoLuong() < dto.getSoLuong()) throw new RuntimeException("Sản phẩm hết hàng");
            
            Double gia = (sp.getGiaBanGiamGia() != null && sp.getGiaBanGiamGia() > 0 && sp.getGiaBanGiamGia() < sp.getGiaBan()) ? sp.getGiaBanGiamGia() : sp.getGiaBan();
            DonHangChiTiet ct = new DonHangChiTiet();
            ct.setDonHang(don);
            ct.setSanPhamChiTiet(sp);
            ct.setSoLuong(dto.getSoLuong());
            ct.setGia(gia);
            ct.setThanhTien(dto.getSoLuong() * gia);
            chiTiets.add(donHangChiTietRepository.save(ct));
            tongTien += ct.getThanhTien();
        }
        don.setDonHangChiTiets(chiTiets);

        double giam = 0;
        if (req.getIdVoucher() != null) {
            Voucher v = voucherRepository.findById(req.getIdVoucher()).orElse(null);
            if (v != null && tongTien >= v.getDonToiThieu()) {
                giam = tinhTienGiamVoucher(tongTien, v);
                don.setGiamGia(v);
            }
        }
        don.setTongTienGiamGia(giam);
        don.setTongTien(tongTien - giam + don.getPhiVanChuyen());
        don.setIdService(req.getIdService());
        return convertToDTO(donHangRepository.save(don));
    }

    @Transactional
    public void xacNhanDon(Integer id) {
        DonHang d = donHangRepository.findById(id).orElseThrow();
        if (d.getTrangThai() == 0) {
            for (DonHangChiTiet ct : d.getDonHangChiTiets()) {
                SanPhamChiTiet sp = ct.getSanPhamChiTiet();
                if (sp != null) {
                    if (sp.getSoLuong() < ct.getSoLuong()) throw new RuntimeException("Hết hàng");
                    sp.setSoLuong(sp.getSoLuong() - ct.getSoLuong());
                    sanPhamChiTietRepository.save(sp);
                }
            }
        }
        d.setTrangThai(TrangThaiDonHang.XAC_NHAN.getValue());
        d.setNgayMua(LocalDate.now());
        donHangRepository.save(d);
    }

    @Transactional
    public void huyDon(Integer idDon) {
        DonHang don = donHangRepository.findById(idDon).orElseThrow();
        if (don.getTrangThai() > 3) throw new RuntimeException("Không thể hủy");
        int oldST = don.getTrangThai();
        don.setTrangThai(TrangThaiDonHang.DA_HUY.getValue());
        if (oldST > 0) {
            for (DonHangChiTiet ct : don.getDonHangChiTiets()) {
                SanPhamChiTiet sp = ct.getSanPhamChiTiet();
                if (sp != null) {
                    sp.setSoLuong(sp.getSoLuong() + ct.getSoLuong());
                    sanPhamChiTietRepository.save(sp);
                }
            }
        }
        if (don.getGiamGia() != null) {
            Voucher v = don.getGiamGia();
            v.setSoLuong(v.getSoLuong() + 1);
            voucherRepository.save(v);
        }
        donHangRepository.save(don);
    }

    public DonHangDTO capNhatDiaChiVaTinhPhi(Integer id, String diaChi, String sdt, String ten, String email, Integer districtId, String wardCode, Integer phiMoi) {
        DonHang don = donHangRepository.findById(id).orElseThrow();
        don.setDiaChiGiaoHang(diaChi);
        don.setSoDienThoaiGiaoHang(sdt);
        don.setTenNguoiNhan(ten);
        don.setEmailGiaoHang(email);
        int phi = (phiMoi != null) ? phiMoi : (int) ghnClientService.tinhPhiVanChuyen(districtId, 0, wardCode, 3000, 0, null).get("total_fee");
        don.setPhiVanChuyen(phi);
        capNhatTongTienDonHang(id);
        return convertToDTO(donHangRepository.save(don));
    }

    public List<DonHang> layDonTheoKhach(Integer idKhach) {
        return donHangRepository.findByKhachHangIdOrderByNgayTaoDesc(idKhach);
    }

    public List<DonHang> layDonTheoKhachVaTrangThai(Integer idKhach, Integer trangThai) {
        return donHangRepository.findByKhachHangIdAndTrangThaiOrderByNgayTaoDesc(idKhach, trangThai);
    }

    public DonHang layChiTietDon(Integer id) {
        return donHangRepository.findWithChiTiet(id);
    }

    public List<DonHangDTO> getByTrangThaiDTO(Integer trangThai) {
        return donHangRepository.findByTrangThai(trangThai).stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    public List<DonHang> getByTrangThai(Integer trangThai) {
        return donHangRepository.findByTrangThai(trangThai);
    }

    public Map<String, Object> thongKeDon() {
        return Map.of("tongDon", donHangRepository.count(), "doanhThu", donHangRepository.sumTongTien(), "donDaGiao", donHangRepository.countByTrangThai(TrangThaiDonHang.DA_GIAO.getValue()));
    }

    @Transactional
    public void capNhatTrangThai(Integer idDon, TrangThaiDonHang moi) {
        DonHang don = donHangRepository.findById(idDon).orElseThrow();
        TrangThaiDonHang hienTai = TrangThaiDonHang.fromValue(don.getTrangThai());
        if (!isTrangThaiHopLe(hienTai, moi)) throw new RuntimeException("Trạng thái không hợp lệ");
        
        if (moi == TrangThaiDonHang.DA_GIAO) don.setNgayMua(LocalDate.now());

        if (hienTai == TrangThaiDonHang.CHO_XAC_NHAN && moi == TrangThaiDonHang.XAC_NHAN) {
            for (DonHangChiTiet ct : don.getDonHangChiTiets()) {
                SanPhamChiTiet sp = ct.getSanPhamChiTiet();
                if (sp != null) {
                    if (sp.getSoLuong() < ct.getSoLuong()) throw new RuntimeException("Hết hàng");
                    sp.setSoLuong(sp.getSoLuong() - ct.getSoLuong());
                    sanPhamChiTietRepository.save(sp);
                }
            }
        }

        if (hienTai != TrangThaiDonHang.CHO_XAC_NHAN && hienTai != TrangThaiDonHang.DA_HUY && moi == TrangThaiDonHang.DA_HUY) {
            for (DonHangChiTiet ct : don.getDonHangChiTiets()) {
                SanPhamChiTiet sp = ct.getSanPhamChiTiet();
                if (sp != null) {
                    sp.setSoLuong(sp.getSoLuong() + ct.getSoLuong());
                    sanPhamChiTietRepository.save(sp);
                }
            }
        }

        // Tự động đẩy đơn GHN
        if ((moi == TrangThaiDonHang.XAC_NHAN || moi == TrangThaiDonHang.DANG_CHUAN_BI) && "ONLINE".equalsIgnoreCase(don.getLoaiDonHang()) && don.getMaVanDon() == null) {
            String track = ghnClientService.createShippingOrder(don);
            if (track != null) don.setMaVanDon(track);
        }

        don.setTrangThai(moi.getValue());
        donHangRepository.save(don);
    }

    private boolean isTrangThaiHopLe(TrangThaiDonHang hienTai, TrangThaiDonHang moi) {
        return switch (hienTai) {
            case CHO_XAC_NHAN -> moi == TrangThaiDonHang.XAC_NHAN || moi == TrangThaiDonHang.DA_HUY;
            case XAC_NHAN -> moi == TrangThaiDonHang.DANG_CHUAN_BI || moi == TrangThaiDonHang.DA_HUY;
            case DANG_CHUAN_BI -> moi == TrangThaiDonHang.DANG_GIAO || moi == TrangThaiDonHang.DA_HUY;
            case DANG_GIAO -> moi == TrangThaiDonHang.DA_GIAO || moi == TrangThaiDonHang.DA_HUY;
            case DA_GIAO -> moi == TrangThaiDonHang.TRA_HANG_HOAN_TIEN;
            default -> false;
        };
    }

    private double tinhTienGiamVoucher(double total, Voucher v) {
        if (v == null) return 0.0;
        String loai = v.getLoaiVoucher();
        double giaTri = (v.getGiaTri() != null) ? v.getGiaTri() : 0.0;
        double giam = 0.0;

        if (loai != null && (loai.equalsIgnoreCase("PHAN_TRAM") || loai.equalsIgnoreCase("PERCENT") || loai.contains("%"))) {
            giam = total * giaTri / 100.0;
        } else {
            giam = giaTri;
        }

        return Math.min(giam, total);
    }

    private DonHangDTO convertToDTO(DonHang dh) {
        DonHangDTO dto = new DonHangDTO(dh);
        dto.setTenNhanVien(dh.getNhanVien() != null ? dh.getNhanVien().getTenNhanVien() : null);
        return dto;
    }

    private DonHang convertToEntity(DonHangDTO dto) {
        DonHang dh = new DonHang();
        dh.setNgayMua(dto.getNgayMua());
        dh.setNgayTao(dto.getNgayTao());
        dh.setLoaiDonHang(dto.getLoaiDonHang());
        dh.setTrangThai(dto.getTrangThai());
        dh.setTongTien(dto.getTongTien());
        dh.setTongTienGiamGia(dto.getTongTienGiamGia());
        dh.setPhiVanChuyen(dto.getPhiVanChuyen() != null ? dto.getPhiVanChuyen() : 0);
        dh.setTenNguoiNhan(dto.getTenNguoiNhan());
        dh.setSoDienThoaiGiaoHang(dto.getSoDienThoaiGiaoHang());
        dh.setDiaChiGiaoHang(dto.getDiaChiGiaoHang());
        dh.setEmailGiaoHang(dto.getEmailGiaoHang());
        dh.setMaVanDon(dto.getMaVanDon());
        dh.setIdService(dto.getIdService());
        if (dto.getIdnhanVien() != null) nhanVienRepository.findById(dto.getIdnhanVien()).ifPresent(dh::setNhanVien);
        if (dto.getIdkhachHang() != null) khachHangRepository.findById(dto.getIdkhachHang()).ifPresent(dh::setKhachHang);
        if (dto.getIdgiamGia() != null) voucherRepository.findById(dto.getIdgiamGia()).ifPresent(dh::setGiamGia);
        return dh;
    }
}
