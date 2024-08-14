package com.ssafy.withme.service.challege.response;

import com.ssafy.withme.domain.challenge.Challenge;
import jakarta.persistence.Column;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
public class ChallengeViewResponse {

    private Long challengeId;

    private String youtubeId;

    private String url;

    private String title;

    private String thumbnail;

    private List<String> hashtags;
    @Builder
    private ChallengeViewResponse(Long challengeId, String youtubeId, String url, String title, String thumbnail, List<String> hashtags) {
        this.challengeId = challengeId;
        this.youtubeId = youtubeId;
        this.url = url;
        this.thumbnail = thumbnail;
        this.title = title;
        this.hashtags = hashtags;
    }

    public static ChallengeViewResponse ofResponse(Challenge challenge, List<String> hashtags) {
        return ChallengeViewResponse.builder()
                .challengeId(challenge.getId())
                .thumbnail(challenge.getThumbnailUrl())
                .url(challenge.getUrl())
                .youtubeId(challenge.getYoutubeId())
                .title(challenge.getTitle())
                .hashtags(hashtags)
                .build();
    }

    public static ChallengeViewResponse ofResponse(Challenge challenge) {
        return ChallengeViewResponse.builder()
                .challengeId(challenge.getId())
                .thumbnail(challenge.getThumbnailUrl())
                .url(challenge.getUrl())
                .youtubeId(challenge.getYoutubeId())
                .title(challenge.getTitle())
                .hashtags(challenge.getChallengeHashTags().stream()
                        .map(ch -> ch.getHashtag().getName())
                        .toList())
                .build();
    }
}
