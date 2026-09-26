package com.revolt.showroom.dto;

import java.util.List;

public record BikeImportResult(int created, List<BikeImportRowError> errors) {
}
