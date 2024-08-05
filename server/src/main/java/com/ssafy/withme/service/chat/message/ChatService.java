package com.ssafy.withme.service.chat.message;

import com.ssafy.withme.domain.chat.constant.MessageType;
import com.ssafy.withme.dto.chat.ChatMessageDto;
import com.ssafy.withme.dto.chat.ChatRoomGetResponse;
import com.ssafy.withme.dto.chat.MessageSubDto;
import com.ssafy.withme.repository.chat.ChatRoomRedisRepository;
import com.ssafy.withme.service.chat.RedisPublisher;
import com.ssafy.withme.service.chat.chatroom.ChatRoomService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@RequiredArgsConstructor
@Transactional(readOnly = true)
@Service
@Slf4j
public class ChatService {

    private final RedisPublisher redisPublisher;
    private final ChatRoomRedisRepository chatRoomRedisRepository;
    private final ChatRoomService chatRoomService;

    /**
     * 채팅방에 메시지 발송
     */
    @Transactional
    public void sendChatMessage(ChatMessageDto chatMessage, Long roomId) {

        log.info("############################");
        log.info("#####debug send chat message: {}", chatMessage.getStatus());
        log.info("############################");

        // 0. redis에 해당 채팅방 roomId(key)에 마지막 메시지(value)를 넣어준다.
        chatRoomRedisRepository.setLastChatMessage(chatMessage.getRoomId(), chatMessage);

        Long userId = chatMessage.getUserId();
        Long partnerId;

        log.info("userId : {}", userId);

        // 1. 채팅방이 삭제되는 것이라면 delete를 해준다.
        if (chatMessage.getType().equals(MessageType.DELETE)) {
            chatRoomService.deleteChatRoom(chatMessage.getRoomId(), userId);
        }
        // 2. 채팅방 리스트에 새로운 채팅방 정보가 없다면, 넣어준다. 마지막 메시지도 같이 담는다. 상대방 redis에도 업데이트 해준다.
        ChatRoomGetResponse newChatRoom = null;
        if (chatRoomRedisRepository.existChatRoom(userId, chatMessage.getRoomId())) {
            newChatRoom = chatRoomRedisRepository.getChatRoom(userId, chatMessage.getRoomId());
        } else {
            newChatRoom = chatRoomService.getChatRoomInfo(userId, chatMessage.getRoomId());
        }

        partnerId = getPartnerId(chatMessage, newChatRoom);

        log.info("newChatRoom : {}", newChatRoom);
        log.info("partnerId : {}", partnerId);

        setNewChatRoomInfo(chatMessage, newChatRoom);

        // 3. 마지막 메시지들이 담긴 채팅방 리스트들을 가져온다.
        // 4. 파트너 채팅방 리스트도 가져온다. (파트너는 userId로 가져옴)
        List<ChatRoomGetResponse> chatRoomList = chatRoomService.getChatRoomList(userId);
        List<ChatRoomGetResponse> partnerChatRoomList = getChatRoomListByPartnerId(partnerId);

        // 5. 마지막 메시지 기준으로 정렬 채팅방 리스트 정렬
        chatRoomList = chatRoomService.sortChatRoomListLatest(chatRoomList);
        partnerChatRoomList = chatRoomService.sortChatRoomListLatest(partnerChatRoomList);

        MessageSubDto messageSubDto = MessageSubDto.builder()
                .userId(userId)
                .partnerId(partnerId)
                .roomId(roomId)
                .chatMessageDto(chatMessage)
                .list(chatRoomList)
                .partnerList(partnerChatRoomList)
                .build();

        log.info("messageSubDto : {}", messageSubDto);
        redisPublisher.publish(messageSubDto, roomId);

    }

    private Long getPartnerId(ChatMessageDto chatMessageDto, ChatRoomGetResponse my) {
        if (my.getPartnerId() == chatMessageDto.getUserId()) {
            return my.getUserId();
        }
        return my.getPartnerId();
    }

    /**
     * redis에 채팅방 정보가 없는 경우 새로 저장
     * @param chatMessage
     */
    private void setNewChatRoomInfo(ChatMessageDto chatMessage, ChatRoomGetResponse newChatRoom) {
        newChatRoom.updateChatMessageDto(chatMessage);
    }

    // redis에서 채팅방 리스트 불러오는 로직
    private List<ChatRoomGetResponse> getChatRoomListByPartnerId(Long userId) {
        List<ChatRoomGetResponse> chatRoomListGetResponseList = new ArrayList<>();

        if (chatRoomRedisRepository.existChatRoomList(userId)) {
            chatRoomListGetResponseList = chatRoomRedisRepository.getChatRoomList(userId);
            for (ChatRoomGetResponse chatRoomListGetResponse : chatRoomListGetResponseList) {
                chatRoomService.setListChatLastMessage(chatRoomListGetResponse);
            }
        }

        return chatRoomListGetResponseList;
    }
}
