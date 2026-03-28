package com.example.backend.controller;

import com.example.backend.dto.BestSellerDTO;
import com.example.backend.service.ThongKeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/thong-ke")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:3002"})
public class ThongKeController {

    @Autowired
    private ThongKeService thongKeService;

    @GetMapping("/today-revenue")
    public ResponseEntity<Double> getTodayRevenue() {
        return ResponseEntity.ok(thongKeService.getTodayRevenue());
    }

    @GetMapping("/revenue")
    public ResponseEntity<Double> getRevenue(@RequestParam("month") int month, @RequestParam("year") int year) {
        return ResponseEntity.ok(thongKeService.getRevenueByMonthAndYear(month, year));
    }

    @GetMapping("/products-sold")
    public ResponseEntity<Integer> getProductsSold(@RequestParam("month") int month, @RequestParam("year") int year) {
        return ResponseEntity.ok(thongKeService.getProductsSoldByMonthAndYear(month, year));
    }

    @GetMapping("/orders-completed")
    public ResponseEntity<Integer> getOrdersCompleted(@RequestParam("month") int month, @RequestParam("year") int year) {
        return ResponseEntity.ok(thongKeService.getOrdersCompletedByMonthAndYear(month, year));
    }

    @GetMapping("/revenue-by-channel")
    public ResponseEntity<Double> getRevenueByChannel(@RequestParam("channel") String channel, @RequestParam("month") int month, @RequestParam("year") int year) {
        return ResponseEntity.ok(thongKeService.getRevenueByChannel(channel, month, year));
    }

    @GetMapping("/products-sold-by-channel")
    public ResponseEntity<Integer> getProductsSoldByChannel(@RequestParam("channel") String channel, @RequestParam("month") int month, @RequestParam("year") int year) {
        return ResponseEntity.ok(thongKeService.getProductsSoldByChannel(channel, month, year));
    }

    @GetMapping("/revenue-share")
    public ResponseEntity<Map<String, Object>> getRevenueShare(@RequestParam("month") int month, @RequestParam("year") int year) {
        return ResponseEntity.ok(thongKeService.getRevenueShare(month, year));
    }

    @GetMapping("/best-sellers")
    public ResponseEntity<List<BestSellerDTO>> getBestSellers(@RequestParam(value="type", required=false) String type) {
        // Hardcode limit to 10 as per most dashboards
        return ResponseEntity.ok(thongKeService.getBestSellers(10));
    }

    @GetMapping("/orders-by-date")
    public ResponseEntity<Integer> getOrdersByDate(@RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(thongKeService.getOrdersByDate(date));
    }
}
