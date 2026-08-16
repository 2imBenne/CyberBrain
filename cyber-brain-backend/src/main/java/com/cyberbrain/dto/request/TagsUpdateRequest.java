package com.cyberbrain.dto.request;

import java.util.List;

public record TagsUpdateRequest(List<Long> tagIds) {
}
