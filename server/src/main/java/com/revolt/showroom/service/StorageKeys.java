package com.revolt.showroom.service;

final class StorageKeys {
    private StorageKeys() {
    }

    static String fromUrl(String url) {
        if (url == null) return null;
        String withoutQuery = url.split("\\?")[0];
        String marker = "/uploads/";
        int idx = withoutQuery.indexOf(marker);
        return idx == -1 ? null : withoutQuery.substring(idx + marker.length());
    }
}
