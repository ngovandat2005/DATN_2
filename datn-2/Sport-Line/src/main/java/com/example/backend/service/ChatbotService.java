package com.example.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.MediaType;
import reactor.core.publisher.Flux;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ChatbotService {

    @Value("${gemini.api.key:AIzaSyBvjeGQmWCM6NcLfuCkFfIpsHws7iZlhi4}")
    private String geminiApiKey;

<<<<<<< HEAD
    private static final String GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=";
    private final RestTemplate restTemplate = new RestTemplate();
=======
    private final WebClient webClient = WebClient.builder().build();
>>>>>>> dbcc773015f481c98f8da0d3b9f78c0a448b6424
    private final ObjectMapper objectMapper = new ObjectMapper();

    private String getSystemInstructions(String contextInfo) {
        String instructions = "Bạn là trợ lý ảo AI của hệ thống giày thể thao KingStep (KingStep.vn). " +
                "Nhiệm vụ: Tư vấn giày (Nike, Adidas, Puma, v.v.), size giày, thanh toán. " +
                "QUY TẮC CỐT LÕI: " +
                "1. Trả lời cực kỳ ngắn gọn, tập trung đúng vào câu hỏi của khách. " +
                "2. CHỈ cung cấp địa chỉ, hotline hoặc chính sách đổi trả KHI khách hàng thực sự hỏi về những điều đó. " +
                "3. Xưng 'Shop', gọi khách là 'Quý khách'. " +
                "4. Thông tin cửa hàng: 'Số 10, Ngõ 20, Ba Đình, Hà Nội', Hotline '0987.654.321'. " +
                "5. Chính sách: Miễn phí vận chuyển đơn trên 2.000.000đ. Đổi trả 30 ngày. ";

        if (contextInfo != null && !contextInfo.trim().isEmpty()) {
            instructions += "Bối cảnh sản phẩm hiện tại: " + contextInfo + ". ";
        }
        return instructions;
    }

    public Flux<String> streamAskGemini(List<Map<String, String>> history, String contextInfo) {
        if (geminiApiKey == null || geminiApiKey.trim().isEmpty()) {
            return Flux.just("Tính năng Chatbot AI chưa được cấu hình.");
        }

        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:streamGenerateContent?key=" + geminiApiKey.trim();

<<<<<<< HEAD
            Map<String, Object> requestBody = new HashMap<>();
            Map<String, Object> content = new HashMap<>();

            String systemPrompt = "Bạn là trợ lý ảo AI cao cấp của hệ thống cửa hàng giày thể thao chính hãng KingStep. "
                    +
                    "Nhiệm vụ của bạn là tư vấn cho khách hàng về các mẫu giày (Nike, Adidas, Puma, v.v.), size giày, chính sách bảo hành, giao hàng. "
                    +
                    "Quy tắc trả lời:\n" +
                    "1. Luôn xưng 'tôi' và gọi khách là 'bạn' hoặc 'quý khách'.\n" +
                    "2. Trả lời ngắn gọn (dưới 150 chữ), chia các ý bằng gạch đầu dòng cho dễ đọc.\n" +
                    "3. Địa chỉ: 'Số 10, ngõ 20, Ba Đình, Hà Nội'.\n" +
                    "4. Liên hệ: Hotline/Zalo phản ánh dịch vụ: 0987.654.321. Email: support@kingstep.vn.\n" +
                    "5. Phí Ship: Nội thành Hà Nội 30.000đ; Ngoại thành và tỉnh khác 50.000đ. Miễn phí ship (Freeship) cho đơn hàng từ 2.000.000đ trở lên.\n"
                    +
                    "6. Chính sách: Đổi trả trong 30 ngày. Bảo hành 1 năm.\n" +
                    "7. Chỉ tư vấn về giày thể thao và mua sắm.\n\n";

            if (contextInfo != null && !contextInfo.trim().isEmpty()) {
                systemPrompt += "THÔNG TIN CẬP NHẬT TRỰC TIẾP TỪ HỆ THỐNG (" + contextInfo
                        + "). Hãy sử dụng thông tin này để trả lời nếu khách hàng hỏi về sản phẩm nổi bật hoặc giảm giá.\n\n";
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
=======
        Map<String, Object> requestBody = createRequestBody(history, contextInfo);

        return webClient.post()
                .uri(url)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(requestBody)
                .retrieve()
                .bodyToFlux(JsonNode.class)
                .map(node -> {
                    try {
                        JsonNode textNode = node.path("candidates").get(0).path("content").path("parts").get(0).path("text");
                        return textNode.isMissingNode() ? "" : textNode.asText();
                    } catch (Exception e) {
                        return "";
>>>>>>> dbcc773015f481c98f8da0d3b9f78c0a448b6424
                    }
                })
                .filter(text -> !text.isEmpty());
    }

    public String askGemini(String userMessage, String contextInfo) {
        List<Map<String, String>> history = new ArrayList<>();
        Map<String, String> msg = new HashMap<>();
        msg.put("role", "user");
        msg.put("text", userMessage);
        history.add(msg);
        
        try {
            return streamAskGemini(history, contextInfo)
                    .collectList()
                    .map(list -> String.join("", list))
                    .block();
        } catch (Exception e) {
            return "Xin lỗi, hiện tại tôi đang gặp sự cố kết nối.";
        }
    }

    private Map<String, Object> createRequestBody(List<Map<String, String>> history, String contextInfo) {
        List<Map<String, Object>> contents = new ArrayList<>();
        
        for (Map<String, String> msg : history) {
            Map<String, Object> entry = new HashMap<>();
            // Gemini roles: "user" and "model"
            String role = msg.getOrDefault("role", "user");
            entry.put("role", role.equals("bot") ? "model" : "user");
            
            Map<String, String> part = new HashMap<>();
            part.put("text", msg.get("text"));
            entry.put("parts", new Object[]{part});
            contents.add(entry);
        }

        Map<String, Object> body = new HashMap<>();
        body.put("contents", contents);

        // System Instruction (available in v1beta)
        Map<String, Object> siPart = new HashMap<>();
        siPart.put("text", getSystemInstructions(contextInfo));
        Map<String, Object> systemInstruction = new HashMap<>();
        systemInstruction.put("parts", new Object[]{siPart});
        body.put("system_instruction", systemInstruction);

        return body;
    }
}