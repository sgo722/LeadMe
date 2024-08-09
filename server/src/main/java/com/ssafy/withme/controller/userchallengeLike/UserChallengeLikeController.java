package com.ssafy.withme.controller.userchallengeLike;

import com.ssafy.withme.global.config.jwt.TokenProvider;
import com.ssafy.withme.global.response.SuccessResponse;
import com.ssafy.withme.service.userChallengeLike.UserChallengeLikeService;
import lombok.RequiredArgsConstructor;
import org.apache.tomcat.util.http.parser.Authorization;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1")
public class UserChallengeLikeController {

    private static final Logger log = LoggerFactory.getLogger(UserChallengeLikeController.class);
    private final UserChallengeLikeService userChallengeLikeService;
    private final TokenProvider tokenProvider;

    // 유저 게시글 좋아요 기능
    @PostMapping("/userChallenge/like")
    public SuccessResponse<?> likeUserChallenge(
            @RequestHeader("Authorization") String authorization,
            @RequestParam("userChallengeId") Long userChallengeId
    ) {

        String accessToken = authorization.split(" ")[1];

        Long userId = tokenProvider.getUserId(accessToken);

        userChallengeLikeService.likeUserChallenge(userId, userChallengeId);
        return SuccessResponse.of("OK");
    }

    // 유저가 받은 좋아요 수 스케쥴링
    @Scheduled(fixedRate = 1000 * 60) // 1분마다 실행
    public void updateLikesToRDBMS() {
        log.info("1분마다 새로고침");
        userChallengeLikeService.updateLikesFromRedisToRDBMS();
    }
}
