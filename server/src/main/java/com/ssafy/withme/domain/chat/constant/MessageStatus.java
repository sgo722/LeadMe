package com.ssafy.withme.domain.chat.constant;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum MessageStatus {

    READ("Read"), UNREAD("Unread");

    private String status;
}
