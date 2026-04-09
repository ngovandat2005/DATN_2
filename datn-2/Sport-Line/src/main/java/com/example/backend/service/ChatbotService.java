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

    private final WebClient webClient = WebClient.builder().build();
    private final ObjectMapper objectMapper = new ObjectMapper();

    private String getSystemInstructions(String contextInfo) {
        String instructions = "Bạn là trợ lý ảo AI của hệ thống giày thể thao KingStep (KingStep.vn). " +
                "Nhiệm vụ: Tư vấn giày (Nike, Adidas, Puma, v.v.), size giày, thanh toán. " +
                "QUY TẮC CỐT LÕI: " +
                "1. Trả lời cực kỳ ngắn gọn, tập trung đúng vào câu hỏi của khách. " +
                "2. CHỈ cung cấp địa chỉ, hotline hoặc chính sách đổi trả KHI khách hàng thực sự hỏi về những điều đó. "
                +
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

        // Đổi sang model gemini-1.5-flash ổn định và nhanh hơn
        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:streamGenerateContent?key="
                + geminiApiKey.trim();

        Map<String, Object> requestBody = createRequestBody(history, contextInfo);

        return webClient.post()
                .uri(url)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(requestBody)
                .retrieve()
                .bodyToFlux(JsonNode.class)
                .map(node -> {
                    try {
                        // Gemini 1.5 format check
                        JsonNode candidates = node.path("candidates");
                        if (candidates.isArray() && candidates.size() > 0) {
                            JsonNode textNode = candidates.get(0).path("content").path("parts").get(0).path("text");
                            return textNode.isMissingNode() ? "" : textNode.asText();
                        }
                        return "";
                    } catch (Exception e) {
                        return "";
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
            String role = msg.getOrDefault("role", "user");
            String text = msg.get("text");
            
            if (text == null || text.trim().isEmpty()) continue;

            // Chuyển bot thành model
            String mappedRole = role.equals("bot") ? "model" : "user";
            
            // QUAN TRỌNG: Gemini contents MUST khởi đầu bằng 'user'. 
            // Nếu tin nhắn đầu tiên là của bot (welcome), chúng ta sẽ bỏ qua nó trong history gửi đi.
            if (contents.isEmpty() && mappedRole.equals("model")) {
                continue;
            }

            // Tránh gửi 2 role liên tiếp giống nhau (Gemini sẽ lỗi 400)
            if (!contents.isEmpty()) {
                String lastRole = (String) contents.get(contents.size() - 1).get("role");
                if (lastRole.equals(mappedRole)) {
                    // Nếu trùng role, gộp text vào thay vì tạo entry mới
                    List<Map<String, String>> parts = (List<Map<String, String>>) contents.get(contents.size() - 1).get("parts");
                    Map<String, String> newPart = new HashMap<>();
                    newPart.put("text", text);
                    parts.add(newPart);
                    continue;
                }
            }

            Map<String, Object> entry = new HashMap<>();
            entry.put("role", mappedRole);

            List<Map<String, String>> parts = new ArrayList<>();
            Map<String, String> part = new HashMap<>();
            part.put("text", text);
            parts.add(part);
            entry.put("parts", parts);
            contents.add(entry);
        }

        // Nếu sau khi lọc mà contents trống, thêm một tin nhắn ảo để tránh lỗi
        if (contents.isEmpty()) {
            Map<String, Object> entry = new HashMap<>();
            entry.put("role", "user");
            List<Map<String, String>> parts = new ArrayList<>();
            Map<String, String> part = new HashMap<>();
            part.put("text", "Xin chào");
            parts.add(part);
            entry.put("parts", parts);
            contents.add(entry);
        }

        Map<String, Object> body = new HashMap<>();
        body.put("contents", contents);

        Map<String, Object> siPart = new HashMap<>();
        siPart.put("text", getSystemInstructions(contextInfo));
        Map<String, Object> systemInstruction = new HashMap<>();
        List<Map<String, Object>> siParts = new ArrayList<>();
        siParts.add(siPart);
        systemInstruction.put("parts", siParts);
        body.put("system_instruction", systemInstruction);

        return body;
    }
}