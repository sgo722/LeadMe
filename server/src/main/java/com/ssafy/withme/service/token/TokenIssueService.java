package com.ssafy.withme.service.token;

import com.ssafy.withme.dto.AccessTokenResponseDto;
import com.ssafy.withme.dto.TokenDetails;
import com.ssafy.withme.global.config.jwt.TokenProvider;
import com.ssafy.withme.global.config.jwt.constant.TokenType;
import com.ssafy.withme.service.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
@RequiredArgsConstructor
public class TokenIssueService {

    private final TokenProvider tokenProvider;

    private final UserService userService;

    public AccessTokenResponseDto createAccessTokenByRefreshToken(String refreshToken) {

        Long findId = tokenProvider.getUserId(refreshToken);

        TokenDetails tokenDetails = tokenProvider.generateToken(userService.findById(findId), Duration.ofDays(1), TokenType.ACCESS);

        return AccessTokenResponseDto.builder()
                .accessToken(tokenDetails.token())
                .accessTokenExpireTime(tokenDetails.expireTime())
                .build();
    }
}
