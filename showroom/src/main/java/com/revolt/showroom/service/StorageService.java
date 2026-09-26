package com.revolt.showroom.service;

import com.revolt.showroom.config.GarageProperties;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.HexFormat;

@Service
public class StorageService {

    private static final SecureRandom RANDOM = new SecureRandom();

    private final S3Client s3Client;
    private final GarageProperties props;

    public StorageService(S3Client s3Client, GarageProperties props) {
        this.s3Client = s3Client;
        this.props = props;
    }

    public String generateKey(String originalName) {
        String ext = "";
        int dot = originalName == null ? -1 : originalName.lastIndexOf('.');
        if (dot != -1) ext = originalName.substring(dot).toLowerCase();

        byte[] randomBytes = new byte[6];
        RANDOM.nextBytes(randomBytes);
        return Instant.now().toEpochMilli() + "-" + HexFormat.of().formatHex(randomBytes) + ext;
    }

    public void uploadObject(String key, byte[] content, String contentType) {
        s3Client.putObject(
            PutObjectRequest.builder().bucket(props.getBucket()).key(key).contentType(contentType).build(),
            RequestBody.fromBytes(content)
        );
    }

    public ResponseInputStream<GetObjectResponse> getObject(String key) {
        return s3Client.getObject(GetObjectRequest.builder().bucket(props.getBucket()).key(key).build());
    }

    public void deleteObject(String key) {
        try {
            s3Client.deleteObject(DeleteObjectRequest.builder().bucket(props.getBucket()).key(key).build());
        } catch (Exception ignored) {
            // Best-effort cleanup, mirrors the Node app's fire-and-forget delete.
        }
    }

    public void checkBucketHealth() {
        s3Client.headBucket(HeadBucketRequest.builder().bucket(props.getBucket()).build());
    }

    /** Extracts the storage key from a full "/uploads/&lt;key&gt;" or absolute URL. */
    public String keyFromUrl(String url) {
        if (url == null) return null;
        String withoutQuery = url.split("\\?")[0];
        String marker = "/uploads/";
        int idx = withoutQuery.indexOf(marker);
        return idx == -1 ? null : withoutQuery.substring(idx + marker.length());
    }
}
