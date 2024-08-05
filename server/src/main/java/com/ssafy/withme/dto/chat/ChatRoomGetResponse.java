package com.ssafy.withme.dto.chat;

import com.ssafy.withme.domain.chat.ChatRoom;
import lombok.*;

@Builder
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
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
}
