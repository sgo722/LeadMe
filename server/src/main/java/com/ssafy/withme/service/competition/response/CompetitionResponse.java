package com.ssafy.withme.service.competition.response;

import com.ssafy.withme.domain.competition.Competition;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class CompetitionResponse {

    private Long competitionId;
    private String nickname;
    private String profileImg;
    private String roomName;
    private String sessionId;
    private boolean isPublic;
    private LocalDateTime createdDate;
    private Integer userCount;

    @Builder
    private CompetitionResponse(Long competitionId, String nickname, String profileImg ,String roomName, String sessionId, boolean isPublic, LocalDateTime createdDate) {
        this.competitionId = competitionId;
        this.nickname = nickname;
        this.profileImg= profileImg;
        this.roomName = roomName;
        this.sessionId = sessionId;
        this.isPublic = isPublic;
        this.createdDate = createdDate;
    }

    public static CompetitionResponse toResponse(Competition competition) {
        return CompetitionResponse.builder()
                .competitionId(competition.getId())
                .nickname(competition.getCreateUser().getNickname())
                .profileImg(competition.getCreateUser().getProfileImg())
                .roomName(competition.getRoomName())
                .sessionId(competition.getSessionId())
                .isPublic(competition.isPublic())
                .createdDate(competition.getCreatedDate())
                .build();
    }

    public void updateCount(Integer count){
        this.userCount = count;
    }

}
