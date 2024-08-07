package com.ssafy.withme.service.userChallenge.response;

import com.ssafy.withme.domain.userchallenge.UserChallenge;
import lombok.Builder;
import lombok.Getter;

@Getter
public class UserChallengeFeedResponse {

    private String fileName;

    private Long userChallengeId;

    private byte[] thumbnail;


    @Builder
    private UserChallengeFeedResponse(String fileName, Long userChallengeId, byte[] thumbnail) {
        this.fileName = fileName;
        this.userChallengeId = userChallengeId;
        this.thumbnail = thumbnail;
    }

    public static UserChallengeFeedResponse ofResponse(UserChallenge userChallenge, byte[] thumbnail){
        return UserChallengeFeedResponse.builder()
                .fileName(userChallenge.getFileName())
                .userChallengeId(userChallenge.getId())
                .thumbnail(thumbnail)
                .build();
    }
}
