package com.ssafy.withme.service.challege.response;

import com.ssafy.withme.domain.challenge.Challenge;
import jakarta.persistence.Column;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Builder;
import lombok.Getter;

@Getter
public class ChallengeViewResponse {

    private Long challengeId;

    private String youtubeId;

    private String url;

    private String title;

    private byte[] thumbnail;

    @Builder
    private ChallengeViewResponse(Long challengeId, String youtubeId, String url, String title, byte[] thumbnail) {
        this.challengeId = challengeId;
        this.youtubeId = youtubeId;
        this.url = url;
        this.thumbnail = thumbnail;
        this.title = title;
    }

    public static ChallengeViewResponse ofResponse(Challenge challenge, byte[] thumbnail) {
        return ChallengeViewResponse.builder()
                .challengeId(challenge.getId())
                .thumbnail(thumbnail)
                .url(challenge.getUrl())
                .youtubeId(challenge.getYoutubeId())
                .title(challenge.getTitle())
                .build();
    }
}
