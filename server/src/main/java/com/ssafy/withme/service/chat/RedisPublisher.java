package com.ssafy.withme.service.chat;

import com.ssafy.withme.dto.chat.MessageSubDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.listener.ChannelTopic;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
@Slf4j
public class RedisPublisher {
    private final ChannelTopic channelTopic;
    private final RedisTemplate<String, Object> redisTemplate;

    public void publish(MessageSubDto message, Long roomId) {

        log.info("RedisPublisher publishing to room {}: {}", roomId, message.getChatMessageDto().getMessage());

        log.info("topic : {} ", channelTopic.getTopic());
        redisTemplate.convertAndSend(channelTopic.getTopic(), message); // 해당 방으로 메시지 발행
    }
}
