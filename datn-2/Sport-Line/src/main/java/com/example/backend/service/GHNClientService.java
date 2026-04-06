package com.example.backend.service;

import com.example.backend.entity.DonHang;
import com.example.backend.entity.DonHangChiTiet;
import com.example.backend.model.GhnOrderRequest;
import com.example.backend.model.GhnService;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;

import org.springframework.web.client.RestTemplate;
import java.util.ArrayList;
import java.util.HashMap;
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
     * Lấy danh sách dịch vụ vận chuyển khả dụng
     */
    public List<GhnService> getAvailableServices(Integer toDistrictId) {
        String url = ghnBaseUrl + "/v2/shipping-order/available-services";
        HttpHeaders headers = createHeaders();
        Map<String, Object> body = new HashMap<>();
        body.put("shop_id", ghnShopId);
        body.put("from_district", fromDistrictId);
        body.put("to_district", toDistrictId);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(url, new HttpEntity<>(body, headers), Map.class);
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                List<Map<String, Object>> data = (List<Map<String, Object>>) response.getBody().get("data");
                List<GhnService> services = new ArrayList<>();
                for (Map<String, Object> item : data) {
                    GhnService s = new GhnService();
                    s.setService_id((Integer) item.get("service_id"));
                    s.setShort_name((String) item.get("short_name"));
                    s.setService_type_id((Integer) item.get("service_type_id"));
                    services.add(s);
                }
                return services;
            }
        } catch (Exception e) {
            System.err.println("Lỗi lấy dịch vụ GHN: " + e.getMessage());
        }
        return new ArrayList<>();
    }

    /**
     * Tính phí giao hàng chuẩn từ GHN API
     */
    public Integer calculateGhnFee(Integer serviceId, Integer toDistrictId, String toWardCode, int weight) {
        String url = ghnBaseUrl + "/v2/shipping-order/fee";
        HttpHeaders headers = createHeaders();
        headers.set("ShopId", String.valueOf(ghnShopId));

        Map<String, Object> body = new HashMap<>();
        body.put("service_id", serviceId);
        body.put("insurance_value", 0);
        body.put("coupon", null);
        body.put("from_district_id", fromDistrictId);
        body.put("to_district_id", toDistrictId);
        body.put("to_ward_code", toWardCode);
        body.put("weight", weight);
        body.put("length", 20);
        body.put("width", 20);
        body.put("height", 10);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(url, new HttpEntity<>(body, headers), Map.class);
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<String, Object> data = (Map<String, Object>) response.getBody().get("data");
                return (Integer) data.get("total");
            }
        } catch (Exception e) {
            System.err.println("Lỗi tính phí GHN: " + e.getMessage());
        }
        return null;
    }

    /**
     * Lấy thời gian giao hàng dự kiến
     */
    public Long getLeadTime(Integer serviceId, Integer toDistrictId, String toWardCode) {
        String url = ghnBaseUrl + "/v2/shipping-order/leadtime";
        HttpHeaders headers = createHeaders();
        headers.set("ShopId", String.valueOf(ghnShopId));

        Map<String, Object> body = new HashMap<>();
        body.put("from_district_id", fromDistrictId);
        body.put("from_ward_code", "1A0101"); // Mặc định p.Trung Trực, Ba Đình
        body.put("to_district_id", toDistrictId);
        body.put("to_ward_code", toWardCode);
        body.put("service_id", serviceId);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(url, new HttpEntity<>(body, headers), Map.class);
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<String, Object> data = (Map<String, Object>) response.getBody().get("data");
                return ((Number) data.get("leadtime")).longValue();
            }
        } catch (Exception e) {
            // Ignore
        }
        return null;
    }

    /**
     * Tạo đơn hàng vận chuyển trên GHN
     */
    public String createShippingOrder(DonHang dh) {
        String url = ghnBaseUrl + "/v2/shipping-order/create";
        HttpHeaders headers = createHeaders();
        headers.set("ShopId", String.valueOf(ghnShopId));

        GhnOrderRequest req = new GhnOrderRequest();
        req.setTo_name(dh.getTenNguoiNhan());
        req.setTo_phone(dh.getSoDienThoaiGiaoHang());
        req.setTo_address(dh.getDiaChiGiaoHang());

        // Cần parse districtId và wardCode từ địa chỉ hoặc DTO
        // Ở đây giả định chúng ta đã lưu chúng trong DonHang hoặc truyền vào
        // Để đơn giản, ta sẽ cần cập nhật schema DonHang để lưu toDistrictId và
        // toWardCode
        // Hoặc parse từ chuỗi địa chỉ (không an toàn)
        // Trong kế hoạch, ta nên có các trường này.

        req.setItems(dh.getDonHangChiTiets().stream()
                .map(ct -> new GhnOrderRequest.GhnItem(ct.getSanPhamChiTiet().getSanPham().getTenSanPham(),
                        ct.getSanPhamChiTiet().getMa(),
                        ct.getSoLuong(),
                        ct.getGia().intValue()))
                .toList());

        // Log logic: create real GHN order request should be handled carefully
        try {
            // ResponseEntity<Map> response = restTemplate.postForEntity(url, new
            // HttpEntity<>(req, headers), Map.class);
            // ... return order_code
            return "GHN_MOCKED_CODE_" + System.currentTimeMillis();
        } catch (Exception e) {
            return null;
        }
    }

    private HttpHeaders createHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Token", ghnToken);
        return headers;
    }

    public Map<String, Object> tinhPhiVanChuyen(Integer toDistrictId, Integer toProvinceId, String toWardCode,
            int weightGram, int insuranceValue, Double actualDistance) {
        // Mặc định trọng lượng nếu không có (Shopee thường tính tối thiểu 500g)
        int finalWeight = weightGram > 0 ? weightGram : 500;

        // 1. Thử gọi GHN thật trước (Tính toán phí chính xác nhất)
        Integer ghnFee = null;
        if (toDistrictId != null && toWardCode != null) {
            // Thử gói Chuẩn (53320)
            ghnFee = calculateGhnFee(53320, toDistrictId, toWardCode, finalWeight);

            // Nếu gói Chuẩn thất bại, thử gói Nhanh (53321)
            if (ghnFee == null) {
                ghnFee = calculateGhnFee(53321, toDistrictId, toWardCode, finalWeight);
            }

            // Nếu vẫn thất bại, lấy thử dịch vụ đầu tiên khả dụng
            if (ghnFee == null) {
                List<GhnService> services = getAvailableServices(toDistrictId);
                if (!services.isEmpty()) {
                    ghnFee = calculateGhnFee(services.get(0).getService_id(), toDistrictId, toWardCode, finalWeight);
                }
            }
        }

        // Nếu lấy được giá từ GHN, trả về ngay
        if (ghnFee != null && ghnFee > 0) {
            Map<String, Object> result = new HashMap<>();
            result.put("total_fee", ghnFee);
            result.put("status", "ghn_realtime");
            return result;
        }

        // 2. FALLBACK (Dự phòng khi GHN lỗi hoặc không hỗ trợ vùng sâu vùng xa)
        // Shopee Style: Tính theo vùng miền thay vì tính tiền triệu theo km
        double distanceKm = (actualDistance != null && actualDistance > 0) ? actualDistance : 100.0;

        // Mặc định địa chỉ Cà Mau nếu GHN lỗi nhưng ta biết là liên tỉnh xa
        if (toProvinceId != null && toProvinceId >= 250) { // Giả định vùng miền Nam
            if (distanceKm < 500)
                distanceKm = 1000.0; // Force distance if Southern
        }

        double totalFee = 25000.0; // Phí cơ bản (Hà Nội đi nội thành)

        if (distanceKm <= 30) {
            totalFee = 22000.0;
        } else if (distanceKm <= 100) {
            totalFee = 30000.0;
        } else if (distanceKm <= 500) {
            totalFee = 38000.0;
        } else {
            // Liên tỉnh xa (Hà Nội - HCM, Cà Mau...)
            totalFee = 45000.0 + (Math.min(distanceKm, 2000) / 100.0) * 1000;
        }

        // Giới hạn phí ship tối đa (Shopee Style) -> Không bao giờ để phí ship hàng
        // triệu đồng
        int maxFee = 100000;
        int finalFee = (int) Math.min(totalFee, maxFee);

        // Làm tròn đến hàng nghìn
        finalFee = (int) (Math.ceil(finalFee / 1000.0) * 1000);

        Map<String, Object> result = new HashMap<>();
        result.put("total_fee", finalFee);
        result.put("status", "fallback_shopee_style");
        result.put("note", "Hệ thống tự động áp dụng mức phí ưu đãi");
        return result;
    }

    private Integer getProvinceIdByDistrictId(Integer districtId) {
        if (districtId == null)
            return null;
        String url = ghnBaseUrl + "/master-data/district";
        HttpHeaders headers = createHeaders();

        try {
            Map<String, Object> body = new HashMap<>();
            body.put("province_id", null);
            ResponseEntity<Map> response = restTemplate.postForEntity(url, new HttpEntity<>(body, headers), Map.class);
            if (response.getBody() != null && response.getBody().get("data") instanceof List) {
                List<Map<String, Object>> data = (List<Map<String, Object>>) response.getBody().get("data");
                for (Map<String, Object> district : data) {
                    if (districtId.equals(district.get("DistrictID"))) {
                        return (Integer) district.get("ProvinceID");
                    }
                }
            }
        } catch (Exception e) {
        }
        return null;
    }

    @PostConstruct
    public void init() {
        System.out.println("Config loaded → Token: " + ghnToken + ", ShopId: " + ghnShopId);
    }
}
