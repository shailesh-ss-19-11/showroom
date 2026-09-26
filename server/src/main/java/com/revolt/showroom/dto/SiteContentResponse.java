package com.revolt.showroom.dto;

import com.revolt.showroom.entity.SiteContent;

public record SiteContentResponse(
    String heroEyebrow,
    String heroHeadingLine1,
    String heroHeadingLine2,
    String heroHeadingLine3,
    String heroSubtext,
    String heroImageUrl,
    String stat1Value,
    String stat1Label,
    String stat2Value,
    String stat2Label,
    String stat3Value,
    String stat3Label
) {
    public static SiteContentResponse from(SiteContent content) {
        return new SiteContentResponse(
            content.getHeroEyebrow(),
            content.getHeroHeadingLine1(),
            content.getHeroHeadingLine2(),
            content.getHeroHeadingLine3(),
            content.getHeroSubtext(),
            content.getHeroImageUrl(),
            content.getStat1Value(),
            content.getStat1Label(),
            content.getStat2Value(),
            content.getStat2Label(),
            content.getStat3Value(),
            content.getStat3Label()
        );
    }
}
