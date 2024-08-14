package com.ssafy.withme.service.userChallenge;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.withme.controller.userchallenge.request.UserChallengeAnalyzeRequest;
import com.ssafy.withme.controller.userchallenge.request.UserChallengeDeleteRequest;
import com.ssafy.withme.controller.userchallenge.request.UserChallengeUpdateRequest;
import com.ssafy.withme.domain.user.User;
import com.ssafy.withme.global.exception.AuthorizationException;
import com.ssafy.withme.service.userChallenge.response.*;
import com.ssafy.withme.controller.userchallenge.request.UserChallengeSaveRequest;
import com.ssafy.withme.domain.challenge.Challenge;
import com.ssafy.withme.domain.landmark.Landmark;
import com.ssafy.withme.domain.report.Report;
import com.ssafy.withme.domain.userchallenge.UserChallenge;
import com.ssafy.withme.global.exception.EntityNotFoundException;
import com.ssafy.withme.global.exception.FileNotFoundException;
import com.ssafy.withme.global.response.Frame;
import com.ssafy.withme.global.response.Keypoint;
import com.ssafy.withme.global.util.PoseComparison;

import com.ssafy.withme.repository.challenge.ChallengeRepository;
import com.ssafy.withme.repository.landmark.LandmarkRepository;
import com.ssafy.withme.repository.report.ReportRepository;
import com.ssafy.withme.repository.user.UserRepository;
import com.ssafy.withme.repository.userChallenge.UserChallengeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;


import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;
import java.util.concurrent.TimeUnit;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import static com.ssafy.withme.domain.challenge.QChallenge.challenge;
import static com.ssafy.withme.global.error.ErrorCode.*;

@RequiredArgsConstructor
@Service
@Slf4j
@Transactional(readOnly = true)
public class UserChallengeService {

    @Value("${python-server.temp-directory}")
    String TEMP_DIRECTORY;

    @Value("${python-server.permanent-directory}")
    String PERMANENT_DIRECTORY;

    @Value("${python-server.url}")
    String FAST_API_URL;

    @Value("${python-server.youtube-audio-directory}")
    String AUDIO_DIRECTORY;


//    @Value("${python-server.permanent-thumbnail-directory}")
//    String THUMBNAIL_DIRECTORY;

    @Value("${python-server.temporary-thumbnail-directory}")
    String TEMPORARY_THUMBNAIL_DIRECTORY;

    @Value("${python-server.permanent-thumbnail-directory}")
    String PERMANENT_THUMBNAIL_DIRECTORY;

    private final UserChallengeRepository userChallengeRepository;

    private final UserRepository userRepository;

    private final ChallengeRepository challengeRepository;

    private final RestTemplate restTemplate;
    private final LandmarkRepository landmarkRepository;

    private final ReportRepository reportRepository;

    /**
     * * 유저의 스켈레톤 데이터를 받아와서 알고리즘으로 분석률을 반환한다.
     *
     * @param request
     * @param videoFile
     * @return
     * @throws EntityNotFoundException
     * @throws IOException
     */


    @Transactional
    public UserChallengeAnalyzeResponse analyzeVideo(UserChallengeAnalyzeRequest request, MultipartFile videoFile) throws EntityNotFoundException, IOException {
        // 챌린지 아이디
        Long challengeId = request.getChallengeId();

        // 챌린지 아이디를 기반으로 저장되어 있는 챌린지 정보 조회
        Challenge challenge = challengeRepository.findById(challengeId).orElse(null);

        // 조회한 챌린지가 없는 경우 예외처리
        if (challenge == null) {
            throw new EntityNotFoundException(NOT_EXISTS_CHALLENGE);
        }

        // 원본 영상 저장, 수평 반전한 영상 저장, 오디오 추출
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
        ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, requestEntity, String.class);
        String result = response.getBody();
        ObjectMapper objectMapper = new ObjectMapper();
        JsonNode rootNode = objectMapper.readTree(result);
        String uuid = rootNode.path("uuid").asText();

        // =====================================================================================================

        headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        body = new LinkedMultiValueMap<>();
        body.add("youtubeId", challenge.getYoutubeId());
        body.add("uuid", uuid);

        // 블레이즈 포즈 추출
        url = FAST_API_URL + "/upload/blazepose";


        requestEntity = new HttpEntity<>(body, headers);
        // Fast API 반환값
        response = restTemplate.exchange(url, HttpMethod.POST, requestEntity, String.class);

        result = response.getBody();

        // 역직렬화한 유저 포즈 정보
        List<Frame> userFrames = deserialize(result);


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
        log.info(" 반환 점수 : {}", calculateResult.get("totalScore"));

        Report report = Report.builder()
                .uuid(uuid)
                .scoreHistory((double[]) calculateResult.get("scoreHistory"))
                .totalScore((Double) calculateResult.get("totalScore"))
                .challengeId(request.getChallengeId())
                .build();
        Report save = reportRepository.insert(report);

        return UserChallengeAnalyzeResponse.builder()
                .uuid(uuid)
                .build();
    }


    /**
     * 파이썬 서버에서 받아온 스켈레톤데이터를 값을 역직렬화 진행
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
        for (JsonNode frameNode : landmarkNode) {
            List<Keypoint> keypoints = new ArrayList<>();

            // landmark[][]
            for (JsonNode keypointNode : frameNode) {
                double x = keypointNode.path("x").asDouble();
                double y = keypointNode.path("y").asDouble();
                double z = keypointNode.path("z").asDouble();
                double visibility = keypointNode.path("visibility").asDouble();

                keypoints.add(new Keypoint(x, y, z, visibility));
            }
            frames.add(new Frame(keypoints));
        }
        return frames;
    }


    /**
     * 임시저장된 유저 영상파일을 영구저장한다.
     * 유저가 챌린지를 따라 한 후 업로드/저장을 한 경우 사용된다.
     * @param request
     */

    @Transactional
    public UserChallengeSaveResponse saveUserFile(User user, UserChallengeSaveRequest request) {
        Challenge challenge = challengeRepository.findById(request.getChallengeId()).orElse(null);

        log.info("설정된 폴더 경로 " + TEMP_DIRECTORY);
        log.info("uuid : " + request.getUuid());


        Path thumbnailPath = Paths.get(TEMPORARY_THUMBNAIL_DIRECTORY, request.getUuid() + ".png");
        Path tempVideoPath = Paths.get(TEMP_DIRECTORY, request.getUuid() + "_merged.mp4");

        log.info("임시 비디오 경로 : " + tempVideoPath.toString());

        if (!Files.exists(tempVideoPath)) {
            throw new FileNotFoundException(NOT_EXISTS_USER_CHALLENGE_FILE);
        }

        System.out.println("썸네일 경로 : " + thumbnailPath.toString());

        try {
            // 영구 저장 경로로 이동 및 파일명 변경
            String finalFileName = request.getFileName() + ".mp4";

//            Path userChallengeFolder = Paths.get(PERMANENT_DIRECTORY, String.valueOf(user.getId()));
//            if (!Files.exists(userChallengeFolder)) {
//                Files.createDirectories(userChallengeFolder);
//            }

            Path permanentVideoPath = Paths.get(PERMANENT_DIRECTORY + "/", finalFileName);

            Files.move(tempVideoPath, permanentVideoPath);


//            String thumbnailPath = extractThumbnail(thumbnailExtractPath, user.getId(), request.getFileName());

            UserChallenge userChallenge = UserChallenge.builder()
                    .fileName(request.getFileName())
                    .user(user)
                    .likes(0)
                    .challenge(challenge)
                    .videoPath(PERMANENT_DIRECTORY + "/" + finalFileName)
                    .access(request.getAccess())
                    .uuid(request.getUuid())
                    .thumbnailPath(thumbnailPath.toString())
                    .build();
            UserChallenge savedUserChallenge = userChallengeRepository.save(userChallenge);

            Report findReportByUuid = reportRepository.findByUuid(request.getUuid());
            findReportByUuid.setUserChallengeId(savedUserChallenge.getId());
            reportRepository.save(findReportByUuid);
            return UserChallengeSaveResponse.ofResponse(savedUserChallenge);
        } catch (IOException e) {
            e.printStackTrace();
        }
        return null;
    }

    /**
     * 임시저장된 파일을 영구 삭제한다.
     * 유저가 챌린지를 따라 한 후 재촬영/취소를 한 경우 사용된다.
     * @param request
     */

    @Transactional
    public void deleteUserFile(UserChallengeDeleteRequest request) {
        Path tempVideoPath = Paths.get(TEMP_DIRECTORY, request.getUuid() + ".mp4");

        if (!Files.exists(tempVideoPath)) {
            throw new FileNotFoundException(NOT_EXISTS_USER_CHALLENGE_FILE);
        }
        try {
            // 임시 파일 삭제
            Files.delete(tempVideoPath);
            Report findReportByUuid = reportRepository.findByUuid(request.getUuid());
            reportRepository.delete(findReportByUuid);
        } catch (IOException e) {
            e.printStackTrace();
        }

    }

    /**
     * uuid를 기반으로 영상 분석데이터를 조회한다.
     * @param uuid
     * @return
     */


    @Transactional
    public UserChallengeReportResponse findReportByUuid(String uuid) throws IOException, InterruptedException {
        Report report = reportRepository.findByUuid(uuid);
//        UserChallenge userChallenge = userChallengeRepository.findByUuid(uuid);
        Challenge challenge = challengeRepository.findById(report.getChallengeId()).get();
        Long challengeId = challenge.getId();
        String youtubeId = challenge.getYoutubeId();
        int originalFps = challenge.getOriginalFps();
        String videoPath = TEMP_DIRECTORY + "/" + uuid + ".mp4";
        String audioPath = AUDIO_DIRECTORY + "/" + uuid + ".mp3";
        String outputPath = TEMP_DIRECTORY + "/" + uuid + "_merged.mp4";

        byte[] mergedVideoFile = mergeVideoAndAudio(videoPath, audioPath, outputPath);


        return UserChallengeReportResponse.ofResponse(report, challengeId, youtubeId, mergedVideoFile, originalFps);
    }

    /**
     * leadme 페이지에서 사용자들이 업로드한 영상을 조회한다.
     * @param pageable
     * @return
     */

    public UserChallengeFeedResponses findUserChallengeByPageable(Pageable pageable) {
        //유저 영상 중 access = "public" 인 영상들을 페이징 조회한다.
        Page<UserChallenge> findUserChallenge = userChallengeRepository.findByAccessOrderByCreatedDateDesc("public", pageable);
        List<UserChallengeFeedResponse> userChallengeFeedResponse = findUserChallenge.stream()
                .map(userChallenge -> {
                    try {
                        User user = userChallenge.getUser();
                        byte[] video = Files.readAllBytes(Paths.get(userChallenge.getVideoPath()));
                        return UserChallengeFeedResponse.ofResponse(userChallenge, user, video);
                    } catch (Exception e) {
                        // 예외 처리 로직을 여기에 추가
                        e.printStackTrace();
                        return null; // 또는 다른 적절한 예외 처리 방법
                    }
                })
                .filter(Objects::nonNull) // null 값을 필터링하여 스트림에서 제외
                .collect(Collectors.toList());

        int pageSize = findUserChallenge.getPageable().getPageSize();
        long totalElements = findUserChallenge.getTotalElements();
        int totalPages = findUserChallenge.getTotalPages();
        int size = findUserChallenge.getSize();

        return new UserChallengeFeedResponses(size, totalElements, totalPages, pageSize, userChallengeFeedResponse);
    }

    /**
     * 유저영상의 챌린지 음악을 삽입한다.
     * @param videoPath
     * @param audioPath
     * @param outputPath
     * @return
     * @throws IOException
     * @throws InterruptedException
     */
    private byte[] mergeVideoAndAudio(String videoPath, String audioPath, String outputPath) throws IOException, InterruptedException {
        // 입력 파일 경로 확인
        System.out.println(videoPath);
        System.out.println(audioPath);
        Path videoFilePath = Paths.get(videoPath);
        Path audioFilePath = Paths.get(audioPath);

        if (!Files.exists(videoFilePath)) {
            throw new IOException("비디오 파일을 찾을 수 없습니다: " + videoPath);
        }

        if (!Files.exists(audioFilePath)) {
            throw new IOException("오디오 파일을 찾을 수 없습니다: " + audioPath);
        }

        // ffmpeg 명령어를 사용하여 비디오와 오디오 결합
        String command = String.format("ffmpeg -i %s -i %s -c:v copy -c:a aac %s", videoPath, audioPath, outputPath);
        Process process = Runtime.getRuntime().exec(command);

//        if (!process.waitFor(30, TimeUnit.SECONDS)) {
//            throw new IOException("ffmpeg 프로세스가 시간 초과되었습니다.");
//        }

        process.waitFor(2, TimeUnit.SECONDS);

        Path outputPathObj = Paths.get(outputPath);
        if (!Files.exists(outputPathObj)) {
            throw new IOException("출력 파일을 찾을 수 없습니다: " + outputPath);
        }

        byte[] mergedFile = Files.readAllBytes(outputPathObj);

        // 임시 파일 삭제 (옵션)
//        Files.deleteIfExists(outputPathObj);

        return mergedFile;
    }

    /**
     * 유저의 본인, 타인의 개인피드를 조회한다.
     * @param pageable
     * @param user
     * @param viewUserId
     * @return
     */
    public Page<UserChallengeMyPageResponse> getUserChallengeByUser(Pageable pageable, User user, Long viewUserId) {
        // 개인 피드를 조회한 유저를 조회한다.
        User findUser = userRepository.findById(viewUserId)
                .orElseThrow(() -> new EntityNotFoundException(USER_NOT_EXISTS));


        // 본인의 개인 피드를 조회한 경우 - access값이 private, public 모두 보여준다
        if(findUser.equals(user)){
            System.out.println("본인");
            Page<UserChallenge> userChallengeByPaging = userChallengeRepository.findByUserOrderByCreatedDateDesc(user.getId(), pageable);
            return userChallengeByPaging
                    .map(userChallenge -> {
//                        try {
//                            Path thumbnailPath = new File(userChallenge.getThumbnailPath()).toPath();
//                            byte[] thumbnailBytes = Files.readAllBytes(thumbnailPath);
                            return UserChallengeMyPageResponse.responseOf(userChallenge, null);
//                        } catch (IOException e) {
//                            throw new FileNotFoundException(NOT_EXISTS_USER_CHALLENGE_THUMBNAIL_FILE);
//                        }
                    });
        }

        // 타인의 개인피드를 조회한 경우 - access값이 public인 영상만 보여준다.
        if(!findUser.equals(user)){

            System.out.println("타인");
            Page<UserChallenge> userChallengeByPaging = userChallengeRepository.findByUserAndAccessOrderByCreatedDateDesc(findUser.getId(), "public", pageable);
            return userChallengeByPaging
                    .map(userChallenge -> {
//                        try {
//                            Path thumbnailPath = new File(userChallenge.getThumbnailPath()).toPath();
//                            byte[] thumbnailBytes = Files.readAllBytes(thumbnailPath);
                            return UserChallengeMyPageResponse.responseOf(userChallenge, null);
//                        } catch (IOException e) {
//                            throw new FileNotFoundException(NOT_EXISTS_USER_CHALLENGE_THUMBNAIL_FILE);
//                        }
                    });

        }
        return null;
    }

    public List<UserChallengeFeedResponse> findByKeyword(String keyword) {

        List<UserChallenge> findList = userChallengeRepository.findByKeyword(keyword);

        return fromEntity(findList);


//        List<UserChallengeFeedResponse> userChallengeFeedResponse = findUserChallenge.stream()
//                .map(userChallenge -> {
//                    try {
//
//                        byte[] video = Files.readAllBytes(Paths.get(userChallenge.getVideoPath()));
//
//                        return UserChallengeFeedResponse.of(userChallenge, video);
//                    } catch (Exception e) {
//                        // 예외 처리 로직을 여기에 추가
//                        e.printStackTrace();
//                        return null; // 또는 다른 적절한 예외 처리 방법
//                    }
//                })
//                .filter(Objects::nonNull) // null 값을 필터링하여 스트림에서 제외
//                .collect(Collectors.toList());
//
//        int pageSize = findUserChallenge.getPageable().getPageSize();
//        long totalElements = findUserChallenge.getTotalElements();
//        int totalPages = findUserChallenge.getTotalPages();
//        int size = findUserChallenge.getSize();
//
//        return new UserChallengeFeedResponses(size, totalElements, totalPages, pageSize, userChallengeFeedResponse);

    }


    @Transactional
    public void delete(User user, Long userChallengeId) {
        UserChallenge userChallenge = userChallengeRepository.findById(userChallengeId).orElseThrow(() -> {
            throw new EntityNotFoundException(NOT_EXISTS_USER_CHALLENGE_FILE);
        });


        User userChallengeMakeUser = userChallenge.getUser();
        if(user != userChallengeMakeUser){
            throw new AuthorizationException(NOT_AUTHORIZATION);
        }

        userChallengeRepository.deleteById(userChallengeId);
    }


    @Transactional
    public UserChallengeUpdateResponse update(User user, UserChallengeUpdateRequest request) {
        UserChallenge userChallenge = userChallengeRepository.findById(request.getUserChallengeId()).orElseThrow(() -> {
            throw new EntityNotFoundException(NOT_EXISTS_USER_CHALLENGE_FILE);
        });

        User userChallengeMakeUser = userChallenge.getUser();
        if(user != userChallengeMakeUser){
            throw new AuthorizationException(NOT_AUTHORIZATION);
        }

        String updateTitle = request.getTitle();
        userChallenge.changeTitle(updateTitle);
        return UserChallengeUpdateResponse.ofResponse(userChallenge);
    }

    public List<UserChallengeFeedResponse> findByUserId(Long userId) {

        List<UserChallenge> findList = userChallengeRepository.findByUserId(userId);

        return fromEntity(findList);
    }

    private List<UserChallengeFeedResponse> fromEntity(List<UserChallenge> userChallengeList) {

        return userChallengeList.stream()
                .map(c -> {

                    try {
                        byte[] videoData = Files.readAllBytes(Paths.get(c.getVideoPath()));

                        return UserChallengeFeedResponse.of(c, videoData);
                    } catch (IOException e) {

                        log.info("File Exception: {}", e.getMessage());

                        return null;
                    }
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }
}