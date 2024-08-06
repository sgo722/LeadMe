package com.ssafy.withme.repository.chat;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.withme.dto.chat.ChatMessageDto;
import com.ssafy.withme.dto.chat.response.ChatRoomGetResponse;
import com.ssafy.withme.global.error.ErrorCode;
import com.ssafy.withme.global.exception.BusinessException;
import jakarta.annotation.Resource;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.HashOperations;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;

/**
 * Redis 관련 메소드
 */
@Repository
@RequiredArgsConstructor
@Slf4j
public class ChatRoomRedisRepository {

    private static final String CHAT_ROOM_KEY = "_CHAT_ROOM_RESPONSE_LIST";
    private static final String CHAT_ROOM = "CHAT_ROOM_LAST_MSG"; // 채팅방 마지막 메시지
    private final RedisTemplate<String, Object> redisTemplate;
    private final ObjectMapper objectMapper;

    @Resource(name = "redisTemplate")
    private HashOperations<String, String, String> opsHashChatRoom;

    @Resource(name = "redisTemplate")
    private HashOperations<String, String, String> opsHashLastChatMessage;

    private String getChatRoomKey(Long userId) {
        return userId + CHAT_ROOM_KEY;
    }

    public boolean existChatRoomList(Long userId) {
        return redisTemplate.hasKey(getChatRoomKey(userId));
    }

    public void initChatRoomList(Long userId, List<ChatRoomGetResponse> list) {
        if (redisTemplate.hasKey(getChatRoomKey(userId))) { // 같은 키로 되어있는 방이 있으면
            redisTemplate.delete(getChatRoomKey(userId)); // 없애고
        }

        opsHashChatRoom = redisTemplate.opsForHash(); // 빈 방 생성
        for (ChatRoomGetResponse chatRoomListGetRes : list) {
            // 빈 방을 리스트에 박아줌
            setChatRoom(userId, chatRoomListGetRes.getRoomId(), chatRoomListGetRes);
        }
    }

    public void setChatRoom(Long userId, Long roomId, ChatRoomGetResponse response) {

        String toJson = null;

        try {
            toJson = objectMapper.writeValueAsString(response);
        } catch (JsonProcessingException e) {
            throw new BusinessException(ErrorCode.FAILED_TO_CONVERT_TYPE);
        }

        opsHashChatRoom.put(getChatRoomKey(userId), String.valueOf(roomId), toJson);
    }

    public boolean existChatRoom(Long userId, Long roomId) {
        return opsHashChatRoom.hasKey(getChatRoomKey(userId), String.valueOf(roomId));
    }

    public void deleteChatRoom(Long userId, Long roomId) {
        opsHashChatRoom.delete(getChatRoomKey(userId), String.valueOf(roomId));
    }

    public ChatRoomGetResponse getChatRoom(Long userId, Long roomId) {

        String json = opsHashChatRoom.get(getChatRoomKey(userId), String.valueOf(roomId));

        if (json == null) {
            return null;
        }

        try {
            return objectMapper.readValue(json, ChatRoomGetResponse.class);
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }

    public List<ChatRoomGetResponse> getChatRoomList(Long userId) {

        List<String> jsonList = opsHashChatRoom.values(getChatRoomKey(userId));

        for (String json : jsonList) {
            log.info("#####get chat room list json: {}", json);
        }

        List<ChatRoomGetResponse> chatRoomResponses = new ArrayList<>();
        for (String json : jsonList) {
            try {
                ChatRoomGetResponse response = objectMapper.readValue(json, ChatRoomGetResponse.class);
                chatRoomResponses.add(response);
            } catch (JsonProcessingException e) {
                throw new RuntimeException("Failed to parse JSON: " + json, e);
            }
        }

        return chatRoomResponses;
    }


    public void setLastChatMessage(Long roomId, ChatMessageDto chatMessageDto) {

        String toJson = null;
        try {
            toJson = objectMapper.writeValueAsString(chatMessageDto);
        } catch (JsonProcessingException e) {
            throw new BusinessException(ErrorCode.FAILED_TO_CONVERT_TYPE);
        }

        log.info("Set last chat message: {}", toJson);
        log.info("roomId: {}", roomId);
        opsHashLastChatMessage.put(CHAT_ROOM, String.valueOf(roomId), toJson);
    }

    public ChatMessageDto getLastMessage(Long roomId) {

        String json = opsHashLastChatMessage.get(CHAT_ROOM, String.valueOf(roomId));

        if (json == null) {
            return null;
        }

        try {
            return objectMapper.readValue(json, ChatMessageDto.class);
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }


    /******************** 밑에 코드 사용 안하지만 일단 냅둠 ***************************/

//    public static final String USER_COUNT = "USER_COUNT"; // 채팅룸에 입장한 클라이언트수 저장
//    public static final String ENTER_INFO = "ENTER_INFO";
//
//    @Resource(name = "redisTemplate")
//    private HashOperations<String, String, String> hashOpsEnterInfo;
//
//    @Resource(name = "redisTemplate")
//    private ValueOperations<String, String> valueOps;
//
//    @Resource(name = "redisTemplate")
//    private ValueOperations<String, String> userInfoOps;
//
//    // 세션 id와 유저 정보 가져오기.
//    public String getUserInfoBySessionId(String sessionId) {
//        return userInfoOps.get(sessionId);
//    }
//
//    // 퇴장 시 세션 id 값 삭제
//    public void deleteUserInfo(String sessionId) {
//        userInfoOps.getAndDelete(sessionId);
//    }
//
//    // 유저가 입장한 채팅방 ID와 유저 세션 ID 맵핑 정보 저장
//    public void setUserEnterInfo(String sessionId, String roomId) {
//        hashOpsEnterInfo.put(ENTER_INFO, sessionId, roomId);
//    }
//
//    // 유저 세션으로 입장해 있는 채팅방 ID 조회
//    public String getUserEnterRoomId(String sessionId) {
//        return hashOpsEnterInfo.get(ENTER_INFO, sessionId);
//    }
//
//    // 유저 세션정보와 맵핑된 채팅방 ID 삭제
//    public void removeUserEnterInfo(String sessionId) {
//        hashOpsEnterInfo.delete(ENTER_INFO, sessionId);
//    }
//
//    // 채팅방 유저수 조회
//    public long getUserCount(String roomId) {
//        return Long.valueOf(Optional.ofNullable(valueOps.get(USER_COUNT + "_" + roomId)).orElse("0"));
//    }
//
//    // 채팅방에 입장한 유저수 +1
//    public long plusUserCount(String roomId) {
//        return Optional.ofNullable(valueOps.increment(USER_COUNT + "_" + roomId)).orElse(0L);
//    }
//
//    // 채팅방에 입장한 유저수 -1
//    public long minusUserCount(String roomId) {
//        return Optional.ofNullable(valueOps.decrement(USER_COUNT + "_" + roomId)).filter(count -> count > 0).orElse(0L);
//    }


}
