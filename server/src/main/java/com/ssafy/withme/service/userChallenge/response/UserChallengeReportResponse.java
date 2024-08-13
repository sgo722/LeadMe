package com.ssafy.withme.service.userChallenge.response;

import com.ssafy.withme.domain.report.Report;
import lombok.Builder;
import lombok.Getter;

@Getter
public class UserChallengeReportResponse {

    private String uuid;

    private Long challengeId;

    private String youtubeId;

    private Double totalScore;

    private double[] scoreHistory;

    private byte[] videoFile;

    private int originalFps;


    @Builder
    private UserChallengeReportResponse(String uuid, Long challengeId, String youtubeId, Double totalScore, double[] scoreHistory, byte[] videoFile, int originalFps) {
        this.uuid = uuid;
        this.challengeId = challengeId;
        this.youtubeId = youtubeId;
        this.totalScore = totalScore;
        this.scoreHistory = scoreHistory;
        this.videoFile = videoFile;
        this.originalFps = originalFps;
    }

    public static UserChallengeReportResponse ofResponse(Report report, Long challengeId, String youtubeId, byte[] videoFile, int originalFps){
        return UserChallengeReportResponse.builder()
                .uuid(report.getUuid())
                .challengeId(challengeId)
                .youtubeId(youtubeId)
                .totalScore(report.getTotalScore())
                .scoreHistory(report.getScoreHistory())
                .videoFile(videoFile)
                .originalFps(originalFps)
                .build();
    }

}
