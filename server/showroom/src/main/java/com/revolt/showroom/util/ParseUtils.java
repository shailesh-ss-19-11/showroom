package com.revolt.showroom.util;

import java.math.BigDecimal;

public final class ParseUtils {

    private ParseUtils() {
    }

    public static Double toDoubleOrNull(String value) {
        if (value == null || value.isBlank()) return null;
        try {
            return Double.parseDouble(value);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    public static BigDecimal toBigDecimalOrNull(String value) {
        if (value == null || value.isBlank()) return null;
        try {
            return new BigDecimal(value);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    public static boolean toBoolean(String value) {
        return "true".equalsIgnoreCase(value) || "on".equals(value) || "1".equals(value);
    }
}
