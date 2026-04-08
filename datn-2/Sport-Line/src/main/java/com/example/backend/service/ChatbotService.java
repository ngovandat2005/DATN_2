package com.example.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.HttpClientErrorException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.MediaType;

import java.util.HashMap;
import java.util.Map;

@Service
public class ChatbotService {

    @Value("${gemini.api.key:AIzaSyCip5f5SHPpiX0sE7VjXqGzPSLSAQz50dk}")
    private String geminiApiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public String askGemini(String userMessage, String contextInfo) {
        if (geminiApiKey == null || geminiApiKey.trim().isEmpty() || geminiApiKey.contains("YOUR_KEY")) {
            return "Tính năng Chatbot AI chưa được cấu hình. Vui lòng thêm gemini.api.key vào file application.properties.";
        }

        try {
            // Sử dụng gemini-flash-latest để tối ưu giới hạn lượt gọi (Quotas)
            String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=" + geminiApiKey.trim();

            // System prompt thiết lập cá tính cho KingStep
            String systemInstructions = "Bạn là trợ lý ảo AI của hệ thống giày thể thao KingStep (KingStep.vn). " +
                                       "Nhiệm vụ: Tư vấn giày (Nike, Adidas, Puma, v.v.), size giày, thanh toán. " +
                                       "QUY TẮC CỐT LÕI: " +
                                       "1. Trả lời cực kỳ ngắn gọn, tập trung đúng vào câu hỏi của khách. " +
                                       "2. CHỈ cung cấp địa chỉ, hotline hoặc chính sách đổi trả KHI khách hàng thực sự hỏi về những điều đó. Đừng lặp lại chúng ở mọi câu trả lời. " +
                                       "3. Xưng 'Shop', gọi khách là 'Quý khách'. " +
                                       "4. Thông tin cửa hàng (khi được hỏi): Địa chỉ 'Số 10, Ngõ 20, Ba Đình, Hà Nội', Hotline '0987.654.321'. " +
                                       "5. Chính sách: Miễn phí vận chuyển đơn trên 2.000.000đ. Đổi trả 30 ngày. ";

            if (contextInfo != null && !contextInfo.trim().isEmpty()) {
                systemInstructions += "Bối cảnh hiện tại: " + contextInfo + ". ";
            }

            Map<String, Object> requestBody = new HashMap<>();
            Map<String, Object> part = new HashMap<>();
            part.put("text", systemInstructions + "\nKhách hỏi: " + userMessage);
            
            Map<String, Object> contents = new HashMap<>();
            contents.put("parts", new Object[]{part});
            
            requestBody.put("contents", new Object[]{contents});

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode rootNode = objectMapper.readTree(response.getBody());
                JsonNode textNode = rootNode.path("candidates").get(0).path("content").path("parts").get(0).path("text");
                if (!textNode.isMissingNode()) {
                    String reply = textNode.asText().replaceAll("(?i)\\*\\*", ""); // Xóa dấu format đậm
                    return reply.trim();
                }
            }
            return "Xin lỗi, tôi không thể tìm thấy câu trả lời phù hợp lúc này.";
        } catch (HttpClientErrorException e) {
            String errorBody = e.getResponseBodyAsString();
            System.err.println("Gemini API Error [" + e.getStatusCode() + "]: " + errorBody);
            
            if (e.getStatusCode().value() == 403) {
                return "Lỗi: API Key Gemini không hợp lệ hoặc đã bị khóa. Vui lòng kiểm tra lại file application.properties.";
            } else if (e.getStatusCode().value() == 429) {
                return "Hệ thống AI đang quá tải (vượt giới hạn lượt gọi). Quý khách vui lòng thử lại sau 1 phút!";
            }
            return "Dịch vụ AI đang gặp sự cố kết nối (Code: " + e.getStatusCode().value() + ").";
        } catch (Exception e) {
            System.err.println("Chatbot Service Internal Error: " + e.getMessage());
            return "Hệ thống AI đang bảo trì kỹ thuật. Chúng tôi sẽ sớm quay trở lại hỗ trợ Quý khách!";
        }
    }
}
