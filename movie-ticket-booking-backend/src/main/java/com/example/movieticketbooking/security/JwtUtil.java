package com.example.movieticketbooking.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@Component
public class JwtUtil {

    private final String secretKey;
    private static final long EXPIRATION_TIME_MS = 24 * 60 * 60 * 1000L; // 24 hours
    private final ObjectMapper objectMapper = new ObjectMapper();

    public JwtUtil(@Value("${jwt.secret:#{null}}") String configuredSecret) {
        String envSecret = System.getenv("JWT_SECRET");
        String secret = (envSecret != null && !envSecret.trim().isEmpty())
                ? envSecret.trim()
                : (configuredSecret != null && !configuredSecret.trim().isEmpty() ? configuredSecret.trim() : null);

        if (secret == null || secret.isEmpty()) {
            throw new IllegalStateException(
                "Missing required JWT signing secret. Please configure the JWT_SECRET environment variable or set 'jwt.secret' in application properties."
            );
        }
        if (secret.length() < 32) {
            throw new IllegalStateException(
                "Insecure JWT signing secret. The secret must be at least 32 characters long for secure HMAC-SHA256 operations."
            );
        }
        this.secretKey = secret;
    }

    public String generateToken(String username, Integer userId, String role, Integer customerId) {
        try {
            long now = System.currentTimeMillis();
            long exp = now + EXPIRATION_TIME_MS;

            Map<String, Object> header = new HashMap<>();
            header.put("alg", "HS256");
            header.put("typ", "JWT");

            Map<String, Object> payload = new HashMap<>();
            payload.put("sub", username);
            payload.put("userId", userId);
            payload.put("role", role);
            payload.put("customerId", customerId);
            payload.put("iat", now / 1000);
            payload.put("exp", exp / 1000);

            String encodedHeader = Base64.getUrlEncoder().withoutPadding().encodeToString(
                    objectMapper.writeValueAsString(header).getBytes(StandardCharsets.UTF_8)
            );
            String encodedPayload = Base64.getUrlEncoder().withoutPadding().encodeToString(
                    objectMapper.writeValueAsString(payload).getBytes(StandardCharsets.UTF_8)
            );

            String dataToSign = encodedHeader + "." + encodedPayload;
            String signature = sign(dataToSign);

            return dataToSign + "." + signature;
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate JWT token", e);
        }
    }

    public boolean validateToken(String token) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length != 3) {
                return false;
            }

            String dataToSign = parts[0] + "." + parts[1];
            String expectedSignature = sign(dataToSign);
            if (!MessageDigest.isEqual(expectedSignature.getBytes(StandardCharsets.UTF_8), parts[2].getBytes(StandardCharsets.UTF_8))) {
                return false;
            }

            Map<String, Object> payload = getClaims(token);
            if (payload == null) {
                return false;
            }

            Number expNumber = (Number) payload.get("exp");
            if (expNumber == null) {
                return false;
            }

            long expTime = expNumber.longValue() * 1000;
            return System.currentTimeMillis() <= expTime;
        } catch (Exception e) {
            return false;
        }
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> getClaims(String token) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length < 2) {
                return null;
            }
            byte[] decodedBytes = Base64.getUrlDecoder().decode(parts[1]);
            return objectMapper.readValue(decodedBytes, Map.class);
        } catch (Exception e) {
            return null;
        }
    }

    public String extractUsername(String token) {
        Map<String, Object> claims = getClaims(token);
        return claims != null ? (String) claims.get("sub") : null;
    }

    public String extractRole(String token) {
        Map<String, Object> claims = getClaims(token);
        return claims != null ? (String) claims.get("role") : null;
    }

    public Integer extractUserId(String token) {
        Map<String, Object> claims = getClaims(token);
        if (claims != null && claims.get("userId") != null) {
            return ((Number) claims.get("userId")).intValue();
        }
        return null;
    }

    public Integer extractCustomerId(String token) {
        Map<String, Object> claims = getClaims(token);
        if (claims != null && claims.get("customerId") != null) {
            return ((Number) claims.get("customerId")).intValue();
        }
        return null;
    }

    private String sign(String data) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        SecretKeySpec secretKeySpec = new SecretKeySpec(this.secretKey.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        mac.init(secretKeySpec);
        byte[] hmacBytes = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        return Base64.getUrlEncoder().withoutPadding().encodeToString(hmacBytes);
    }
}
