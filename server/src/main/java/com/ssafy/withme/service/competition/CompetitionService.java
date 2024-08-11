package com.ssafy.withme.service.competition;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.withme.controller.competition.request.CompetitionCreateRequest;
import com.ssafy.withme.controller.competition.request.PasswordVerificationRequest;
import com.ssafy.withme.controller.userchallenge.request.UserChallengeAnalyzeRequest;
import com.ssafy.withme.domain.challenge.Challenge;
import com.ssafy.withme.domain.competition.Competition;
import com.ssafy.withme.domain.competition.CompetitionEditor;
import com.ssafy.withme.domain.competition.constant.CompetitionStatus;
import com.ssafy.withme.domain.landmark.Landmark;
import com.ssafy.withme.domain.user.User;
import com.ssafy.withme.global.annotation.CurrentUser;
import com.ssafy.withme.global.exception.EntityNotFoundException;
import com.ssafy.withme.global.response.Frame;
import com.ssafy.withme.global.response.Keypoint;
import com.ssafy.withme.global.util.PoseComparison;
import com.ssafy.withme.global.util.SHA256Util;
import com.ssafy.withme.repository.challenge.ChallengeRepository;
import com.ssafy.withme.repository.competition.CompetitionRepository;
import com.ssafy.withme.repository.landmark.LandmarkRepository;
import com.ssafy.withme.service.competition.response.CompetitionResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.dao.DataAccessException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.redis.core.RedisOperations;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.SessionCallback;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static com.ssafy.withme.global.error.ErrorCode.*;
import static com.ssafy.withme.service.userChallenge.UserChallengeService.deserialize;

@Transactional(readOnly = true)
@RequiredArgsConstructor
@Service
@Slf4j
public class CompetitionService {

    @Value("${python-server.url}")
    String FAST_API_URL;

    private final RestTemplate restTemplate;

    private final LandmarkRepository landmarkRepository;

    private final CompetitionRepository competitionRepository;

    private final ChallengeRepository challengeRepository;

    private final RedisTemplate<String, String> redisTemplate;


    private static final String SESSION_KEY_PREFIX = "session:";

    /**
     * 세션 생성
     *
     * @param request
     * @param sessionId
     */
    @Transactional
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

        if(page == null) throw new EntityNotFoundException(NOT_FOUND_COMPETITION);
        List<Competition> competitions = page.getContent();


        if (!competitions.isEmpty()) {
            competitions = competitionRepository.fetchWithUser(competitions, pageable);
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
    @Transactional
    public boolean incrementIfLessThenTwo(String sessionId) {
        String key = SESSION_KEY_PREFIX + sessionId+":count";

        return Boolean.TRUE.equals(redisTemplate.execute(new SessionCallback<Boolean>() {
            @Override
            public <K, V> Boolean execute(RedisOperations<K, V> operations) throws DataAccessException {
                operations.watch((K) key);

                String value = (String) operations.opsForValue().get(key);  // redisTemplate 대신 operations 사용
                int count = (value == null) ? 0 : Integer.parseInt(value);

                // 값이 2 미만일 경우 트랜잭션 시작, 여기부터 모든 명령어는 큐에 쌓이다.
                if (count < 2) {
                    operations.multi();
                    operations.opsForValue().increment((K) key);  // (K) 캐스팅 제거

                    List<Object> results = operations.exec();
                    // 트랜잭션 끝 results 가 null이 아니면 성공
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
    @Transactional
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

    public double getCompetitionResult(UserChallengeAnalyzeRequest request, MultipartFile videoFile) throws IOException {
        // 챌린지 아이디
        Long challengeId = request.getChallengeId();
        log.info("챌린지 id: {}", challengeId);

        // 챌린지 아이디를 기반으로 저장되어 있는 챌린지 정보 조회
        Challenge challenge = challengeRepository.findById(challengeId).orElse(null);

        // 조회한 챌린지가 없는 경우 예외처리
        if (challenge == null) {
            log.info("조회할 챌린지가 없어 예외 발생.");
            throw new EntityNotFoundException(NOT_EXISTS_CHALLENGE);
        }

        log.info("비디오 파일 정보 : {}", videoFile.getOriginalFilename());

        String url = FAST_API_URL + "/upload/userFile";
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("videoFile", new ByteArrayResource(videoFile.getBytes()) {
            @Override
            public String getFilename() {
                return videoFile.getOriginalFilename();
            }
        });
        body.add("youtubeId", challenge.getYoutubeId());

        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

        // Fast API 반환값
        ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, requestEntity, String.class);

        String result = response.getBody();
        ObjectMapper objectMapper = new ObjectMapper();
        JsonNode rootNode = objectMapper.readTree(result);
        String uuid = rootNode.path("uuid").asText();

        // 역직렬화한 유저 포즈 정보
        List<Frame> userFrames = deserialize(result);
        log.info("유저 영상 프레임 수 : {} ", userFrames.size());

        // 저장된 챌린지 포즈 정보
        Landmark landmark = landmarkRepository.findByYoutubeId(challenge.getYoutubeId());
        log.info("youtubeID : {} 동영상 분석 준비", challenge.getYoutubeId());

        // 기존 챌린지 정보를 List<Frame> 형태로 캐스팅
        List<Frame> challengeFrames = landmark.getLandmarks().stream()
                .map(keypoints -> keypoints.stream()
                        .map(p -> new Keypoint(p.getX(), p.getY(), p.getZ(), p.getVisibility()))
                        .collect(Collectors.toList()))
                .map(Frame::new)
                .collect(Collectors.toList());

        Map<String, Object> calculateResult = PoseComparison.calculatePoseScore(userFrames, challengeFrames);
        log.info(" 반환 점수 : {}", calculateResult.get("score"));
        return Double.valueOf((String) calculateResult.get("score"));
    }

    @Transactional
    public Long decrementSessionCount(String sessionId) {
        String key = SESSION_KEY_PREFIX + sessionId + ":count";
        return redisTemplate.opsForValue().decrement(key);
    }

    public Long getSessionCount(String sessionId) {
        String key = SESSION_KEY_PREFIX + sessionId + ":count";
        String count = redisTemplate.opsForValue().get(key);
        return count != null ? Long.valueOf(count) : 0L;
    }

    @Transactional
    public void setSessionCount(String sessionId, Long count) {
        String key = SESSION_KEY_PREFIX + sessionId + ":count";
        redisTemplate.opsForValue().set(key, String.valueOf(count));
    }

    @Transactional
    public void deleteSessionCount(String sessionId) {
        String key = SESSION_KEY_PREFIX + sessionId + ":count";
        redisTemplate.delete(key);
    }


}
