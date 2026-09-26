package com.revolt.showroom.security;

import com.revolt.showroom.entity.Admin;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.UUID;

@Service
public class JwtService {

    @Value("${app.jwt.secret}")
    private String secret;

    @Value("${app.jwt.expiration-days}")
    private long expirationDays;

    private SecretKey key;

    @PostConstruct
    void init() {
        if (secret == null || secret.isBlank()) {
            throw new IllegalStateException("app.jwt.secret (JWT_SECRET) must be set");
        }
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateToken(Admin admin) {
        Instant now = Instant.now();
        return Jwts.builder()
            .subject(admin.getId().toString())
            .claim("name", admin.getName())
            .claim("email", admin.getEmail())
            .claim("role", admin.getRole().name())
            .issuedAt(Date.from(now))
            .expiration(Date.from(now.plus(expirationDays, ChronoUnit.DAYS)))
            .signWith(key)
            .compact();
    }

    public AdminPrincipal parseToken(String token) {
        Claims claims = Jwts.parser()
            .verifyWith(key)
            .build()
            .parseSignedClaims(token)
            .getPayload();

        return new AdminPrincipal(
            UUID.fromString(claims.getSubject()),
            claims.get("name", String.class),
            claims.get("email", String.class),
            com.revolt.showroom.entity.AdminRole.valueOf(claims.get("role", String.class))
        );
    }
}
