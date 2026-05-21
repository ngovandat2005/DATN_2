package com.example.backend.controller;

import com.example.backend.service.PaymentService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payment")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @GetMapping("/create")
    public String createPayment(@RequestParam(required = false) String orderId, HttpServletRequest request) throws Exception {
        String ipAddress = request.getRemoteAddr();
        return paymentService.createPaymentUrl(ipAddress, orderId);
    }

    @GetMapping("/vnpay-return")
    public String handleVNPayReturn(HttpServletRequest request) {
        return paymentService.processReturn(request);
    }
}
