package com.ssafy.withme.service.chat.chatroom;

import com.ssafy.withme.domain.chat.ChatMessage;
import com.ssafy.withme.domain.chat.ChatRoom;
import com.ssafy.withme.domain.user.User;
import com.ssafy.withme.dto.chat.ChatMessageDto;
import com.ssafy.withme.dto.chat.ChatRoomGetResponse;
import com.ssafy.withme.dto.chat.request.ChatRoomCreateRequest;
import com.ssafy.withme.global.error.ErrorCode;
import com.ssafy.withme.global.exception.EntityNotFoundException;
import com.ssafy.withme.global.response.SuccessMessage;
import com.ssafy.withme.repository.chat.ChatRoomRedisRepository;
import com.ssafy.withme.repository.chat.ChatRoomRepository;
import com.ssafy.withme.service.chat.message.ChatMongoService;
import com.ssafy.withme.service.user.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    public ChatRoomGetResponse getChatRoomInfo(Long userId, String roomId) {
//        return mainFeignClient.getChatRoomInfo(accessToken, roomId);
        ChatRoom findRoom = chatRoomRepository.findByUserIdAndRoomId(userId, roomId);

        return ChatRoomGetResponse.from(findRoom);
    }

    public List<ChatRoomGetResponse> getChatRoomListByUserId(Long userId) {
        // 처음 HTTP 요청에서는 무조건 레디스 초기화 진행하도록 로직 수정

        // Feign Client를 사용하는 것이 아닌 직접 redis에서 채팅내역 조회
        // TODO: Redis -> RDBMS
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
            // 채팅방이 레디스에 없으면 페인 사용해서 불러온다!
            // -> 레디스에 없으면 그냥 만들자
//            chatRoomListGetResponseList = mainFeignClient.getChatRoomList(accessToken);
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
        String chatRoomNumber = chatRoomListGetResponse.getChatRoomNumber();
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
    public void deleteChatRoom(String roomId, Long userId) {
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

}
