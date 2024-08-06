package com.ssafy.withme.dto.chat;

import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.ssafy.withme.dto.chat.response.ChatRoomGetResponse;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
import java.util.List;

@Getter
@Setter
@Builder
@JsonTypeInfo(use = JsonTypeInfo.Id.CLASS, include = JsonTypeInfo.As.PROPERTY, property = "@class")
public class MessageSubDto implements Serializable {
    private Long userId;
    private Long partnerId;
    private Long roomId;
    private ChatMessageDto chatMessageDto;
    private List<ChatRoomGetResponse> list;
    private List<ChatRoomGetResponse> partnerList;
}
