package com.ssafy.withme.repository.user;

import com.ssafy.withme.domain.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User,Long>, UserRepositoryCustom {

//    @Query("select u from users u where u.email =:email")
    Optional<User> findByEmail(String email);

    @Override
    List<User> findByNameContaining(String name);

    Optional<User> findByName(String name);

    List<User> findByNicknameContaining(String nickname);

    Optional<User> findByNickname(String nickname);
}
