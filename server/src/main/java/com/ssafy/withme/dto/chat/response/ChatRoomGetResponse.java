package com.ssafy.withme.dto.chat.response;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.ssafy.withme.domain.chat.ChatRoom;
import com.ssafy.withme.dto.chat.ChatMessageDto;
import lombok.*;

@Builder
@Getter
//@NoArgsConstructor(access = AccessLevel.PROTECTED)
//@AllArgsConstructor
@JsonTypeInfo(use = JsonTypeInfo.Id.CLASS, include = JsonTypeInfo.As.PROPERTY, property = "@class")
public class ChatRoomGetResponse {

    private Long roomId;

    private Long userId;

    private String userNickname;

    private Long partnerId;

    private String partnerNickname;

    private String partnerImageUrl;

    private ChatMessageDto lastChatMessageDto;

    public void updateChatMessageDto(ChatMessageDto chatMessageDto) {
        this.lastChatMessageDto = chatMessageDto;
    }

    public static ChatRoomGetResponse from(ChatRoom chatRoom) {

        return ChatRoomGetResponse.builder()
                .roomId(chatRoom.getId())
                .userNickname(chatRoom.getUser().getNickname())
                .userId(chatRoom.getUser().getId())
                .partnerNickname(chatRoom.getPartner().getNickname())
                .partnerId(chatRoom.getPartner().getId())
                .partnerImageUrl(chatRoom.getPartner().getProfileImg())
                .build();
    }

    @JsonCreator
    public ChatRoomGetResponse(
            @JsonProperty("roomId") Long roomId,
            @JsonProperty("userId") Long userId,
            @JsonProperty("userNickname") String userNickname,
            @JsonProperty("partnerId") Long partnerId,
            @JsonProperty("partnerNickname") String partnerNickname,
            @JsonProperty("partnerImageUrl") String partnerImageUrl,
            @JsonProperty("lastChatMessageDto") ChatMessageDto lastChatMessageDto) {
        this.roomId = roomId;
        this.userId = userId;
        this.userNickname = userNickname;
        this.partnerId = partnerId;
        this.partnerNickname = partnerNickname;
        this.partnerImageUrl = partnerImageUrl;
        this.lastChatMessageDto = lastChatMessageDto;
    }
}
