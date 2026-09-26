package com.revolt.showroom.util;

import java.util.ArrayList;
import java.util.List;

/** Minimal RFC 4180-ish CSV parser: handles quoted fields, escaped quotes, and commas inside quotes. */
public final class CsvParser {

    private CsvParser() {
    }

    public static List<List<String>> parse(String content) {
        List<List<String>> rows = new ArrayList<>();
        List<String> row = new ArrayList<>();
        StringBuilder field = new StringBuilder();
        boolean inQuotes = false;
        int i = 0;
        int len = content.length();

        while (i < len) {
            char c = content.charAt(i);
            if (inQuotes) {
                if (c == '"') {
                    if (i + 1 < len && content.charAt(i + 1) == '"') {
                        field.append('"');
                        i++;
                    } else {
                        inQuotes = false;
                    }
                } else {
                    field.append(c);
                }
            } else {
                if (c == '"') {
                    inQuotes = true;
                } else if (c == ',') {
                    row.add(field.toString());
                    field.setLength(0);
                } else if (c == '\n' || c == '\r') {
                    if (c == '\r' && i + 1 < len && content.charAt(i + 1) == '\n') i++;
                    row.add(field.toString());
                    field.setLength(0);
                    if (!(row.size() == 1 && row.get(0).isEmpty())) {
                        rows.add(row);
                    }
                    row = new ArrayList<>();
                } else {
                    field.append(c);
                }
            }
            i++;
        }
        if (field.length() > 0 || !row.isEmpty()) {
            row.add(field.toString());
            rows.add(row);
        }
        return rows;
    }
}
