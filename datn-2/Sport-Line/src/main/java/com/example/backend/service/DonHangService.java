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
<<<<<<< HEAD

    @Autowired
    private VoucherRepository voucherRepository;

    @Autowired
    VoucherService voucherService;

=======
    @Autowired
    private VoucherRepository voucherRepository;
    @Autowired
    private VoucherService voucherService;
>>>>>>> dbcc773015f481c98f8da0d3b9f78c0a448b6424
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
<<<<<<< HEAD
        if (donHang.getNgayTao() == null)
            donHang.setNgayTao(LocalDate.now()); // ✅ Đảm bảo có ngày tạo
        if (donHang.getTrangThai() == null)
            donHang.setTrangThai(0);
        if (donHang.getLoaiDonHang() == null)
            donHang.setLoaiDonHang("Bán hàng tại quầy");

        if (donHang.getTongTien() == null)
            donHang.setTongTien(0.0);
        if (donHang.getTongTienGiamGia() == null)
            donHang.setTongTienGiamGia(0.0);
=======
        if (donHang.getNgayTao() == null) {
            donHang.setNgayTao(LocalDate.now());
        }
>>>>>>> dbcc773015f481c98f8da0d3b9f78c0a448b6424

        // ✅ Atomic Checkout: Kiểm tra Voucher & Trừ số lượng ngay lập tức
        if (donHang.getGiamGia() != null) {
<<<<<<< HEAD
            double tongTien = donHang.getTongTien();
            double giam = tinhTienGiamVoucher(tongTien, donHang.getGiamGia());
            donHang.setTongTienGiamGia(giam);
            donHang.setTongTien(tongTien - giam);
=======
            try {
                Voucher voucher = donHang.getGiamGia();
                voucherService.kiemTraDieuKienVoucher(donHang, voucher.getId());
                
                // Trừ số lượng voucher (Stock -1)
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
            // Đã có tongTien từ frontend (gồm ship)
>>>>>>> dbcc773015f481c98f8da0d3b9f78c0a448b6424
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
<<<<<<< HEAD
                Voucher newVoucher = voucherRepository.findById(idgiamGia).orElse(null);
                if (newVoucher == null)
                    throw new RuntimeException("Không tìm thấy voucher mới");
                if (newVoucher.getSoLuong() <= 0)
                    throw new RuntimeException("Voucher đã hết lượt sử dụng");
                // Trừ số lượng voucher mới
=======
                Voucher newVoucher = voucherRepository.findById(idgiamGia).orElseThrow();
                if (newVoucher.getSoLuong() <= 0) throw new RuntimeException("Voucher đã hết lượt");
>>>>>>> dbcc773015f481c98f8da0d3b9f78c0a448b6424
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
<<<<<<< HEAD
    // ...existing code...

    // Hàm tính số tiền giảm giá từ voucher
    private double tinhTienGiamVoucher(double tongTien, Voucher voucher) {
        if (voucher == null)
            return 0.0;
        double giam = 0.0;
        String loai = voucher.getLoaiVoucher();
        double giaTri = voucher.getGiaTri();

        if ("Giảm giá %".equalsIgnoreCase(loai) || "PHAN_TRAM".equalsIgnoreCase(loai)) {
            giam = tongTien * giaTri / 100.0;
        } else if ("Giảm giá số tiền".equalsIgnoreCase(loai) || "TIEN_MAT".equalsIgnoreCase(loai)) {
            giam = giaTri;
        }
        // Không cho giảm quá tổng tiền
        if (giam > tongTien)
            giam = tongTien;
        // Làm tròn về số nguyên nếu muốn
        return Math.round(giam);
    }

    // ... existing code ...
=======

>>>>>>> dbcc773015f481c98f8da0d3b9f78c0a448b6424
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
<<<<<<< HEAD
        Optional<DonHang> donHangOptional = donHangRepository.findById(id);
        if (donHangOptional.isPresent()) {
            DonHang donHang = donHangOptional.get();
            // Duyệt và cộng lại tồn kho TRƯỚC khi clear hoặc xóa
            // Chỉ hoàn trả kho nếu đơn hàng đã được xác nhận (đã trừ kho)
            if (donHang.getTrangThai() != null && donHang.getTrangThai() > 0) {
                for (DonHangChiTiet chiTiet : donHang.getDonHangChiTiets()) {
                    SanPhamChiTiet spct = chiTiet.getSanPhamChiTiet();
                    if (spct != null) {
                        spct.setSoLuong(spct.getSoLuong() + chiTiet.getSoLuong());
                        sanPhamChiTietRepository.save(spct);
                    }
                }
            }
            // KHÔNG cần clear() nữa, chỉ cần xóa đơn hàng, Hibernate sẽ tự xóa chi tiết (do
            // orphanRemoval = true)
=======
        donHangRepository.findById(id).ifPresent(donHang -> {
            for (DonHangChiTiet ct : donHang.getDonHangChiTiets()) {
                SanPhamChiTiet sp = ct.getSanPhamChiTiet();
                if (sp != null) {
                    sp.setSoLuong(sp.getSoLuong() + ct.getSoLuong());
                    sanPhamChiTietRepository.save(sp);
                }
            }
>>>>>>> dbcc773015f481c98f8da0d3b9f78c0a448b6424
            donHangRepository.delete(donHang);
        });
    }

    public List<DonHangDTO> filterByTrangThaiAndLoai(Integer trangThai, String loaiDonHang) {
        List<DonHang> list = (trangThai == null) ?
                donHangRepository.findByLoaiDonHangOnly(loaiDonHang) :
                donHangRepository.findByTrangThaiAndLoaiDonHangOnly(trangThai, loaiDonHang);
        return list.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

<<<<<<< HEAD
    public DonHangDTO xacNhanDonHang(
            Integer id,
            Double tongTien, // Tham số này sẽ không dùng để set lại tổng tiền!
            Integer idkhachHang,
            String tenKhachHang,
            String email,
            String soDienThoai,
            Integer phiVanChuyen,
            String diaChiGiaoHang) {
=======
    public DonHangDTO xacNhanDonHang(Integer id, Double tongTien, Integer idkhachHang, String tenKhachHang, String email, String sdt, Integer ship, String diaChi) {
>>>>>>> dbcc773015f481c98f8da0d3b9f78c0a448b6424
        Optional<DonHang> optional = donHangRepository.findById(id);
        if (optional.isPresent()) {
            DonHang donHang = optional.get();
            if (donHang.getGiamGia() != null) {
                try {
                    voucherService.kiemTraDieuKienVoucher(donHang, donHang.getGiamGia().getId());
                } catch (Exception e) {
                    donHang.setGiamGia(null);
                    donHang.setTongTienGiamGia(0.0);
                }
            }
<<<<<<< HEAD

            // ✅ THÊM: Trừ kho khi xác nhận đơn hàng tại quầy (POS)
            if (donHang.getTrangThai() != null && donHang.getTrangThai() == 0) {
                for (DonHangChiTiet ct : donHang.getDonHangChiTiets()) {
                    SanPhamChiTiet sp = ct.getSanPhamChiTiet();
                    if (sp != null) {
                        if (sp.getSoLuong() < ct.getSoLuong()) {
                            throw new RuntimeException(
                                    "Sản phẩm " + sp.getSanPham().getTenSanPham() + " không đủ số lượng!");
                        }
                        sp.setSoLuong(sp.getSoLuong() - ct.getSoLuong());
                        sanPhamChiTietRepository.save(sp);
                    }
                }
            }

            donHang.setTrangThai(1); // Đã thanh toán
            donHang.setNgayMua(LocalDate.now()); // ✅ Cập nhật ngày mua (ngày thanh toán)
            if (phiVanChuyen != null)
                donHang.setPhiVanChuyen(phiVanChuyen);
            if (diaChiGiaoHang != null)
                donHang.setDiaChiGiaoHang(diaChiGiaoHang);

            // Luôn cập nhật lại tổng tiền và giảm giá dựa trên voucher hiện tại
=======
            donHang.setTrangThai(1);
            donHang.setNgayMua(LocalDate.now());
            if (ship != null) donHang.setPhiVanChuyen(ship);
            if (diaChi != null) donHang.setDiaChiGiaoHang(diaChi);
            
>>>>>>> dbcc773015f481c98f8da0d3b9f78c0a448b6424
            capNhatTongTienDonHang(donHang.getId());

            if (idkhachHang != null) {
                khachHangRepository.findById(idkhachHang).ifPresent(donHang::setKhachHang);
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
        if (subTotal >= 2000000) ship = 0;
        
        donHang.setPhiVanChuyen(ship);
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
        for (SanPhamDatDTO dto : req.getSanPhamDat()) {
            SanPhamChiTiet sp = sanPhamChiTietRepository.findById(dto.getIdSanPhamChiTiet()).orElseThrow();
            if (sp.getSoLuong() < dto.getSoLuong()) throw new RuntimeException("Sản phẩm hết hàng");
            sp.setSoLuong(sp.getSoLuong() - dto.getSoLuong());
            Double gia = (sp.getGiaBanGiamGia() != null && sp.getGiaBanGiamGia() > 0 && sp.getGiaBanGiamGia() < sp.getGiaBan()) ? sp.getGiaBanGiamGia() : sp.getGiaBan();
            DonHangChiTiet ct = new DonHangChiTiet();
            ct.setDonHang(don);
            ct.setSanPhamChiTiet(sp);
            ct.setSoLuong(dto.getSoLuong());
            ct.setGia(gia);
            ct.setThanhTien(dto.getSoLuong() * gia);
            donHangChiTietRepository.save(ct);
            tongTien += ct.getThanhTien();
        }

        double giam = 0;
        if (req.getIdVoucher() != null) {
            Voucher v = voucherRepository.findById(req.getIdVoucher()).orElse(null);
            if (v != null) {
                giam = tinhTienGiamVoucher(tongTien, v);
                don.setGiamGia(v);
            }
        }
        
        double subTotal = tongTien - giam;
        int fee = (subTotal >= 2000000) ? 0 : (req.getPhiVanChuyen() != null ? req.getPhiVanChuyen() : 0);
        don.setPhiVanChuyen(fee);
        don.setTongTien(subTotal + fee);
        don.setIdService(req.getIdService());
        return convertToDTO(donHangRepository.save(don));
    }

    public void xacNhanDon(Integer id) {
        donHangRepository.findById(id).ifPresent(d -> {
            d.setTrangThai(TrangThaiDonHang.XAC_NHAN.getValue());
            d.setNgayMua(LocalDate.now());
            donHangRepository.save(d);
        });
    }

    @Transactional
    public void huyDon(Integer idDon) {
        DonHang don = donHangRepository.findById(idDon).orElseThrow();
        if (don.getTrangThai() > 3) throw new RuntimeException("Không thể hủy đơn này");
        don.setTrangThai(TrangThaiDonHang.DA_HUY.getValue());
        for (DonHangChiTiet ct : don.getDonHangChiTiets()) {
            SanPhamChiTiet sp = ct.getSanPhamChiTiet();
            if (sp != null) {
                sp.setSoLuong(sp.getSoLuong() + ct.getSoLuong());
                sanPhamChiTietRepository.save(sp);
            }
        }
        if (don.getGiamGia() != null) {
            Voucher v = don.getGiamGia();
            v.setSoLuong(v.getSoLuong() + 1);
            voucherRepository.save(v);
        }
        donHangRepository.save(don);
    }

    public DonHangDTO capNhatDiaChiVaTinhPhi(Integer id, String diaChi, String sdt, String ten, String email, Integer districtId, String wardCode, Integer phiVanChuyenMoi) {
        DonHang don = donHangRepository.findById(id).orElseThrow();
        don.setDiaChiGiaoHang(diaChi);
        don.setSoDienThoaiGiaoHang(sdt);
        don.setTenNguoiNhan(ten);
        don.setEmailGiaoHang(email);
        int phi = (phiVanChuyenMoi != null) ? phiVanChuyenMoi : (int) ghnClientService.tinhPhiVanChuyen(districtId, 0, wardCode, 3000, 0, null).get("total_fee");
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

    public void capNhatTrangThai(Integer idDon, TrangThaiDonHang moi) {
        DonHang don = donHangRepository.findById(idDon).orElseThrow();
        TrangThaiDonHang hienTai = TrangThaiDonHang.fromValue(don.getTrangThai());
        if (!isTrangThaiHopLe(hienTai, moi)) throw new RuntimeException("Chuyển trạng thái sai");
        if (moi == TrangThaiDonHang.DA_GIAO) don.setNgayMua(LocalDate.now());
        
        // Tự động tạo đơn GHN khi xác nhận (XAC_NHAN) hoặc chuẩn bị (DANG_CHUAN_BI)
        if ((moi == TrangThaiDonHang.XAC_NHAN || moi == TrangThaiDonHang.DANG_CHUAN_BI) 
            && "ONLINE".equalsIgnoreCase(don.getLoaiDonHang()) 
            && don.getMaVanDon() == null) {
            String trackingCode = ghnClientService.createShippingOrder(don);
            if (trackingCode != null) {
                don.setMaVanDon(trackingCode);
            }
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

    private double tinhTienGiamVoucher(double tongTien, Voucher v) {
        if (v == null) return 0.0;
        String loai = v.getLoaiVoucher();
        double val = (v.getGiaTri() != null) ? v.getGiaTri() : 0.0;
        double giam = (loai != null && (loai.equalsIgnoreCase("PHAN_TRAM") || loai.contains("%"))) ? tongTien * val / 100.0 : val;
        return Math.min(giam, tongTien);
    }

    private DonHangDTO convertToDTO(DonHang dh) {
        DonHangDTO dto = new DonHangDTO(dh);
        dto.setTenNhanVien(dh.getNhanVien() != null ? dh.getNhanVien().getTenNhanVien() : null);
        dto.setMaVanDon(dh.getMaVanDon());
        dto.setIdService(dh.getIdService());
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
<<<<<<< HEAD

    // public void capNhatTongTienDonHang(Integer idDonHang) {
    // DonHang donHang = donHangRepository.findById(idDonHang).orElseThrow();
    // List<DonHangChiTiet> chiTiets = donHang.getDonHangChiTiets();
    // double tongTienGoc = 0;
    // for (DonHangChiTiet ct : chiTiets) {
    // tongTienGoc += ct.getThanhTien();
    // }
    //
    // double giam = 0.0;
    // if (donHang.getGiamGia() != null) {
    // giam = tinhTienGiamVoucher(tongTienGoc, donHang.getGiamGia());
    // }
    // donHang.setTongTienGiamGia(giam);
    // donHang.setTongTien(tongTienGoc - giam);
    //
    // donHangRepository.save(donHang);
    // }
    public void capNhatTongTienDonHang(Integer idDonHang) {
        DonHang donHang = donHangRepository.findById(idDonHang).orElseThrow();
        List<DonHangChiTiet> chiTiets = donHangChiTietRepository.findByDonHang_Id(idDonHang);
        double tongTienGoc = 0;
        for (DonHangChiTiet ct : chiTiets) {
            tongTienGoc += ct.getThanhTien();
        }

        double giam = 0.0;
        Voucher voucher = donHang.getGiamGia();
        if (voucher != null) {
            // Kiểm tra điều kiện đơn tối thiểu
            if (tongTienGoc < voucher.getDonToiThieu()) {
                // Không đủ điều kiện, hủy voucher
                donHang.setGiamGia(null);
                donHang.setTongTienGiamGia(0.0);
            } else {
                giam = tinhTienGiamVoucher(tongTienGoc, voucher);
                donHang.setTongTienGiamGia(giam);
            }
        } else {
            donHang.setTongTienGiamGia(0.0);
        }

        // ✅ SỬA: Phải cộng thêm phí ship vào tổng tiền
        int ship = donHang.getPhiVanChuyen();
        donHang.setTongTien(tongTienGoc - giam + ship);

        donHangRepository.save(donHang);
    }

    // Tạo đơn mới
    @jakarta.transaction.Transactional
    public DonHangDTO taoHoaDonOnline(HoaDonOnlineRequest req) {
        DonHang don = new DonHang();
        don.setNgayTao(LocalDate.now()); // ✅ ĐẢM BẢO set ngày tạo
        don.setLoaiDonHang("ONLINE");
        don.setTrangThai(TrangThaiDonHang.CHO_XAC_NHAN.getValue());
        don.setDiaChiGiaoHang(req.getDiaChiGiaoHang());
        don.setSoDienThoaiGiaoHang(req.getSoDienThoaiGiaoHang());
        don.setEmailGiaoHang(req.getEmailGiaoHang());
        don.setTenNguoiNhan(req.getTenNguoiNhan());

        // Cài đặt phiVanChuyen ban đầu (đảm bảo không null)
        int incomingFee = (req.getPhiVanChuyen() != null) ? req.getPhiVanChuyen() : 0;
        don.setPhiVanChuyen(incomingFee);

        don.setKhachHang(khachHangRepository.findById(req.getIdKhachHang()).orElse(null));
        // don = donHangRepository.save(don); // BỎ save trung gian

        double tongTien = 0;
        List<DonHangChiTiet> dsChiTiet = new ArrayList<>();

        for (SanPhamDatDTO dto : req.getSanPhamDat()) {
            SanPhamChiTiet sp = sanPhamChiTietRepository.findById(dto.getIdSanPhamChiTiet()).orElseThrow();
            if (sp.getSoLuong() < dto.getSoLuong())
                throw new RuntimeException("Sản phẩm đã hết hàng");

            // sp.setSoLuong(sp.getSoLuong() - dto.getSoLuong()); // ✅ ĐÃ SỬA: Không trừ kho
            // khi ở trạng thái CHỜ XÁC NHẬN
            // sanPhamChiTietRepository.save(sp);

            Double gia = (sp.getGiaBanGiamGia() != null && sp.getGiaBanGiamGia() > 0
                    && sp.getGiaBanGiamGia() < sp.getGiaBan())
                            ? sp.getGiaBanGiamGia()
                            : sp.getGiaBan();

            DonHangChiTiet ct = new DonHangChiTiet();
            ct.setDonHang(don);
            ct.setSanPhamChiTiet(sp);
            ct.setSoLuong(dto.getSoLuong());
            ct.setGia(gia);
            ct.setThanhTien(dto.getSoLuong() * gia);
            dsChiTiet.add(donHangChiTietRepository.save(ct));
            tongTien += ct.getThanhTien();
        }

        don.setDonHangChiTiets(dsChiTiet);

        // --- LOG DEBUG ---
        System.out.println("DEBUG taoHoaDonOnline - INCOMING req.phiVanChuyen: " + req.getPhiVanChuyen());
        System.out.println("DEBUG taoHoaDonOnline - calculated sum items: " + tongTien);

        // Đảm bảo phiVanChuyen được set (lấy 0 nếu null)
        int fee = (req.getPhiVanChuyen() != null) ? req.getPhiVanChuyen() : 0;
        don.setPhiVanChuyen(fee);

        double giam = 0;
        if (req.getIdVoucher() != null) {
            Voucher v = voucherRepository.findById(req.getIdVoucher()).orElse(null);
            if (v != null) {
                // Kiểm tra điều kiện đơn tối thiểu của voucher
                if (tongTien >= v.getDonToiThieu()) {
                    giam = tinhTienGiamVoucher(tongTien, v);
                    don.setGiamGia(v);
                }
            }
        }
        don.setTongTienGiamGia(giam);

        // Tính tổng thanh toán cuối cùng = Tổng tiền sản phẩm - Giảm giá voucher + Phí
        // vận chuyển
        double finalTongTien = tongTien - giam + fee;

        don.setTongTien(finalTongTien);
        if (don.getNgayTao() == null)
            don.setNgayTao(LocalDate.now()); // ✅ Backup NgayTao
        if (don.getNgayMua() == null && don.getTrangThai() != null && don.getTrangThai() > 0) {
            don.setNgayMua(LocalDate.now()); // ✅ Set NgayMua nếu đơn đã thanh toán
        }
        System.out.println("DEBUG taoHoaDonOnline - SETTING FINAL tongTien: " + finalTongTien);

        // Lưu duy nhất 1 lần thay vì lưu nhiều lần
        don = donHangRepository.save(don);
        System.out.println("DEBUG taoHoaDonOnline - SAVED ORDER ID: " + don.getId());

        return new DonHangDTO(don);
    }

    // Xác nhận đơn
    public void xacNhanDon(Integer id) {
        DonHang d = donHangRepository.findById(id).orElseThrow();

        // ✅ THÊM: Trừ kho khi chuyển sang trạng thái XÁC NHẬN
        if (d.getTrangThai() != null && d.getTrangThai() == 0) {
            for (DonHangChiTiet ct : d.getDonHangChiTiets()) {
                SanPhamChiTiet sp = ct.getSanPhamChiTiet();
                if (sp != null) {
                    if (sp.getSoLuong() < ct.getSoLuong()) {
                        throw new RuntimeException(
                                "Sản phẩm " + sp.getSanPham().getTenSanPham() + " không đủ số lượng!");
                    }
                    sp.setSoLuong(sp.getSoLuong() - ct.getSoLuong());
                    sanPhamChiTietRepository.save(sp);
                }
            }
        }

        d.setTrangThai(TrangThaiDonHang.XAC_NHAN.getValue());
        d.setNgayMua(LocalDate.now());
        donHangRepository.save(d);
    }

    public void huyDon(Integer idDon) {
        DonHang don = donHangRepository.findById(idDon)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn"));

        int trangThaiCu = don.getTrangThai();

        // Kiểm tra trạng thái có được phép hủy
        List<Integer> trangThaiDuocHuy = List.of(0, 1, 2, 3); // Được hủy nếu chưa giao
        if (!trangThaiDuocHuy.contains(trangThaiCu)) {
            throw new RuntimeException("Không thể hủy đơn ở trạng thái: "
                    + TrangThaiDonHang.fromValue(trangThaiCu).getDisplayName());
        }
        // Cập nhật trạng thái đơn
        don.setTrangThai(TrangThaiDonHang.DA_HUY.getValue());

        // ✅ THÊM: Chỉ hoàn trả lại kho nếu đơn hàng đã từng được xác nhận (trạng thái >
        // 0)
        if (trangThaiCu > 0) {
            for (DonHangChiTiet ct : don.getDonHangChiTiets()) {
                SanPhamChiTiet sp = ct.getSanPhamChiTiet();
                if (sp != null) {
                    int hienTai = sp.getSoLuong();
                    sp.setSoLuong(hienTai + ct.getSoLuong());
                    sanPhamChiTietRepository.save(sp);
                }
            }
        }
        donHangRepository.save(don);
    }

    // Cập nhật địa chỉ & phí giao hàng
    public DonHangDTO capNhatDiaChiVaTinhPhi(
            Integer id,
            String diaChiMoi,
            String sdtMoi,
            String tenNguoiNhanMoi,
            String emailMoi,
            Integer districtId,
            String wardCode,
            Integer phiVanChuyenMoi) {
        DonHang don = donHangRepository.findById(id).orElseThrow();

        don.setDiaChiGiaoHang(diaChiMoi);
        don.setSoDienThoaiGiaoHang(sdtMoi);
        don.setTenNguoiNhan(tenNguoiNhanMoi);
        don.setEmailGiaoHang(emailMoi);

        // Tính phí vận chuyển và lưu vào đơn hàng
        int phiVanChuyen;
        if (phiVanChuyenMoi != null) {
            phiVanChuyen = phiVanChuyenMoi;
        } else {
            phiVanChuyen = ghnClientService.tinhPhiVanChuyen(districtId, 0, wardCode, 3000, 0);
        }
        don.setPhiVanChuyen(phiVanChuyen);

        // Cập nhật lại tổng tiền đơn hàng bao gồm phí ship mới
        capNhatTongTienDonHang(don.getId());

        donHangRepository.save(don);

        return new DonHangDTO(don);
    }

    public List<DonHang> layDonTheoKhach(Integer idKhach) {
        return donHangRepository.findByKhachHangIdOrderByNgayTaoDesc(idKhach);
    }

    public List<DonHang> layDonTheoKhachVaTrangThai(Integer idKhach, Integer trangThai) {
        return donHangRepository.findByKhachHangIdAndTrangThaiOrderByNgayTaoDesc(idKhach, trangThai);
    }

    public DonHang layChiTietDon(Integer id) {
        DonHang don = donHangRepository.findWithChiTiet(id);
        if (don == null)
            throw new RuntimeException("Không tìm thấy đơn #" + id);
        return don;
    }

    public List<DonHangDTO> getByTrangThaiDTO(Integer trangThai) {
        return donHangRepository.findByTrangThai(trangThai)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<DonHang> getByTrangThai(Integer trangThai) {
        return donHangRepository.findByTrangThai(trangThai);
    }

    public Map<String, Object> thongKeDon() {
        long tong = donHangRepository.count();
        double doanhThu = donHangRepository.sumTongTien();
        int daGiao = donHangRepository.countByTrangThai(TrangThaiDonHang.DA_GIAO.getValue()); // ✅ Dùng số thay vì chữ

        return Map.of(
                "tongDon", tong,
                "doanhThu", doanhThu,
                "donDaGiao", daGiao);
    }

    public void capNhatTrangThai(Integer idDon, TrangThaiDonHang trangThaiMoi) {
        DonHang don = donHangRepository.findById(idDon)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));

        TrangThaiDonHang hienTai = TrangThaiDonHang.fromValue(don.getTrangThai());
        if (!isTrangThaiHopLe(hienTai, trangThaiMoi)) {
            throw new RuntimeException("Không thể chuyển từ "
                    + hienTai.getDisplayName() + " sang "
                    + trangThaiMoi.getDisplayName());
        }

        if (trangThaiMoi == TrangThaiDonHang.DA_GIAO) {
            don.setNgayMua(LocalDate.now());
        }

        // ✅ THÊM: Xử lý trừ kho khi chuyển từ CHỜ XÁC NHẬN sang XÁC NHẬN
        if (hienTai == TrangThaiDonHang.CHO_XAC_NHAN && trangThaiMoi == TrangThaiDonHang.XAC_NHAN) {
            for (DonHangChiTiet ct : don.getDonHangChiTiets()) {
                SanPhamChiTiet sp = ct.getSanPhamChiTiet();
                if (sp != null) {
                    if (sp.getSoLuong() < ct.getSoLuong()) {
                        throw new RuntimeException(
                                "Sản phẩm " + sp.getSanPham().getTenSanPham() + " không đủ số lượng!");
                    }
                    sp.setSoLuong(sp.getSoLuong() - ct.getSoLuong());
                    sanPhamChiTietRepository.save(sp);
                }
            }
        }

        // ✅ THÊM: Hoàn kho nếu hủy đơn đã xác nhận
        if (hienTai != TrangThaiDonHang.CHO_XAC_NHAN && hienTai != TrangThaiDonHang.DA_HUY
                && trangThaiMoi == TrangThaiDonHang.DA_HUY) {
            for (DonHangChiTiet ct : don.getDonHangChiTiets()) {
                SanPhamChiTiet sp = ct.getSanPhamChiTiet();
                if (sp != null) {
                    sp.setSoLuong(sp.getSoLuong() + ct.getSoLuong());
                    sanPhamChiTietRepository.save(sp);
                }
            }
        }

        don.setTrangThai(trangThaiMoi.getValue());
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

=======
>>>>>>> dbcc773015f481c98f8da0d3b9f78c0a448b6424
}
