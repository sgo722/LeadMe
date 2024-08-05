package com.ssafy.withme.controller.competition;

import com.ssafy.withme.controller.competition.request.CompetitionCreateRequest;
import com.ssafy.withme.global.error.ErrorCode;
import com.ssafy.withme.global.exception.SessionNotFoundException;
import com.ssafy.withme.global.response.SuccessResponse;
import com.ssafy.withme.service.competition.CompetitionService;
import com.ssafy.withme.service.competition.response.CompetitionResponse;
import io.openvidu.java.client.*;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RequiredArgsConstructor
@RestController
@Slf4j
public class CompetitionController {

    private final OpenVidu openVidu;

    private final CompetitionService competitionService;

    /**
     * 세션 생성 및 초기화
     * @param request
     * @return
     * @throws OpenViduJavaClientException
     * @throws OpenViduHttpException
     */
    @PostMapping("/api/v1/sessions")
    public SuccessResponse<?> initializeSession(@RequestBody(required = false) CompetitionCreateRequest request) throws OpenViduJavaClientException, OpenViduHttpException {

        String userId = "test";

        //SessionProperties properties = SessionProperties.fromJson().build();
        Session session = openVidu.createSession();

        competitionService.create(request, session.getSessionId(), userId);

        return SuccessResponse.of(session.getSessionId());
    }

    /**
     * 커넥션 생성 및 토큰 부여
     * @param sessionId
     * @param params
     * @return
     * @throws OpenViduJavaClientException
     * @throws OpenViduHttpException
     */
    @PostMapping("/api/v1/sessions/{sessionId}/connections")
    public SuccessResponse<?> createConnection(@PathVariable("sessionId") String sessionId, @RequestBody(required = false) Map<String, Object> params) throws OpenViduJavaClientException, OpenViduHttpException {

        Session session = openVidu.getActiveSession(sessionId);

        if(session == null) {
            throw new SessionNotFoundException(ErrorCode.NOT_FOUND_SESSION);
        }

        ConnectionProperties properties = ConnectionProperties.fromJson(params).build();
        Connection connection = session.createConnection(properties);

        return SuccessResponse.of(connection.getToken());
    }

    @GetMapping("api/v1/competitions")
    public SuccessResponse<?> getCompetitions(@RequestParam(required = false, defaultValue = "0", value = "page") int pageNo,
                                              @RequestParam(required = false, defaultValue = "createdDate", value = "criteria") String criteria,
                                              @RequestParam(required = false, defaultValue = "4", value = "size") int size,
                                              @RequestParam(required = false) String searchKeyword) {

        Map<String, Object> response = new HashMap<>();

        List<CompetitionResponse> competitions = competitionService.getCompetitions(pageNo, criteria, size, searchKeyword);
        int totalElements = competitionService.getTotlaCompetitions();
        int totalPages = (int) Math.ceil((double) totalElements / (double) size);
        boolean isFirst = false;
        boolean isLast = false;

        if(pageNo == 0) isFirst = true;
        if(pageNo == totalPages) isLast = true;

        response.put("competitions", competitions);
        response.put("totalElements", totalElements);
        response.put("totalPages", totalPages);
        response.put("isFirst", isFirst);
        response.put("isLast", isLast);
        response.put("pageNo", pageNo);

        return SuccessResponse.of(response);
    }



}
