package com.revolt.showroom.dto;

public record SiteContentRequest(
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
}
