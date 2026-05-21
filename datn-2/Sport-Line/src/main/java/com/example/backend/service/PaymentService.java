package com.example.backend.service;

import com.example.backend.config.VNpayConfig;
import com.example.backend.model.VNPayUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class PaymentService {

    private static final Logger logger = LoggerFactory.getLogger(PaymentService.class);

    @Autowired
    private VNpayConfig vnpayConfig;

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private DonHangService donHangService;

    public String createPaymentUrl(String ipAddress, String orderId) throws Exception {
        if (ipAddress == null || ipAddress.equals("0:0:0:0:0:0:0:1") || ipAddress.equals("localhost")) {
            ipAddress = "127.0.0.1";
        }
        logger.info("DEBUG VNPAY - Client IP: {}, Order ID: {}", ipAddress, orderId);

        int amount = 0;
        if (orderId != null && !orderId.trim().isEmpty()) {
            com.example.backend.entity.DonHang donHang = donHangService.layChiTietDon(Integer.parseInt(orderId));
            if (donHang != null && donHang.getTongTien() != null) {
                if (donHang.getTrangThai() != null && donHang.getTrangThai() >= 1 && donHang.getTrangThai() != 8) {
                    throw new Exception("Đơn hàng này đã được thanh toán hoặc xác nhận trước đó!");
                }
                amount = donHang.getTongTien().intValue();
            } else {
                throw new Exception("Không tìm thấy đơn hàng hoặc tổng tiền không hợp lệ.");
            }
        } else {
            throw new Exception("Cần có mã đơn hàng để thanh toán.");
        }

        Map<String, String> vnpParams = vnpayConfig.createVNPayParams(amount, ipAddress, orderId);

        vnpParams.remove("vnp_SecureHashType");
        vnpParams.remove("vnp_SecureHash");

        // Sort theo thứ tự alphabet
        List<String> fieldNames = new ArrayList<>(vnpParams.keySet());
        Collections.sort(fieldNames);

        List<String> hashParts = new ArrayList<>();
        List<String> queryParts = new ArrayList<>();
        
        for (String fieldName : fieldNames) {
            String fieldValue = vnpParams.get(fieldName);
            
            if (fieldValue != null && fieldValue.length() > 0) {
                String encodedKey = encodeValue(fieldName);
                String encodedValue = encodeValue(fieldValue);
                
                // Build hash data
                hashParts.add(fieldName + "=" + encodedValue);
                
                // Build query string
                queryParts.add(encodedKey + "=" + encodedValue);
            }
        }

        String hashDataStr = String.join("&", hashParts);
        String queryStr = String.join("&", queryParts);

        String secretKey = vnpayConfig.getSecretKey().trim();
        String secureHash = VNPayUtil.hmacSHA512(secretKey, hashDataStr);

        String finalUrl = vnpayConfig.getPayUrl() + "?" + queryStr + "&vnp_SecureHash=" + secureHash;

        logger.info("DEBUG VNPAY - Hash Data: [{}]", hashDataStr);
        logger.info("DEBUG VNPAY - Hash Output: [{}]", secureHash);
        logger.info("DEBUG VNPAY - Full URL: {}", finalUrl);

        return finalUrl;
    }

    private String encodeValue(String value) {
        try {
            // VNPAY standard Java sample requires replacing + with %20 for correct checksum
            return URLEncoder.encode(value, StandardCharsets.UTF_8.toString()).replace("+", "%20");
        } catch (Exception e) {
            return value;
        }
    }

    public String processReturn(HttpServletRequest request) {
        // 1. Kiểm tra chữ ký bảo mật (Secure Hash) từ VNPay để tránh giả mạo request
        Map<String, String> fields = new HashMap<>();
        for (Enumeration<String> params = request.getParameterNames(); params.hasMoreElements();) {
            String fieldName = params.nextElement();
            String fieldValue = request.getParameter(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                fields.put(fieldName, fieldValue);
            }
        }

        String vnp_SecureHash = request.getParameter("vnp_SecureHash");
        fields.remove("vnp_SecureHash");
        fields.remove("vnp_SecureHashType");

        // Sắp xếp các tham số theo thứ tự alphabet
        List<String> fieldNames = new ArrayList<>(fields.keySet());
        Collections.sort(fieldNames);

        List<String> hashParts = new ArrayList<>();
        for (String fieldName : fieldNames) {
            String fieldValue = fields.get(fieldName);
            String encodedValue = encodeValue(fieldValue);
            hashParts.add(fieldName + "=" + encodedValue);
        }

        String hashDataStr = String.join("&", hashParts);
        String secretKey = vnpayConfig.getSecretKey().trim();
        String secureHash = VNPayUtil.hmacSHA512(secretKey, hashDataStr);

        logger.info("DEBUG VNPAY RETURN - Calculated Hash: [{}]", secureHash);
        logger.info("DEBUG VNPAY RETURN - Received Hash: [{}]", vnp_SecureHash);

        if (vnp_SecureHash == null || !secureHash.equalsIgnoreCase(vnp_SecureHash)) {
            logger.error("Chữ ký VNPay không hợp lệ! Có thể có hành vi giả mạo hoặc cấu hình sai.");
            return "Thanh toán thất bại. Mã: Invalid Signature";
        }

        String vnp_ResponseCode = request.getParameter("vnp_ResponseCode");
        String vnp_TxnRef = request.getParameter("vnp_TxnRef");
        String amount = request.getParameter("vnp_Amount");

        if (vnp_TxnRef != null) {
            try {
                int orderId = Integer.parseInt(vnp_TxnRef);
                if ("00".equals(vnp_ResponseCode)) {
                    com.example.backend.entity.DonHang donHang = donHangService.layChiTietDon(orderId);
                    if (donHang != null && donHang.getTrangThai() != null && donHang.getTrangThai() >= 1 && donHang.getTrangThai() != 8) {
                        logger.info("Đơn hàng #{} đã được xác nhận thanh toán trước đó.", orderId);
                        return "Thanh toán thành công. Mã giao dịch: " + vnp_TxnRef;
                    }
                    donHangService.capNhatTrangThai(orderId, com.example.backend.enums.TrangThaiDonHang.XAC_NHAN);
                    String customerEmail = (donHang != null && donHang.getEmailGiaoHang() != null) ? donHang.getEmailGiaoHang() : "ngovandat10a5@gmail.com";
                    sendSuccessEmail(vnp_TxnRef, amount, customerEmail);
                    return "Thanh toán thành công. Mã giao dịch: " + vnp_TxnRef;
                } else {
                    // Thanh toán thất bại hoặc người dùng hủy giao dịch
                    // Giữ nguyên trạng thái CHO_THANH_TOAN (8) để cho phép khách hàng thanh toán lại sau
                    return "Thanh toán thất bại. Mã: " + vnp_ResponseCode;
                }
            } catch (Exception e) {
                logger.error("Lỗi khi cập nhật trạng thái đơn hàng sau thanh toán VNPay: {}", e.getMessage());
            }
        }

        if ("00".equals(vnp_ResponseCode)) {
            sendSuccessEmail(vnp_TxnRef, amount, "ngovandat10a5@gmail.com");
            return "Thanh toán thành công. Mã giao dịch: " + vnp_TxnRef;
        }
        return "Thanh toán thất bại. Mã: " + vnp_ResponseCode;
    }

    private void sendSuccessEmail(String txnRef, String amount, String toEmail) {
        if (toEmail == null || toEmail.trim().isEmpty()) return;
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail); 
        message.setSubject("Giao dịch thành công với VNPay");
        message.setText("Giao dịch mã: " + txnRef + "\nSố tiền: " + (Integer.parseInt(amount) / 100) + " VNĐ\nCảm ơn bạn đã sử dụng dịch vụ!");
        mailSender.send(message);
    }
}
