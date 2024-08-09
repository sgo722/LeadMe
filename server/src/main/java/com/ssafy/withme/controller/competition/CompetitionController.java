package com.ssafy.withme.controller.competition;

import com.ssafy.withme.controller.competition.request.CompetitionCreateRequest;
import com.ssafy.withme.controller.competition.request.PasswordVerificationRequest;
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
     * @param request
     * @return
     * @throws OpenViduJavaClientException
     * @throws OpenViduHttpException
     */
    @PostMapping("/api/v1/sessions/{sessionId}/connections")
    public SuccessResponse<?> createConnection(@PathVariable("sessionId") String sessionId, @RequestBody(required = false) PasswordVerificationRequest request) throws OpenViduJavaClientException, OpenViduHttpException {

        Session session = openVidu.getActiveSession(sessionId);

        if(session == null) {
            throw new SessionNotFoundException(ErrorCode.NOT_FOUND_SESSION);
        }

        Connection connection = session.createConnection();
        HashMap<String, Object> response = new HashMap<>();


        int activeConnectionSize = session.getActiveConnections().size();

        log.info(String.valueOf(activeConnectionSize  + "activeConnectionSize "));

        if(activeConnectionSize >= 2) {
            response.put("isFulled",  true);
            return SuccessResponse.of(response);
        }

        // 비밀번호가 설정된 경쟁전에 참여하는 경우
        if(request != null) {
            if(competitionService.verifyCompetitionsPassword(request)) {
                response.put("validation", true);
                response.put("token", connection.getToken());
            } else {
                response.put("validation", false);
            }
        }

        // 비밀번호가 설정되지 않은 경쟁전에 참여하는 경우
        if(request == null) {
            response.put("token", connection.getToken());
        }

        return SuccessResponse.of(response);
    }

    /**
     * OPEN 상태와 방 이름 기반으로 페이징 처리하여 조회
     * @param pageNo
     * @param criteria
     * @param size
     * @param searchKeyword
     * @return
     */
    @GetMapping("api/v1/competitions")
    public SuccessResponse<?> getCompetitions(@RequestParam(required = false, defaultValue = "0", value = "page") int pageNo,
                                              @RequestParam(required = false, defaultValue = "createdDate", value = "criteria") String criteria,
                                              @RequestParam(required = false, defaultValue = "4", value = "size") int size,
                                              @RequestParam(required = false) String searchKeyword) {

        Map<String, Object> response = new HashMap<>();

        List<CompetitionResponse> competitions = competitionService.getCompetitions(pageNo, criteria, size, searchKeyword);
        int totalElements = competitionService.getTotlaCompetitions(searchKeyword);
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


