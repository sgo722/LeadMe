package com.ssafy.withme.service.userchellenge.response;

import com.ssafy.withme.domain.challenge.Challenge;
import com.ssafy.withme.domain.comment.Comment;
import com.ssafy.withme.domain.user.User;
import com.ssafy.withme.domain.userchallenge.UserChallenge;
import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

import static jakarta.persistence.FetchType.LAZY;

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
