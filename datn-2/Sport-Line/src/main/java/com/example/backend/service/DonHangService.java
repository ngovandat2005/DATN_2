
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

    @Autowired VoucherService voucherService;

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

    public DonHangDTO create(DonHangDTO dto) {
        DonHang donHang = convertToEntity(dto);

        // Nếu có voucher thì tính giảm giá
        if (donHang.getGiamGia() != null) {
            double tongTien = donHang.getTongTien() != null ? donHang.getTongTien() : 0;
            double giam = tinhTienGiamVoucher(tongTien, donHang.getGiamGia());
            donHang.setTongTienGiamGia(giam);
            donHang.setTongTien(tongTien - giam);
        } else {
            donHang.setTongTienGiamGia(0.0);
            // donHang.setTongTien(...) // giữ nguyên tổng tiền gốc
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

    // ... existing code ...
    // ...existing code...
    @Transactional
    public DonHangDTO updateVoucher(Integer idDonHang, Integer idgiamGia) {
        Optional<DonHang> optional = donHangRepository.findById(idDonHang);
        if (optional.isPresent()) {
            DonHang donHang = optional.get();

            // Lưu lại voucher cũ
            Voucher oldVoucher = donHang.getGiamGia();

            // Nếu có voucher cũ, cộng lại số lượng
            if (oldVoucher != null) {
                oldVoucher.setSoLuong(oldVoucher.getSoLuong() + 1);
                voucherRepository.save(oldVoucher);
            }

            // Nếu có voucher mới
            if (idgiamGia != null) {
                Voucher newVoucher = voucherRepository.findById(idgiamGia).orElse(null);
                if (newVoucher == null) throw new RuntimeException("Không tìm thấy voucher mới");
                if (newVoucher.getSoLuong() <= 0) throw new RuntimeException("Voucher đã hết lượt sử dụng");
                // Trừ số lượng voucher mới
                newVoucher.setSoLuong(newVoucher.getSoLuong() - 1);
                voucherRepository.save(newVoucher);

                voucherService.kiemTraDieuKienVoucher(donHang, idgiamGia);
                donHang.setGiamGia(newVoucher);
            } else {
                donHang.setGiamGia(null);
            }

            capNhatTongTienDonHang(idDonHang);
            return convertToDTO(donHangRepository.save(donHang));
        }
        return null;
    }
// ...existing code...

    // Hàm tính số tiền giảm giá từ voucher
    private double tinhTienGiamVoucher(double tongTien, Voucher voucher) {
        if (voucher == null) return 0.0;
        double giam = 0.0;
        String loai = voucher.getLoaiVoucher();
        double giaTri = voucher.getGiaTri();

        if ("Giảm giá %".equalsIgnoreCase(loai)) {
            giam = tongTien * giaTri / 100.0;
        } else if ("Giảm giá số tiền".equalsIgnoreCase(loai)) {
            giam = giaTri;
        }
        // Không cho giảm quá tổng tiền
        if (giam > tongTien) giam = tongTien;
        // Làm tròn về số nguyên nếu muốn
        return Math.round(giam);
    }
    // ... existing code ...
    public DonHangDTO updateKhachHang(Integer idDonHang, Integer idkhachHang) {
        Optional<DonHang> optional = donHangRepository.findById(idDonHang);
        if (optional.isPresent()) {
            DonHang donHang = optional.get();
            if (idkhachHang != null) {
                Optional<KhachHang> kh = khachHangRepository.findById(idkhachHang);
                kh.ifPresent(donHang::setKhachHang);
            } else {
                donHang.setKhachHang(null);
            }
            return convertToDTO(donHangRepository.save(donHang));
        }
        return null;
    }

    @Transactional
    public void delete(Integer id) {
        Optional<DonHang> donHangOptional = donHangRepository.findById(id);
        if (donHangOptional.isPresent()) {
            DonHang donHang = donHangOptional.get();
            // Duyệt và cộng lại tồn kho TRƯỚC khi clear hoặc xóa
            for (DonHangChiTiet chiTiet : donHang.getDonHangChiTiets()) {
                SanPhamChiTiet spct = chiTiet.getSanPhamChiTiet();
                if (spct != null) {
                    spct.setSoLuong(spct.getSoLuong() + chiTiet.getSoLuong());
                    sanPhamChiTietRepository.save(spct);
                }
            }
            // KHÔNG cần clear() nữa, chỉ cần xóa đơn hàng, Hibernate sẽ tự xóa chi tiết (do orphanRemoval = true)
            donHangRepository.delete(donHang);
        }
    }

    public List<DonHangDTO> filterByTrangThaiAndLoai(Integer trangThai, String loaiDonHang) {
        List<DonHang> list;
        if (trangThai == null) {
            list = donHangRepository.findByLoaiDonHangOnly(loaiDonHang);
        } else {
            list = donHangRepository.findByTrangThaiAndLoaiDonHangOnly(trangThai, loaiDonHang);
        }
        return list.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }


    public DonHangDTO xacNhanDonHang(
            Integer id,
            Double tongTien, // Tham số này sẽ không dùng để set lại tổng tiền!
            Integer idkhachHang,
            String tenKhachHang,
            String email,
            String soDienThoai,
            Integer phiVanChuyen,
            String diaChiGiaoHang
    ) {
        Optional<DonHang> optional = donHangRepository.findById(id);
        if (optional.isPresent()) {
            DonHang donHang = optional.get();

            // Kiểm tra lại điều kiện voucher nếu có
            if (donHang.getGiamGia() != null) {
                try {
                    voucherService.kiemTraDieuKienVoucher(donHang, donHang.getGiamGia().getId());
                } catch (Exception e) {
                    // Nếu voucher không hợp lệ, reset về null và cập nhật lại tổng tiền
                    donHang.setGiamGia(null);
                    donHang.setTongTienGiamGia(0.0);
                    capNhatTongTienDonHang(donHang.getId());
                    donHangRepository.save(donHang);
                    throw new RuntimeException("Voucher không đủ điều kiện, đã được reset về null!");
                }
            }

            donHang.setTrangThai(1); // Đã thanh toán
            donHang.setNgayMua(LocalDate.now()); // ✅ Cập nhật ngày mua (ngày thanh toán)
            if (phiVanChuyen != null) donHang.setPhiVanChuyen(phiVanChuyen);
            if (diaChiGiaoHang != null) donHang.setDiaChiGiaoHang(diaChiGiaoHang);

            // Luôn cập nhật lại tổng tiền và giảm giá dựa trên voucher hiện tại
            capNhatTongTienDonHang(donHang.getId());

            // Xử lý khách hàng như cũ...
            KhachHang khachHang = null;
            if (idkhachHang != null) {
                khachHang = khachHangRepository.findById(idkhachHang).orElse(null);
            } else if (tenKhachHang != null && !tenKhachHang.isEmpty()) {
                khachHang = new KhachHang();
                khachHang.setTenKhachHang(tenKhachHang);
                khachHang.setEmail(email);
                khachHang.setSoDienThoai(soDienThoai);
                khachHang = khachHangRepository.save(khachHang);
            }
            if (khachHang != null) {
                donHang.setKhachHang(khachHang);
            }

            // Lưu và trả về DTO
            donHang = donHangRepository.save(donHang);
            return convertToDTO(donHang);
        }
        return null;
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
        dh.setPhiVanChuyen(dto.getPhiVanChuyen() != null ? dto.getPhiVanChuyen() : 0); // null-safe
        dh.setTenNguoiNhan(dto.getTenNguoiNhan());
        dh.setSoDienThoaiGiaoHang(dto.getSoDienThoaiGiaoHang());
        dh.setDiaChiGiaoHang(dto.getDiaChiGiaoHang());
        dh.setEmailGiaoHang(dto.getEmailGiaoHang());

        if (dto.getIdnhanVien() != null) {
            Optional<NhanVien> nv = nhanVienRepository.findById(dto.getIdnhanVien());
            nv.ifPresent(dh::setNhanVien);
        }

        if (dto.getIdkhachHang() != null) {
            Optional<KhachHang> kh = khachHangRepository.findById(dto.getIdkhachHang());
            kh.ifPresent(dh::setKhachHang);
        }

        if (dto.getIdgiamGia() != null) {
            // Kiểm tra điều kiện voucher trước khi gán!
            voucherService.kiemTraDieuKienVoucher(dh, dto.getIdgiamGia());
            Optional<Voucher> voucher = voucherRepository.findById(dto.getIdgiamGia());
            voucher.ifPresent(dh::setGiamGia);
        }

        return dh;
    }
//    public void capNhatTongTienDonHang(Integer idDonHang) {
//        DonHang donHang = donHangRepository.findById(idDonHang).orElseThrow();
//        List<DonHangChiTiet> chiTiets = donHang.getDonHangChiTiets();
//        double tongTienGoc = 0;
//        for (DonHangChiTiet ct : chiTiets) {
//            tongTienGoc += ct.getThanhTien();
//        }
//
//        double giam = 0.0;
//        if (donHang.getGiamGia() != null) {
//            giam = tinhTienGiamVoucher(tongTienGoc, donHang.getGiamGia());
//        }
//        donHang.setTongTienGiamGia(giam);
//        donHang.setTongTien(tongTienGoc - giam);
//
//        donHangRepository.save(donHang);
//    }
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
        don.setNgayTao(LocalDate.now());
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

            sp.setSoLuong(sp.getSoLuong() - dto.getSoLuong());
            sanPhamChiTietRepository.save(sp);

            Double gia = (sp.getGiaBanGiamGia() != null && sp.getGiaBanGiamGia() > 0 && sp.getGiaBanGiamGia() < sp.getGiaBan())
                    ? sp.getGiaBanGiamGia() : sp.getGiaBan();

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
        System.out.println("DEBUG taoHoaDonOnline - don.setPhiVanChuyen: " + fee);

        double giam = 0;
        if (req.getIdVoucher() != null) {
            Voucher v = voucherRepository.findById(req.getIdVoucher()).orElse(null);
            if (v != null) {
                // ✅ FIX: Dùng đúng loaiVoucher trong DB ("Giảm giá số tiền" hoặc "Giảm giá %")
                giam = tinhTienGiamVoucher(tongTien, v);
                don.setGiamGia(v);
                System.out.println("DEBUG taoHoaDonOnline - Apply Voucher giam: " + giam);
            }
        }
        don.setTongTienGiamGia(giam);
        
        // Tính tổng thanh toán cuối cùng = Tổng tiền sản phẩm - Giảm giá voucher + Phí vận chuyển
        double finalTongTien = tongTien - giam + fee;
        
        // --- FIX: Ưu tiên sử dụng tổng tiền Frontend gửi lên nếu có (đã bao gồm voucher, chưa gồm ship) ---
        if (req.getTongTien() != null && req.getTongTien() > 0) {
            // finalTongTien = Tổng do Frontend tính + Phí vận chuyển
            finalTongTien = req.getTongTien() + fee;
            System.out.println("DEBUG taoHoaDonOnline - OVERRIDE finalTongTien bằng dữ liệu Frontend: " + finalTongTien);
        }
        
        don.setTongTien(finalTongTien);
        System.out.println("DEBUG taoHoaDonOnline - SETTING FINAL tongTien: " + finalTongTien);

        // Lưu duy nhất 1 lần thay vì lưu nhiều lần
        don = donHangRepository.save(don);
        System.out.println("DEBUG taoHoaDonOnline - SAVED ORDER ID: " + don.getId());
        
        return new DonHangDTO(don);
    }

    // Xác nhận đơn
    public void xacNhanDon(Integer id) {
        DonHang d = donHangRepository.findById(id).orElseThrow();
        d.setTrangThai(TrangThaiDonHang.XAC_NHAN.getValue());
        d.setNgayMua(LocalDate.now());
        donHangRepository.save(d);
    }

    public void huyDon(Integer idDon) {
        DonHang don = donHangRepository.findById(idDon)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn"));

        int trangThaiCu = don.getTrangThai();

        //  Kiểm tra trạng thái có được phép hủy
        List<Integer> trangThaiDuocHuy = List.of(0, 1, 2, 3); // Được hủy nếu chưa giao
        if (!trangThaiDuocHuy.contains(trangThaiCu)) {
            throw new RuntimeException("Không thể hủy đơn ở trạng thái: "
                    + TrangThaiDonHang.fromValue(trangThaiCu).getDisplayName());
        }
        //  Cập nhật trạng thái đơn
        don.setTrangThai(TrangThaiDonHang.DA_HUY.getValue());

        //  Hoàn lại số lượng sản phẩm
        for (DonHangChiTiet ct : don.getDonHangChiTiets()) {
            SanPhamChiTiet sp = ct.getSanPhamChiTiet();
            if (sp != null) {
                int hienTai = sp.getSoLuong();
                sp.setSoLuong(hienTai + ct.getSoLuong());
                sanPhamChiTietRepository.save(sp);
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
            Integer phiVanChuyenMoi
    ) {
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

    public DonHang layChiTietDon(Integer id) {
        DonHang don = donHangRepository.findWithChiTiet(id);
        if (don == null) throw new RuntimeException("Không tìm thấy đơn #" + id);
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
                "donDaGiao", daGiao
        );
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

        don.setTrangThai(trangThaiMoi.getValue());
        donHangRepository.save(don);
    }

    private boolean isTrangThaiHopLe(TrangThaiDonHang hienTai, TrangThaiDonHang moi) {
        return switch (hienTai) {
            case CHO_XAC_NHAN -> moi == TrangThaiDonHang.XAC_NHAN || moi == TrangThaiDonHang.DA_HUY;
            case XAC_NHAN -> moi == TrangThaiDonHang.DANG_CHUAN_BI || moi == TrangThaiDonHang.DA_HUY;
            case DANG_CHUAN_BI -> moi == TrangThaiDonHang.DANG_GIAO || moi == TrangThaiDonHang.DA_HUY;
            case DANG_GIAO -> moi == TrangThaiDonHang.DA_GIAO || moi == TrangThaiDonHang.DA_HUY;
            case DA_GIAO -> moi == TrangThaiDonHang.TRA_HANG_HOAN_TIEN      ;
            default -> false;
        };
    }








}
