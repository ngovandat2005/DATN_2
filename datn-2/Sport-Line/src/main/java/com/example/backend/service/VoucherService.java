
package com.example.backend.service;

import com.example.backend.KhongTimThay;
import com.example.backend.dto.VoucherDTO;
import com.example.backend.entity.DonHang;
import com.example.backend.entity.Voucher;
import com.example.backend.repository.DonHangRepository;
import com.example.backend.repository.VoucherRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class VoucherService {

    @Autowired
    private VoucherRepository voucherRepository;

    @Autowired
    private DonHangRepository donHangRepository;

    public VoucherDTO convertDTO(Voucher voucher, Boolean isAvailable){
        VoucherDTO dto = new VoucherDTO(
                voucher.getId(),
                voucher.getMaVoucher(),
                voucher.getTenVoucher(),
                voucher.getLoaiVoucher(),
                voucher.getMoTa(),
                voucher.getSoLuong(),
                voucher.getGiaTri(),
                voucher.getDonToiThieu(),
                voucher.getNgayBatDau(),
                voucher.getNgayKetThuc(),
                isAvailable
        );
        dto.setTrangThai(voucher.getTrangThai());
        dto.setGiamGiaToiDa(voucher.getGiamGiaToiDa());
        return dto;
    }
    //Hàm 1 tham số dụng cho các hàm crud
    public VoucherDTO convertDTO(Voucher voucher) {
        return convertDTO(voucher, null); // hoặc true nếu muốn mặc định là đủ điều kiện
    }

    // ham lay all voucher
    public List<VoucherDTO> getall(){
        return voucherRepository.findAll().stream()
                .map(voucher -> convertDTO(voucher))
                .toList();
    }


    //ham lay danh sach theo id
    public VoucherDTO findById(Integer id){
        return voucherRepository.findById(id)
                .map(voucher -> convertDTO(voucher))
                .orElseThrow(() -> new KhongTimThay("Không tìm thấy voucher!"));
    }

    // ham create voucher
    @Transactional
    public VoucherDTO create(VoucherDTO dto){
        // Kiểm tra mã voucher không được trùng
        if (dto.getMaVoucher() != null && voucherRepository.existsByMaVoucher(dto.getMaVoucher().trim())) {
            throw new RuntimeException("Mã voucher \"" + dto.getMaVoucher() + "\" đã tồn tại!");
        }
        // Kiểm tra ngày kết thúc phải sau ngày bắt đầu
        if (dto.getNgayBatDau() != null && dto.getNgayKetThuc() != null
                && !dto.getNgayKetThuc().isAfter(dto.getNgayBatDau())) {
            throw new RuntimeException("Ngày kết thúc phải sau ngày bắt đầu!");
        }
        Voucher v = new Voucher();
        v.setMaVoucher(dto.getMaVoucher());
        v.setTenVoucher(dto.getTenVoucher());
        v.setLoaiVoucher(dto.getLoaiVoucher());
        v.setSoLuong(dto.getSoLuong());
        v.setMoTa(dto.getMoTa());
        v.setGiaTri(dto.getGiaTri());
        v.setDonToiThieu(dto.getDonToiThieu());
        v.setNgayBatDau(dto.getNgayBatDau());
        v.setNgayKetThuc(dto.getNgayKetThuc());
        v.setGiamGiaToiDa(dto.getGiamGiaToiDa());
        v.setTrangThai(dto.getTrangThai());

        return convertDTO(voucherRepository.save(v));
    }

    // ham delete voucher
    public boolean delete(Integer id){
        voucherRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Voucher không tồn tại"));
        // Kiểm tra có đơn hàng nào đang dùng voucher này không
        List<DonHang> donHangs = donHangRepository.findAllByGiamGia_Id(id);
        if (!donHangs.isEmpty()) {
            throw new RuntimeException("Không thể xóa voucher vì đang được áp dụng cho đơn hàng!");
        }
        voucherRepository.deleteById(id);
        return true;
    }

    //ham update voucher
    @Transactional
    public VoucherDTO update (int id, VoucherDTO dto){
        return voucherRepository.findById(id)
                .map( v  -> {
                    // Kiểm tra mã voucher không được trùng với voucher khác
                    if (dto.getMaVoucher() != null
                            && voucherRepository.existsByMaVoucherAndIdNot(dto.getMaVoucher().trim(), id)) {
                        throw new RuntimeException("Mã voucher \"" + dto.getMaVoucher() + "\" đã tồn tại!");
                    }
                    // Kiểm tra ngày kết thúc phải sau ngày bắt đầu
                    if (dto.getNgayBatDau() != null && dto.getNgayKetThuc() != null
                            && !dto.getNgayKetThuc().isAfter(dto.getNgayBatDau())) {
                        throw new RuntimeException("Ngày kết thúc phải sau ngày bắt đầu!");
                    }
                    v.setMaVoucher(dto.getMaVoucher());
                    v.setTenVoucher(dto.getTenVoucher());
                    v.setLoaiVoucher(dto.getLoaiVoucher());
                    v.setSoLuong(dto.getSoLuong());
                    v.setMoTa(dto.getMoTa());
                    v.setGiaTri(dto.getGiaTri());
                    v.setDonToiThieu(dto.getDonToiThieu());
                    v.setNgayBatDau(dto.getNgayBatDau());
                    v.setNgayKetThuc(dto.getNgayKetThuc());
                    v.setGiamGiaToiDa(dto.getGiamGiaToiDa());
                    v.setTrangThai(dto.getTrangThai());

                    return convertDTO(voucherRepository.save(v));
                })
                .orElseThrow(() -> new KhongTimThay("Không tìm thấy voucher!"));
    }

    @Scheduled(fixedRate = 60000) // Cập nhật mỗi 60 giây
    public void updateActiveVoucher() {
        updateVoucherActive();
    }

    /**
     * Cập nhật trạng thái voucher:
     * - Nếu đã hết hạn: trạng thái = 0
     * - Nếu đang hoạt động: trạng thái = 1
     * - Nếu chưa bắt đầu hoặc hết hạn: trạng thái = 0
     */
    @Transactional
    public void updateVoucherActive() {
        LocalDateTime now = LocalDateTime.now();

        List<Voucher> voucherList = voucherRepository.findAll();
        List<Voucher> vouchersToUpdate = new ArrayList<>();

        for (Voucher v : voucherList) {
            // Nếu voucher bị tạm ngưng thủ công (trangThai == 2), ta giữ nguyên trạng thái tạm ngưng
            // trừ khi voucher đó đã hết hạn (ngayKetThuc trước now) thì ta cho hết hạn hẳn (setTrangThai(0))
            if (v.getTrangThai() != null && v.getTrangThai() == 2) {
                boolean isExpired = v.getNgayKetThuc().isBefore(now);
                if (isExpired) {
                    v.setTrangThai(0);
                    vouchersToUpdate.add(v);
                }
                continue;
            }

            boolean isExpired = v.getNgayKetThuc().isBefore(now);
            boolean isNotStarted = v.getNgayBatDau().isAfter(now);
            boolean isOutOfStock = v.getSoLuong() != null && v.getSoLuong() == 0;

            boolean isInvalid = isExpired || isNotStarted || isOutOfStock;
            boolean isActive = !isInvalid;

            if (isInvalid) {
                if (v.getTrangThai() == null || v.getTrangThai() != 0) {
                    v.setTrangThai(0);
                    vouchersToUpdate.add(v);
                }

            } else if (isActive) {
                if (v.getTrangThai() == null || v.getTrangThai() != 1) {
                    v.setTrangThai(1);
                    vouchersToUpdate.add(v);
                }
            }
        }

        if (!vouchersToUpdate.isEmpty()) {
            voucherRepository.saveAll(vouchersToUpdate);
        }
    }



    public void updateVoucherForDonHang(DonHang dh, Integer idVoucher) {
        Voucher voucher = voucherRepository.findById(idVoucher)
                .orElseThrow(() -> new RuntimeException("Voucher không tồn tại"));

        double tongTien = dh.getTongTien() != null ? dh.getTongTien() : 0d;

        // Kiểm tra điều kiện áp dụng voucher
        if (voucher.getTrangThai() == null || voucher.getTrangThai() != 1) {
            throw new RuntimeException("Voucher không hoạt động");
        }

        if (voucher.getSoLuong() == null || voucher.getSoLuong() <= 0) {
            throw new RuntimeException("Voucher đã hết lượt sử dụng");
        }

        if (voucher.getNgayBatDau().isAfter(LocalDateTime.now()) || voucher.getNgayKetThuc().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Voucher không còn hiệu lực theo thời gian");
        }

        // Tính toán tổng tiền gốc trước chiết khấu để kiểm tra điều kiện đơn tối thiểu
        double totalGoc = tongTien;
        if (dh.getTongTienGiamGia() != null) {
            totalGoc += dh.getTongTienGiamGia();
        }
        if (dh.getPhiVanChuyen() != null) {
            totalGoc -= dh.getPhiVanChuyen();
        }

        if (voucher.getDonToiThieu() != null && totalGoc < voucher.getDonToiThieu()) {
            throw new RuntimeException("Đơn hàng không đủ điều kiện áp dụng voucher");
        }

        // Hoàn trả voucher cũ nếu có
        Voucher oldVoucher = dh.getGiamGia();
        if (oldVoucher != null) {
            oldVoucher.setSoLuong(oldVoucher.getSoLuong() + 1);
            voucherRepository.save(oldVoucher);
        }

        // Gán voucher và tính lại các giá trị tiền
        double giam = tinhTienGiam(totalGoc, voucher);
        dh.setGiamGia(voucher);
        dh.setTongTienGiamGia(giam);
        dh.setTongTien(totalGoc - giam + (dh.getPhiVanChuyen() != null ? dh.getPhiVanChuyen() : 0));

        // Giảm số lượng voucher mới áp dụng
        voucher.setSoLuong(voucher.getSoLuong() - 1);
        voucherRepository.save(voucher);
    }
    /**
     * Kiểm tra voucher với tổng tiền hàng (chưa gồm ship) và trả về số tiền giảm dự kiến.
     */
    public java.util.Map<String, Object> kiemTraVaTinhGiam(Integer idVoucher, double tongTienHang) {
        Voucher voucher = voucherRepository.findById(idVoucher)
                .orElseThrow(() -> new RuntimeException("Voucher không tồn tại"));

        if (voucher.getTrangThai() == null || voucher.getTrangThai() != 1) {
            throw new RuntimeException("Voucher không hoạt động hoặc đã hết hạn");
        }
        if (voucher.getSoLuong() == null || voucher.getSoLuong() <= 0) {
            throw new RuntimeException("Voucher đã hết lượt sử dụng");
        }
        LocalDateTime now = LocalDateTime.now();
        if (voucher.getNgayBatDau() != null && voucher.getNgayBatDau().isAfter(now)) {
            throw new RuntimeException("Voucher chưa đến thời gian sử dụng");
        }
        if (voucher.getNgayKetThuc() != null && voucher.getNgayKetThuc().isBefore(now)) {
            throw new RuntimeException("Voucher đã hết hạn");
        }
        if (voucher.getDonToiThieu() != null && tongTienHang < voucher.getDonToiThieu()) {
            throw new RuntimeException("Đơn hàng chưa đạt giá trị tối thiểu "
                    + String.format("%,.0f", voucher.getDonToiThieu()) + "đ để dùng voucher");
        }

        double giam = tinhTienGiam(tongTienHang, voucher);
        java.util.Map<String, Object> result = new java.util.HashMap<>();
        result.put("valid", true);
        result.put("discount", giam);
        result.put("tenVoucher", voucher.getTenVoucher());
        result.put("maVoucher", voucher.getMaVoucher());
        result.put("donToiThieu", voucher.getDonToiThieu());
        return result;
    }

    public void kiemTraDieuKienVoucher(DonHang dh, Integer idVoucher) {
        Voucher voucher = voucherRepository.findById(idVoucher)
                .orElseThrow(() -> new RuntimeException("Voucher không tồn tại"));

        double tongTien = dh.getTongTien() != null ? dh.getTongTien() : 0d;

        if (voucher.getTrangThai() == null || voucher.getTrangThai() != 1) {
            throw new RuntimeException("Voucher không hoạt động");
        }
        if (voucher.getSoLuong() == null || voucher.getSoLuong() <= 0) {
            throw new RuntimeException("Voucher đã hết lượt sử dụng");
        }
        if (voucher.getNgayBatDau().isAfter(LocalDateTime.now()) || voucher.getNgayKetThuc().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Voucher không còn hiệu lực theo thời gian");
        }
        if (voucher.getDonToiThieu() != null && tongTien < voucher.getDonToiThieu()) {
            throw new RuntimeException("Đơn hàng không đủ điều kiện áp dụng voucher");
        }
    }

    private double tinhTienGiam(double tongTien, Voucher voucher) {
        double giam = 0.0;
        String loai = voucher.getLoaiVoucher();
        double giaTri = voucher.getGiaTri();

        if ("PHAN_TRAM".equalsIgnoreCase(loai) || "PERCENT".equalsIgnoreCase(loai) || "Giảm giá %".equalsIgnoreCase(loai)) {
            giam = tongTien * (giaTri / 100.0);
            if (voucher.getGiamGiaToiDa() != null && voucher.getGiamGiaToiDa() > 0) {
                giam = Math.min(giam, voucher.getGiamGiaToiDa());
            }
        } else if ("TIEN_MAT".equalsIgnoreCase(loai) || "CASH".equalsIgnoreCase(loai) || "Giảm giá số tiền".equalsIgnoreCase(loai)) {
            giam = giaTri;
        }

        return Math.min(giam, tongTien);
    }
    //Kiểm tra xem voucher nào đủ điều kiện áp dụng cho đơn hàng
    public List<VoucherDTO> getAvailableVouchers(Integer orderId) {
        DonHang donHang = donHangRepository.findById(orderId).orElse(null);
        List<Voucher> allVouchers = voucherRepository.findAll();
        List<VoucherDTO> result = new ArrayList<>();
        for (Voucher v : allVouchers) {
            boolean isAvailable = true;
            try {
                if (donHang != null) {
                    kiemTraDieuKienVoucher(donHang, v.getId());
                }
            } catch (Exception e) {
                isAvailable = false;
            }
            VoucherDTO dto = convertDTO(v);
            dto.setIsAvailable(isAvailable);
            result.add(dto);
        }
        // Sắp xếp voucher đủ điều kiện lên đầu (nếu muốn)
        result.sort((a, b) -> Boolean.compare(Boolean.TRUE.equals(b.getIsAvailable()), Boolean.TRUE.equals(a.getIsAvailable())));
        return result;
    }
}
