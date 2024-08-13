package com.ssafy.withme.global.config;

import com.ssafy.withme.global.interceptor.AdminAuthorizationInterceptor;
import com.ssafy.withme.global.interceptor.AuthenticationInterceptor;
import com.ssafy.withme.global.resolver.CurrentUserArgumentResolver;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.List;

@Configuration
@ComponentScan("com.ssafy.withme")
@RequiredArgsConstructor
public class WebConfig implements WebMvcConfigurer {

    private final AuthenticationInterceptor authenticationInterceptor;

    private final AdminAuthorizationInterceptor adminAuthorizationInterceptor;

    private final CurrentUserArgumentResolver currentUserArgumentResolver;

    @Override
    public void addCorsMappings(CorsRegistry registry) {

        registry
                .addMapping("/**")
//                .allowedOrigins(
//                        "http://localhost:8080",
//                        "http://localhost:5173",
//                        "https://i11c109.p.ssafy.io",
//                        "https://*.ngrok.io"
//                )
                .allowedOrigins("*")
                .allowCredentials(false)
                .allowedHeaders("*")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
                .maxAge(3600);
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {

        registry.addInterceptor(authenticationInterceptor)
                .addPathPatterns("/leadme/**")
                .excludePathPatterns("/leadme/user/**")
                .order(1);

        registry.addInterceptor(adminAuthorizationInterceptor)
                .addPathPatterns("/admin/**")
                .order(2);
    }

    @Override
    public void addArgumentResolvers(List<HandlerMethodArgumentResolver> resolvers) {

        resolvers.add(currentUserArgumentResolver);
    }
}
