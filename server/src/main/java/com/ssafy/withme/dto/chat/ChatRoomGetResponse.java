package com.ssafy.withme.dto.chat;

import com.ssafy.withme.domain.chat.ChatRoom;
import lombok.*;

@Builder
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class ChatRoomGetResponse {

    private Long roomId;

    private String userNickname;

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
                .partnerNickname(chatRoom.getPartner().getNickname())
                .partnerImageUrl(chatRoom.getPartner().getProfileImg())
                .build();
    }
}
