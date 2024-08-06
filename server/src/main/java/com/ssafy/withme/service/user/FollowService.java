package com.ssafy.withme.service.user;

import com.ssafy.withme.domain.user.Follow;
import com.ssafy.withme.domain.user.User;
import com.ssafy.withme.dto.user.UserInfoDto;
import com.ssafy.withme.global.error.ErrorCode;
import com.ssafy.withme.global.exception.BusinessException;
import com.ssafy.withme.repository.user.FollowRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class FollowService {

    private final FollowRepository followRepository;

    private final UserService userService;


    // 팔로잉 리스트 조회
    public List<UserInfoDto> findFollowing(Long userId) {

        User findUser = userService.findById(userId);

        List<UserInfoDto> findFollowingList = findUser.getFromFollowList().stream()
                .map(Follow::getToUser)
                .map(UserInfoDto::from)
                .toList();

        return findFollowingList;
    }

    // 팔로워 리스트 조회
    public List<UserInfoDto> findFollowers(Long userId) {

        User findUser = userService.findById(userId);

        List<UserInfoDto> findFollowerList = findUser.getToFollowList().stream()
                .map(Follow::getFromUser)
                .map(UserInfoDto::from)
                .toList();

        return findFollowerList;
    }

    @Transactional
    public void following(Long toId, Long fromId) {

        User toUser = userService.findById(toId); // 요청 받는 사람
        User fromUser = userService.findById(fromId); // 요청 보내는 사람

        Follow newFollow = Follow.builder()
                .toUser(toUser)
                .fromUser(fromUser)
                .build();

        followRepository.save(newFollow);
    }

    @Transactional
    public void unfollowing(Long toId, Long fromId) {

        Long unfollow = followRepository.unfollow(toId, fromId);

        if (unfollow <= 0)
            throw new BusinessException(ErrorCode.FAILED_UNFOLLOW);
    }
}
