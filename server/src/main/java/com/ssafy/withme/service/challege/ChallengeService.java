package com.ssafy.withme.service.challege;

import com.ssafy.withme.controller.challenge.request.ChallengeCreateRequest;
import com.ssafy.withme.domain.challenge.Challenge;
import com.ssafy.withme.domain.landmark.Landmark;
import com.ssafy.withme.global.exception.EntityNotFoundException;
import com.ssafy.withme.repository.challenge.ChallengeRepository;
import com.ssafy.withme.repository.landmark.LandmarkRepository;
import com.ssafy.withme.service.challege.response.ChallengeCreateResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;

import static com.ssafy.withme.global.error.ErrorCode.NOT_EXISTS_CHALLENGE;

@RequiredArgsConstructor
@Service
public class ChallengeService {

    static final String FAST_API_URL = "http://localhost:8000/videoUrl";
    private final ChallengeRepository challengeRepository;

    private final LandmarkRepository landmarkRepository;


    private final RestTemplate restTemplate;

    /**
     * 클라이언트가 youtubeURL로 요청하면 영상을 저장하고, 몽고디비에 스켈레톤 데이터를 저장한다.
     * @param request
     */
    public ChallengeCreateResponse createChallenge(ChallengeCreateRequest request){
        String youtubeId = request.getYoutubeId();
        Challenge challengeByYoutubeId = challengeRepository.findByYoutubeId(youtubeId);
        if(challengeByYoutubeId != null){
            return ChallengeCreateResponse.toResponse(challengeByYoutubeId);
        }
        Challenge challenge = request.toEntity();
        System.out.println(challenge);
        Challenge savedChallenge = challengeRepository.save(challenge);
        System.out.println(savedChallenge);
        // 헤더 설정
        HttpHeaders httpHeaders = new HttpHeaders();
        httpHeaders.setContentType(MediaType.APPLICATION_JSON);

        // 바디 설정
        HashMap<String, String> requestBody = new HashMap<>();
        // 유튜브 url을 바디에 넣는다.
        requestBody.put("url", challenge.getUrl());
        requestBody.put("youtubeId", challenge.getYoutubeId());


        HttpEntity<HashMap<String, String>> CreateLandMarkDataRequest = new HttpEntity<>(requestBody, httpHeaders);
        restTemplate.postForEntity(FAST_API_URL, CreateLandMarkDataRequest, String.class);
        return ChallengeCreateResponse.toResponse(savedChallenge);
    }

    /**
     * 프론트엔드에서 youtubeId를 파라미터로 담아 요청하면 스켈레톤 데이터를 반환한다.
     * @param youtubeId
     * @return
     */
    public Landmark getLandMarkByYoutubeId(String youtubeId) throws EntityNotFoundException {
        Challenge challenge = challengeRepository.findByYoutubeId(youtubeId);

        if(challenge == null) {
            throw new EntityNotFoundException(NOT_EXISTS_CHALLENGE);
        }

        // youtubeId로 몽고디비로부터 스켈레톤 데이터를 조회합니다.
        return landmarkRepository.findByYoutubeId(youtubeId);
    }
}
