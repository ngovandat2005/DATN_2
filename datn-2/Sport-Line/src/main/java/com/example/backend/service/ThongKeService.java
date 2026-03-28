package com.example.backend.service;

import com.example.backend.dto.BestSellerDTO;
import com.example.backend.repository.DonHangChiTietRepository;
import com.example.backend.repository.DonHangRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ThongKeService {

    @Autowired
    private DonHangRepository donHangRepository;

    @Autowired
    private DonHangChiTietRepository donHangChiTietRepository;

    public Double getTodayRevenue() {
        return donHangRepository.sumRevenueByDate(LocalDate.now());
    }

    public Double getRevenueByMonthAndYear(int month, int year) {
        return donHangRepository.sumRevenueByMonthAndYear(month, year);
    }

    public Integer getProductsSoldByMonthAndYear(int month, int year) {
        return donHangChiTietRepository.sumProductsSoldByMonthAndYear(month, year);
    }

    public Integer getOrdersCompletedByMonthAndYear(int month, int year) {
        return donHangRepository.countOrdersCompletedByMonthAndYear(month, year);
    }

    public Double getRevenueByChannel(String channel, int month, int year) {
        if ("OFFLINE".equalsIgnoreCase(channel)) channel = "Bán hàng tại quầy";
        return donHangRepository.sumRevenueByChannelAndMonthAndYear(channel, month, year);
    }

    public Integer getProductsSoldByChannel(String channel, int month, int year) {
        if ("OFFLINE".equalsIgnoreCase(channel)) channel = "Bán hàng tại quầy";
        return donHangChiTietRepository.sumProductsSoldByChannelAndMonthAndYear(channel, month, year);
    }

    public Map<String, Object> getRevenueShare(int month, int year) {
        Double online = donHangRepository.sumRevenueByChannelAndMonthAndYear("ONLINE", month, year);
        Double offline = donHangRepository.sumRevenueByChannelAndMonthAndYear("Bán hàng tại quầy", month, year);
        if (online == null) online = 0.0;
        if (offline == null) offline = 0.0;
        double total = online + offline;
        
        Map<String, Object> share = new HashMap<>();
        share.put("onlineRevenue", online);
        share.put("offlineRevenue", offline);
        share.put("onlinePercent", total > 0 ? (online / total * 100) : 0);
        share.put("offlinePercent", total > 0 ? (offline / total * 100) : 0);
        
        return share;
    }

    public List<BestSellerDTO> getBestSellers(int limit) {
        return donHangChiTietRepository.getBestSellers(PageRequest.of(0, limit));
    }

    public Integer getOrdersByDate(LocalDate date) {
        return donHangRepository.countOrdersByDate(date);
    }
}
