package com.example.backend;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class PasswordUtil {

    private final PasswordEncoder encoder = new BCryptPasswordEncoder();

    public String encode(String rawPassword) {
        if (rawPassword == null || rawPassword.isEmpty()) {
            throw new IllegalArgumentException("Password must not be empty");
        }
        return encoder.encode(rawPassword);
    }

    public boolean isEncoded(String stored) {
        return stored != null
                && (stored.startsWith("$2a$") || stored.startsWith("$2b$") || stored.startsWith("$2y$"));
    }

    public boolean matches(String rawPassword, String storedPassword) {
        if (rawPassword == null || storedPassword == null) {
            return false;
        }
        if (isEncoded(storedPassword)) {
            return encoder.matches(rawPassword, storedPassword);
        }
        return rawPassword.equals(storedPassword);
    }
}