package com.ssafy.withme.service.challege.response;

import com.ssafy.withme.domain.challenge.Challenge;
import lombok.Builder;
import lombok.Getter;

@Getter
public class ChallengeBattleListResponse {


    private Long challengeId;

    private String youtubeId;

    private String title;

    @Builder
    private ChallengeBattleListResponse(Long challengeId, String youtubeId, String title) {
        this.challengeId = challengeId;
        this.youtubeId = youtubeId;
        this.title = title;
    }

    public static ChallengeBattleListResponse ofResponse(Challenge challenge){
        return ChallengeBattleListResponse.builder()
                .challengeId(challenge.getId())
                .title(challenge.getTitle())
                .youtubeId(challenge.getYoutubeId())
                .build();
    }
}
