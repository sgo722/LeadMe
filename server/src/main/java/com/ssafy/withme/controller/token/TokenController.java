package com.ssafy.withme.controller.token;

import com.ssafy.withme.dto.AccessTokenResponseDto;
import com.ssafy.withme.global.config.jwt.TokenProvider;
import com.ssafy.withme.global.response.SuccessResponse;
import com.ssafy.withme.service.token.TokenIssueService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/token")
@RequiredArgsConstructor
public class TokenController {

    private final TokenIssueService tokenIssueService;

    @PostMapping("/issue")
    public SuccessResponse<AccessTokenResponseDto> issueAccessToken(HttpServletRequest request){

        String authorization = request.getHeader("Authorization");

        String refreshToken = authorization.split(" ")[1];

        AccessTokenResponseDto accessTokenByRefreshToken = tokenIssueService.createAccessTokenByRefreshToken(refreshToken);

        return new SuccessResponse<>(accessTokenByRefreshToken);
    }
}
