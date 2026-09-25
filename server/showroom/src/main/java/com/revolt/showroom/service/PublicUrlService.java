package com.revolt.showroom.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class PublicUrlService {

    private final String publicUrl;

    public PublicUrlService(@Value("${app.public-url}") String publicUrl) {
        this.publicUrl = publicUrl.replaceAll("/$", "");
    }

    public String buildFileUrl(String key) {
        return publicUrl + "/uploads/" + key;
    }
}
