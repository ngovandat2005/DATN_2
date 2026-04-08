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

    /**
     * Tính phí vận chuyển dựa trên khoảng cách (km) và các thông số khác.
     * Nếu actualDistance != null, sẽ dùng khoảng cách này để tính phí theo công thức.
     * Nếu actualDistance == null, sẽ tự ước tính dựa trên DistrictID/ProvinceID.
     */
    public Map<String, Object> tinhPhiVanChuyen(Integer toDistrictId, Integer toProvinceId, String toWardCode, int weightGram, int insuranceValue, Double actualDistance) {
        int fromDistrict = (fromDistrictId != null) ? fromDistrictId : 1484; // Mặc định Ba Đình
        double distanceKm = 50.0; // Mặc định liên tỉnh 50km
        
        if (actualDistance != null && actualDistance > 0) {
            distanceKm = actualDistance;
        } else if (toDistrictId != null) {
            // Logic ước tính cũ (Fallback)
            if (toDistrictId.equals(fromDistrict)) {
                distanceKm = 5.0; // Cùng quận
            } else if (toProvinceId != null && toProvinceId != 0) {
                Integer fromProvinceId = getProvinceIdByDistrictId(fromDistrict);
                if (fromProvinceId != null && toProvinceId.equals(fromProvinceId)) {
                    distanceKm = 15.0; // Cùng tỉnh
                }
            }
        }

        // --- CÔNG THỨC TÍNH PHÍ ĐÃ ĐIỀU CHỈNH (THÂN THIỆN HƠN) ---
        // 0km - 5km: 15.000 VNĐ (Base - Ưu đãi nội thành)
        // 5km - 20km: +2.500 VNĐ/km
        // > 20km: +2.000 VNĐ/km
        
        double totalFee = 15000.0; // Base fee (0-5km)
        
        if (distanceKm > 5) {
            if (distanceKm <= 20) {
                totalFee += (distanceKm - 5) * 2500;
            } else {
                totalFee += (15 * 2500) + (distanceKm - 20) * 2000;
            }
        }

        // Làm tròn lên hàng nghìn
        int finalFee = (int) (Math.ceil(totalFee / 1000) * 1000);

        // --- GIỚI HẠN PHÍ SHIP THEO VÙNG (KIỂU SHOPEE - 63 TỈNH THÀNH) ---
        // Nhận diện vùng miền qua toProvinceId chuẩn xác theo provinces_utf8.json
        boolean isHanoi = (toProvinceId != null && (toProvinceId == 201 || toProvinceId == 2002));
        
        // Danh sách đầy đủ 25 tỉnh Miền Bắc (theo GHN ProvinceID chính xác từ dữ liệu gốc)
        List<Integer> mienBacIds = java.util.List.of(
            221, 224, 225, 226, 227, 228, 229, 230, 231, 232, 233, 244, 
            245, 246, 247, 248, 249, 263, 264, 265, 266, 267, 268, 269
        );
        boolean isMienBac = mienBacIds.contains(toProvinceId);

        int maxFee = 55000; // Mặc định cho toàn quốc (Miền Trung / Miền Nam)
        if (isHanoi) {
            maxFee = 22000; 
        } else if (isMienBac) {
            maxFee = 35000;
        }

        // Nếu phí tính theo KM thực tế vượt mức trần của vùng, lấy mức trần
        if (finalFee > maxFee) {
            finalFee = maxFee;
        }

        Map<String, Object> result = new java.util.HashMap<>();
        result.put("total_fee", finalFee);
        result.put("distance_km", Math.round(distanceKm * 10.0) / 10.0);
        result.put("from_district", fromDistrict);
        result.put("status", "capped_by_region");

        return result;
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
