package com.ssafy.withme.dto.chat.request;

import lombok.*;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ChatRoomCreateRequest {

    private Long userId;
    private Long partnerId;
}
