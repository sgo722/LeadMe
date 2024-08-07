package com.ssafy.withme.service.userChallenge.response;

import lombok.Builder;
import lombok.Getter;


@Getter
public class UserChallengeAnalyzeResponse {

    // uuid
    private String uuid;

    @Builder
    private UserChallengeAnalyzeResponse(String uuid) {
        this.uuid = uuid;
    }
}
