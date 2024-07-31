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

    @GetMapping("/user/follower/list")
    public SuccessResponse<?> getFollowers(@CurrentUser User user) {

        List<UserInfoDto> followers = followService.findFollowers(user.getId());

        return SuccessResponse.of(followers);
    }

    @GetMapping("/user/following/list")
    public SuccessResponse<?> getFollowings(@CurrentUser User user) {

        List<UserInfoDto> followings = followService.findFollowing(user.getId());

        return SuccessResponse.of(followings);
    }

    @PostMapping("/user/following/")

    @DeleteMapping("/user/following/unfollow/{id}")
    public SuccessResponse<?> unfollow(@PathVariable Long id, @CurrentUser User user) {

        followService.unfollowing(id, user.getId());

        return SuccessResponse.of(true);
    }

    @DeleteMapping("/user/follower/unfollow/{id}")
    public SuccessResponse<?> deleteFollower(@PathVariable Long id, @CurrentUser User user) {

        followService.unfollowing(user.getId(), id);

        return SuccessResponse.of(true);
    }
}
