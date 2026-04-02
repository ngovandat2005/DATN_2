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

    private static final String GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=";
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public String askGemini(String userMessage, String contextInfo) {
        if (geminiApiKey == null || geminiApiKey.trim().isEmpty() || geminiApiKey.contains("YOUR_KEY")) {
            return "Tính năng Chatbot AI chưa được cấu hình. Vui lòng thêm gemini.api.key vào file cấu hình hệ thống.";
        }

        try {
            String url = GEMINI_API_URL + geminiApiKey;

            Map<String, Object> requestBody = new HashMap<>();
            Map<String, Object> content = new HashMap<>();

            String systemPrompt = "Bạn là trợ lý ảo AI cao cấp của hệ thống cửa hàng giày thể thao chính hãng KingStep. " +
                                  "Nhiệm vụ của bạn là tư vấn cho khách hàng về các mẫu giày (Nike, Adidas, Puma, v.v.), size giày, chính sách bảo hành, giao hàng. " +
                                  "Quy tắc trả lời:\n" +
                                  "1. Luôn xưng 'tôi' và gọi khách là 'bạn' hoặc 'quý khách'.\n" +
                                  "2. Trả lời ngắn gọn (dưới 150 chữ), chia các ý bằng gạch đầu dòng cho dễ đọc.\n" +
                                  "3. Địa chỉ: 'Số 10, ngõ 20, Ba Đình, Hà Nội'.\n" +
                                  "4. Liên hệ: Hotline/Zalo phản ánh dịch vụ: 0987.654.321. Email: support@kingstep.vn.\n" +
                                  "5. Phí Ship: Nội thành Hà Nội 30.000đ; Ngoại thành và tỉnh khác 50.000đ. Miễn phí ship (Freeship) cho đơn hàng từ 2.000.000đ trở lên.\n" +
                                  "6. Chính sách: Đổi trả trong 30 ngày. Bảo hành 1 năm.\n" +
                                  "7. Chỉ tư vấn về giày thể thao và mua sắm.\n\n";

            if (contextInfo != null && !contextInfo.trim().isEmpty()) {
                systemPrompt += "THÔNG TIN CẬP NHẬT TRỰC TIẾP TỪ HỆ THỐNG (" + contextInfo + "). Hãy sử dụng thông tin này để trả lời nếu khách hàng hỏi về sản phẩm nổi bật hoặc giảm giá.\n\n";
            }
            String fullMessage = systemPrompt + "Khách hỏi: " + userMessage;

            Map<String, String> part = new HashMap<>();
            part.put("text", fullMessage);

            content.put("parts", new Object[] { part });
            requestBody.put("contents", new Object[] { content });

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode rootNode = objectMapper.readTree(response.getBody());
                JsonNode candidates = rootNode.path("candidates");
                if (candidates.isArray() && candidates.size() > 0) {
                    JsonNode textNode = candidates.get(0).path("content").path("parts").get(0).path("text");
                    if (!textNode.isMissingNode()) {
                        return textNode.asText().replaceAll("(?i)\\*\\*", "");
                    }
                }
            }
            return "Xin lỗi, tôi không thể lấy được câu trả lời lúc này.";
        } catch (HttpClientErrorException e) {
            System.err.println("Lỗi gọi Gemini API: " + e.getResponseBodyAsString());
            return "Lỗi cấu hình AI hoặc API Key bị giới hạn. Vui lòng liên hệ Admin.";
        } catch (Exception e) {
            e.printStackTrace();
            return "Hệ thống AI đang bảo trì. Vui lòng thử lại sau vài phút.";
        }
    }
}
