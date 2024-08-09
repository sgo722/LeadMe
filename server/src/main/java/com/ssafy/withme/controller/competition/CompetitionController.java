package com.ssafy.withme.controller.competition;

import com.ssafy.withme.controller.competition.request.CompetitionCreateRequest;
import com.ssafy.withme.controller.competition.request.PasswordVerificationRequest;
import com.ssafy.withme.domain.user.User;
import com.ssafy.withme.global.annotation.CurrentUser;
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
    public SuccessResponse<?> initializeSession(@RequestBody(required = false) CompetitionCreateRequest request, @CurrentUser User user) throws OpenViduJavaClientException, OpenViduHttpException {

        //SessionProperties properties = SessionProperties.fromJson().build();
        Session session = openVidu.createSession();

        competitionService.create(request, session.getSessionId(), user);

        Connection connection = session.getConnection(session.getSessionId());

        HashMap<String, Object> response = new HashMap<>();
        response.put("sessionId", session.getSessionId());
        response.put("token", connection.getToken());

        return SuccessResponse.of(response);
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
    public SuccessResponse<?> createConnection(@PathVariable("sessionId") String sessionId, @RequestBody(required = false) PasswordVerificationRequest request) throws OpenViduJavaClientException, OpenViduHttpException, InterruptedException {

        Session session = openVidu.getActiveSession(sessionId);

        if(session == null) {
            throw new SessionNotFoundException(ErrorCode.NOT_FOUND_SESSION);
        }

        Connection connection = session.createConnection();
        HashMap<String, Object> response = new HashMap<>();

        Long activeConnectionSize = competitionService.getSessionCount(sessionId);
        log.info("Current number of connections in session " + sessionId + ": " + activeConnectionSize);

        // 해당 세션 인원 1 증가하며 2명 이상인 경우에는 꽉 찼다고 반환한다.
        if(!competitionService.incrementIfLessThenTwo(sessionId)) {
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

    /**
     * 세션 아이디를 활용해 유저 아이디 반환
     * @param sessionId
     * @return
     */
    @GetMapping("api/v1/sessions/{sessionId}/host")
    public SuccessResponse<?> getCreateUserId(@PathVariable String sessionId) {
        return SuccessResponse.of(competitionService.getCreateUserId(sessionId));
    }

    /**
     * 세션에서 나간 경우 세션 삭제 또는 커넥트 카운트 감소
     * @param sessionId
     * @param user
     */
    @DeleteMapping("api/v1/session/{sessionId}")
    public void deleteSession(@PathVariable String sessionId, @CurrentUser User user) {
        competitionService.deleteSession(sessionId, user);
    }

}


