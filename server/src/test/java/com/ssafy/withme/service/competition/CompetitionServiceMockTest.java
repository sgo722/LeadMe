package com.ssafy.withme.service.competition;

import com.ssafy.withme.repository.competition.CompetitionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.data.redis.core.RedisOperations;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.SessionCallback;
import org.springframework.data.redis.core.ValueOperations;

import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class CompetitionServiceMockTest {


    @Mock
    private RedisTemplate<String, String> redisTemplate;

    @Mock
    private ValueOperations<String, String> valueOperations;

    @Mock
    private RedisOperations<String, String> redisOperations;

    @InjectMocks
    private CompetitionService competitionService;

    private CompetitionRepository competitionRepository;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
    }

    @Test
    @DisplayName("redis 세션 카운트")
    void incrementIfLessThenTwo() {
        // given
        String sessionId = "testSession";
        String key = "session:" + sessionId + ":count";

        RedisOperations<String, String> redisOperations = mock(RedisOperations.class);
        ValueOperations<String, String> valueOps = mock(ValueOperations.class);

        // RedisTemplate 모킹
        when(redisTemplate.opsForValue()).thenReturn(valueOps);
        when(valueOps.get(key)).thenReturn("1");  // 현재 카운트가 1이라고 가정

        // RedisOperations 모킹
        when(redisOperations.opsForValue()).thenReturn(valueOps);
        when(valueOps.increment(key)).thenReturn(2L);  // increment 호출 시 2 반환

        when(redisOperations.exec()).thenReturn(Collections.singletonList(2L));  // 트랜잭션 성공

        doAnswer(invocation -> {
            SessionCallback<?> callback = invocation.getArgument(0);
            return callback.execute(redisOperations);
        }).when(redisTemplate).execute(any(SessionCallback.class));

        // when
        boolean result = competitionService.incrementIfLessThenTwo(sessionId);

        // then
        assertTrue(result);
        verify(redisOperations).watch(key);
        verify(redisOperations).multi();
        verify(redisOperations).exec();
        verify(valueOps).increment(key);
    }


}