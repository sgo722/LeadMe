package com.ssafy.withme.domain.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

/**
 * SuccessHandler에서 인증인가 정보 Response해주기 위한 DTO
 */
@Getter
public class AuthResponse {

    private String accessToken;

    private LocalDateTime accessTokenExpireTime;

    private String refreshToken;

    private LocalDateTime refreshTokenExpireTime;

    @Builder
    public AuthResponse(String accessToken, LocalDateTime accessTokenExpireTime, String refreshToken, LocalDateTime refreshTokenExpireTime) {
        this.accessToken = accessToken;
        this.accessTokenExpireTime = accessTokenExpireTime;
        this.refreshToken = refreshToken;
        this.refreshTokenExpireTime = refreshTokenExpireTime;
    }
}
