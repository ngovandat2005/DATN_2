package com.example.backend.scheduler;

import com.example.backend.entity.DonHang;
import com.example.backend.repository.DonHangRepository;
import com.example.backend.service.DonHangService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class PaymentCleanupScheduler {

    @Autowired
    private DonHangRepository donHangRepository;

    @Autowired
    private DonHangService donHangService;

    /**
     * Tự động chạy mỗi 5 phút (300,000 mili-giây)
     * Quét các đơn hàng trạng thái 8 (CHỜ THANH TOÁN) quá 15 phút mà không hoàn tất để hủy bỏ và trả lại tồn kho.
     */
    @Scheduled(fixedRate = 300000)
    @Transactional
    public void cleanUpExpiredPayments() {
        // Lấy các đơn ở trạng thái CHO_THANH_TOAN (giá trị enum là 8)
        List<DonHang> pendingOrders = donHangRepository.findByTrangThai(8);
        
        if (pendingOrders == null || pendingOrders.isEmpty()) {
            return;
        }

        LocalDateTime thresholdTime = LocalDateTime.now().minusMinutes(15);
        int count = 0;

        for (DonHang dh : pendingOrders) {
            if (dh.getNgayTao() != null && dh.getNgayTao().isBefore(thresholdTime)) {
                try {
                    // Gọi hàm hủy đơn hiện có để vừa chuyển trạng thái 5, vừa hoàn kho và hoàn voucher
                    donHangService.huyDon(dh.getId());
                    System.out.println("[SCHEDULER] Đã tự động hủy đơn hàng VNPay quá hạn (#ID: " + dh.getId() + ")");
                    count++;
                } catch (Exception e) {
                    System.err.println("[SCHEDULER ERROR] Lỗi khi hủy đơn #" + dh.getId() + ": " + e.getMessage());
                }
            }
        }

        if (count > 0) {
            System.out.println("[SCHEDULER] Hoàn tất dọn dẹp. Đã hủy thành công " + count + " đơn hàng quá hạn thanh toán.");
        }
    }
}
