package com.ssafy.withme.controller.competition.request;

import lombok.Getter;

@Getter
public class PasswordVerificationRequest {
    private int competitionId;
    private String password;
}
