package com.ssafy.withme.global.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.withme.global.config.jwt.TokenProvider;
import com.ssafy.withme.global.config.oauth.OAuth2AuthorizationRequestBasedOnCookieRepository;
import com.ssafy.withme.global.config.oauth.OAuth2SuccessHandler;
import com.ssafy.withme.global.config.oauth.OAuth2UserCustomService;
import com.ssafy.withme.repository.user.RefreshTokenRepository;
import com.ssafy.withme.service.user.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.List;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@RequiredArgsConstructor
@Configuration
@Slf4j
public class WebOAuthSecurityConfig {

    private final OAuth2UserCustomService oAuth2UserCustomService;
    private final TokenProvider tokenProvider;
    private final RefreshTokenRepository refreshTokenRepository;
    private final UserService userService;
    private final ObjectMapper objectMapper;

    // 스프링 시큐리티 기능 비활성화
    @Bean
    public WebSecurityCustomizer configure() {
        return (web) -> web.ignoring()
                .requestMatchers("/img/**", "/css/**", "/js/**");

    }

    // 토큰 방식으로 인증을 하기 때문에 기존에 사용하던 폼 로그인, 세션 비활성화
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)
                .logout(AbstractHttpConfigurer::disable)
                .sessionManagement(mangement -> mangement.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                // 헤더를 확인할 커스텀 필터 추가
                .addFilterBefore(tokenAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class)

                .authorizeRequests(auth -> auth
                        // 토큰 재발급 url은 인증없이 접근 가능하도록 설정 permitAll()? denyAll()?
                        .requestMatchers(new AntPathRequestMatcher("/api/token/issue")).permitAll()
                        .requestMatchers(new AntPathRequestMatcher("/api/v1/user/info/**")).permitAll()
                        // /api/~ 권한 요규
                        .requestMatchers(new AntPathRequestMatcher("/api/**")).authenticated()
                        // 이외에는 모두 허가
                        .anyRequest().permitAll()
                )
                .csrf((csrf) -> csrf.disable())
                .httpBasic((httpBasic) -> httpBasic.disable())
                .formLogin((formLogin) -> formLogin.disable())

                // OAuth 로그인 후 쿠키 세팅 및 유저 레포지토리에 반영
                .oauth2Login(oauth2 -> oauth2
                        .loginPage("/login")
                        .authorizationEndpoint(authorizationEndpoint -> authorizationEndpoint.baseUri("/oauth2/authorization")
                                .authorizationRequestRepository(oAuth2AuthorizationRequestBasedOnCookieRepository()))
                        //.redirectionEndpoint(endpoint -> endpoint.baseUri("/*/oauth2/code/*"))
                        .userInfoEndpoint(userInfoEndPoint -> userInfoEndPoint.userService(oAuth2UserCustomService))
                        .successHandler(oAuth2SuccessHandler()) // 인증 성공 시 실행할 핸들러
                        .failureHandler(oAuth2FailureHandler()) // 인증 실패 시 실행할 핸들러

                )

//                .logout(logout -> logout
//                        .logoutSuccessUrl("/login")
//                )

                // /api로 시작하는 url인 경우 401 상태 코드를 반환하도록 예외 처리
                .exceptionHandling(exceptionHandling -> exceptionHandling
                        .defaultAuthenticationEntryPointFor(
                                new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED),
                                new AntPathRequestMatcher("/api/**")
                        ))
                .build();
    }

    // 실패 핸들링
    // exception message와 status code를 queryparam으로 전달
    private AuthenticationFailureHandler oAuth2FailureHandler() {
        return (request, response, exception) -> {
            String errorMessage = URLEncoder.encode("authorization_request_not_found", StandardCharsets.UTF_8);
            response.sendRedirect("/login?error=" + errorMessage + "&code=" + response.getStatus());
        };
    }

    @Bean
    public OAuth2SuccessHandler oAuth2SuccessHandler() {
        return new OAuth2SuccessHandler(tokenProvider,
                refreshTokenRepository,
                oAuth2AuthorizationRequestBasedOnCookieRepository(),
                userService,
                objectMapper
        );
    }

    @Bean
    public TokenAuthenticationFilter tokenAuthenticationFilter() {
        return new TokenAuthenticationFilter(tokenProvider);
    }

    @Bean
    public OAuth2AuthorizationRequestBasedOnCookieRepository oAuth2AuthorizationRequestBasedOnCookieRepository() {
        return new OAuth2AuthorizationRequestBasedOnCookieRepository();
    }
}
