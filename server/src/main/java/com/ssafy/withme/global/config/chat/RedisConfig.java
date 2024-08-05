package com.ssafy.withme.global.config.chat;

import com.fasterxml.jackson.databind.ObjectMapper;
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
import org.springframework.data.redis.serializer.GenericToStringSerializer;
import org.springframework.data.redis.serializer.Jackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;

@Configuration
@EnableRedisRepositories
public class RedisConfig {

    // yml 파일 redis 설정 불러오기
//    private final RedisProperties redisProperties;

    @Value("${spring.data.redis.host}")
    private String redisHost;

    @Value("${spring.data.redis.port}")
    private int redisPort;

    @Value("${spring.data.redis.password}")
    private String redisPassword;

    // 단일 Topic 사용을 위한 Bean 설정
    @Bean
    public ChannelTopic channelTopic() {
        return new ChannelTopic("chatroom");
    }

//    @Bean
//    public JedisConnectionFactory jedisConnectionFactory() {
//        RedisStandaloneConfiguration redisStandaloneConfiguration = new RedisStandaloneConfiguration("localhost", 6379);
//        redisStandaloneConfiguration.setPassword(RedisPassword.of("yourRedisPasswordIfAny"));
//        return new JedisConnectionFactory(redisStandaloneConfiguration);
//    }

    // deprecated 됐다고해서 위에 방법 사용 추천
//    @Bean
//    public RedisConnectionFactory redisConnectionFactory() {
//
//        LettuceConnectionFactory lettuceConnectionFactory = new LettuceConnectionFactory();
//
//        lettuceConnectionFactory.setHostName(redisHost);
//        lettuceConnectionFactory.setPort(Integer.parseInt(redisPort));
//        lettuceConnectionFactory.setPassword(redisPassword);
//
//        return lettuceConnectionFactory;
//    }

    @Bean
    public LettuceConnectionFactory redisConnectionFactory() {

        RedisStandaloneConfiguration redisStandaloneConfiguration = new RedisStandaloneConfiguration();
        redisStandaloneConfiguration.setHostName(redisHost); // Redis 서버 호스트명
        redisStandaloneConfiguration.setPort(redisPort); // Redis 서버 포트
        redisStandaloneConfiguration.setPassword(redisPassword); // Redis 서버 비밀번호

        return new LettuceConnectionFactory(redisStandaloneConfiguration);
    }

    /**
     * redis에 발행(publish)된 메시지 처리를 위한 리스너 설정
     * @return RedisMessageListenerContainer
     */
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

    // 실제 메시지를 처리하는 subscriber 설정 추가
    @Bean
    public MessageListenerAdapter listenerAdapterChatMessage(RedisSubscriber subscriber) {
        return new MessageListenerAdapter(subscriber, "sendMessage");
    }


    @Bean
    public RedisMessageListenerContainer redisMessageListenerRoomList (
            MessageListenerAdapter listenerAdapterChatRoomList,
            ChannelTopic channelTopic
    ) {
        RedisMessageListenerContainer container = new RedisMessageListenerContainer();
        container.setConnectionFactory(redisConnectionFactory());
        container.addMessageListener(listenerAdapterChatRoomList, channelTopic);
        return container;
    }

    // 실제 메시지 방을 처리하는 subscriber 설정 추가
    @Bean
    public MessageListenerAdapter listenerAdapterChatRoomList(RedisSubscriber subscriber) {
        return new MessageListenerAdapter(subscriber, "sendRoomList");
    }


    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory connectionFactory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);

        // 일반적인 key : value의 경우 직렬화
        template.setKeySerializer(new StringRedisSerializer());
//        template.setValueSerializer(new GenericJackson2JsonRedisSerializer());
        template.setValueSerializer(new GenericToStringSerializer<>(Object.class));

        // Has를 사용할 경우 직렬화
        template.setHashKeySerializer(new StringRedisSerializer());
        template.setHashValueSerializer(new StringRedisSerializer());

        // 모든 경우
        template.setDefaultSerializer(new StringRedisSerializer());

        return template;
    }

}
