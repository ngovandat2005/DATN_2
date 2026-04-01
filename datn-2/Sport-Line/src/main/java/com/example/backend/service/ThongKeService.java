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
        return donHangRepository.sumRevenueByDateRange(LocalDate.now(), LocalDate.now());
    }

    public Map<String, Object> getStatsByDateRange(LocalDate start, LocalDate end) {
        Double totalRevenue = donHangRepository.sumRevenueByDateRange(start, end);
        Integer totalProductsSold = donHangChiTietRepository.sumProductsSoldByDateRange(start, end);
        Integer ordersCompleted = donHangRepository.countOrdersCompletedByDateRange(start, end);
        
        Double onlineRevenue = donHangRepository.sumRevenueByChannelAndDateRange("ONLINE", start, end);
        Double offlineRevenue = donHangRepository.sumRevenueByChannelAndDateRange("Bán hàng tại quầy", start, end);
        
        Integer onlineProducts = donHangChiTietRepository.sumProductsSoldByChannelAndDateRange("ONLINE", start, end);
        Integer offlineProducts = donHangChiTietRepository.sumProductsSoldByChannelAndDateRange("Bán hàng tại quầy", start, end);

        if (onlineRevenue == null) onlineRevenue = 0.0;
        if (offlineRevenue == null) offlineRevenue = 0.0;
        double total = onlineRevenue + offlineRevenue;

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalRevenue", totalRevenue);
        stats.put("totalProductsSold", totalProductsSold);
        stats.put("ordersCompleted", ordersCompleted);
        stats.put("onlineRevenue", onlineRevenue);
        stats.put("offlineRevenue", offlineRevenue);
        stats.put("onlineProducts", onlineProducts);
        stats.put("offlineProducts", offlineProducts);
        stats.put("onlinePercent", total > 0 ? (onlineRevenue / total * 100) : 0);
        stats.put("offlinePercent", total > 0 ? (offlineRevenue / total * 100) : 0);
        
        // Status Distribution for Pie Chart
        List<Object[]> statusCounts = donHangRepository.countOrdersByStatusInRange(start, end);
        Map<Integer, Long> statusMap = new HashMap<>();
        for (Object[] obj : statusCounts) {
            if (obj[0] != null && obj[1] != null) {
                statusMap.put(((Number) obj[0]).intValue(), ((Number) obj[1]).longValue());
            }
        }
        stats.put("statusDistribution", statusMap);

        // Brand Distribution
        List<Object[]> brandCounts = donHangChiTietRepository.countSoldByBrandInRange(start, end);
        Map<String, Long> brandMap = new HashMap<>();
        for (Object[] obj : brandCounts) {
            if (obj[0] != null && obj[1] != null) {
                brandMap.put(obj[0].toString(), ((Number) obj[1]).longValue());
            }
        }
        stats.put("brandDistribution", brandMap);

        // Category Distribution (Quantity)
        List<Object[]> categoryCounts = donHangChiTietRepository.countSoldByCategoryInRange(start, end);
        Map<String, Long> categoryMap = new HashMap<>();
        for (Object[] obj : categoryCounts) {
            if (obj[0] != null && obj[1] != null) {
                categoryMap.put(obj[0].toString(), ((Number) obj[1]).longValue());
            }
        }
        stats.put("categoryDistribution", categoryMap);

        // Category Revenue (New)
        List<Object[]> categoryRevenues = donHangChiTietRepository.sumRevenueByCategoryInRange(start, end);
        Map<String, Double> categoryRevenueMap = new HashMap<>();
        for (Object[] obj : categoryRevenues) {
            if (obj[0] != null && obj[1] != null) {
                categoryRevenueMap.put(obj[0].toString(), ((Number) obj[1]).doubleValue());
            }
        }
        stats.put("categoryRevenue", categoryRevenueMap);

        return stats;
    }

    public List<BestSellerDTO> getBestSellersByDateRange(LocalDate start, LocalDate end, int limit) {
        return donHangChiTietRepository.getBestSellersByDateRange(start, end, PageRequest.of(0, limit));
    }

    public Double getRevenueByMonthAndYear(int month, int year) {
        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end = start.withDayOfMonth(start.lengthOfMonth());
        return donHangRepository.sumRevenueByDateRange(start, end);
    }

    public Integer getProductsSoldByMonthAndYear(int month, int year) {
        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end = start.withDayOfMonth(start.lengthOfMonth());
        return donHangChiTietRepository.sumProductsSoldByDateRange(start, end);
    }

    public Integer getOrdersCompletedByMonthAndYear(int month, int year) {
        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end = start.withDayOfMonth(start.lengthOfMonth());
        return donHangRepository.countOrdersCompletedByDateRange(start, end);
    }

    public Double getRevenueByChannel(String channel, int month, int year) {
        if ("OFFLINE".equalsIgnoreCase(channel)) channel = "Bán hàng tại quầy";
        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end = start.withDayOfMonth(start.lengthOfMonth());
        return donHangRepository.sumRevenueByChannelAndDateRange(channel, start, end);
    }

    public Integer getProductsSoldByChannel(String channel, int month, int year) {
        if ("OFFLINE".equalsIgnoreCase(channel)) channel = "Bán hàng tại quầy";
        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end = start.withDayOfMonth(start.lengthOfMonth());
        return donHangChiTietRepository.sumProductsSoldByChannelAndDateRange(channel, start, end);
    }

    public Map<String, Object> getRevenueShare(int month, int year) {
        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end = start.withDayOfMonth(start.lengthOfMonth());
        Double online = donHangRepository.sumRevenueByChannelAndDateRange("ONLINE", start, end);
        Double offline = donHangRepository.sumRevenueByChannelAndDateRange("Bán hàng tại quầy", start, end);
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
        return donHangChiTietRepository.getBestSellersByDateRange(LocalDate.of(2000, 1, 1), LocalDate.of(2099, 12, 31), PageRequest.of(0, limit));
    }

    public Map<String, Object> getOrdersByDate(LocalDate date) {
        Map<String, Object> data = new java.util.HashMap<>();
        data.put("count", donHangRepository.countOrdersCompletedByDateRange(date, date));
        Double rev = donHangRepository.sumRevenueByDateRange(date, date);
        data.put("revenue", rev != null ? rev : 0.0);
        return data;
    }
}
