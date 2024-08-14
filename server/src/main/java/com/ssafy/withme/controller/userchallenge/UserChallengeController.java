package com.ssafy.withme.controller.userchallenge;

import com.ssafy.withme.controller.userchallenge.request.UserChallengeAnalyzeRequest;
import com.ssafy.withme.controller.userchallenge.request.UserChallengeDeleteRequest;
import com.ssafy.withme.controller.userchallenge.request.UserChallengeSaveRequest;
import com.ssafy.withme.controller.userchallenge.request.UserChallengeUpdateRequest;
import com.ssafy.withme.domain.user.User;
import com.ssafy.withme.global.annotation.CurrentUser;
import com.ssafy.withme.global.exception.EntityNotFoundException;
import com.ssafy.withme.global.response.ApiResponse;
import com.ssafy.withme.global.response.SuccessResponse;
import com.ssafy.withme.service.userChallenge.UserChallengeService;
import com.ssafy.withme.service.userChallenge.response.*;
import lombok.RequiredArgsConstructor;
import org.apache.tomcat.util.http.parser.Authorization;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/v1/userChallenge")
public class UserChallengeController {

    private final UserChallengeService userChallengeService;

    /**
     * leadMe에 업로드한 사용자들의 영상을 페이징 조회한다.
     * @param pageable
     * @return
     */
    @GetMapping("/feed")
    public SuccessResponse<UserChallengeFeedResponses> findUserChallengeByPageable(
            @PageableDefault(size = 1) Pageable pageable) {
        return SuccessResponse.of(userChallengeService.findUserChallengeByPageable(pageable));
    }

    /**
     * 본인, 타인의 개인 피드를 조회한다.
     * @param pageable
     * @param user
     * @param viewUserId
     * @return
     */
    @GetMapping("/{viewUserId}")
    public SuccessResponse<Page<UserChallengeMyPageResponse>> getUserMyPageFeed(
            @PageableDefault(size = 8) Pageable pageable,
            @CurrentUser User user,
            @PathVariable("viewUserId") Long viewUserId
    ){
        return SuccessResponse.of(userChallengeService.getUserChallengeByUser(pageable, user, viewUserId));
    }

    @GetMapping("/search/{keyword}")
    public SuccessResponse<List> getUserChallengeByKeyword(@PathVariable("keyword") String keyword){

        List<UserChallengeFeedResponse> response = userChallengeService.findByKeyword(keyword);

        return SuccessResponse.of(response);
    }

    /**
     ** 유저영상을 스켈레톤 데이터를 저장하고 영상파일을 임시저장 한다.
     * @param request
     * @param videoFile
     * @return
     * @throws IOException
     */
    @PostMapping("/analyze")
    public ApiResponse<UserChallengeAnalyzeResponse> createUserChallenge(
            @CurrentUser User user,
            @RequestPart("request") UserChallengeAnalyzeRequest request,
            @RequestPart MultipartFile videoFile) throws IOException {

        return SuccessResponse.of(userChallengeService.analyzeVideo(request, videoFile));
    }


    /**
     * 영상 분석 결과를 조회한다.
     * 영상 고유 uuid를 받아서 영상 레포트 정보를 반환한다.
     * @param uuid
     * @return
     */

    @GetMapping("/report/{uuid}")
    public SuccessResponse<UserChallengeReportResponse> findReportByUuid(
            @CurrentUser User user,
            @PathVariable("uuid") String uuid) throws IOException, InterruptedException {
        return SuccessResponse.of(userChallengeService.findReportByUuid(uuid));
    }

    /**
     * 임시저장된 유저 영상파일을 영구저장한다.
     * 유저가 챌린지를 따라 한 후 업로드/저장을 한 경우 사용된다.
     * @param request
     * @return
     */
    @PostMapping("/temporary/save")
    public SuccessResponse<UserChallengeSaveResponse> saveTemporaryFile(
            @CurrentUser User user,
            @RequestBody UserChallengeSaveRequest request) {
        return SuccessResponse.of(userChallengeService.saveUserFile(user, request));
    }

    /**
     * 임시저장된 파일을 영구 삭제한다.
     * 유저가 챌린지를 따라 한 후 재촬영/취소를 한 경우 사용된다.
     * @param request
     * @return
     */
    @PostMapping("/temporary/delete")
    public SuccessResponse<Void> deleteTemporaryFile(
            @CurrentUser User user,
            @RequestBody UserChallengeDeleteRequest request){
        userChallengeService.deleteUserFile(request);
        return SuccessResponse.empty();
    }

    /**
     * 유저 영상을 삭제한다.
     * @param user
     * @param userChallengeId
     */

    @DeleteMapping("/{userChallengeId}")
    public void delete(
            @CurrentUser User user,
            @PathVariable("userChallengeId") Long userChallengeId){
        userChallengeService.delete(user, userChallengeId);
    }

    /**
     * 유저 영상을 수정한다.
     */
    @PutMapping
    public SuccessResponse<UserChallengeUpdateResponse> update(
            @CurrentUser User user,
            @RequestBody UserChallengeUpdateRequest request){
        return SuccessResponse.of(userChallengeService.update(user, request));
    }
}
