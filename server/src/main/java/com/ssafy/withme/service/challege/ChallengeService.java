package com.ssafy.withme.service.challege;

import com.ssafy.withme.controller.challenge.request.ChallengeCreateRequest;
import com.ssafy.withme.domain.challenge.Challenge;
import com.ssafy.withme.domain.challengeHashtag.ChallengeHashTag;
import com.ssafy.withme.domain.hashtag.Hashtag;
import com.ssafy.withme.domain.landmark.Landmark;
import com.ssafy.withme.global.exception.EntityNotFoundException;
import com.ssafy.withme.repository.challenge.ChallengeRepository;
import com.ssafy.withme.repository.challengeHashtag.ChallengeHashtagRepository;
import com.ssafy.withme.repository.hashtag.HashtagRepository;
import com.ssafy.withme.repository.landmark.LandmarkRepository;

import com.ssafy.withme.service.userChallenge.response.LandmarkResponse;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Value;

import com.ssafy.withme.service.challege.response.ChallengeCreateResponse;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static com.ssafy.withme.global.error.ErrorCode.NOT_EXISTS_CHALLENGE;
import static com.ssafy.withme.global.error.ErrorCode.NOT_EXISTS_CHALLENGE_SKELETON_DATA;


@RequiredArgsConstructor
@Service
public class ChallengeService {

    private final HashtagRepository hashtagRepository;
    @Value("${python-server.url}")
    String FAST_API_URL;

    private final ChallengeRepository challengeRepository;

    private final LandmarkRepository landmarkRepository;

    private final ChallengeHashtagRepository challengeHashTagRepository;


    private final RestTemplate restTemplate;


    @Value("${python-server.permanent-challenge-thumbnail-directory}")
    String THUMBNAIL_DIRECTORY;

    @Value("${python-server.permanent-challenge-directory}")
    String CHALLENGE_DIRECTORY;

    /**
     * 수작업으로 해야하는 작업..
     * 클라이언트가 영상을 가지고 요청하면 youtubeId, url, hashtags를 등록한다.
     * videoFile을 블레이즈포즈를 이용해 몽고디비에 데이터를 저장하면서, 챌린지를 저장한다.
     * 챌린지 썸네일도 저장해야한다.
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

        String url = FAST_API_URL + "/admin/challenge";
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("videoFile", new ByteArrayResource(videoFile.getBytes()) {
            @Override
            public String getFilename() {
                return videoFile.getOriginalFilename();
            }
        });
        body.add("youtubeId", request.getYoutubeId());


        Challenge challenge = request.toEntity();
        Challenge savedChallenge = challengeRepository.save(challenge);
        ArrayList<String> hashtags = request.getHashtags();
        for(String hashtag : hashtags){
            Hashtag savedHashtag = hashtagRepository.save(new Hashtag(hashtag));
            ChallengeHashTag challengeHashTag = ChallengeHashTag.builder()
                    .challenge(savedChallenge)
                    .hashtag(savedHashtag)
                    .build();
            challengeHashTagRepository.save(challengeHashTag);
        }


        try{
            String finalFileName = request.getYoutubeId() + ".mp4";
            Path permanentVideoPath = Paths.get(CHALLENGE_DIRECTORY, finalFileName);

            String challengeVideoPath = extractThumbnail(permanentVideoPath, request.getYoutubeId());
            savedChallenge.setVideoPath(challengeVideoPath);
        }catch (InterruptedException e) {
            e.printStackTrace();
        }

        
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

        return thumbnailPath.toString();
    }
}
