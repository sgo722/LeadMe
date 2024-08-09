package com.ssafy.withme.dto.chat.response;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.ssafy.withme.domain.chat.ChatRoom;
import com.ssafy.withme.dto.chat.ChatMessageDto;
import lombok.*;

import java.time.LocalDateTime;

@Builder
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class ChatRoomGetResponse {

    private Long roomId;

    private Long userId;

    private String userNickname;

    private String userImageUrl;

    private Long partnerId;

    private String partnerNickname;

    private String partnerImageUrl;

    private ChatMessageDto lastChatMessageDto;

    // user 마지막으로 채팅방에서 나온 시각 기록
    private LocalDateTime userLastChatLeaveTime;

    // partner 마지막으로 채팅방에서 나온 시각 기록
    private LocalDateTime partnerLastChatLeaveTime;

    public void updateChatMessageDto(ChatMessageDto chatMessageDto) {
        this.lastChatMessageDto = chatMessageDto;
    }

    public static ChatRoomGetResponse from(ChatRoom chatRoom) {

        return ChatRoomGetResponse.builder()
                .roomId(chatRoom.getId())
                .userNickname(chatRoom.getUser().getNickname())
                .userImageUrl(chatRoom.getUser().getProfileImg())
                .userId(chatRoom.getUser().getId())
                .partnerNickname(chatRoom.getPartner().getNickname())
                .partnerId(chatRoom.getPartner().getId())
                .partnerImageUrl(chatRoom.getPartner().getProfileImg())
                .userLastChatLeaveTime(chatRoom.getUserLeaveTime())
                .partnerLastChatLeaveTime(chatRoom.getPartnerLeaveTime())
                .build();
    }
}
