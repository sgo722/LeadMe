package com.ssafy.withme.controller.competition;

import com.ssafy.withme.controller.competition.request.CompetitionCreateRequest;
import com.ssafy.withme.global.response.SuccessResponse;
import com.ssafy.withme.service.competition.CompetitionService;
import io.openvidu.java.client.OpenViduHttpException;
import io.openvidu.java.client.OpenViduJavaClientException;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RequiredArgsConstructor
@RestController
public class CompetitionController {

    private final CompetitionService competitionService;

    @PostMapping("/api/v1/competition")
    public SuccessResponse<?> createCompetition(@RequestBody CompetitionCreateRequest request) throws OpenViduJavaClientException, OpenViduHttpException {

        return SuccessResponse.of(competitionService.createCompetition(request));
    }

    @PostMapping("/api/v1/join-competition")
    public SuccessResponse<?> joinCompetition(@RequestBody String sessionId) throws OpenViduJavaClientException, OpenViduHttpException {
        return SuccessResponse.of(competitionService.joinCompetition(sessionId));
    }



}
