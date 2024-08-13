package com.ssafy.withme.service.user;

import com.ssafy.withme.domain.user.User;
import com.ssafy.withme.domain.user.constant.UserStatus;
import com.ssafy.withme.dto.user.SearchUserDto;
import com.ssafy.withme.global.exception.EntityNotFoundException;
import com.ssafy.withme.repository.user.UserRepository;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @InjectMocks
    private UserService userService;

    @Mock
    private UserRepository userRepository;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        User user1 = User.builder()
                .id(1L)
                .email("test@ssafy.com")
                .name("ssafy")
                .nickname("ssafy")
                .userStatus(UserStatus.ACTIVE)
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(user1));
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user1));
        when(userRepository.findByNameContaining("Test")).thenReturn(List.of(user1));
        when(userRepository.findById(999L)).thenReturn(Optional.empty());
    }

    @Test
    @DisplayName("식별자로 유저 검색")
    void 식별자_검색(){

        User findUser = userService.findById(1L);

        assertThat(findUser.getName()).isEqualTo("ssafy");
        assertThrows(EntityNotFoundException.class, () -> userService.findById(999L));
    }

    @Test
    @DisplayName("이메일로 유저 검색")
    void 이메일_검색() {

        User findUser = userService.findByEmail("test@ssafy.com");

        assertThat(findUser.getId()).isEqualTo(1L);
        assertThrows(IllegalArgumentException.class, () -> userService.findByEmail("error@ssafy.com"));
    }

    @Test
    @DisplayName("닉네임으로 유저 중복 탐색")
    void 닉네임_중복_탐색() {

        boolean find = userService.findByNickname("ssafy");
        boolean notFound = userService.findByNickname("leadme");

        assertThat(find).isEqualTo(false);
        assertThat(notFound).isEqualTo(true);
    }

    @Test
    @DisplayName("닉네임 포함 유저 리스트 조회")
    void 닉네임_포함_탐색() {

        List<SearchUserDto> findUserList = userService.findListByNickname("ss");

        assertThat(findUserList.size()).isEqualTo(1);
        assertThat((findUserList.get(0).id())).isEqualTo(1L);
        assertThat((findUserList.get(0).nickname())).isEqualTo("ssafy");
        assertThrows(EntityNotFoundException.class, () -> userService.findListByNickname("cc"));
    }
}