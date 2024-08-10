package com.ssafy.withme.domain.competition;

import com.ssafy.withme.domain.competition.constant.CompetitionStatus;
import lombok.Builder;
import lombok.Getter;

@Getter
public class CompetitionEditor {

    private final CompetitionStatus competitionStatus;

    @Builder
    public CompetitionEditor(CompetitionStatus competitionStatus) {
        this.competitionStatus = competitionStatus;
    }

}
