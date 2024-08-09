package com.ssafy.withme.controller.challenge;

import com.ssafy.withme.controller.challenge.request.ChallengeCreateRequest;
import com.ssafy.withme.domain.BaseEntity;
import com.ssafy.withme.global.response.ApiResponse;
import com.ssafy.withme.global.response.SuccessResponse;
import com.ssafy.withme.service.challege.ChallengeService;
import com.ssafy.withme.service.challege.response.ChallengeCreateResponse;
import com.ssafy.withme.service.challege.response.ChallengeViewResponse;
import com.ssafy.withme.service.userChallenge.UserChallengeService;
import com.ssafy.withme.service.userChallenge.response.LandmarkResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RequiredArgsConstructor
@RestController
public class ChallengeController extends BaseEntity {

    private final ChallengeService challengeService;
    private final UserChallengeService userChallengeService;

    /**
     * 클라이언트가 youtubeURL로 요청하면 영상을 저장하고, 몽고디비에 스켈레톤 데이터를 저장한다.
     * @param request
     */
//    @PostMapping("/api/v1/challenge")
//    public SuccessResponse<ChallengeCreateResponse> createChallenge(@RequestBody ChallengeCreateRequest request){
//        return SuccessResponse.of(challengeService.createChallenge(request));
//    }

    @PostMapping("/api/v1/admin/challenge")
    public ApiResponse<ChallengeCreateResponse> create(@RequestPart("request") ChallengeCreateRequest request,
                                    @RequestPart MultipartFile videoFile) throws IOException {

        return SuccessResponse.of(challengeService.createChallenge(request,videoFile));
    }


    /**
     * 프론트엔드에서 youtubeId를 파라미터로 담아 요청하면 스켈레톤 데이터를 반환한다.
     * @param youtubeId
     * @return
     */
    @GetMapping("/api/v1/challenge/{youtubeId}")
    public SuccessResponse<LandmarkResponse> findLandMarkByVideoName(@PathVariable String youtubeId) throws Exception {
        return SuccessResponse.of(challengeService.getLandMarkByYoutubeId(youtubeId));
    }


    /**
     * 서버에 있는 유튜브 챌린지 영상들을 조회한다.
     */
    @GetMapping("/api/v1/challenge")
    public SuccessResponse<List<ChallengeViewResponse>> findChallengeByPaging(@PageableDefault(size = 4) Pageable pageable){
        return SuccessResponse.of(challengeService.findChallengeByPaging(pageable));

    }

}
