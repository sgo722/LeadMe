package com.ssafy.withme.controller.user;

import com.ssafy.withme.domain.user.User;
import com.ssafy.withme.dto.UserInfoDto;
import com.ssafy.withme.global.annotation.CurrentUser;
import com.ssafy.withme.global.response.SuccessResponse;
import com.ssafy.withme.service.user.FollowService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class FollowController {

    private final FollowService followService;

    /**
     * Follower 목록 조회
     * @param user
     * @return
     */
    @GetMapping("/user/follower/list")
    public SuccessResponse<?> getFollowers(@CurrentUser User user) {

        List<UserInfoDto> followers = followService.findFollowers(user.getId());

        return SuccessResponse.of(followers);
    }

    /**
     * Following 목록 조회
     * @param user
     * @return
     */
    @GetMapping("/user/following/list")
    public SuccessResponse<?> getFollowings(@CurrentUser User user) {

        List<UserInfoDto> followings = followService.findFollowing(user.getId());

        return SuccessResponse.of(followings);
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
