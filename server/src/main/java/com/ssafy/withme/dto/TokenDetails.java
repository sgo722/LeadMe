package com.ssafy.withme.dto;

import java.time.LocalDateTime;

public record TokenDetails(String token, LocalDateTime expireTime) {
}
