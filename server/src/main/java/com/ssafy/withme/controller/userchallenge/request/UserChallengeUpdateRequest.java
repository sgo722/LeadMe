package com.ssafy.withme.controller.userchallenge.request;

import lombok.Getter;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@Getter
public class UserChallengeUpdateRequest {


    private Long userChallengeId;

    private String title;
}
