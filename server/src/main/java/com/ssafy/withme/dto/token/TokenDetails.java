package com.ssafy.withme.dto.token;

import java.time.LocalDateTime;

public record TokenDetails(String token, LocalDateTime expireTime) {
}
