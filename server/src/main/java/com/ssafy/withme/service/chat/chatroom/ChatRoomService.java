package com.ssafy.withme.service.chat.chatroom;

import com.ssafy.withme.domain.chat.ChatMessage;
import com.ssafy.withme.domain.chat.ChatRoom;
import com.ssafy.withme.domain.user.User;
import com.ssafy.withme.dto.chat.ChatMessageDto;
import com.ssafy.withme.dto.chat.response.ChatRoomGetResponse;
import com.ssafy.withme.dto.chat.request.ChatRoomCreateRequest;
import com.ssafy.withme.global.response.SuccessMessage;
import com.ssafy.withme.repository.chat.ChatRoomRedisRepository;
import com.ssafy.withme.repository.chat.ChatRoomRepository;
import com.ssafy.withme.service.chat.message.ChatMongoService;
import com.ssafy.withme.service.user.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.Hibernate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@RequiredArgsConstructor
@Service
@Slf4j
public class ChatRoomService {

    private final ChatRoomRedisRepository chatRoomRedisRepository;
    private final ChatMongoService chatMongoService;
    private final ChatRoomRepository chatRoomRepository;
    private final UserService userService;

    public ChatRoomGetResponse getChatRoomInfo(Long userId, Long roomId) {
        log.info("userId = {}, roomId = {}", userId, roomId);
        ChatRoom findRoom = chatRoomRepository.findByUserIdAndRoomId(userId, roomId);

        return ChatRoomGetResponse.from(findRoom);
    }

    public List<ChatRoomGetResponse> getChatRoomListByUserId(Long userId) {
        List<ChatRoomGetResponse> chatRoomListGetResponseList =
                chatRoomRepository.findByUserId(userId).stream()
                        .map(ChatRoomGetResponse::from)
                        .toList();

        log.info("chatRoomListGetResponseList: {}", chatRoomListGetResponseList);
        chatRoomListGetResponseList.forEach(this::setListChatLastMessage);
        chatRoomRedisRepository.initChatRoomList(userId, chatRoomListGetResponseList);
        return sortChatRoomListLatest(chatRoomListGetResponseList);
    }

    public List<ChatRoomGetResponse> getChatRoomList(Long userId) {

        List<ChatRoomGetResponse> chatRoomListGetResponseList = null;
        if (chatRoomRedisRepository.existChatRoomList(userId)) {
            chatRoomListGetResponseList = chatRoomRedisRepository.getChatRoomList(userId);

        } else {
            // -> 레디스에 없으면 그냥 만들자
            chatRoomListGetResponseList = new ArrayList<>();
            chatRoomRedisRepository.initChatRoomList(userId, chatRoomListGetResponseList);
        }

        chatRoomListGetResponseList.forEach(this::setListChatLastMessage);

        return chatRoomListGetResponseList;
    }

    /**
     * 몽고 디비에서 마지막 메시지 가져와서 저장하는 로직
     * @param chatRoomListGetResponse
     */
    public void setListChatLastMessage(ChatRoomGetResponse chatRoomListGetResponse) {

        // 몽고 디비에서 마지막 메시지 가져와서 저장.
        Long chatRoomNumber = chatRoomListGetResponse.getRoomId();
        if (chatRoomRedisRepository.getLastMessage(chatRoomNumber) != null) {
            chatRoomListGetResponse.updateChatMessageDto(
                    chatRoomRedisRepository.getLastMessage(chatRoomNumber)
            );

        } else {
            ChatMessage chatMessage = chatMongoService.findLatestMessageByRoomId(chatRoomNumber);
            if (chatMessage != null) {
                chatRoomListGetResponse.updateChatMessageDto(
                        ChatMessageDto.fromEntity(chatMessage)
                );
            }
        }
    }

    /**
     * 채팅방 마지막 메시지의 시간들을 비교하여 정렬하는 메소드
     * @param chatRoomListGetResponseList
     */
    public List<ChatRoomGetResponse> sortChatRoomListLatest (
            List<ChatRoomGetResponse> chatRoomListGetResponseList
    ) {
        List<ChatRoomGetResponse> newChatRoomList = new ArrayList<>();
        for (ChatRoomGetResponse response : chatRoomListGetResponseList) {
            if (response.getLastChatMessageDto() != null) newChatRoomList.add(response);
        }

        Collections.sort(newChatRoomList, (o1, o2) ->
                o2.getLastChatMessageDto().getTime().compareTo(o1.getLastChatMessageDto().getTime()));

        return newChatRoomList;
    }

    /**
     * 채팅방 삭제 로직
     * @param roomId
     */
    public void deleteChatRoom(Long roomId, Long userId) {
        log.info("=>> 채팅방 삭제 {} start ", roomId);

        // feign으로 전달하는 API의 로직을 하단에 다시 작성해야함
//        SuccessMessage message = mainFeignClient.deleteChatRoom(accessToken, roomId);

        // feign으로 삭제할 게 아니라 service로직에서 직접 삭제해주기
        chatRoomRedisRepository.deleteChatRoom(userId, roomId);

        log.info(
                "=>> 채팅방 삭제 {} Msg : {}",
                roomId,
                SuccessMessage.createSuccessMessage("채팅방이 삭제되었습니다.")
        );
    }

    @Transactional
    public ChatRoom createChatRoom(ChatRoomCreateRequest chatRoomCreateRequest) {

        User user = userService.findById(chatRoomCreateRequest.getUserId());
        User partner = userService.findById(chatRoomCreateRequest.getPartnerId());

        ChatRoom chatRoom = chatRoomRepository.findByUserIdAndPartnerId(
                        chatRoomCreateRequest.getUserId(),
                        chatRoomCreateRequest.getPartnerId()
                )
                .orElse(ChatRoom.create(user, partner));

        chatRoomRepository.save(chatRoom);

        return chatRoom;
    }

    /**
     * 채팅방 떠날때의 시각 기록
     */
    @Transactional
    public LocalDateTime leaveChatRoom(Long userId, Long roomId) {
        ChatRoom chatRoom = chatRoomRepository.findByUserIdAndRoomId(userId, roomId);

        if (chatRoom == null) {
            throw new IllegalArgumentException(("유저 또는 해당 채팅방을 찾을 수 없습니다."));
        }

        LocalDateTime now = LocalDateTime.now();

        if (chatRoom.getUser().getId().equals(userId)) {
            chatRoom.setUserLeaveTime(now);
        } else if (chatRoom.getPartner().getId().equals(userId)) {
            chatRoom.setPartnerLeaveTime(now);
        } else {
            throw new IllegalArgumentException("유저는 채팅방의 구성인원이 아닙니다.");
        }

        //@Tranactional로 변경감지
//        chatRoomRepository.save(chatRoom);

        return now;
    }

}
