package com.ssafy.withme.service.challege.response;

import com.ssafy.withme.domain.challenge.Challenge;
import lombok.Builder;
import lombok.Getter;

@Getter
public class ChallengeBattleListResponse {


    private Long challengeId;

    private String youtubeId;

    private String title;

    private String thumbnailUrl;

    @Builder
    private ChallengeBattleListResponse(Long challengeId, String youtubeId, String title, String thumbnailUrl) {
        this.challengeId = challengeId;
        this.youtubeId = youtubeId;
        this.title = title;
        this.thumbnailUrl = thumbnailUrl;
    }

    public static ChallengeBattleListResponse ofResponse(Challenge challenge){
        return ChallengeBattleListResponse.builder()
                .challengeId(challenge.getId())
                .title(challenge.getTitle())
                .youtubeId(challenge.getYoutubeId())
                .thumbnailUrl(challenge.getThumbnailUrl())
                .build();
    }
}
