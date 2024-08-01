package com.ssafy.withme.service.userchellenge.response;

import lombok.Builder;
import lombok.Getter;


@Getter
public class UserChallengeAnalyzeResponse {
    // 유사도 점수
    private double score;
    // uuid
    private String uuid;
    // 프레임별 점수 기록
    private double[] scoreHistroy;

    @Builder
    private UserChallengeAnalyzeResponse(double score, String uuid, double[] scoreHistroy) {
        this.score = score;
        this.uuid = uuid;
        this.scoreHistroy = scoreHistroy;
    }
}
