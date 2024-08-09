package com.ssafy.withme.service.user;

import com.ssafy.withme.domain.user.User;
import com.ssafy.withme.domain.user.constant.UserStatus;
import com.ssafy.withme.repository.user.FollowRepository;
import com.ssafy.withme.repository.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FollowServiceTest {

    @InjectMocks
    private FollowService followService;

    @Mock
    private FollowRepository followRepository;

    @Mock
    private UserRepository userRepository;

    @BeforeEach
    void setUp() {

        MockitoAnnotations.openMocks(this);

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

        when(userRepository. findById(1L)).thenReturn(Optional.of(user1));
        when(userRepository.findById(2L)).thenReturn(Optional.of(user2));
    }
}