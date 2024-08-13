package com.ssafy.withme.service.userChallenge.response;

import com.ssafy.withme.domain.userchallenge.UserChallenge;
import lombok.Builder;
import lombok.Getter;

@Getter
public class UserChallengeFeedResponse {

    private Long userId;

    private String title;

    private Long userChallengeId;

    private byte[] video;


    @Builder
    private UserChallengeFeedResponse(Long userId, String title, Long userChallengeId, byte[] video) {
        this.userId = userId;
        this.title = title;
        this.userChallengeId = userChallengeId;
        this.video = video;
    }

    public static UserChallengeFeedResponse ofResponse(UserChallenge userChallenge, byte[] video){
        return UserChallengeFeedResponse.builder()
                .userId(userChallenge.getUser().getId())
                .title(userChallenge.getFileName())
                .userChallengeId(userChallenge.getId())
                .video(video)
                .build();
    }
}
