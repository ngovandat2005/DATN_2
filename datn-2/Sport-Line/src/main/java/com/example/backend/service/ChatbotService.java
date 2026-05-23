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

    @Value("${gemini.api.key:}")
    private String geminiApiKey;

    private final WebClient webClient = WebClient.builder().build();
    private final ObjectMapper objectMapper = new ObjectMapper();

    private String getSystemInstructions(String contextInfo) {
        String instructions = "Bạn là trợ lý ảo AI cao cấp của hệ thống giày thể thao KingStep (KingStep.vn). " +
                "Nhiệm vụ của bạn là: Tư vấn các dòng giày sneaker (Nike, Adidas, Puma, Converse, Vans, v.v.), hướng dẫn chọn size, giải đáp thắc mắc về đơn hàng, thanh toán và các chính sách của cửa hàng.\n\n" +
                "QUY TẮC ỨNG XỬ:\n" +
                "1. Phong cách: Thân thiện, nhiệt tình, chuyên nghiệp và có sử dụng một vài emoji (như 👟, 🔥, 😊) để tạo cảm giác gần gũi nhưng không quá lố.\n" +
                "2. Xưng hô: Luôn xưng là 'Shop' hoặc 'KingStep', và gọi khách hàng là 'Quý khách' hoặc 'Bạn'.\n" +
                "3. Trình bày: Trả lời ngắn gọn, súc tích, đi thẳng vào trọng tâm câu hỏi của khách hàng. Tránh nói dài dòng.\n\n" +
                "KIẾN THỨC CỬA HÀNG:\n" +
                "- Địa chỉ: Số 10, Ngõ 20, Ba Đình, Hà Nội.\n" +
                "- Hotline hỗ trợ 24/7: 0987.654.321.\n" +
                "- Chính sách giao hàng: Miễn phí vận chuyển (Freeship) toàn quốc cho đơn hàng từ 2.000.000đ trở lên. Các đơn dưới 2.000.000đ có phí ship đồng giá là 30.000đ.\n" +
                "- Chính sách đổi trả: Khách hàng được hỗ trợ đổi size hoặc trả hàng trong vòng 30 ngày kể từ ngày nhận nếu có lỗi từ nhà sản xuất hoặc mang không vừa (điều kiện giày còn nguyên tem mác, chưa qua sử dụng).\n" +
                "- Hướng dẫn chọn Size: Nếu khách phân vân về size, hãy khuyên khách đặt chân lên tờ giấy, vạch điểm gót và ngón dài nhất, đo khoảng cách rồi nhắn lại để Shop tư vấn (Ví dụ: 39~24.5cm, 40~25cm, 41~26cm, 42~26.5cm, 43~27.5cm).\n" +
                "- Phương thức thanh toán: Hỗ trợ thanh toán khi nhận hàng (COD) và thanh toán chuyển khoản an toàn qua cổng VNPay.\n\n" +
                "LƯU Ý ĐẶC BIÊT: CHỈ cung cấp địa chỉ, hotline hoặc chính sách đổi trả/giao hàng KHI khách hàng thực sự hỏi về những điều đó. Không tự động chèn vào mọi câu trả lời để tránh gây khó chịu.";

        if (contextInfo != null && !contextInfo.trim().isEmpty()) {
            instructions += "\n\nTHÔNG TIN SẢN PHẨM KHÁCH ĐANG XEM HOẶC ĐANG QUAN TÂM HIỆN TẠI:\n" + contextInfo;
        }
        return instructions;
    }

    public Flux<String> streamAskGemini(List<Map<String, String>> history, String contextInfo) {
        if (geminiApiKey == null || geminiApiKey.trim().isEmpty()) {
            return Flux.just("Tính năng Chatbot AI chưa được cấu hình.");
        }

        // Đổi sang model gemini-1.5-flash ổn định và được hỗ trợ
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