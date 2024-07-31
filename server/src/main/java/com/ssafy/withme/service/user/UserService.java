package com.ssafy.withme.service.user;

import com.ssafy.withme.domain.user.User;
import com.ssafy.withme.domain.user.constant.UserStatus;
import com.ssafy.withme.global.config.jwt.TokenProvider;
import com.ssafy.withme.global.error.ErrorCode;
import com.ssafy.withme.global.exception.EntityNotFoundException;
import com.ssafy.withme.repository.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class UserService {

    private static final Logger log = LoggerFactory.getLogger(UserService.class);
    private final UserRepository userRepository;
    private final TokenProvider tokenProvider;

    public List<User> findAll() {

        return userRepository.findAll();
    }

//    public Long save(AddUserRequest dto) {
//        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
//
//        return userRepository.save(User.builder()
//                .email(dto.getEmail())
//                .password(encoder.encode(dto.getPassword()))
//                .build()).getId();
//    }

    public User findById(Long id) {

        return userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(ErrorCode.USER_NOT_EXISTS));
    }

    public User findByEmail(String email) {

        log.info("find by email: {}", email);

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Unexpected user"));
    }

    // find user list by name field
    public List<User> findByNameContaining(String name) {

        List<User> findUserList = userRepository.findByNameContaining(name);

        if (findUserList.isEmpty())
            throw new EntityNotFoundException(ErrorCode.USER_NOT_EXISTS);

        return findUserList;
    }

    public List<String> findListByNickname(String nickname) {

        List<String> list = userRepository.findByNicknameContaining(nickname).stream()
                .map(User::getNickname)
                .toList();

        if (list.isEmpty())
            throw new EntityNotFoundException(ErrorCode.USER_NOT_EXISTS);

        return list;
    }

    public User findUserIdByToken(String token) {

        Long userId = tokenProvider.getUserId(token);

        return findById(userId);
    }

    @Transactional
    public void updateStatus(Long id, UserStatus status) {

        User findUser = findById(id);

        findUser.updateStatus(status);
    }
}
