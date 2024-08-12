package com.ssafy.withme.controller.challenge;

import com.ssafy.withme.controller.challenge.request.ChallengeCreateRequest;
import com.ssafy.withme.domain.BaseEntity;
import com.ssafy.withme.domain.user.User;
import com.ssafy.withme.global.annotation.CurrentUser;
import com.ssafy.withme.global.response.ApiResponse;
import com.ssafy.withme.global.response.SuccessResponse;
import com.ssafy.withme.service.challege.ChallengeService;
import com.ssafy.withme.service.challege.response.ChallengeBattleListResponse;
import com.ssafy.withme.service.challege.response.ChallengeCreateResponse;
<<<<<<< Updated upstream
import com.ssafy.withme.service.challege.response.ChallengeViewResponse;
=======
import com.ssafy.withme.service.challege.response.ChallengeYoutubeIdResponse;
>>>>>>> Stashed changes
import com.ssafy.withme.service.userChallenge.UserChallengeService;
import com.ssafy.withme.service.userChallenge.response.LandmarkResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
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
     * [DEPRECATED - 사용되지않음]
     * 클라이언트가 youtubeURL로 요청하면 영상을 저장하고, 몽고디비에 스켈레톤 데이터를 저장한다.
     * @param request
     */
//    @PostMapping("/api/v1/challenge")
//    public SuccessResponse<ChallengeCreateResponse> createChallenge(@RequestBody ChallengeCreateRequest request){
//        return SuccessResponse.of(challengeService.createChallenge(request));
//    }

    /**
     * [유튜브 기능 마비로 인한 대체 메서드]
     * 관리자가 영상을 추가할 수 있다.
     * 영상을 추가하면 스켈레톤 데이터와 challenge가 생성된다.
     * @param request
     * @param videoFile
     * @return
     * @throws IOException
     */

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
    public SuccessResponse<LandmarkResponse> findLandMarkByVideoName(
            @CurrentUser User user,
            @PathVariable String youtubeId) throws Exception {
        return SuccessResponse.of(challengeService.getLandMarkByYoutubeId(youtubeId));
    }

    @GetMapping("/api/v1/challenge/list")
    public SuccessResponse<ChallengeYoutubeIdResponse> findByChallengeYoutubeId(){
        return SuccessResponse.of(challengeService.findAllChallengeYoutubeId());
    }


    /**
     * [메인페이지 챌린지 조회 기능]
     * 직접 저장한 유튜브 챌린지 영상들을 페이징 조회한다.
     *  기본적으로 4개의 영상정보를 반환한다.
     * @param pageable
     * @return
     */
    @GetMapping("/api/v1/challenge")
    public SuccessResponse<Page<ChallengeViewResponse>> findChallengeByPaging(@PageableDefault(size = 4) Pageable pageable){
        return SuccessResponse.of(challengeService.findChallengeByPaging(pageable));
    }


    /**
     * [메인페이지 챌린지 검색 기능]
     * 직접 저장한 유튜브 챌린지 영상들을 검색한다.
     *  기본적으로 4개의 영상 정보를 반환한다.
     * @param pageable
     * @param title
     * @return
     */
    @GetMapping("/api/v1/challenge/search")
    public SuccessResponse<Page<ChallengeViewResponse>> searchChallengeByPaging(
            @PageableDefault(size = 4) Pageable pageable,
            @RequestParam(name = "title") String title) {
        return SuccessResponse.of(challengeService.searchChallengeByPaging(pageable,title));
    }

    /**
     * 챌린지 목록을 조회한다.
     */
    @GetMapping("/api/v1/challenge/battleList")
    public SuccessResponse<List<ChallengeBattleListResponse>> findAllChallenge(){
        return SuccessResponse.of(challengeService.findAllChallenge());
    }

    @PutMapping("/api/v1/challenge/thumbnail-url")
    public SuccessResponse<?> updateChallengeThumbnailUrl() {
        challengeService.updateChallengeThumbnailUrl();
        return SuccessResponse.of(true);
    }

}
