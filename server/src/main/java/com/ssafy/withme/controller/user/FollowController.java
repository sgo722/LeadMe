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
    public SuccessResponse<?> getFollowers(@RequestHeader("Authorization")String authorization) {

        Long userId = userService.findUserIdByToken(authorization.split(" ")[1]);

        List<FollowDto> followers = followService.findFollowers(userId);

        return SuccessResponse.of(followers);
    }

    /**
     * Following 목록 조회
     * @param user
     * @return
     */
    @GetMapping("/user/following/list")
    public SuccessResponse<?> getFollowings(@RequestHeader("Authorization")String authorization) {

        Long userId = userService.findUserIdByToken(authorization.split(" ")[1]);

        List<FollowDto> followings = followService.findFollowing(userId);

        return SuccessResponse.of(followings);
    }

    @GetMapping("/user/following/check/{userId}")
    public SuccessResponse<String> checkFollowing(@PathVariable Long userId,
                                                  @RequestHeader("Authorization")String authorization) {

        Long findUserId = userService.findUserIdByToken(authorization.split(" ")[1]);

        Boolean following = followService.isFollowing(findUserId, userId);

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
    public SuccessResponse<?> sendFollowing(@PathVariable("id") Long id,
                                            @RequestHeader("Authorization")String authorization) {

        Long findUserId = userService.findUserIdByToken(authorization.split(" ")[1]);

        followService.following(id, findUserId);

        return SuccessResponse.of(true);
    }

    /**
     * Unfollow
     * @param id 팔로잉 하는 대상의 id
     * @param user
     * @return
     */
    @DeleteMapping("/user/following/unfollow/{id}")
    public SuccessResponse<?> unfollow(@PathVariable Long id,
                                       @RequestHeader("Authorization")String authorization) {

        Long findUserId = userService.findUserIdByToken(authorization.split(" ")[1]);

        followService.unfollowing(id, findUserId);

        return SuccessResponse.of(true);
    }

    /**
     * 팔로워 삭제
     * @param id 본인을 팔로잉 하고있는 대상의 id
     * @param user
     * @return
     */
    @DeleteMapping("/user/follower/unfollow/{id}")
    public SuccessResponse<?> deleteFollower(@PathVariable Long id,
                                             @RequestHeader("Authorization")String authorization) {

        Long findUserId = userService.findUserIdByToken(authorization.split(" ")[1]);

        followService.unfollowing(findUserId, id);

        return SuccessResponse.of(true);
    }
}
