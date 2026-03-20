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

@Service
public class PaymentService {

    @Autowired
    private VNpayConfig vnpayConfig;

    @Autowired
    private JavaMailSender mailSender;

    public String createPaymentUrl(int amount, String ipAddress) throws Exception {
        if (ipAddress == null || ipAddress.equals("0:0:0:0:0:0:0:1") || ipAddress.equals("localhost")) {
            ipAddress = "127.0.0.1";
        }
        System.out.println("DEBUG VNPAY - Client IP: " + ipAddress);

        Map<String, String> vnpParams = vnpayConfig.createVNPayParams(amount, ipAddress);

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

        System.out.println("DEBUG VNPAY - Hash Data: [" + hashDataStr + "]");
        System.out.println("DEBUG VNPAY - Hash Output: [" + secureHash + "]");
        System.out.println("DEBUG VNPAY - Full URL: " + finalUrl);

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
        String vnp_ResponseCode = request.getParameter("vnp_ResponseCode");
        String vnp_TxnRef = request.getParameter("vnp_TxnRef");
        String amount = request.getParameter("vnp_Amount");

        if ("00".equals(vnp_ResponseCode)) {
            sendSuccessEmail(vnp_TxnRef, amount);
            return "Thanh toán thành công. Mã giao dịch: " + vnp_TxnRef;
        }
        return "Thanh toán thất bại. Mã: " + vnp_ResponseCode;
    }

    private void sendSuccessEmail(String txnRef, String amount) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo("ngovandat10a5@gmail.com"); // bạn có thể cho động luôn
        message.setSubject("Giao dịch thành công với VNPay");
        message.setText("Giao dịch mã: " + txnRef + "\nSố tiền: " + (Integer.parseInt(amount) / 100) + " VNĐ\nCảm ơn bạn đã sử dụng dịch vụ!");
        mailSender.send(message);
    }
}
