package com.ssafy.withme.controller.userchallenge.request;

import com.ssafy.withme.domain.userchallenge.UserChallenge;
import lombok.Builder;
import lombok.Getter;

@Getter
public class UserChallengeReportViewResponse {

    private String fileName;

    private Long userChallengeId;

    private byte[] videoFile;


    @Builder
    private UserChallengeReportViewResponse(String fileName, Long userChallengeId, byte[] videoFile) {
        this.fileName = fileName;
        this.userChallengeId = userChallengeId;
        this.videoFile = videoFile;
    }

    public static UserChallengeReportViewResponse ofResponse(UserChallenge userChallenge, byte[] videoFile){
        return UserChallengeReportViewResponse.builder()
                .fileName(userChallenge.getFileName())
                .userChallengeId(userChallenge.getId())
                .videoFile(videoFile)
                .build();
    }
}
