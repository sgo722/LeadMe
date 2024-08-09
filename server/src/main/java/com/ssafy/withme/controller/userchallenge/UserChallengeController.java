package com.ssafy.withme.controller.userchallenge;

import com.ssafy.withme.controller.userchallenge.request.UserChallengeAnalyzeRequest;
import com.ssafy.withme.controller.userchallenge.request.UserChallengeDeleteRequest;
import com.ssafy.withme.controller.userchallenge.request.UserChallengeSaveRequest;
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
     * 영상 분석 결과를 조회한다.
     * 영상 고유 uuid를 받아서 영상 레포트 정보를 반환한다.
     * @param uuid
     * @return
     */

    @GetMapping("/report/{uuid}")
    public SuccessResponse<UserChallengeReportResponse> findReportByUuid(@PathVariable("uuid") String uuid) throws IOException, InterruptedException {
        return SuccessResponse.of(userChallengeService.findReportByUuid(uuid));
    }

    /**
     * leadMe에 업로드한 사용자들의 영상을 페이징 조회한다.
     * @param pageable
     * @return
     */
    @GetMapping("/feed")
    public SuccessResponse<List<UserChallengeFeedResponse>> findUserChallengeByPageable(
            @PageableDefault(size = 3) Pageable pageable) {
        return SuccessResponse.of(userChallengeService.findUserChallengeByPageable(pageable));
    }

    /**
     ** 유저의 스켈레톤 데이터를 받아와서 알고리즘으로 분석률을 반환한다.
     * @param request
     * @param videoFile
     * @return
     * @throws IOException
     */
    @PostMapping("/analyze")
    public ApiResponse<UserChallengeAnalyzeResponse> createUserChallenge(@RequestPart("request") UserChallengeAnalyzeRequest request,
                                                                         @RequestPart MultipartFile videoFile) throws IOException {

        return SuccessResponse.of(userChallengeService.analyzeVideo(request, videoFile));
    }

    /**
     ** uuid와 fileName을 받아 임시저장 파일에서 해당 영상을 찾아 영구저장 파일로 이동시키고 파일 이름을 변경하여 영구저장한다.
     * @param request
     * @return
     */
    @PostMapping("/temporary/save")
    public SuccessResponse<UserChallengeSaveResponse> saveTemporaryFile(@RequestBody UserChallengeSaveRequest request) {
        return SuccessResponse.of(userChallengeService.saveUserFile(request));
    }

    /**
     * 유저 영상 uuid를 받아 임시저장폴더에서 해당 영상을 찾아서 삭제한다.
     * @param request
     * @return
     */
    @PostMapping("/temporary/delete")
    public SuccessResponse<Void> deleteTemporaryFile(@RequestBody UserChallengeDeleteRequest request){
        userChallengeService.deleteUserFile(request);
        return SuccessResponse.empty();
    }

    @GetMapping("/{viewUserId}")
    public SuccessResponse<Page<UserChallengeMyPageResponse>> getUserMyPageFeed(
            @PageableDefault(size = 8) Pageable pageable,
            @CurrentUser User user,
            @PathVariable("viewUserId") Long viewUserId
    ){
        return SuccessResponse.of(userChallengeService.getUserChallengeByUser(pageable, user, viewUserId));
    }

}
