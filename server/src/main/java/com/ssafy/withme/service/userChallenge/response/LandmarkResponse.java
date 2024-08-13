package com.ssafy.withme.service.userChallenge.response;

import com.ssafy.withme.domain.challenge.Challenge;
import com.ssafy.withme.domain.landmark.Landmark;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
public class LandmarkResponse {

    private String youtubeId;

    private List<List<Landmark.Point>> landmarks;

    private Long challengeId;

    private int originalFps;


    @Builder
    private LandmarkResponse(String youtubeId, List<List<Landmark.Point>> landmarks, Long challengeId, int originalFps) {
        this.youtubeId = youtubeId;
        this.landmarks = landmarks;
        this.challengeId = challengeId;
        this.originalFps = originalFps;
    }

    public static LandmarkResponse ofResponse(Landmark landmark, Challenge challenge) {
        return LandmarkResponse.builder()
                .challengeId(challenge.getId())
                .landmarks(landmark.getLandmarks())
                .youtubeId(landmark.getYoutubeId())
                .originalFps(challenge.getOriginalFps())
                .build();

    }
}
