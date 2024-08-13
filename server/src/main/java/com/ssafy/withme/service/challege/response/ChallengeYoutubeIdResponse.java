package com.ssafy.withme.service.challege.response;

import com.ssafy.withme.domain.challenge.Challenge;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
public class ChallengeYoutubeIdResponse {

    private final List<String> youtubeId;


    public ChallengeYoutubeIdResponse(List<String> youtubeId) {
        this.youtubeId = youtubeId;
    }
}
