package com.ssafy.withme.dto.chat;

import com.ssafy.withme.domain.chat.ChatMessage;
import com.ssafy.withme.domain.chat.constant.MessageStatus;
import com.ssafy.withme.domain.chat.constant.MessageType;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.*;

import java.io.Serializable;

@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ChatMessageDto implements Serializable {

    // 메시지 타입 : 입장, 채팅, 퇴장
    private MessageType type; // 메시지 타입
    private Long roomId; // 방 번호
    private Long userId;
    private String nickname;
    private String message; // 메시지
    private String time;
    @Enumerated(EnumType.STRING)
    private MessageStatus status;

    public void updateStatus(MessageStatus status) {
        this.status = status;
    }

    public static ChatMessageDto fromEntity(ChatMessage chatMessage) {
        return ChatMessageDto.builder()
                .type(chatMessage.getType())
                .userId(chatMessage.getUserId())
                .nickname(chatMessage.getNickname())
                .roomId(chatMessage.getRoomId())
                .time(chatMessage.getTime())
                .message(chatMessage.getMessage())
                .status(chatMessage.getStatus())
                .build();
    }

}
