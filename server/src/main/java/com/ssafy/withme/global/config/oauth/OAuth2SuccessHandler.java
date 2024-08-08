package com.ssafy.withme.global.config.oauth;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.withme.dto.oauth.CustomOAuth2User;
import com.ssafy.withme.domain.user.RefreshToken;
import com.ssafy.withme.domain.user.User;
import com.ssafy.withme.dto.token.TokenDetails;
import com.ssafy.withme.global.config.jwt.TokenProvider;
import com.ssafy.withme.global.config.jwt.constant.TokenType;
import com.ssafy.withme.global.util.CookieUtil;
import com.ssafy.withme.repository.user.RefreshTokenRepository;
import com.ssafy.withme.service.user.UserService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.time.Duration;
import java.time.LocalDateTime;

@RequiredArgsConstructor
@Component
@Slf4j
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    // 스프링 시큐리티에서 별도의 authenticationSuccessHandler를 지정하지 않으면
    // 로그인 성공 이후 SimpleUrlAuthenticationSuccessHandler 사용한다.

    public static final String REFRESH_TOKEN_COOKIE_NAME = "refresh_token";
    public static final Duration REFRESH_TOKEN_DURATION = Duration.ofDays(14);
    public static final Duration ACCESS_TOKEN_DURATION = Duration.ofHours(1);

    // 로그인 성공 시 리다이렉트 페이지
    public static final String REDIRECT_PATH = "https://i11c109.p.ssafy.io/home";

    private final TokenProvider tokenProvider;
    private final RefreshTokenRepository refreshTokenRepository;
    private final OAuth2AuthorizationRequestBasedOnCookieRepository authorizationRequestRepository;
    private final UserService userService;
    private final ObjectMapper objectMapper;

    // 성공적으로 로그인 하는 경우에 토큰과 관련된 작업을 추가로 처리하기 위해 오버라이드함
//    @Override
//    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, FilterChain chain, Authentication authentication) throws IOException, ServletException {
//        // 인증된 principal(주체)를 반환한다.
//        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
//        System.out.println("여기 확인하자");
//        System.out.println(oAuth2User);
//        String email = ((Map<String, String>) oAuth2User.getAttributes().get("kakao_account")).get("email");
//        User user = userService.findByEmail(email);
//    }

    // 일반적인 로직은 동일하게 사용하고, 토큰과 관련된 작업만 추가로 처리하기 위해 오버라이드함
    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {

        System.out.println(authentication);
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        log.info("oauth login user: {}", oAuth2User);
        log.info("oauth login user name: {}", oAuth2User.getName());
        log.info("oauth login user attributes: {}", oAuth2User.getAttributes());

        // *** 여기서 계속 틀렸음
        String email = ((CustomOAuth2User) oAuth2User).getUserDto().getEmail();
        System.out.println(email);

        User user = userService.findByEmail(email);

        // 1. 리프레시 토큰 생성 -> 저장 -> 쿠키에 저장
        TokenDetails refreshTokenDetails = tokenProvider.generateToken(user, REFRESH_TOKEN_DURATION, TokenType.REFRESH);
        String refreshToken = refreshTokenDetails.token();
        // 데이터 베이스에 유저아이디와 리프레시 토큰을 저장
        saveRefreshToken(user, refreshToken);
        // 클라이언트에서 액세스 토큰이 만료되면 재발급 요청하도록 쿠키에 리프레시 토큰을 저장
        addRefreshTokenToCookie(request, response, refreshToken);

        // 2. 액세스 토큰 생성 -> 패스에 액세스 토큰을 추가
        // 토큰 제공자를 사용해 액세스 토큰을 만든 뒤
        TokenDetails accessTokenDetails = tokenProvider.generateToken(user, ACCESS_TOKEN_DURATION, TokenType.ACCESS);
        String accessToken = accessTokenDetails.token();

        // 쿠키에서 리다이렉트 경로가 담긴 값을 가져와 쿼리파라미터에 액세스 토큰을 추가함
        String targetUrl = getTargetUrl(
                accessToken,
                accessTokenDetails.expireTime(),
                refreshToken,
                refreshTokenDetails.expireTime()
        );

        // 인증 관련 설정값, 쿠키 제거
        clearAuthenticationAttributes(request, response);

//         리다이렉트 ( 2에서 만든 URL로 리다이렉트합니다)
        log.info("targetUrl: {}" + targetUrl);
        log.info("accessToken: {}" + accessToken);
        log.info("authentication: {}" + authentication);

        SecurityContextHolder.getContext().setAuthentication(authentication);

        getRedirectStrategy().sendRedirect(request, response, targetUrl);
//
//        log.info("response: {}", responseTokenDto);
//
//        response.setStatus(HttpStatus.OK.value());
//        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
//        response.getWriter().write(objectMapper.writeValueAsString(responseTokenDto));
    }

    // 생성된 리프레시 토큰을 전달받아 데이터베이스에 저장
    private void saveRefreshToken(User user, String newRefreshToken) {

        RefreshToken refreshToken = refreshTokenRepository.findByUserId(user.getId())
                .map(entity -> entity.update(newRefreshToken))
                .orElse(new RefreshToken(user, newRefreshToken));

        refreshTokenRepository.save(refreshToken);

    }

    // 생성된 리프레시 토큰을 쿠키에 저장
    private void addRefreshTokenToCookie(HttpServletRequest request, HttpServletResponse response, String refreshToken) {
        int cookieMaxAge = (int) REFRESH_TOKEN_DURATION.toSeconds();

        CookieUtil.deleteCookie(request, response, REFRESH_TOKEN_COOKIE_NAME);
        CookieUtil.addCookie(response, REFRESH_TOKEN_COOKIE_NAME, refreshToken, cookieMaxAge);
    }

    // 인증 관련 설정값, 쿠키 제거
    private void clearAuthenticationAttributes(HttpServletRequest request, HttpServletResponse response) {
        super.clearAuthenticationAttributes(request);
        // Oauth 인증을 위해 저장된 정보도 삭제
//        authorizationRequestRepository.removeAuthorizationRequestCookies(request, response);
    }

    // 액세스 토큰을 패스에 추가
    private String getTargetUrl(String accessToken, LocalDateTime accessTokenExpireTime, String refreshToken, LocalDateTime refreshTokenExpireTime) {
        return UriComponentsBuilder.fromUriString(REDIRECT_PATH)
                .queryParam("accessToken", accessToken)
                .queryParam("accessTokenExpireTime", accessTokenExpireTime)
                .queryParam("refreshToken", refreshToken)
                .queryParam("refreshTokenExpireTime", refreshTokenExpireTime)
                .build()
                .toUriString();
    }
}
