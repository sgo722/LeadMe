package com.ssafy.withme.repository.user;

import com.ssafy.withme.domain.user.User;

import java.util.List;
import java.util.Optional;

public interface UserRepositoryCustom {

    List<User> findByNameContaining(String name);

    Optional<User> findByNickname(String nickname);
}
