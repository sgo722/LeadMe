package com.ssafy.withme.dto.chat;

import lombok.Builder;
import lombok.Getter;

@Builder
@Getter
public class ChatSimpleDto {

    private String message;
    private String time;
}
