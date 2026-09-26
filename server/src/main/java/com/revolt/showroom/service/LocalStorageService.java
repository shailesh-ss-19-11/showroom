package com.revolt.showroom.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.net.URLConnection;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.HexFormat;

@Service
@ConditionalOnProperty(name = "app.storage.type", havingValue = "local", matchIfMissing = true)
public class LocalStorageService implements StorageService {

    private static final SecureRandom RANDOM = new SecureRandom();

    private final Path rootDir;

    public LocalStorageService(@Value("${app.storage.local.dir}") String dir) {
        this.rootDir = Paths.get(dir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(rootDir);
        } catch (IOException e) {
            throw new UncheckedIOException("Could not create local storage directory: " + rootDir, e);
        }
    }

    @Override
    public String generateKey(String originalName) {
        String ext = "";
        int dot = originalName == null ? -1 : originalName.lastIndexOf('.');
        if (dot != -1) ext = originalName.substring(dot).toLowerCase();

        byte[] randomBytes = new byte[6];
        RANDOM.nextBytes(randomBytes);
        return Instant.now().toEpochMilli() + "-" + HexFormat.of().formatHex(randomBytes) + ext;
    }

    @Override
    public void uploadObject(String key, byte[] content, String contentType) {
        Path target = resolve(key);
        try {
            Files.createDirectories(target.getParent());
            Files.write(target, content, StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);
        } catch (IOException e) {
            throw new UncheckedIOException("Failed to write file to local storage: " + key, e);
        }
    }

    @Override
    public StoredFile getObject(String key) {
        Path source = resolve(key);
        if (!Files.isRegularFile(source)) {
            throw new StorageObjectNotFoundException(key);
        }
        try {
            byte[] bytes = Files.readAllBytes(source);
            String contentType = Files.probeContentType(source);
            if (contentType == null) {
                contentType = URLConnection.guessContentTypeFromName(source.getFileName().toString());
            }
            return new StoredFile(bytes, contentType);
        } catch (IOException e) {
            throw new UncheckedIOException("Failed to read file from local storage: " + key, e);
        }
    }

    @Override
    public void deleteObject(String key) {
        try {
            Files.deleteIfExists(resolve(key));
        } catch (Exception ignored) {
            // Best-effort cleanup, mirrors the Node app's fire-and-forget delete.
        }
    }

    @Override
    public void checkBucketHealth() {
        if (!Files.isDirectory(rootDir) || !Files.isWritable(rootDir)) {
            throw new IllegalStateException("Local storage directory is not writable: " + rootDir);
        }
    }

    @Override
    public String keyFromUrl(String url) {
        return StorageKeys.fromUrl(url);
    }

    private Path resolve(String key) {
        Path resolved = rootDir.resolve(key).normalize();
        if (!resolved.startsWith(rootDir)) {
            throw new IllegalArgumentException("Invalid storage key: " + key);
        }
        return resolved;
    }
}
