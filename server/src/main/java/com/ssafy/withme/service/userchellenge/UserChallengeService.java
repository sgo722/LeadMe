package com.ssafy.withme.service.userchellenge;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.withme.controller.userchallenge.request.UserChallengeAnalyzeRequest;
import com.ssafy.withme.controller.userchallenge.request.UserChallengeDeleteRequest;
import com.ssafy.withme.service.userchellenge.response.UserChallengeFeedResponse;
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
import com.ssafy.withme.repository.userchallenge.UserChallengeRepository;
import com.ssafy.withme.service.userchellenge.response.UserChallengeAnalyzeResponse;
import com.ssafy.withme.service.userchellenge.response.UserChallengeReportResponse;
import com.ssafy.withme.service.userchellenge.response.UserChallengeSaveResponse;
import com.ssafy.withme.service.userchellenge.response.UserChallengeMyPageResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
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

import static com.ssafy.withme.global.error.ErrorCode.*;

@RequiredArgsConstructor
@Service
@Slf4j
public class UserChallengeService {

    @Value("${python-server.temp-directory}")
    String TEMP_DIRECTORY;

    @Value("${python-server.permanent-directory}")
    String PERMANENT_DIRECTORY;

    @Value("${python-server.url}")
    String FAST_API_URL;

    @Value("${python-server.youtube-audio-directory}")
    String AUDIO_DIRECTORY;


    @Value("${python-server.permanent-thumbnail-directory}")
    String THUMBNAIL_DIRECTORY;

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

    public UserChallengeAnalyzeResponse analyzeVideo(UserChallengeAnalyzeRequest request, MultipartFile videoFile) throws EntityNotFoundException, IOException {
        // 챌린지 아이디
        Long challengeId = request.getChallengeId();

        // 챌린지 아이디를 기반으로 저장되어 있는 챌린지 정보 조회
        Challenge challenge = challengeRepository.findById(challengeId).orElse(null);

        // 조회한 챌린지가 없는 경우 예외처리
        if (challenge == null) {
            throw new EntityNotFoundException(NOT_EXISTS_CHALLENGE);
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

        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

        // Fast API 반환값
        ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, requestEntity, String.class);

        String result = response.getBody();
        ObjectMapper objectMapper = new ObjectMapper();
        JsonNode rootNode = objectMapper.readTree(result);
        String uuid = rootNode.path("uuid").asText();

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
        log.info(" 반환 점수 : {}", calculateResult.get("score"));

        Report report = Report.builder()
                .uuid(uuid)
                .scoreHistory((double[]) calculateResult.get("scoreHistory"))
                .totalScore((Double) calculateResult.get("totalScore"))
                .challengeId(request.getChallengeId())
                .build();
        Report save = reportRepository.insert(report);
        System.out.println(save);

        return UserChallengeAnalyzeResponse.builder()
                .uuid(uuid)
                .build();
    }


    /**
     * 파이썬 서버에서 받아온 keypoints 값을 역직렬화 진행
     *
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
     * uuid와 fileName을 받아 임시저장 파일에서 해당 영상을 찾아 영구저장 파일로 이동시키고 파일 이름을 변경하여 영구저장한다.
     *
     * @param request
     */
    public UserChallengeSaveResponse saveUserFile(UserChallengeSaveRequest request) {
        Challenge challenge = challengeRepository.findById(request.getChallengeId()).orElse(null);
//        User user = userRepository.findById(request.getUserId()).get();

        log.info("설정된 폴더 경로 " + TEMP_DIRECTORY);
        log.info("uuid : " + request.getUuid());

        Path tempVideoPath = Paths.get(TEMP_DIRECTORY, request.getUuid() + "_merged.mp4");

        log.info("임시 비디오 경로 : " + tempVideoPath.toString());

        if (!Files.exists(tempVideoPath)) {
            throw new FileNotFoundException(NOT_EXISTS_USER_CHALLENGE_FILE);
        }


        try {
            // 영구 저장 경로로 이동 및 파일명 변경
            String finalFileName = request.getFileName() + ".mp4";
            Path permanentVideoPath = Paths.get(PERMANENT_DIRECTORY, finalFileName);
            Files.move(tempVideoPath, permanentVideoPath);

            String thumbnailPath = extractThumbnail(permanentVideoPath, request.getFileName());

            UserChallenge userChallenge = UserChallenge.builder()
                    .fileName(request.getFileName())
//                    .user(user)
                    .challenge(challenge)
                    .videoPath(PERMANENT_DIRECTORY + "/" + finalFileName)
                    .access(request.getAccess())
                    .uuid(request.getUuid())
                    .thumbnailPath(thumbnailPath)
                    .build();
            UserChallenge savedUserChallenge = userChallengeRepository.save(userChallenge);

            Report findReportByUuid = reportRepository.findByUuid(request.getUuid());
            findReportByUuid.setUserChallengeId(savedUserChallenge.getId());
            reportRepository.save(findReportByUuid);
            return UserChallengeSaveResponse.ofResponse(savedUserChallenge);
        } catch (IOException e) {
            e.printStackTrace();
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        return null;
    }

    /**
     * 유저 영상 uuid를 받아 임시저장폴더에서 해당 영상을 찾아서 삭제한다.
     *
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
            Report findReportByUuid = reportRepository.findByUuid(request.getUuid());
            reportRepository.delete(findReportByUuid);
        } catch (IOException e) {
            e.printStackTrace();
        }

    }

    /**
     * uuid를 기반으로 영상 분석데이터를 조회한다.
     *
     * @param uuid
     * @return
     */

    public UserChallengeReportResponse findReportByUuid(String uuid) throws IOException, InterruptedException {
        Report report = reportRepository.findByUuid(uuid);
//        UserChallenge userChallenge = userChallengeRepository.findByUuid(uuid);
        Challenge challenge = challengeRepository.findById(report.getChallengeId()).get();
        Long challengeId = challenge.getId();
        String youtubeId = challenge.getYoutubeId();
        String videoPath = TEMP_DIRECTORY + "/" + uuid + ".mp4";
        String audioPath = AUDIO_DIRECTORY + "/" + uuid + ".mp3";
        String outputPath = TEMP_DIRECTORY + "/" + uuid + "_merged.mp4";

        byte[] mergedVideoFile = mergeVideoAndAudio(videoPath, audioPath, outputPath);


        return UserChallengeReportResponse.ofResponse(report, challengeId, youtubeId, mergedVideoFile);
    }


    public List<UserChallengeFeedResponse> findUserChallengeByPageable(Pageable pageable) {
        //유저 영상 중 access = "public" 인 영상들을 페이징 조회한다.
        Page<UserChallenge> findUserChallenge = userChallengeRepository.findByAccessOrderByCreatedDateDesc("public", pageable);

        return findUserChallenge.stream()
                .map(userChallenge -> {
                    try {
                        byte[] thumbnail = Files.readAllBytes(Paths.get(userChallenge.getThumbnailPath()));
                        return UserChallengeFeedResponse.ofResponse(userChallenge, thumbnail);
                    } catch (Exception e) {
                        // 예외 처리 로직을 여기에 추가
                        e.printStackTrace();
                        return null; // 또는 다른 적절한 예외 처리 방법
                    }
                })
                .filter(Objects::nonNull) // null 값을 필터링하여 스트림에서 제외
                .collect(Collectors.toList());
    }

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

    private String extractThumbnail(Path videoPath, String fileName) throws IOException, InterruptedException {
        // 비디오 길이 확인
        String durationCommand = String.format("ffmpeg -i %s", videoPath.toString());
        Process process = Runtime.getRuntime().exec(durationCommand);
        BufferedReader reader = new BufferedReader(new InputStreamReader(process.getErrorStream()));

        String line;
        String durationStr = null;
        Pattern pattern = Pattern.compile("Duration: (\\d{2}):(\\d{2}):(\\d{2}\\.\\d{2})");

        while ((line = reader.readLine()) != null) {
            Matcher matcher = pattern.matcher(line);
            if (matcher.find()) {
                durationStr = matcher.group(0);
                break;
            }
        }
        process.waitFor();

        if (durationStr == null) {
            throw new IOException("Failed to retrieve video duration.");
        }

        log.info("비디오 길이 : " + durationStr);

        // 비디오 길이를 초 단위로 변환
        String[] timeParts = durationStr.split(":");
        String[] secondPart = timeParts[3].split("//.");
        int minutes = Integer.parseInt(timeParts[2]);
        double seconds = Double.parseDouble(secondPart[0]);
        double totalDuration = minutes * 60 + seconds;

        // 3/5 지점 계산
        double targetTime = totalDuration * 3 / 5;

        // 썸네일 추출
        String thumbnailFileName = fileName + ".png";
        Path thumbnailPath = Paths.get(THUMBNAIL_DIRECTORY, thumbnailFileName);

        // 디렉토리 존재 여부 확인 및 생성
        Files.createDirectories(thumbnailPath.getParent());

        // 수정된 부분 시작
        String thumbnailCommand = String.format("ffmpeg -i %s -ss %f -vframes 1 %s", videoPath.toString(), targetTime, thumbnailPath.toString());
        ProcessBuilder builder = new ProcessBuilder(thumbnailCommand.split(" "));
        builder.redirectErrorStream(true);

        Process thumbnailProcess = builder.start();

        // 프로세스 출력 로그
        reader = new BufferedReader(new InputStreamReader(thumbnailProcess.getInputStream()));


        // 수정된 부분 끝

        log.info("썸네일 경로 : " + thumbnailPath.toString());

        return thumbnailPath.toString();
    }

    public Page<UserChallengeMyPageResponse> getUserChallengeByUser(Pageable pageable, Long userId) {
        Page<UserChallenge> userChallengeByPaging = userChallengeRepository.findByUserIdOrderByCreatedDateDesc(userId, pageable);

        return userChallengeByPaging
                .map(userChallenge -> {
                    try {
                        Path thumbnailPath = new File(userChallenge.getThumbnailPath()).toPath();
                        byte[] thumbnailBytes = Files.readAllBytes(thumbnailPath);
                        return UserChallengeMyPageResponse.responseOf(userChallenge, thumbnailBytes);
                    } catch (IOException e) {
                        throw new FileNotFoundException(NOT_EXISTS_USER_CHALLENGE_THUMBNAIL_FILE);
                    }
                });
    }
}