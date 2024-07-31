package com.ssafy.withme.service.userchellenge;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.withme.controller.userchallenege.request.UserChallengeAnalyzeRequest;
import com.ssafy.withme.controller.userchallenege.request.UserChallengeDeleteRequest;
import com.ssafy.withme.controller.userchallenege.request.UserChallengeSaveRequest;
import com.ssafy.withme.domain.challenge.Challenge;
import com.ssafy.withme.domain.landmark.Landmark;
import com.ssafy.withme.domain.user.User;
import com.ssafy.withme.domain.userchallenge.UserChallenge;
import com.ssafy.withme.global.exception.EntityNotFoundException;
import com.ssafy.withme.global.exception.FileNotFoundException;
import com.ssafy.withme.global.response.Frame;
import com.ssafy.withme.global.response.Keypoint;
import com.ssafy.withme.global.util.PoseComparison;

import com.ssafy.withme.repository.challenge.ChallengeRepository;
import com.ssafy.withme.repository.landmark.LandmarkRepository;
import com.ssafy.withme.repository.user.UserRepository;
import com.ssafy.withme.repository.userchallenge.UserChallengeRepository;
import com.ssafy.withme.service.userchellenge.response.UserChallengeAnalyzeResponse;
import com.ssafy.withme.service.userchellenge.response.UserChallengeSaveResponse;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;


import java.io.IOException;
import java.nio.file.FileAlreadyExistsException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import static com.ssafy.withme.global.error.ErrorCode.NOT_EXISTS_CHALLENGE;
import static com.ssafy.withme.global.error.ErrorCode.NOT_EXISTS_USER_CHALLENGE_FILE;

@RequiredArgsConstructor
@Service
@Slf4j
public class UserChallengeService {

    @Value("${temp-directory}")
    String TEMP_DIRECTORY;

    @Value("${permanent-directory}")
    String PERMANENT_DIRECTORY;

    @Value("${python-server.url}")
    String FAST_API_URL;

    private final UserChallengeRepository userChallengeRepository;

    private final UserRepository userRepository;

    private final ChallengeRepository challengeRepository;

    private final RestTemplate restTemplate;
    private final LandmarkRepository landmarkRepository;

    public UserChallengeAnalyzeResponse analyzeVideo(UserChallengeAnalyzeRequest request, MultipartFile videoFile) throws EntityNotFoundException, IOException {
        Long challengeId = request.getChallengeId();

        Challenge challenge = challengeRepository.findById(challengeId).orElse(null);

        if(challenge == null){
            throw new EntityNotFoundException(NOT_EXISTS_CHALLENGE);
        }
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("videoFile", new ByteArrayResource(videoFile.getBytes()) {
            @Override
            public String getFilename() {
                return videoFile.getOriginalFilename();
            }
        });
        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

        String url = FAST_API_URL + "/upload/userFile";
        // Fast API 반환값
        ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, requestEntity, String.class);
        System.out.println(response);
        String result = response.getBody();
        ObjectMapper objectMapper = new ObjectMapper();
        JsonNode rootNode = objectMapper.readTree(result);
        String uuid = rootNode.path("uuid").asText();

        List<Frame> userFrames = deserialize(result);
        System.out.println(challenge.getYoutubeId());

        Landmark landmark = landmarkRepository.findByYoutubeId(challenge.getYoutubeId());
        List<Frame> challengeFrames = landmark.getLandmarks().stream()
                .map(keypoints -> keypoints.stream()
                        .map(p -> new Keypoint(p.getX(), p.getY(), p.getZ(), p.getVisibility()))
                        .collect(Collectors.toList()))
                .map(Frame::new)
                .collect(Collectors.toList());

        // 점수
        double score = PoseComparison.calculatePoseScore(userFrames, challengeFrames);
        System.out.println(score);

        return UserChallengeAnalyzeResponse.builder()
                .uuid(uuid)
                .score(score)
                .build();
    }

    /**
     * 파이썬 서버에서 받아온 keypoints 값을 역직렬화 진행
     * @param jsonResponse
     * @return List<Frame>
     * @throws JsonProcessingException
     */
    public static List<Frame> deserialize(String jsonResponse) throws JsonProcessingException {
        ObjectMapper objectMapper = new ObjectMapper();

        JsonNode rootNode = objectMapper.readTree(jsonResponse);
        JsonNode landmarkNode = rootNode.path("keypoints");

        List<Frame> frames = new ArrayList<>();

        // landmarks[]
        for(JsonNode frameNode : landmarkNode){
            List<Keypoint> keypoints = new ArrayList<>();

            // landmark[][]
            for(JsonNode keypointNode : frameNode) {
                double x = keypointNode.path("x").asDouble();
                double y = keypointNode.path("y").asDouble();
                double z = keypointNode.path("z").asDouble();
                double visibility  = keypointNode.path("visibility").asDouble();

                keypoints.add(new Keypoint(x, y, z, visibility));
            }
            frames.add(new Frame(keypoints));
        }
        return frames;
    }


    /**
     * uuid와 fileName을 받아 임시저장 파일에서 해당 영상을 찾아 영구저장 파일로 이동시키고 파일 이름을 변경하여 영구저장한다.
     * @param request
     */
    public UserChallengeSaveResponse saveUserFile(UserChallengeSaveRequest request) {
        Challenge challenge = challengeRepository.findById(request.getChallengeId()).orElse(null);
//        User user = userRepository.findById(request.getUserId()).get();

        log.info("설정된 폴더 경로 " + TEMP_DIRECTORY);
        log.info("uuid : " + request.getUuid());

        Path tempVideoPath = Paths.get(TEMP_DIRECTORY, request.getUuid() + ".mp4");

        log.info("임시 비디오 경로 : " + tempVideoPath.toString());

        if (!Files.exists(tempVideoPath)) {
            throw new FileNotFoundException(NOT_EXISTS_USER_CHALLENGE_FILE);
        }

        try {
            // 영구 저장 경로로 이동 및 파일명 변경
            String finalFileName = request.getFileName() + ".mp4";
            Path permanentVideoPath = Paths.get(PERMANENT_DIRECTORY, finalFileName);
            Files.move(tempVideoPath, permanentVideoPath);

            UserChallenge userChallenge = UserChallenge.builder()
                    .name(request.getFileName())
//                    .user(user)
                    .challenge(challenge)
                    .videoPath(PERMANENT_DIRECTORY+"/"+finalFileName)
                    .build();
            UserChallenge savedUserChallenge = userChallengeRepository.save(userChallenge);
            return UserChallengeSaveResponse.ofResponse(savedUserChallenge);
        } catch(IOException e) {
            e.printStackTrace();
        }
        return null;
    }

    /**
     * 유저 영상 uuid를 받아 임시저장폴더에서 해당 영상을 찾아서 삭제한다.
     * @param request
     */
    public void deleteUserFile(UserChallengeDeleteRequest request) {
        Path tempVideoPath = Paths.get(TEMP_DIRECTORY, request.getUuid() + ".mp4");

        if (!Files.exists(tempVideoPath)) {
            throw new FileNotFoundException(NOT_EXISTS_USER_CHALLENGE_FILE);
        }
        try {
            // 임시 파일 삭제
            Files.delete(tempVideoPath);
        } catch (IOException e) {
            e.printStackTrace();
        }

    }
}
