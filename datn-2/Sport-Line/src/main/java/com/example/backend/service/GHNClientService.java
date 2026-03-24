package com.example.backend.service;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;

import org.springframework.web.client.RestTemplate;
import java.util.List;
import java.util.Map;

@Service
public class GHNClientService {


    @Value("${ghn.token}")
    private String ghnToken;

    @Value("${ghn.shopId}")
    private Integer ghnShopId;

    private final RestTemplate restTemplate;


    public GHNClientService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @Value("${ghn.baseUrl}")
    private String ghnBaseUrl;

    @Value("${ghn.fromDistrictId}")
    private Integer fromDistrictId;

    public int tinhPhiVanChuyen(Integer toDistrictId, Integer toProvinceId, String toWardCode, int weightGram, int insuranceValue) {
        // ✅ THỰC HIỆN: Tính phí ship THEO KHOẢNG CÁCH (5k/km) như yêu cầu
        int fromDistrict = (fromDistrictId != null) ? fromDistrictId : 1484;
        int distanceKm = 50; // Mặc định liên tỉnh 50km
        
        if (toDistrictId != null) {
            if (toDistrictId.equals(fromDistrict)) {
                distanceKm = 5; // Cùng quận: 5km
            } else if (toProvinceId != null && toProvinceId != 0) {
                Integer fromProvinceId = getProvinceIdByDistrictId(fromDistrict); // Lấy tỉnh của shop
                
                if (fromProvinceId != null && toProvinceId.equals(fromProvinceId)) {
                    distanceKm = 10; // Cùng tỉnh: 10km
                }
            } else {
                // Fallback nếu không có toProvinceId (không khuyến khích)
                Integer lookupProvinceId = getProvinceIdByDistrictId(toDistrictId);
                Integer fromProvinceId = getProvinceIdByDistrictId(fromDistrict);
                if (lookupProvinceId != null && fromProvinceId != null && lookupProvinceId.equals(fromProvinceId)) {
                    distanceKm = 15;
                }
            }
        }

        int finalFee = distanceKm * 5000;
        System.out.println("🚚 Zone-based Distance Logic:");
        System.out.println("   - From District: " + fromDistrict);
        System.out.println("   - To District: " + toDistrictId + " (Province: " + toProvinceId + ")");
        System.out.println("   - Assigned Distance: " + distanceKm + "km");
        System.out.println("   - Final Fee (5k/km): " + finalFee);
        return finalFee;
    }

    // Cận thận: Map.of không nhận null
    private Integer getProvinceIdByDistrictId(Integer districtId) {
        if (districtId == null) return null;
        String url = ghnBaseUrl + "/master-data/district";
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Token", ghnToken);

        try {
            Map<String, Object> body = new java.util.HashMap<>();
            body.put("province_id", null);
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(url, HttpMethod.POST, new HttpEntity<>(body, headers), (Class<Map<String, Object>>) (Class<?>) Map.class);
            Map<String, Object> responseBody = response.getBody();
            if (responseBody != null && responseBody.get("data") instanceof List) {
                List<Map<String, Object>> data = (List<Map<String, Object>>) responseBody.get("data");
                for (Map<String, Object> district : data) {
                    if (districtId.equals(district.get("DistrictID"))) {
                        return (Integer) district.get("ProvinceID");
                    }
                }
            }
        } catch (Exception e) {
            // Im lặng
        }
        return null;
    }

    @PostConstruct
    public void init() {
        System.out.println("Config loaded → Token: " + ghnToken + ", ShopId: " + ghnShopId);
    }
}
