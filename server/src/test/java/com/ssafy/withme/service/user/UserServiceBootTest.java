package com.ssafy.withme.service.user;

import com.ssafy.withme.domain.user.User;
import com.ssafy.withme.domain.user.constant.RoleType;
import com.ssafy.withme.domain.user.constant.UserStatus;
import com.ssafy.withme.dto.user.SearchUserDto;
import com.ssafy.withme.global.config.database.MongoConfig;
import com.ssafy.withme.global.exception.EntityNotFoundException;
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
import static org.assertj.core.api.Assertions.assertThatThrownBy;
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
        assertThrows(EntityNotFoundException.class, () -> userService.findById(3L));
        assertThatThrownBy(() -> userService.findById(4L))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessageContaining("해당 회원은 존재하지 않습니다.");
    }

    @Test
    @DisplayName("회원 이메일로 탐색")
    void 회원_이메일_탐색() {

        User findUser1 = userService.findByEmail("test1@ssafy.com");
        User findUser2 = userService.findByEmail("test2@ssafy.com");

        assertThat(findUser1.getEmail()).isEqualTo("test1@ssafy.com");
        assertThat(findUser2.getEmail()).isEqualTo("test2@ssafy.com");
        assertThrows(IllegalArgumentException.class, () -> userService.findByEmail("test3@ssafy.com"));
    }

    @Test
    @DisplayName("회원 닉네임 중복 검색을 위한 닉네임 탐색")
    void 회원_닉네임_탐색() {

        boolean find1 = userService.findByNickname("nickname1");
        boolean find2 = userService.findByNickname("nickname2");

        assertThat(find1).isFalse();
        assertThat(find2).isFalse();
        assertThat(userService.findByNickname("notfound")).isTrue();
    }

    @Test
    @DisplayName("회원 이름 LIKE 탐색")
    void 회원_이름_탐색() {

        List<User> findList = userService.findByNameContaining("ss");

        assertThat(findList.size()).isEqualTo(2);
        assertThrows(EntityNotFoundException.class, () -> userService.findByNickname("hh"));
    }

    @Test
    @DisplayName("닉네임으로 Dto List 산출")
    void 닉네임으로_유저_정보_탐색() {

        List<SearchUserDto> findList = userService.findListByNickname("nickname1");
        List<SearchUserDto> findAllList = userService.findListByNickname("nickname");

        assertThat(findList.get(0).nickname()).isEqualTo("nickname1");
        assertThat(findList.get(0).id()).isEqualTo(1L);
        assertThat(findList.get(0).getClass()).isEqualTo(SearchUserDto.class);
        assertThat(findAllList.size()).isEqualTo(2);
        assertThat(userService.findListByNickname("notfound").size()).isEqualTo(0);
    }

    @Test
    @DisplayName("회원 상태 업데이트")
    void 회원_상태_업데이트() {

        userService.updateStatus(1L, UserStatus.INACTIVE);
        userService.updateStatus(2L, UserStatus.DELETED);

        assertThat(userService.findById(1L).getUserStatus()).isEqualTo(UserStatus.INACTIVE);
        assertThat(userService.findById(2L).getUserStatus()).isEqualTo(UserStatus.DELETED);
    }
}