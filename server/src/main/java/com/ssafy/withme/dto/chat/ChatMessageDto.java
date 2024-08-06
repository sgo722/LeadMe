package com.ssafy.withme.dto.chat;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
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
//@AllArgsConstructor
//@NoArgsConstructor
@JsonTypeInfo(use = JsonTypeInfo.Id.CLASS, include = JsonTypeInfo.As.PROPERTY, property = "@class")
public class ChatMessageDto implements Serializable {

    // 메시지 타입 : 입장, 채팅, 퇴장
    @Enumerated(EnumType.STRING)
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

    @JsonCreator
    public ChatMessageDto(
            @JsonProperty("type") MessageType type,
            @JsonProperty("roomId") Long roomId,
            @JsonProperty("userId") Long userId,
            @JsonProperty("nickname") String nickname,
            @JsonProperty("message") String message,
            @JsonProperty("time") String time,
            @JsonProperty("status") MessageStatus status
    ){
        this.type = type;
        this.roomId = roomId;
        this.userId = userId;
        this.nickname = nickname;
        this.message = message;
        this.time = time;
        this.status = status;
    }
}
