package com.ssafy.withme.service.competition;

import com.ssafy.withme.controller.competition.request.CompetitionCreateRequest;
import com.ssafy.withme.global.exception.BusinessException;
import com.ssafy.withme.global.exception.EntityNotFoundException;
import io.openvidu.java.client.OpenVidu;
import io.openvidu.java.client.OpenViduHttpException;
import io.openvidu.java.client.OpenViduJavaClientException;
import io.openvidu.java.client.Session;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import static com.ssafy.withme.global.error.ErrorCode.NOT_EXISTS_COMPETITON_SESSION;

@Service
public class CompetitionService {

    private OpenVidu openVidu;

    // 경쟁전 생성
    public String createCompetition(CompetitionCreateRequest request) throws OpenViduJavaClientException, OpenViduHttpException {

        Session session = openVidu.createSession();
        String token = session.createConnection().getToken();
        return token;
    }

    // 경쟁전 참여
    public String joinCompetition(String sessionId) throws OpenViduJavaClientException, OpenViduHttpException {

        Session session = openVidu.getActiveSessions().stream()
                .filter(s -> s.getSessionId().equals(sessionId))
                .findFirst()
                .orElseThrow(() -> new EntityNotFoundException(NOT_EXISTS_COMPETITON_SESSION));

        return session.createConnection().getToken();
    }
}
