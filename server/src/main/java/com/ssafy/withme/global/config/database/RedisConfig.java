package com.ssafy.withme.global.config.database;

import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.jsontype.BasicPolymorphicTypeValidator;
import com.fasterxml.jackson.databind.jsontype.PolymorphicTypeValidator;
import com.fasterxml.jackson.databind.module.SimpleModule;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import com.ssafy.withme.service.chat.RedisSubscriber;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.RedisStandaloneConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.listener.ChannelTopic;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;
import org.springframework.data.redis.listener.adapter.MessageListenerAdapter;
import org.springframework.data.redis.repository.configuration.EnableRedisRepositories;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;

@Configuration
@EnableRedisRepositories
public class RedisConfig {

    @Value("${spring.data.redis.host}")
    private String redisHost;

    @Value("${spring.data.redis.port}")
    private int redisPort;

    @Value("${spring.data.redis.password}")
    private String redisPassword;

    @Bean
    public ChannelTopic channelTopic() {
        return new ChannelTopic("chatroom");
    }

    @Bean
    public LettuceConnectionFactory redisConnectionFactory() {
        RedisStandaloneConfiguration redisStandaloneConfiguration = new RedisStandaloneConfiguration();
        redisStandaloneConfiguration.setHostName(redisHost); // Redis 서버 호스트명
        redisStandaloneConfiguration.setPort(redisPort); // Redis 서버 포트
        redisStandaloneConfiguration.setPassword(redisPassword); // Redis 서버 비밀번호

        return new LettuceConnectionFactory(redisStandaloneConfiguration);
    }

    @Bean
    public RedisMessageListenerContainer redisMessageListener (
            MessageListenerAdapter listenerAdapterChatMessage,
            ChannelTopic channelTopic
    ) {
        RedisMessageListenerContainer container = new RedisMessageListenerContainer();
        container.setConnectionFactory(redisConnectionFactory());
        container.addMessageListener(listenerAdapterChatMessage, channelTopic);
        return container;
    }

    @Bean
    public MessageListenerAdapter listenerAdapterChatMessage(RedisSubscriber subscriber) {
        return new MessageListenerAdapter(subscriber, "sendMessage");
    }

//    @Bean
//    public RedisMessageListenerContainer redisMessageListenerRoomList (
//            MessageListenerAdapter listenerAdapterChatRoomList,
//            ChannelTopic channelTopic
//    ) {
//        RedisMessageListenerContainer container = new RedisMessageListenerContainer();
//        container.setConnectionFactory(redisConnectionFactory());
//        container.addMessageListener(listenerAdapterChatRoomList, channelTopic);
//        return container;
//    }

//    @Bean
//    public MessageListenerAdapter listenerAdapterChatRoomList(RedisSubscriber subscriber) {
//        return new MessageListenerAdapter(subscriber, "sendRoomList");
//    }

    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory connectionFactory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);

//         ObjectMapper에 DefaultTyping 설정
        ObjectMapper objectMapper = new ObjectMapper();

        objectMapper.activateDefaultTyping(
                BasicPolymorphicTypeValidator.builder()
                        .allowIfBaseType(Object.class)
                        .build(),
                ObjectMapper.DefaultTyping.NON_FINAL,
                JsonTypeInfo.As.PROPERTY);

        GenericJackson2JsonRedisSerializer serializer = new GenericJackson2JsonRedisSerializer(objectMapper);
        template.setDefaultSerializer(serializer);

//        // 일반적인 key : value의 경우 직렬화
        template.setKeySerializer(new StringRedisSerializer());
        template.setValueSerializer(serializer);
//
//        // Hash를 사용할 경우 직렬화
        template.setHashKeySerializer(new StringRedisSerializer());
        template.setHashValueSerializer(serializer);

        return template;
    }
}
