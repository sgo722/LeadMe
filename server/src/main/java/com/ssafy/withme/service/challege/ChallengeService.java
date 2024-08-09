package com.ssafy.withme.service.challege;

import com.ssafy.withme.controller.challenge.request.ChallengeCreateRequest;
import com.ssafy.withme.domain.challenge.Challenge;
import com.ssafy.withme.domain.landmark.Landmark;
import com.ssafy.withme.global.exception.EntityNotFoundException;
import com.ssafy.withme.repository.challenge.ChallengeRepository;
import com.ssafy.withme.repository.landmark.LandmarkRepository;

import com.ssafy.withme.service.userChallenge.response.LandmarkResponse;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Value;

import com.ssafy.withme.service.challege.response.ChallengeCreateResponse;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;

import static com.ssafy.withme.global.error.ErrorCode.NOT_EXISTS_CHALLENGE;
import static com.ssafy.withme.global.error.ErrorCode.NOT_EXISTS_CHALLENGE_SKELETON_DATA;


@RequiredArgsConstructor
@Service
public class ChallengeService {

    @Value("${python-server.url}")
    String FAST_API_URL;

    private final ChallengeRepository challengeRepository;

    private final LandmarkRepository landmarkRepository;


    private final RestTemplate restTemplate;

    /**
     * 클라이언트가 youtubeURL로 요청하면 영상을 저장하고, 몽고디비에 스켈레톤 데이터를 저장한다.
     * @param request
     */
    @Transactional
    public ChallengeCreateResponse createChallenge(ChallengeCreateRequest request, MultipartFile videoFile) throws IOException {
        String youtubeId = request.getYoutubeId();
        Challenge challengeByYoutubeId = challengeRepository.findByYoutubeId(youtubeId);
        if(challengeByYoutubeId != null){
            Landmark landmark = landmarkRepository.findByYoutubeId(challengeByYoutubeId.getYoutubeId());
            System.out.println(landmark);
            if(landmark == null){
                throw new EntityNotFoundException(NOT_EXISTS_CHALLENGE_SKELETON_DATA);
            }
            return ChallengeCreateResponse.toResponse(challengeByYoutubeId);
        }

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


        Challenge challenge = request.toEntity();

        System.out.println(challenge);
        Challenge savedChallenge = challengeRepository.save(challenge);
        System.out.println(savedChallenge);


        
        return ChallengeCreateResponse.toResponse(savedChallenge);
    }

    /**
     * 프론트엔드에서 youtubeId를 파라미터로 담아 요청하면 스켈레톤 데이터를 반환한다.
     * @param youtubeId
     * @return
     */
    @Transactional
    public LandmarkResponse getLandMarkByYoutubeId(String youtubeId) throws EntityNotFoundException {
        Challenge challenge = challengeRepository.findByYoutubeId(youtubeId);

        if(challenge == null) {
            throw new EntityNotFoundException(NOT_EXISTS_CHALLENGE);
        }

        // youtubeId로 몽고디비로부터 스켈레톤 데이터를 조회합니다.
        Landmark findLandmarkByYoutubeId = landmarkRepository.findByYoutubeId(youtubeId);
        return LandmarkResponse.ofResponse(findLandmarkByYoutubeId, challenge.getId());
    }
}
