package com.revolt.showroom.dto;

import java.util.List;
import java.util.UUID;

public record BulkActionRequest(List<UUID> ids, String action) {
}
