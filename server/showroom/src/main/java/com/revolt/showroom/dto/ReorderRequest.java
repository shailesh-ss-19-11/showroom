package com.revolt.showroom.dto;

import java.util.List;
import java.util.UUID;

public record ReorderRequest(List<UUID> order) {
}
