package com.ssafy.withme.service.user;

import com.ssafy.withme.domain.user.User;
import com.ssafy.withme.domain.user.constant.RoleType;
import com.ssafy.withme.domain.user.constant.UserStatus;
import com.ssafy.withme.global.config.database.MongoConfig;
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
class UserServiceBootTest {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @BeforeEach
    void setUp() {

        User user1 = User.builder()
                .id(1L)
                .email("test1@ssafy.com")
                .name("ssafy1")
                .nickname("nickname1")
                .roleType(RoleType.USER)
                .userStatus(UserStatus.ACTIVE)
                .build();

        User user2 = User.builder()
                .id(2L)
                .email("test2@ssafy.com")
                .name("ssafy2")
                .nickname("nickname2")
                .roleType(RoleType.USER)
                .userStatus(UserStatus.ACTIVE)
                .build();

        userRepository.save(user1);
        userRepository.save(user2);
    }

    @AfterEach
    public void clean() {

        userRepository.deleteAll();
    }

    @Test
    @DisplayName("회원 수 확인")
    void 회원_수_확인() {

        List<User> all = userService.findAll();

        assertThat(all.size()).isEqualTo(2);
    }

    @Test
    @DisplayName("회원 식별자로 탐색")
    void 회원_식별자_탐색() {

        User findUser1 = userService.findById(1L);
        User findUser2 = userService.findById(2L);

        assertThat(findUser1.getId()).isEqualTo(1L);
        assertThat(findUser2.getId()).isEqualTo(2L);
    }
}