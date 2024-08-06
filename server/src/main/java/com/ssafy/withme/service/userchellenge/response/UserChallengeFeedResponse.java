package com.ssafy.withme.service.userchellenge.response;

import com.ssafy.withme.domain.userchallenge.UserChallenge;
import lombok.Builder;
import lombok.Getter;

@Getter
public class UserChallengeFeedResponse {

    private String fileName;

    private Long userChallengeId;

    private byte[] videoFile;


    @Builder
    private UserChallengeFeedResponse(String fileName, Long userChallengeId, byte[] videoFile) {
        this.fileName = fileName;
        this.userChallengeId = userChallengeId;
        this.videoFile = videoFile;
    }

    public static UserChallengeFeedResponse ofResponse(UserChallenge userChallenge, byte[] videoFile){
        return UserChallengeFeedResponse.builder()
                .fileName(userChallenge.getFileName())
                .userChallengeId(userChallenge.getId())
                .videoFile(videoFile)
                .build();
    }
}
