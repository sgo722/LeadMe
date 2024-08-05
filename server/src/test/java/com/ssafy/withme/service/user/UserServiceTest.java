package com.ssafy.withme.service.user;

import com.ssafy.withme.repository.user.UserRepository;
import org.mockito.Mock;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class UserServiceTest {

    @Mock
    private UserService userService;

    @Mock
    private UserRepository userRepository;
}