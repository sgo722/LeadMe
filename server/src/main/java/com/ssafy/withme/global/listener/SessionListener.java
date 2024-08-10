package com.ssafy.withme.global.listener;

import jakarta.servlet.http.HttpSessionEvent;
import jakarta.servlet.http.HttpSessionListener;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class SessionListener implements HttpSessionListener {

    private final RedisTemplate<String, Object> redisTemplate;

    private static final String ACTIVATE_KEY = "active_user";

    @Override
    public void sessionCreated(HttpSessionEvent httpSessionEvent) {

        String sessionId = httpSessionEvent.getSession().getId();

        log.info("session increment: {}", sessionId);

        redisTemplate.opsForSet().add(ACTIVATE_KEY, sessionId);
    }

    @Override
    public void sessionDestroyed(HttpSessionEvent httpSessionEvent) {

        String sessionId = httpSessionEvent.getSession().getId();

        log.info("session destroyed: {}", sessionId);

        redisTemplate.opsForSet().remove(ACTIVATE_KEY, sessionId);
    }

    public Long getActiveUserCount() {

        return redisTemplate.opsForSet().size(ACTIVATE_KEY);
    }
}
