package com.example.backend.controller;

import com.example.backend.service.ChatbotService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.MediaType;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import reactor.core.Disposable;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chatbot")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:3002"})
public class ChatbotController {

    @Autowired
    private ChatbotService chatbotService;

    @PostMapping("/ask")
    public ResponseEntity<Map<String, String>> askChatbot(@RequestBody Map<String, Object> request) {
        String message = (String) request.get("message");
        String context = (String) request.get("context");
        if (message == null || message.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("reply", "Tin nhắn không được để trống."));
        }

        String reply = chatbotService.askGemini(message, context);
        return ResponseEntity.ok(Map.of("reply", reply));
    }

    @PostMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamChatbot(@RequestBody Map<String, Object> request) {
        SseEmitter emitter = new SseEmitter(90000L); // 90s timeout for longer chats
        
        List<Map<String, String>> history = (List<Map<String, String>>) request.get("history");
        String context = (String) request.get("context");

        if (history == null || history.isEmpty()) {
            try {
                emitter.send(SseEmitter.event().data("Lịch sử trò chuyện trống."));
                emitter.complete();
            } catch (Exception ignored) {}
            return emitter;
        }

        // Theo dõi subscription để dispose khi emitter xong (tiết kiệm API quota)
        final Disposable subscription = chatbotService.streamAskGemini(history, context)
                .subscribe(
                        data -> {
                            try {
                                emitter.send(SseEmitter.event().data(data));
                            } catch (Exception e) {
                                emitter.completeWithError(e);
                            }
                        },
                        err -> {
                            try {
                                String errorMsg = err.getMessage();
                                if (errorMsg != null && errorMsg.contains("429")) {
                                    emitter.send(SseEmitter.event().data("Hệ thống đang bận (429), vui lòng đợi 60 giây!"));
                                } else {
                                    emitter.send(SseEmitter.event().data("Lỗi kết nối AI: " + errorMsg));
                                }
                                emitter.complete();
                            } catch (Exception ignored) {}
                        },
                        () -> emitter.complete()
                );

        emitter.onCompletion(subscription::dispose);
        emitter.onTimeout(subscription::dispose);
        emitter.onError(e -> subscription.dispose());

        return emitter;
    }
}