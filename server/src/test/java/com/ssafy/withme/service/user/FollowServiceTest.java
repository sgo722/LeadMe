package com.ssafy.withme.service.user;

import com.ssafy.withme.domain.user.Follow;
import com.ssafy.withme.domain.user.User;
import com.ssafy.withme.domain.user.constant.UserStatus;
import com.ssafy.withme.dto.user.FollowDto;
import com.ssafy.withme.global.exception.BusinessException;
import com.ssafy.withme.repository.user.FollowRepository;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FollowServiceTest {

    @InjectMocks
    private FollowService followService;

    @Mock
    private FollowRepository followRepository;

    @Mock
    private UserService userService;

    @BeforeEach
    void setUp() {

        User user1 = User.builder()
                .id(1L)
                .email("user1@ssafy.com")
                .nickname("user1")
                .name("user1")
                .userStatus(UserStatus.ACTIVE)
                .build();

        User user2 = User.builder()
                .id(2L)
                .email("user2@ssafy.com")
                .nickname("user2")
                .name("user2")
                .userStatus(UserStatus.ACTIVE)
                .build();

        when(userService. findById(1L)).thenReturn(user1);
        when(userService.findById(2L)).thenReturn(user2);
    }

    @Test
    @DisplayName("유저 팔로잉")
    void 팔로잉() {

        // Given
        User user1 = userService.findById(1L);
        User user2 = userService.findById(2L);

        // When
        followService.following(2L, 1L); // 받는 사람, 보내는 사람

        // Then
        ArgumentCaptor<Follow> followArgumentCaptor = ArgumentCaptor.forClass(Follow.class);
        verify(followRepository).save(followArgumentCaptor.capture());

        Follow follow = followArgumentCaptor.getValue();
        assertThat(follow.getToUser()).isEqualTo(user2);
        assertThat(follow.getFromUser()).isEqualTo(user1);
    }

    @Test
    @DisplayName("팔로잉 삭제")
    void 언팔로잉() {

        // Given
        User user1 = userService.findById(1L);
        User user2 = userService.findById(2L);

        // Mock: Assume the user is following
        Follow follow = Follow.builder()
                .toUser(user2)
                .fromUser(user1)
                .build();

        when(followRepository.findByFromUserIdAndToUserId(user1.getId(), user2.getId()))
                .thenReturn(Optional.of(follow)); // 팔로우 관계가 존재한다고 가정

        // When
        followService.unfollowing(2L, 1L); // 언팔로우 메서드 호출

        // Then
        verify(followRepository).delete(follow); // delete 메서드 호출 검증
    }

    @Test
    @DisplayName("팔로우 목록 조회")
    void 팔로우_목록_조회() {

        User user1 = userService.findById(1L);
        User user2 = userService.findById(2L);

        Follow follow = Follow.builder()
                .toUser(user2)
                .fromUser(user1)
                .build();

        user1.getFromFollowList().add(follow);
        user2.getToFollowList().add(follow);

        // When
        List<FollowDto> followings = followService.findFollowing(user1.getId());
        List<FollowDto> followers = followService.findFollowers(user2.getId());

        // Then
        assertThat(followings).hasSize(1);
        assertThat(followers).hasSize(1);
    }
}