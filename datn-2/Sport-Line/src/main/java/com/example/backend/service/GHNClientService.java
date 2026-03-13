package com.example.backend.service;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;

import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

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

    @SuppressWarnings("unchecked")
    public int tinhPhiVanChuyen(Integer toDistrictId, String toWardCode, int weightGram) {
        String url = ghnBaseUrl + "/v2/shipping-order/fee";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Token", ghnToken);
        headers.set("ShopId", String.valueOf(ghnShopId));

        Map<String, Object> body = new java.util.HashMap<>();
        body.put("from_district_id", fromDistrictId);
        body.put("to_district_id", toDistrictId);
        body.put("to_ward_code", toWardCode);
        body.put("service_id", 53320); // Thường ổn định hơn service_type_id
        body.put("service_type_id", 2);
        body.put("height", 10);
        body.put("length", 20);
        body.put("width", 10);
        body.put("weight", weightGram);
        body.put("insurance_value", 0);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
        System.out.println("GHN Token = " + ghnToken);
        System.out.println("GHN ShopId = " + ghnShopId);

        try {
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(url, HttpMethod.POST, request, (Class<Map<String, Object>>) (Class<?>) Map.class);
            Map<String, Object> responseBody = response.getBody();

            if (responseBody == null || !(responseBody.get("data") instanceof Map)) {
                System.err.println("GHN trả về dữ liệu không hợp lệ. Dùng phí mặc định 30000.");
                return 30000;
            }

            Map<String, Object> data = (Map<String, Object>) responseBody.get("data");
            Object total = data.get("total");
            if (total instanceof Number) {
                return ((Number) total).intValue();
            }
            return 30000;

        } catch (HttpClientErrorException ex) {
            System.err.println("GHN API lỗi: " + ex.getStatusCode());
            System.err.println("Body GHN: " + ex.getResponseBodyAsString());
            System.err.println("Dùng phí mặc định 30000 do lỗi tuyến đường GHN.");
            return 30000;
        } catch (Exception e) {
            System.err.println("Lỗi không xác định khi gọi GHN: " + e.getMessage());
            return 30000;
        }
    }

    @PostConstruct
    public void init() {
        System.out.println("Config loaded → Token: " + ghnToken + ", ShopId: " + ghnShopId);
    }
}
