package com.ssafy.withme.service.userChallenge.response;

import com.ssafy.withme.domain.landmark.Landmark;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
public class LandmarkResponse {

    private String youtubeId;

    private List<List<Landmark.Point>> landmarks;

    private Long challengeId;


    @Builder
    private LandmarkResponse(String youtubeId, List<List<Landmark.Point>> landmarks, Long challengeId) {
        this.youtubeId = youtubeId;
        this.landmarks = landmarks;
        this.challengeId = challengeId;
    }

    public static LandmarkResponse ofResponse(Landmark landmark, Long challengeId) {
        return LandmarkResponse.builder()
                .challengeId(challengeId)
                .landmarks(landmark.getLandmarks())
                .youtubeId(landmark.getYoutubeId())
                .build();

    }
}
