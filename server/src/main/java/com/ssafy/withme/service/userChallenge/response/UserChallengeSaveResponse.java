package com.ssafy.withme.service.userChallenge.response;

import com.ssafy.withme.domain.userchallenge.UserChallenge;
import lombok.Builder;
import lombok.Getter;

@Getter
public class UserChallengeSaveResponse {

    private Long userChallengeId;

    private String fileName;

    private Long challengeId;

    @Builder
    private UserChallengeSaveResponse(Long userChallengeId, String fileName, Long challengeId) {
        this.userChallengeId = userChallengeId;
        this.fileName = fileName;
        this.challengeId = challengeId;
    }

    public static UserChallengeSaveResponse ofResponse(UserChallenge userChallenge) {
        return UserChallengeSaveResponse.builder()
                .userChallengeId(userChallenge.getId())
                .fileName(userChallenge.getFileName())
                .challengeId(userChallenge.getChallenge().getId())
                .build();
    }

}
