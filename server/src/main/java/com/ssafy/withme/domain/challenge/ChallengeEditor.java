package com.ssafy.withme.domain.challenge;

import lombok.Builder;
import lombok.Getter;

@Getter
public class ChallengeEditor {

    private final String thumbnailUrl;

    @Builder
    public ChallengeEditor(String thumbnailUrl) {
        this.thumbnailUrl = thumbnailUrl;
    }
}
