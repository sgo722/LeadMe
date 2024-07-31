package com.ssafy.withme.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class AccessTokenResponseDto {

    private String accessToken;

    private LocalDateTime accessTokenExpireTime;

    @Builder
    public AccessTokenResponseDto(String accessToken, LocalDateTime accessTokenExpireTime) {
        this.accessToken = accessToken;
        this.accessTokenExpireTime = accessTokenExpireTime;
    }
}
