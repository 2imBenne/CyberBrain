package com.cyberbrain.util;

import java.text.Normalizer;
import java.util.Locale;

public final class SlugUtils {

    private SlugUtils() {
    }

    /**
     * Tạo slug từ chuỗi tiếng Việt: bỏ dấu, lowercase, thay ký tự lạ bằng '-'.
     */
    public static String slugify(String input) {
        if (input == null || input.isBlank()) {
            return "doc";
        }
        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD)
                .replaceAll("\\p{M}+", "")
                .replace("đ", "d")
                .replace("Đ", "d")
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-+|-+$)", "");
        if (normalized.isBlank()) {
            return "doc";
        }
        return normalized.length() > 200 ? normalized.substring(0, 200) : normalized;
    }
}
