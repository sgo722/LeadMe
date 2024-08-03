package com.ssafy.withme.global.config;

import com.ssafy.withme.global.config.jwt.TokenProvider;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

// OncePerRequestFilter 한 요청에 대해서 한번만 진행하는 필터
@Slf4j
@RequiredArgsConstructor
public class TokenAuthenticationFilter extends OncePerRequestFilter {

    private final TokenProvider tokenProvider;
    // 헤더 인가
    private final static String HEADER_AUTHORIZATION = "Authorization";
    // 토큰의 앞 부분은 Bearer ~~~ 식이다.
    private final static String TOKEN_PREFIX = "Bearer ";

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        // 요청 헤더의 AuthorizationHeader 키의 값 조회
        String authorizationHeader = request.getHeader(HEADER_AUTHORIZATION);
        // 가져온 값에서 Bearer 접두사 제거
        String token = getAccessToken(authorizationHeader);

        log.info("token dto: {}", token);

        // 가져온 토큰이 유효한지 확인
        if(tokenProvider.validToken(token)) {
            // 유효한 경우에는 토큰 공급자를 통해서 인증 정보를 가져온다.
            Authentication authentication = tokenProvider.getAuthentication(token);
            // 인증 정보를 스프링시큐리티에 넣는다.
            SecurityContextHolder.getContext().setAuthentication(authentication);

            log.info("authenticated user: {}", authentication.getPrincipal());
        }
    }

    public String getAccessToken(String authorzationHeader) {
        // 토큰의 접두사를 제거하고 값을 돌려준다.
        if(authorzationHeader != null && authorzationHeader.startsWith(TOKEN_PREFIX)) {
            return authorzationHeader.substring(TOKEN_PREFIX.length());
        }
        return null;
    }
}
