package com.ssafy.withme.controller.chat.chatroom;

import com.ssafy.withme.domain.chat.ChatRoom;
import com.ssafy.withme.dto.chat.response.ChatRoomGetResponse;
import com.ssafy.withme.global.config.jwt.TokenProvider;
import com.ssafy.withme.dto.chat.request.ChatRoomCreateRequest;
import com.ssafy.withme.global.response.SuccessResponse;
import com.ssafy.withme.service.chat.chatroom.ChatRoomService;
import com.ssafy.withme.service.chat.message.ChatMongoService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/chat/room")
@RequiredArgsConstructor
public class ChatRoomController {

    private final TokenProvider tokenProvider;

    private final ChatRoomService chatRoomService;

    private final ChatMongoService chatMongoService;

    /**
     * 현재 유저가 들어가있는 채팅방 리스트를 조회하는 API
     * - 토큰 확인 로직 수정
     * @param authorization
     * @return
     */
    @GetMapping("/list")
    public SuccessResponse<List> getChatRoomList(
            @RequestHeader("Authorization") String authorization
    ) {

        String accessToken = authorization.split(" ")[1];

        Long findUserId = tokenProvider.getUserId(accessToken);

        List<ChatRoomGetResponse> chatRoomList = chatRoomService.getChatRoomListByUserId(findUserId);

        return SuccessResponse.of(chatRoomList);
    }

    /**
     * 채팅방 정보를 불러오는 API
     * - accessToken 파라미터 제거하고 유저 정보를 토큰에서 제공받는 로직으로 수정
     * @param roomId
     * @return
     */
//    @GetMapping("/info")
//    public ChatRoomGetResponse getChatRoom(
//            @RequestHeader("Authorization") String authorization,
//            @RequestParam(name = "roomId") String roomId
//    ) {
//        String accessToken = authorization.split(" ")[1];
//
//        Long userId = tokenProvider.getUserId(accessToken);
//
//        return chatRoomService.getChatRoomInfo(userId, roomId);
//    }

    @GetMapping("/message/list")
    public SuccessResponse<?> roomFindInfo(
            @RequestParam(name = "roomId") Long roomId,
            @RequestParam(name = "page") Integer pageNumber
    ) {
        return SuccessResponse.of(chatMongoService.findAll(roomId, pageNumber));
    }

    @PostMapping("/create")
    public SuccessResponse<Long> createChatRoom(
            @RequestHeader("Authorization") String authorization,
            @RequestBody ChatRoomCreateRequest chatRoomCreateRequest
    ) {
        ChatRoom chatRoom = chatRoomService.createChatRoom(chatRoomCreateRequest);

        return SuccessResponse.of(chatRoom.getId());
    }

}
