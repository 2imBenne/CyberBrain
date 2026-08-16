package com.cyberbrain.config;

import java.net.URI;
import java.util.HashMap;
import java.util.Map;

import org.springframework.context.ApplicationContextInitializer;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.core.env.MapPropertySource;

/**
 * Hỗ trợ biến DATABASE_URL dạng postgres://user:pass@host:port/db?sslmode=require
 * (kiểu Neon/Render) — tự chuyển thành spring.datasource.url/username/password.
 * Khi có DATABASE_URL thì nó override các biến DB_HOST/DB_NAME/... dành cho local dev.
 */
public class DatabaseUrlEnvironmentInitializer
        implements ApplicationContextInitializer<ConfigurableApplicationContext> {

    @Override
    public void initialize(ConfigurableApplicationContext context) {
        String databaseUrl = context.getEnvironment().getProperty("DATABASE_URL");
        if (databaseUrl == null || databaseUrl.isBlank() || databaseUrl.startsWith("jdbc:")) {
            return;
        }

        URI uri;
        try {
            // trim() để tránh lỗi dán chuỗi bị lọt xuống dòng/khoảng trắng
            uri = URI.create(databaseUrl.trim());
            if (uri.getHost() == null) {
                throw new IllegalArgumentException("thiếu host (chuỗi phải có dạng postgres://user:pass@host/db)");
            }
        } catch (Exception e) {
            throw new IllegalStateException(
                    "DATABASE_URL khong parse duoc: " + e.getMessage()
                            + " | Ky vong dang: postgresql://user:password@host/dbname?sslmode=require", e);
        }

        Map<String, Object> props = new HashMap<>();
        String jdbcUrl = "jdbc:postgresql://" + uri.getHost()
                + (uri.getPort() > 0 ? ":" + uri.getPort() : "")
                + uri.getPath()
                + (uri.getQuery() != null ? "?" + uri.getQuery() : "");
        props.put("spring.datasource.url", jdbcUrl);

        String userInfo = uri.getUserInfo();
        if (userInfo != null) {
            int separator = userInfo.indexOf(':');
            if (separator > 0) {
                String username = userInfo.substring(0, separator);
                props.put("spring.datasource.username", username);
                props.put("spring.datasource.password", userInfo.substring(separator + 1));
                // Log chẩn đoán (không in password) — xem tab Logs trên Render
                System.out.println("==> CYBER-BRAIN: DATABASE_URL detected -> jdbc host=" + uri.getHost()
                        + ", port=" + (uri.getPort() > 0 ? uri.getPort() : 5432)
                        + ", db=" + uri.getPath() + ", user=" + username);
            }
        }

        context.getEnvironment().getPropertySources()
                .addFirst(new MapPropertySource("databaseUrl", props));
    }
}
