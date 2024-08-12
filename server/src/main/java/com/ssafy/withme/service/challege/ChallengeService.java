package com.ssafy.withme.service.challege;

import com.ssafy.withme.controller.challenge.request.ChallengeCreateRequest;
import com.ssafy.withme.domain.challenge.Challenge;
import com.ssafy.withme.domain.challenge.ChallengeEditor;
import com.ssafy.withme.domain.challengeHashtag.ChallengeHashTag;
import com.ssafy.withme.domain.hashtag.Hashtag;
import com.ssafy.withme.domain.landmark.Landmark;
import com.ssafy.withme.domain.user.User;
import com.ssafy.withme.global.exception.EntityNotFoundException;
import com.ssafy.withme.repository.challenge.ChallengeRepository;
import com.ssafy.withme.repository.challengeHashtag.ChallengeHashtagRepository;
import com.ssafy.withme.repository.hashtag.HashtagRepository;
import com.ssafy.withme.repository.landmark.LandmarkRepository;

import com.ssafy.withme.service.challege.response.ChallengeBattleListResponse;
import com.ssafy.withme.service.challege.response.ChallengeViewResponse;
import com.ssafy.withme.service.challege.response.ChallengeYoutubeIdResponse;
import com.ssafy.withme.service.userChallenge.response.LandmarkResponse;
import com.ssafy.withme.service.youtube.YouTubeService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Value;

import com.ssafy.withme.service.challege.response.ChallengeCreateResponse;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.*;
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
import java.util.List;
import java.util.Objects;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

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

    private final YouTubeService youTubeService;

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
        // 이미 저장되어 있는지 확인한다.


        String youtubeId = request.getYoutubeId();
        Challenge challengeByYoutubeId = challengeRepository.findByYoutubeId(youtubeId);
        // 저장된 적이 있다면? 스켈레톤 데이터를 반환한다.
        if(challengeByYoutubeId != null){
            Landmark landmark = landmarkRepository.findByYoutubeId(challengeByYoutubeId.getYoutubeId());
            System.out.println(landmark);
            if(landmark == null){
                throw new EntityNotFoundException(NOT_EXISTS_CHALLENGE_SKELETON_DATA);
            }
            return ChallengeCreateResponse.toResponse(challengeByYoutubeId);
        }

        // 저장된 적이 없다면? 파이썬에 요청을 보내서 영상을 저장하고 데이터베이스(몽고디비, MySQL)에 저장한다.
        String url = FAST_API_URL + "/admin/challenge";
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("videoFile", new ByteArrayResource(videoFile.getBytes()) {
            @Override
            public String  getFilename() {
                return videoFile.getOriginalFilename();
            }
        });
        body.add("youtubeId", request.getYoutubeId());


        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

        // Fast API 반환값
        ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, requestEntity, String.class);

        // 챌린지 정보를 저장한다.
        Challenge challenge = request.toEntity();
        Challenge savedChallenge = challengeRepository.save(challenge);

        // 저장된 영상의 해시태그를 저장한다.
        ArrayList<String> hashtags = request.getHashtags();
        for(String hashtag : hashtags){
            Hashtag findHashtagByName = hashtagRepository.findByName(hashtag);
            if(findHashtagByName == null){
                findHashtagByName = hashtagRepository.save(new Hashtag(hashtag));
            }

            ChallengeHashTag challengeHashTag = ChallengeHashTag.builder()
                    .challenge(savedChallenge)
                    .hashtag(findHashtagByName)
                    .build();
            challengeHashTagRepository.save(challengeHashTag);
        }


        // 썸네일을 파일로 생성하고, 썸네일 경로를 데이터베이스(MySQL)에 저장한다.
        try{
            String finalFileName = request.getYoutubeId() + ".mp4";
            Path permanentVideoPath = Paths.get(CHALLENGE_DIRECTORY, finalFileName);

            String challengeThumbnail = extractThumbnail(permanentVideoPath, request.getYoutubeId());
            savedChallenge.setThumbnail(challengeThumbnail);
            challengeRepository.save(savedChallenge);
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

        // MySQL엔 저장된 정보가 있지만, 몽고디비엔 저장되지않은 경우 예외를 발생시킨다.
        if(findLandmarkByYoutubeId == null){
            throw new EntityNotFoundException(NOT_EXISTS_CHALLENGE_SKELETON_DATA);
        }
        return LandmarkResponse.ofResponse(findLandmarkByYoutubeId, challenge.getId());
    }

    /**
     * 직접 저장한 유튜브 챌린지 영상들을 페이징 조회한다.
     *  기본적으로 4개의 영상정보를 반환한다.
     * @param pageable
     * @return
     */
    public Page<ChallengeViewResponse> findChallengeByPaging(Pageable pageable) {
        // 페이징 조회로 Challenge를 가져온다.
        Page<Challenge> findChallengeByPaging = challengeRepository.findAll(pageable);

        // 썸네일 경로의 파일을 바이트코드로 변환하고, ResponseDto를 만들어서 반환한다.
        List<ChallengeViewResponse> challengeResponses = findChallengeByPaging.stream()
                .map(challenge -> {
                    try {
                        List<ChallengeHashTag> findHashtagByChallengeId = challengeHashTagRepository.findAllByChallengeId(challenge.getId());
                        List<String> hashtags = findHashtagByChallengeId.stream()
                                .filter(challengeHashtag -> challengeHashtag == null)
                                .map(challengeHashtag -> hashtagRepository.findById(challengeHashtag.getId()).get().getName())
                                .toList();
                        return ChallengeViewResponse.ofResponse(challenge, hashtags);
                    } catch (Exception e) {
                        // 예외 처리 로직을 여기에 추가
                        e.printStackTrace();
                        return null; // 또는 다른 적절한 예외 처리 방법
                    }
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        return new PageImpl<>(challengeResponses, pageable, findChallengeByPaging.getTotalElements());
    }

    public List<ChallengeViewResponse> findAll() {
        // 페이징 조회로 Challenge를 가져온다.
        List<Challenge> findAllChallenge = challengeRepository.findAll();

        // 썸네일 경로의 파일을 바이트코드로 변환하고, ResponseDto를 만들어서 반환한다.
        List<ChallengeViewResponse> challengeResponses = findAllChallenge.stream()
                .map(challenge -> {
                    try {
                        List<ChallengeHashTag> findHashtagByChallengeIds = challengeHashTagRepository.findAllByChallengeId(challenge.getId());
                        List<String> hashtags = findHashtagByChallengeIds.stream()
                                .map(challengeHashtag -> hashtagRepository.findById(challengeHashtag.getId())
                                        .map(Hashtag::getName)
                                        .orElse(null))
                                .filter(Objects::nonNull) // null인 해시태그를 필터링
                                .toList();
                        return ChallengeViewResponse.ofResponse(challenge, hashtags);
                    } catch (Exception e) {
                        // 예외 처리 로직
                        e.printStackTrace();
                        return null; // 또는 다른 적절한 예외 처리 방법
                    }
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        return challengeResponses;
    }


    /**
     * [메인페이지 챌린지 검색 기능]
     * 직접 저장한 유튜브 챌린지 영상들을 검색한다.
     * @param title
     * @return
     */
    public ChallengeYoutubeIdResponse searchChallengeYoutubeList(String title) {

        // 키워드로 Challenge를 조회한다.
        challengeRepository.findByTitleContaining(title);
        List<String> searchChallengeYoutubeId = challengeRepository.findByTitleContaining(title);
        return new ChallengeYoutubeIdResponse(searchChallengeYoutubeId);
    }

    /**
     * 썸네일 추출 메서드
     * 썸네일은 영상 길이의 3/5 구간의 이미지를 추출한다.
     * @param videoPath
     * @param fileName
     * @return
     * @throws IOException
     * @throws InterruptedException
     */

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

    /**
     * 챌린지 목록에서 유튜브 썸네일 이미지 주소가 없는 목록을 가져와 유튜브 api를 활용해 썸네일 주소를 입력해준다.
     */
    @Transactional
    public void updateChallengeThumbnailUrl() {

        List<Challenge> challenges = challengeRepository.findAllWithThumbnailUrlIsNull();
        for(Challenge challenge: challenges) {

            ChallengeEditor.ChallengeEditorBuilder challengeEditorBuilder = challenge.toEditor();
            ChallengeEditor challengeEditor =  challengeEditorBuilder.
                    thumbnailUrl(youTubeService
                            .getYoutubeThumbnailUrl(challenge.getYoutubeId()))
                    .build();

            challenge.edit(challengeEditor);
        }
    }

    /**
     *  블레이즈 포즈 정보를 업데이트 한다.
     */
    public void updateBlazePoseData() {
        List<Challenge> challenges = challengeRepository.findAllWithNeedToUpdate();

        for(Challenge challenge: challenges) {

            // 저장된 적이 없다면? 파이썬에 요청을 보내서 영상을 저장하고 데이터베이스(몽고디비, MySQL)에 저장한다.
            String url = FAST_API_URL + "/admin/challenge/mongodb";
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("youtubeId", challenge.getYoutubeId());
            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

            // Fast API 반환값
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, requestEntity, String.class);

        }
    }

    public List<ChallengeBattleListResponse> findAllChallenge() {

        List<Challenge> findAllChallenges = challengeRepository.findAll();
        return findAllChallenges.stream()
                .map(challenge -> ChallengeBattleListResponse.ofResponse(challenge))
                .collect(Collectors.toList());


    }

    public ChallengeYoutubeIdResponse findAllChallengeYoutubeId() {
        return new ChallengeYoutubeIdResponse(challengeRepository.findAllYoutubeId());
    }


}
