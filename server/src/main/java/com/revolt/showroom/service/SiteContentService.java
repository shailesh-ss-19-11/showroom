package com.revolt.showroom.service;

import com.revolt.showroom.dto.SiteContentRequest;
import com.revolt.showroom.dto.SiteContentResponse;
import com.revolt.showroom.entity.SiteContent;
import com.revolt.showroom.repository.SiteContentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SiteContentService {

    private final SiteContentRepository repository;

    public SiteContentService(SiteContentRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public SiteContentResponse get() {
        return SiteContentResponse.from(getOrCreate());
    }

    @Transactional
    public SiteContentResponse update(SiteContentRequest request) {
        SiteContent content = getOrCreate();
        content.setHeroEyebrow(request.heroEyebrow());
        content.setHeroHeadingLine1(request.heroHeadingLine1());
        content.setHeroHeadingLine2(request.heroHeadingLine2());
        content.setHeroHeadingLine3(request.heroHeadingLine3());
        content.setHeroSubtext(request.heroSubtext());
        content.setHeroImageUrl(request.heroImageUrl());
        content.setStat1Value(request.stat1Value());
        content.setStat1Label(request.stat1Label());
        content.setStat2Value(request.stat2Value());
        content.setStat2Label(request.stat2Label());
        content.setStat3Value(request.stat3Value());
        content.setStat3Label(request.stat3Label());
        return SiteContentResponse.from(repository.save(content));
    }

    private SiteContent getOrCreate() {
        return repository.findAll().stream().findFirst().orElseGet(() -> {
            SiteContent content = new SiteContent();
            content.setHeroEyebrow("Every Brand. One Showroom.");
            content.setHeroHeadingLine1("Ride");
            content.setHeroHeadingLine2("Beyond");
            content.setHeroHeadingLine3("Ordinary");
            content.setHeroSubtext(
                "Browse, compare, and book test rides across sport bikes, cruisers, commuters, scooters, and EVs — all under one roof."
            );
            content.setStat1Value("15+");
            content.setStat1Label("Brands Available");
            content.setStat2Value("1000+");
            content.setStat2Label("Happy Riders");
            content.setStat3Value("24/7");
            content.setStat3Label("WhatsApp Support");
            return repository.save(content);
        });
    }
}
