package com.revolt.showroom.service;

public interface StorageService {

    String generateKey(String originalName);

    void uploadObject(String key, byte[] content, String contentType);

    StoredFile getObject(String key);

    void deleteObject(String key);

    void checkBucketHealth();

    /** Extracts the storage key from a full "/uploads/&lt;key&gt;" or absolute URL. */
    String keyFromUrl(String url);
}
