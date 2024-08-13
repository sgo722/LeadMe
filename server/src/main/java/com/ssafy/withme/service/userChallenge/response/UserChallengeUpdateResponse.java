package com.ssafy.withme.service.userChallenge.response;

import com.ssafy.withme.domain.challenge.Challenge;
import com.ssafy.withme.domain.userchallenge.UserChallenge;
import lombok.Builder;
import lombok.Getter;

@Getter
public class UserChallengeUpdateResponse {

    private Long userChallengeId;

    private String title;

    @Builder
    private UserChallengeUpdateResponse(Long userChallengeId, String title) {
        this.userChallengeId = userChallengeId;
        this.title = title;
    }

    public static UserChallengeUpdateResponse ofResponse(UserChallenge userChallenge) {
        return UserChallengeUpdateResponse.builder()
                .title(userChallenge.getFileName())
                .userChallengeId(userChallenge.getId())
                .build();
    }
}
