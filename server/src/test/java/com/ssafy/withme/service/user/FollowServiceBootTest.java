package com.ssafy.withme.service.user;

import com.ssafy.withme.domain.user.Follow;
import com.ssafy.withme.domain.user.User;
import com.ssafy.withme.domain.user.constant.RoleType;
import com.ssafy.withme.domain.user.constant.UserStatus;
import com.ssafy.withme.dto.user.FollowDto;
import com.ssafy.withme.repository.user.FollowRepository;
import com.ssafy.withme.repository.user.UserRepository;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class FollowServiceBootTest {

    @Autowired
    private FollowService followService;

    @Autowired
    private UserService userService;

    @Autowired
    private FollowRepository followRepository;

    @Autowired
    private UserRepository userRepository;

    @BeforeEach
    void setUp() {

        User user1 = User.builder()
                .id(1L)
                .email("test1@ssafy.com")
                .name("ssafy1")
                .nickname("ssafy1")
                .userStatus(UserStatus.ACTIVE)
                .roleType(RoleType.ADMIN)
                .build();

        User user2 = User.builder()
                .id(2L)
                .email("test2@ssafy.com")
                .name("ssafy2")
                .nickname("ssafy2")
                .userStatus(UserStatus.ACTIVE)
                .roleType(RoleType.ADMIN)
                .build();

        User user3 = User.builder()
                .id(3L)
                .email("test3@ssafy.com")
                .name("ssafy3")
                .nickname("ssafy3")
                .userStatus(UserStatus.ACTIVE)
                .roleType(RoleType.ADMIN)
                .build();

        userRepository.save(user1);
        userRepository.save(user2);
        userRepository.save(user3);
    }

    @AfterEach
    void tearDown() {

        followRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    @DisplayName("팔로잉 동작 테스트")
    void 팔로잉() {

        followService.following(2L, 1L); // 1번 유저가 2번 유저에게 팔로잉 요청

        assertThat(followService.isFollowing(1L, 2L)).isTrue();
        assertThat(followService.isFollowing(2L, 1L)).isFalse();
    }

    @Test
    @DisplayName("팔로잉 리스트 조회")
    void 팔로잉_리스트_조회() {

        Follow following1 = followService.following(2L, 1L);// 1번 유저가 2번 유저에게 팔로잉 요청
        Follow following2 = followService.following(3L, 1L);// 1번 유저가 3번 유저에게 팔로잉 요청
        Follow following3 = followService.following(2L, 3L);// 1번 유저가 3번 유저에게 팔로잉 요청

        User user1 = userService.findById(1L);
        User user2 = userService.findById(2L);
        User user3 = userService.findById(3L);

        user1.getFromFollowList().add(following1);
        user2.getToFollowList().add(following1);

        user1.getFromFollowList().add(following2);
        user3.getToFollowList().add(following2);

        user3.getFromFollowList().add(following3);
        user2.getToFollowList().add(following3);

        List<FollowDto> findFollowingByUser1 = followService.findFollowing(1L);
        List<FollowDto> findFollowingByUser2 = followService.findFollowing(2L);
        List<FollowDto> findFollowingByUser3 = followService.findFollowing(3L);

        List<FollowDto> findFollowersByUser1 = followService.findFollowers(1L);
        List<FollowDto> findFollowersByUser2 = followService.findFollowers(2L);
        List<FollowDto> findFollowersByUser3 = followService.findFollowers(3L);

        assertThat(findFollowingByUser1.size()).isEqualTo(2);
        assertThat(findFollowingByUser2.size()).isEqualTo(0);
        assertThat(findFollowingByUser3.size()).isEqualTo(1);

        assertThat(findFollowersByUser1.size()).isEqualTo(0);
        assertThat(findFollowersByUser2.size()).isEqualTo(2);
        assertThat(findFollowersByUser3.size()).isEqualTo(1);
    }
}