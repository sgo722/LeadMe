package com.ssafy.withme.controller.chat.message;

import com.ssafy.withme.domain.chat.constant.MessageStatus;
import com.ssafy.withme.dto.chat.ChatMessageDto;
import com.ssafy.withme.service.chat.message.ChatMongoService;
import com.ssafy.withme.service.chat.message.ChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;

@RequiredArgsConstructor
@Controller
@Slf4j
//@CrossOrigin(origins = {"http://"})
public class ChatController {

    private final ChatMongoService chatMongoService;
    private final ChatService chatService;

    /**
     * websocket "/pub/chat/message"로 들어오는 메시징을 처리한다.
     */
    @MessageMapping("/chat/message/{roomId}")
    public void message(ChatMessageDto message, @DestinationVariable("roomId")Long roomId) {

        message.updateStatus(MessageStatus.UNREAD);

        log.info("room name: {}", message.getRoomId());
        log.info("message : {}", message);

        ChatMessageDto chatMessageDto = chatMongoService.save(message);
        chatService.sendChatMessage(chatMessageDto, roomId); // RedisPublisher 호출
    }

    /**
     * @MessageMapping("chat/message")은 스프링 프레임워크에서
     * WebSocket 또는 STOMP 기반의 메시징을 처리하기 위한 주석(annotation)이다.
     * @MessageMapping 을 통해 WebSocket 으로 들어오는 메시지 발행을 처리한다.
     * 클라이언트는 prefix 를 붙여서 /pub/chat/message 로 발행 요청하면 컨트롤러가 처리한다.
     * 메시지가 발행되면, /sub/chat/room/{chatRoomId} 로 메시지 send 하는데,
     * 이는 클라이언트에서 해당 주소 (/sub/chat/room/{chatRoomId})를 구독(sub) 하고 있다가,
     * 메시지가 전달되면 화면에 출력된다.
     * 여기서 (/sub/chat/room/{chatRoomId}) 는 채팅룸을 구분하는 값. 즉 pub/sub의 Topic 역할이다.
     * 기존의 WebSocketHandler 의 역할을 대체하므로 삭제한다.
     */
}
