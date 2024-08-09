package com.ssafy.withme.service.userChallenge.response;

import com.ssafy.withme.domain.userchallenge.UserChallenge;
import lombok.Builder;
import lombok.Getter;

@Getter
public class UserChallengeFeedResponse {

    private String title;

    private Long userChallengeId;

    private byte[] thumbnail;


    @Builder
    private UserChallengeFeedResponse(String title, Long userChallengeId, byte[] thumbnail) {
        this.title = title;
        this.userChallengeId = userChallengeId;
        this.thumbnail = thumbnail;
    }

    public static UserChallengeFeedResponse ofResponse(UserChallenge userChallenge, byte[] thumbnail){
        return UserChallengeFeedResponse.builder()
                .title(userChallenge.getFileName())
                .userChallengeId(userChallenge.getId())
                .thumbnail(thumbnail)
                .build();
    }
}
