package com.revolt.showroom.service;

import com.revolt.showroom.config.GarageProperties;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

import java.io.IOException;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.HexFormat;

@Service
@ConditionalOnProperty(name = "app.storage.type", havingValue = "garage")
public class GarageStorageService implements StorageService {

    private static final SecureRandom RANDOM = new SecureRandom();

    private final S3Client s3Client;
    private final GarageProperties props;

    public GarageStorageService(S3Client s3Client, GarageProperties props) {
        this.s3Client = s3Client;
        this.props = props;
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
        s3Client.putObject(
            PutObjectRequest.builder().bucket(props.getBucket()).key(key).contentType(contentType).build(),
            RequestBody.fromBytes(content)
        );
    }

    @Override
    public StoredFile getObject(String key) {
        try {
            var object = s3Client.getObject(GetObjectRequest.builder().bucket(props.getBucket()).key(key).build());
            byte[] bytes = object.readAllBytes();
            return new StoredFile(bytes, object.response().contentType());
        } catch (NoSuchKeyException e) {
            throw new StorageObjectNotFoundException(key);
        } catch (IOException e) {
            throw new RuntimeException("Failed to read object from storage", e);
        }
    }

    @Override
    public void deleteObject(String key) {
        try {
            s3Client.deleteObject(DeleteObjectRequest.builder().bucket(props.getBucket()).key(key).build());
        } catch (Exception ignored) {
            // Best-effort cleanup, mirrors the Node app's fire-and-forget delete.
        }
    }

    @Override
    public void checkBucketHealth() {
        s3Client.headBucket(HeadBucketRequest.builder().bucket(props.getBucket()).build());
    }

    @Override
    public String keyFromUrl(String url) {
        return StorageKeys.fromUrl(url);
    }
}
