package com.example.backend.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;

import java.io.File;
import java.io.IOException;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class UploadController {

    @Value("${upload.dir:uploads/}")
    private String uploadDir;

    private static final List<String> ALLOWED_EXTENSIONS = Arrays.asList(
            "jpg", "jpeg", "png", "gif", "webp"
    );

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

    @PostMapping("/upload")
    public ResponseEntity<?> uploadImage(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("File rỗng!");
        }

        // Kiểm tra kích thước tối đa 5MB
        if (file.getSize() > MAX_FILE_SIZE) {
            return ResponseEntity.badRequest().body("File quá lớn! Tối đa 5MB.");
        }

        // Lấy phần mở rộng và kiểm tra loại file (chỉ cho phép ảnh)
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || !originalFilename.contains(".")) {
            return ResponseEntity.badRequest().body("Tên file không hợp lệ!");
        }
        String ext = originalFilename.substring(originalFilename.lastIndexOf('.') + 1).toLowerCase();
        if (!ALLOWED_EXTENSIONS.contains(ext)) {
            return ResponseEntity.badRequest().body("Chỉ cho phép upload file ảnh: jpg, jpeg, png, gif, webp");
        }

        try {
            // Dùng UUID để tránh tên file trùng và path traversal attack
            String fileName = UUID.randomUUID() + "." + ext;
            File destDir = new File(uploadDir);
            if (!destDir.exists()) {
                destDir.mkdirs();
            }
            File dest = new File(destDir, fileName);
            file.transferTo(dest);

            Map<String, String> result = new HashMap<>();
            result.put("fileName", fileName);
            return ResponseEntity.ok(result);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Lỗi upload ảnh!");
        }
    }
}