package com.ssafy.withme.repository.chat;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.withme.dto.chat.ChatMessageDto;
import com.ssafy.withme.dto.chat.ChatRoomGetResponse;
import jakarta.annotation.Resource;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.HashOperations;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Repository;

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
    private HashOperations<String, String, ChatRoomGetResponse> opsHashChatRoom;

    @Resource(name = "redisTemplate")
    private HashOperations<String, String, ChatMessageDto> opsHashLastChatMessage;

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
            setChatRoom(userId, chatRoomListGetRes.getChatRoomNumber(), chatRoomListGetRes);
        }
    }

    public void setChatRoom(Long userId, String roomId, ChatRoomGetResponse response) {
        opsHashChatRoom.put(getChatRoomKey(userId), roomId, response);
    }

    public boolean existChatRoom(Long userId, String roomId) {
        return opsHashChatRoom.hasKey(getChatRoomKey(userId), roomId);
    }

    public void deleteChatRoom(Long userId, String roomId) {
        opsHashChatRoom.delete(getChatRoomKey(userId), roomId);
    }

    public ChatRoomGetResponse getChatRoom(Long userId, String roomId) {
        return objectMapper.convertValue(opsHashChatRoom.get(getChatRoomKey(userId), roomId), ChatRoomGetResponse.class);
    }

    public List<ChatRoomGetResponse> getChatRoomList(Long userId) {
        return objectMapper.convertValue(opsHashChatRoom.values(getChatRoomKey(userId)), new TypeReference<>() {});
    }


    public void setLastChatMessage(String roomId, ChatMessageDto chatMessageDto) {
        log.info("Set last chat message: {}", chatMessageDto);
        log.info("roomId: {}", roomId);
        opsHashLastChatMessage.put(CHAT_ROOM, roomId, chatMessageDto);
    }

    public ChatMessageDto getLastMessage(String roomId) {
        return objectMapper.convertValue(opsHashLastChatMessage.get(CHAT_ROOM, roomId), ChatMessageDto.class);
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
