package com.ssafy.withme.controller.user;

import com.ssafy.withme.domain.user.Follow;
import com.ssafy.withme.domain.user.User;
import com.ssafy.withme.dto.user.FollowDto;
import com.ssafy.withme.dto.user.UserInfoDto;
import com.ssafy.withme.global.annotation.CurrentUser;
import com.ssafy.withme.global.response.SuccessResponse;
import com.ssafy.withme.service.user.FollowService;
import com.ssafy.withme.service.user.UserService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class FollowController {

    private final FollowService followService;
    private final UserService userService;

    /**
     * Follower 목록 조회
     * @param user
     * @return
     */
    @GetMapping("/user/follower/list")
    public SuccessResponse<?> getFollowers(@CurrentUser User user) {

        List<FollowDto> followers = followService.findFollowers(user.getId());

        return SuccessResponse.of(followers);
    }

    /**
     * Following 목록 조회
     * @param user
     * @return
     */
    @GetMapping("/user/following/list")
    public SuccessResponse<?> getFollowings(@CurrentUser User user) {

        log.info("user: {}", user);

        List<FollowDto> followings = followService.findFollowing(user.getId());

        return SuccessResponse.of(followings);
    }

    @GetMapping("/user/following/check/{userId}")
    public SuccessResponse<String> checkFollowing(@PathVariable Long userId, HttpServletRequest request) {

        String authorization = request.getHeader("Authorization");
        log.info("Authorization at Follow Check: {}", authorization);

        String accessToken = authorization.split(" ")[1];
        log.info("AccessToken at Follow Check: {}", accessToken);

        Boolean following = followService.isFollowing(userService.findUserIdByToken(accessToken).getId(), userId);

        if (following)
            return SuccessResponse.of("FOLLOW");

        return SuccessResponse.of("UNFOLLOW");
    }

    /**
     * Follow 요청 전송
     * @param id 팔로잉 요청을 받을 대상의 id
     * @param user
     * @return
     */
    @PostMapping("/user/following/send/{id}")
    public SuccessResponse<?> sendFollowing(@PathVariable("id") Long id, @CurrentUser User user) {

        followService.following(id, user.getId());

        return SuccessResponse.of(true);
    }

    /**
     * Unfollow
     * @param id 팔로잉 하는 대상의 id
     * @param user
     * @return
     */
    @DeleteMapping("/user/following/unfollow/{id}")
    public SuccessResponse<?> unfollow(@PathVariable Long id, @CurrentUser User user) {

        followService.unfollowing(id, user.getId());

        return SuccessResponse.of(true);
    }

    /**
     * 팔로워 삭제
     * @param id 본인을 팔로잉 하고있는 대상의 id
     * @param user
     * @return
     */
    @DeleteMapping("/user/follower/unfollow/{id}")
    public SuccessResponse<?> deleteFollower(@PathVariable Long id, @CurrentUser User user) {

        followService.unfollowing(user.getId(), id);

        return SuccessResponse.of(true);
    }
}
