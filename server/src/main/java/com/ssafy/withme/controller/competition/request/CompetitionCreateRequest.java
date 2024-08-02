package com.ssafy.withme.controller.competition.request;

import lombok.Getter;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@Getter
public class CompetitionCreateRequest {

    private String title;
    private String password;
    private boolean isPrivate;
    private String userId;

}
