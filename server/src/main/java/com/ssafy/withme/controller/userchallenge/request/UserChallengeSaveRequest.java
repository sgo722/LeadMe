package com.ssafy.withme.controller.userchallenge.request;

import lombok.Getter;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@Getter
public class UserChallengeSaveRequest {

    private Long challengeId;

    private Long userId;

    private String uuid;

    private String fileName;

    private String access;
}
