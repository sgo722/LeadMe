package com.ssafy.withme.service.competition;

import com.ssafy.withme.controller.competition.request.CompetitionCreateRequest;
import com.ssafy.withme.controller.competition.request.PasswordVerificationRequest;
import com.ssafy.withme.domain.competition.Competition;
import com.ssafy.withme.domain.competition.CompetitionEditor;
import com.ssafy.withme.domain.competition.constant.CompetitionStatus;
import com.ssafy.withme.domain.user.User;
import com.ssafy.withme.global.annotation.CurrentUser;
import com.ssafy.withme.global.exception.EntityNotFoundException;
import com.ssafy.withme.global.util.SHA256Util;
import com.ssafy.withme.repository.competition.CompetitionRepository;
import com.ssafy.withme.service.competition.response.CompetitionResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataAccessException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.redis.core.RedisOperations;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.SessionCallback;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

import static com.ssafy.withme.global.error.ErrorCode.NOT_FOUND_COMPETITION;
import static com.ssafy.withme.global.error.ErrorCode.USER_NOT_EXISTS;

@RequiredArgsConstructor
@Service
@Slf4j
public class CompetitionService {
    private final CompetitionRepository competitionRepository;
    private final RedisTemplate<String, String> redisTemplate;

    private static final String SESSION_KEY_PREFIX = "session:";

    /**
     * 세션 생성
     *
     * @param request
     * @param sessionId
     */
    public void create(CompetitionCreateRequest request, String sessionId, @CurrentUser User user) {

        log.info("세션 생성 : 유저 아아디" + user.getId() + " 유저 이메일 : " + user.getEmail());

        // 해당 세션으로 레디스 데이터 생성
        setSessionCount(sessionId, 0L);

        Competition competition = Competition.builder()
                                .user(user)
                                .roomName(request.getRoomName())
                                .sessionId(sessionId)
                                .isPublic(request.isPublic())
                                .password(SHA256Util.hashString(request.getPassword()))
                                .build();

        competitionRepository.save(competition);



    }

    /**
     * OPEN 상태와 방 이름 기반으로 페이징 처리하여 조회
     * @param pageNo
     * @param criteria
     * @param size
     * @return
     */
    public List<CompetitionResponse> getCompetitions(int pageNo, String criteria, int size, String searchKeyword) {

        Pageable pageable = PageRequest.of(pageNo, size, Sort.by(Sort.Direction.DESC, criteria));
        Page<Competition> page;
        if(searchKeyword == null || searchKeyword.isEmpty()) {
            page = competitionRepository.findByStatus(CompetitionStatus.OPEN, pageable);
        } else {
            page = competitionRepository.findByStatusAndRoomNameContains(CompetitionStatus.OPEN, searchKeyword, pageable);
        }

        List<Competition> competitions = page.getContent();

        if (!competitions.isEmpty()) {
            competitions = competitionRepository.fetchWithUser(competitions);
        }

        return competitions.stream()
                .map(CompetitionResponse::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * OPEN 상태이고 방이름 기반으로 경쟁전의 개수를 조회
     * @return
     */
    public int getTotlaCompetitions(String searchKeyword) {
        return competitionRepository.countByStatusAndRoomNameContains(CompetitionStatus.OPEN, searchKeyword);
    }

    /**
     * 경쟁전 방 비밀번호와 입력된 비밀번호 비교
     * @param request
     * @return
     */
    public boolean verifyCompetitionsPassword(PasswordVerificationRequest request) {

        Competition competition = competitionRepository.findById(request.getCompetitionId())
                .orElseThrow(() -> new EntityNotFoundException(NOT_FOUND_COMPETITION));

        return competition.getPassword().equals(SHA256Util.hashString(request.getPassword()));
    }

    /**
     * 세션 아이디를 활용해 유저 아이디 반환
     * @param sessionId
     * @return
     */
    public Long getCreateUserId(String sessionId) {

        Competition competition = competitionRepository.findBySessionId(sessionId);
        return competition.getCreateUser().getId();
    }

    /**
     * 레디스 트랜잭션을 활용한 sessionId 인원수 체크 및 증가
     * @param sessionId
     * @return
     */
    public boolean incrementIfLessThenTwo(String sessionId) {
        String key = SESSION_KEY_PREFIX + sessionId+":count";
        // 값이 2 미만일 경우 트랜잭션 시작, 여기부터 모든 명령어는 큐에 쌓이다.
        // 트랜잭션 끝 results 가 null이 아니면 성공
        // 값이 2 이상인 경우 감시 해제
        return Boolean.TRUE.equals(redisTemplate.execute(new SessionCallback<Boolean>() {
            @Override
            public <K, V> Boolean execute(RedisOperations<K, V> operations) throws DataAccessException {
                operations.watch((K) key);

                String value = redisTemplate.opsForValue().get(key);
                int count = (value == null) ? 0 : Integer.parseInt(value);

                if (count < 2) {
                    // 값이 2 미만일 경우 트랜잭션 시작, 여기부터 모든 명령어는 큐에 쌓이다.
                    operations.multi();
                    operations.opsForValue().increment((K) key);

                    // 트랜잭션 끝 results 가 null이 아니면 성공
                    List<Object> results = operations.exec();
                    return results != null;
                } else {
                    // 값이 2 이상인 경우 감시 해제
                    operations.unwatch();
                    return false;
                }
            }
        }));
    }

    /**
     * 세션에서 나간 경우 세션 삭제 또는 커넥트 카운트 감소
     * @param sessionId
     * @param user
     */
    public void deleteSession(String sessionId, User user) {

        log.info("입장한 user id : " + user.getId());
        log.info("세션 user id : " + getCreateUserId(sessionId));

        // 호스트인 경우
        if(getCreateUserId(sessionId).equals(user.getId())) {
            deleteSessionCount(sessionId);

            // 경쟁전 상태를 닫음으로 변경
            Competition competition = competitionRepository.findBySessionId(sessionId);

            CompetitionEditor.CompetitionEditorBuilder editorBuilder = competition.toEditor();
            CompetitionEditor competitionEditor =  editorBuilder
                    .competitionStatus(CompetitionStatus.CLOSED)
                    .build();

            competition.edit(competitionEditor);
        }
        // 호스트가 아닌 경우
        else {
            deleteSessionCount(sessionId);
        }
    }

    public Long decrementSessionCount(String sessionId) {
        String key = SESSION_KEY_PREFIX + sessionId + ":count";
        return redisTemplate.opsForValue().decrement(key);
    }

    public Long getSessionCount(String sessionId) {
        String key = SESSION_KEY_PREFIX + sessionId + ":count";
        String count = redisTemplate.opsForValue().get(key);
        return count != null ? Long.valueOf(count) : 0L;
    }

    public void setSessionCount(String sessionId, Long count) {
        String key = SESSION_KEY_PREFIX + sessionId + ":count";
        redisTemplate.opsForValue().set(key, String.valueOf(count));
    }

    public void deleteSessionCount(String sessionId) {
        String key = SESSION_KEY_PREFIX + sessionId + ":count";
        redisTemplate.delete(key);
    }


}
