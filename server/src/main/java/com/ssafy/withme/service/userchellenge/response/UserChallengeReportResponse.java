package com.ssafy.withme.service.userchellenge.response;

import com.ssafy.withme.domain.report.Report;
import lombok.Builder;
import lombok.Getter;

@Getter
public class UserChallengeReportResponse {

    private String uuid;

    private Double totalScore;

    private double[] scoreHistory;


    @Builder
    private UserChallengeReportResponse(String uuid, Double totalScore, double[] scoreHistory) {
        this.uuid = uuid;
        this.totalScore = totalScore;
        this.scoreHistory = scoreHistory;
    }

    public static UserChallengeReportResponse ofResponse(Report report){
        return UserChallengeReportResponse.builder()
                .uuid(report.getUuid())
                .totalScore(report.getTotalScore())
                .scoreHistory(report.getScoreHistory())
                .build();
    }
}
